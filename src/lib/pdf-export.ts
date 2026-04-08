/**
 * PDF Export Utility for Quotes
 * Uses jspdf library to generate professional quote PDFs
 */

export interface QuoteForPDF {
  id: string
  title: string
  clientName?: string
  description?: string
  currency: string
  status: string
  createdAt: string
  lineItems: Array<{
    id: string
    type: string
    description: string
    quantity: string | number
    unit?: string
    unitPrice: string | number
    subtotal: string | number
  }>
}

/**
 * Generate PDF from quote data
 * Dynamically imports jspdf and html2canvas to avoid bundling them unless needed
 */
export async function generateQuotePDF(quote: QuoteForPDF, userEmail?: string): Promise<void> {
  try {
    // Dynamically import jspdf
    const { jsPDF } = await import("jspdf")
    const html2canvas = (await import("html2canvas")).default

    // Create temporary container for rendering
    const container = document.createElement("div")
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.width = "210mm"
    container.style.background = "white"
    container.innerHTML = generateQuoteHTML(quote, userEmail)
    document.body.appendChild(container)

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      allowTaint: true,
      useCORS: true,
      backgroundColor: "#ffffff",
      scale: 2,
    })

    // Calculate PDF dimensions
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const doc = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageHeight = doc.internal.pageSize.getHeight()
    let heightLeft = imgHeight
    let position = 0

    // Add image to PDF
    const imgData = canvas.toDataURL("image/png")
    while (heightLeft >= 0) {
      doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight / (heightLeft / pageHeight))
      heightLeft -= pageHeight
      position -= pageHeight
      if (heightLeft > 0) {
        doc.addPage()
      }
    }

    // Save PDF
    const filename = `${quote.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(filename)

    // Cleanup
    document.body.removeChild(container)
  } catch (error) {
    console.error("Failed to generate PDF:", error)
    throw new Error("Failed to generate PDF. Please ensure jspdf and html2canvas are installed.")
  }
}

/**
 * Generate HTML for quote preview that can be converted to PDF
 */
function generateQuoteHTML(quote: QuoteForPDF, userEmail?: string): string {
  const total = quote.lineItems.reduce((sum, item) => sum + Number(item.subtotal), 0)
  const createdDate = new Date(quote.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1f2937;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div>
          <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 8px 0; color: #111827;">${escapeHtml(quote.title)}</h1>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">Quote ID: ${quote.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 14px; color: #6b7280; margin: 0;">Date: ${createdDate}</p>
          <p style="font-size: 14px; font-weight: 600; margin-top: 8px; color: ${
            quote.status === "draft" ? "#b45309" :
            quote.status === "sent" ? "#2563eb" :
            quote.status === "accepted" ? "#16a34a" :
            "#dc2626"
          };">${quote.status.toUpperCase()}</p>
        </div>
      </div>

      <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 24px 0; margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
          <div>
            <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">FROM</h3>
            <p style="margin: 0; font-weight: 500; color: #111827;">${userEmail || "Service Provider"}</p>
          </div>
          <div>
            <h3 style="font-size: 12px; font-weight: 600; color: #111827; margin: 0 0 8px 0;">BILL TO</h3>
            <p style="margin: 0; font-weight: 500; color: #111827;">${escapeHtml(quote.clientName || "Client")}</p>
            ${quote.description ? `<p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">${escapeHtml(quote.description)}</p>` : ""}
          </div>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #d1d5db;">
            <th style="text-align: left; font-weight: 600; color: #111827; font-size: 14px; padding-bottom: 12px;">Description</th>
            <th style="text-align: right; font-weight: 600; color: #111827; font-size: 14px; padding-bottom: 12px;">Type</th>
            <th style="text-align: right; font-weight: 600; color: #111827; font-size: 14px; padding-bottom: 12px;">Quantity</th>
            <th style="text-align: right; font-weight: 600; color: #111827; font-size: 14px; padding-bottom: 12px;">Unit Price</th>
            <th style="text-align: right; font-weight: 600; color: #111827; font-size: 14px; padding-bottom: 12px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${quote.lineItems.map((item) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; color: #111827;">${escapeHtml(item.description)}</td>
              <td style="text-align: right; color: #4b5563; font-size: 14px; padding: 12px 0;">${item.type}</td>
              <td style="text-align: right; color: #4b5563; padding: 12px 0;">${Number(item.quantity).toFixed(2)} ${item.unit || ""}</td>
              <td style="text-align: right; color: #4b5563; padding: 12px 0;">${Number(item.unitPrice).toFixed(2)} ${quote.currency}</td>
              <td style="text-align: right; font-weight: 500; color: #111827; padding: 12px 0;">${Number(item.subtotal).toFixed(2)} ${quote.currency}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
        <div style="width: 100%; max-width: 280px;">
          <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #d1d5db; border-bottom: 2px solid #d1d5db;">
            <span style="font-weight: 600; color: #111827;">TOTAL</span>
            <span style="font-weight: bold; font-size: 20px; color: #111827;">${total.toFixed(2)} ${quote.currency}</span>
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; font-size: 12px; color: #6b7280;">
        <p style="margin: 0 0 8px 0;">
          <span style="font-weight: 600;">Terms:</span> This is a quote for services as described above.
        </p>
        <p style="margin: 0;">Thank you for your business!</p>
      </div>
    </div>
  `
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}
