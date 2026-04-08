import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Download, ChevronLeft } from "lucide-react"
import { QuotePreview } from "@/components/quote-preview"
import { generateQuotePDF } from "@/lib/pdf-export"

export const Route = createFileRoute("/app/quotes/$id/preview")({
  component: QuotePreviewPage,
})

interface Quote {
  id: string
  title: string
  clientName?: string
  description?: string
  currency: string
  status: string
  createdAt: string
}

interface LineItem {
  id: string
  type: string
  description: string
  quantity: string | number
  unit?: string
  unitPrice: string | number
  subtotal: string | number
}

function QuotePreviewPage() {
  const params = Route.useParams() as { id: string }
  const id = params.id
  const navigate = Route.useNavigate()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [quoteRes, lineItemsRes] = await Promise.all([
          fetch(`/api/quotes/${id}`),
          fetch(`/api/quotes/line-items/?quoteId=${id}`),
        ])

        if (quoteRes.ok) {
          const quoteData = (await quoteRes.json()) as Quote
          setQuote(quoteData)
        } else {
          setError("Failed to load quote")
        }

        if (lineItemsRes.ok) {
          const itemsData = await lineItemsRes.json()
          setLineItems(itemsData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleExportPDF = async () => {
    if (!quote) return

    setExporting(true)
    try {
      await generateQuotePDF(
        {
          ...quote,
          lineItems,
        },
        undefined, // userEmail would come from user context
      )
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export PDF")
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!quote || lineItems.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: `/app/quotes/${id}` })}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Quote
        </Button>
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>Quote not found or has no line items</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: `/app/quotes/${id}` })}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Quote
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          {exporting ? "Exporting..." : "Export PDF"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-gray-100 p-8 rounded-lg border shadow-sm">
        <QuotePreview quote={quote} lineItems={lineItems} />
      </div>
    </div>
  )
}
