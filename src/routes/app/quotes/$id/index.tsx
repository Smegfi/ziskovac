import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, Eye } from "lucide-react"
import { QuoteLineItemForm, type LineItemFormData } from "@/components/quote-line-item-form"
import { QuoteLineItemTable, type LineItem } from "@/components/quote-line-item-table"

export const Route = createFileRoute("/app/quotes/$id/")({
  component: QuoteDetailPage,
})

interface Quote {
  id: string
  title: string
  clientName?: string
  description?: string
  currency: string
  status: string
  createdAt: string
  updatedAt: string
}

function QuoteDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = Route.useParams()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
  })

  // Load quote and line items
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
          setFormData({
            title: quoteData.title,
            clientName: quoteData.clientName || "",
          })
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

  const handleSaveQuote = async () => {
    if (!quote) return
    setSaving(true)
    try {
      const response = await fetch(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          clientName: formData.clientName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save quote")
      }

      const updatedQuote = await response.json()
      setQuote(updatedQuote)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save quote")
    } finally {
      setSaving(false)
    }
  }

  const handleAddLineItem = async (data: LineItemFormData) => {
    try {
      const response = await fetch(`/api/quotes/line-items/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: id,
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add line item")
      }

      const newItem = await response.json()
      setLineItems([...lineItems, newItem])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add line item")
    }
  }

  const handleDeleteLineItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/quotes/line-items/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete line item")
      }

      setLineItems(lineItems.filter((item) => item.id !== itemId))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete line item")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
        <AlertCircle className="w-4 h-4" />
        <span>Quote not found</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/app/quotes" })}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Quotes
        </Button>
        {lineItems.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: `/app/quotes/${id}/preview` })}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview & Export
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Quote Title</Label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              type="text"
              placeholder="Optional"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
            />
          </div>

          <div>
            <Label>Status</Label>
            <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm capitalize">
              {quote.status}
            </div>
          </div>

          <Button onClick={handleSaveQuote} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <QuoteLineItemForm quoteId={id} onSubmit={handleAddLineItem} />

      <QuoteLineItemTable
        lineItems={lineItems}
        onDelete={handleDeleteLineItem}
        loading={saving}
      />
    </div>
  )
}
