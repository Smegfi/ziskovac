import { Separator } from "@/components/ui/separator"

export interface QuotePreviewProps {
  quote: {
    id: string
    title: string
    clientName?: string
    description?: string
    currency: string
    status: string
    createdAt: string
  }
  lineItems: Array<{
    id: string
    type: string
    description: string
    quantity: string | number
    unit?: string
    unitPrice: string | number
    subtotal: string | number
  }>
  userDetails?: {
    email?: string
    name?: string
    company?: string
  }
}

export function QuotePreview({ quote, lineItems, userDetails }: QuotePreviewProps) {
  const total = lineItems.reduce((sum, item) => sum + Number(item.subtotal), 0)

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quote.title}</h1>
            <p className="text-gray-600 mt-2">Quote ID: {quote.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              Date: {new Date(quote.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p className={`text-sm font-semibold mt-1 ${
              quote.status === "draft" ? "text-orange-600" :
              quote.status === "sent" ? "text-blue-600" :
              quote.status === "accepted" ? "text-green-600" :
              "text-red-600"
            }`}>
              {quote.status.toUpperCase()}
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* From/To Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">FROM</h3>
            {userDetails?.name && <p className="font-medium text-gray-900">{userDetails.name}</p>}
            {userDetails?.company && <p className="text-gray-600">{userDetails.company}</p>}
            {userDetails?.email && <p className="text-gray-600 text-sm">{userDetails.email}</p>}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">BILL TO</h3>
            {quote.clientName && <p className="font-medium text-gray-900">{quote.clientName}</p>}
            {quote.description && <p className="text-gray-600 text-sm">{quote.description}</p>}
          </div>
        </div>

        <Separator className="my-6" />
      </div>

      {/* Line Items Table */}
      <div className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left text-sm font-semibold text-gray-900 pb-3">Description</th>
                <th className="text-right text-sm font-semibold text-gray-900 pb-3">Type</th>
                <th className="text-right text-sm font-semibold text-gray-900 pb-3">Quantity</th>
                <th className="text-right text-sm font-semibold text-gray-900 pb-3">Unit Price</th>
                <th className="text-right text-sm font-semibold text-gray-900 pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="text-right text-gray-600 text-sm capitalize">{item.type}</td>
                  <td className="text-right text-gray-600">
                    {Number(item.quantity).toFixed(2)} {item.unit || ""}
                  </td>
                  <td className="text-right text-gray-600">
                    {Number(item.unitPrice).toFixed(2)} {quote.currency}
                  </td>
                  <td className="text-right font-medium text-gray-900">
                    {Number(item.subtotal).toFixed(2)} {quote.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-xs">
            <div className="flex justify-between py-3 border-t-2 border-gray-300 mb-2">
              <span className="font-semibold text-gray-900">TOTAL</span>
              <span className="font-bold text-xl text-gray-900">
                {total.toFixed(2)} {quote.currency}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Footer Notes */}
      <div className="mt-8 text-xs text-gray-600">
        <p className="mb-2">
          <span className="font-semibold">Terms:</span> This is a quote for services as described above.
        </p>
        <p>Thank you for your business!</p>
      </div>
    </div>
  )
}
