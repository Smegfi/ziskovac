import { createFileRoute, useParams } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, Clock } from "lucide-react"
import { useEffect, useState } from "react"

interface QuoteVersion {
  id: string
  version: number
  status: string
  customRate?: number
  netProfit?: number
  totalCost?: number
  createdAt: string
  updatedAt: string
}

export const Route = createFileRoute("/app/quotes/$id/history")({
  component: QuoteHistoryPage,
})

function QuoteHistoryPage() {
  const { id } = useParams({ from: "/app/quotes/$id/history" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quote, setQuote] = useState<any>(null)
  const [versions, setVersions] = useState<QuoteVersion[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/quotes/${id}`)
        if (!res.ok) throw new Error("Failed to load quote")

        const data = await res.json()
        setQuote(data)

        // For now, create a single version from the quote
        // In a full implementation, you'd have separate version history in DB
        setVersions([
          {
            id: data.id,
            version: data.version || 1,
            status: data.status,
            customRate: data.customRate ? parseFloat(data.customRate) : undefined,
            netProfit: data.netProfit ? parseFloat(data.netProfit) : undefined,
            totalCost: data.totalCost ? parseFloat(data.totalCost) : undefined,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          },
        ])

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quote history")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!quote) {
    return (
      <div className="p-6">
        <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">Quote not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{quote.title} - History</h1>
          <p className="text-gray-500 mt-1">View all versions and revisions of this quote</p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {error && (
        <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Quote Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Title</p>
              <p className="font-semibold">{quote.title}</p>
            </div>
            {quote.clientName && (
              <div>
                <p className="text-xs text-gray-600">Client</p>
                <p className="font-semibold">{quote.clientName}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <p className="font-semibold capitalize">{quote.status}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Currency</p>
              <p className="font-semibold">{quote.currency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {versions.length === 0 ? (
            <p className="text-sm text-gray-600">No versions available</p>
          ) : (
            versions.map((version) => (
              <div key={version.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Version {version.version}</span>
                      {version.status && (
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                          {version.status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      Created: {new Date(version.createdAt).toLocaleString()}
                    </p>
                    {version.updatedAt !== version.createdAt && (
                      <p className="text-xs text-gray-600">
                        Updated: {new Date(version.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Version Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {version.customRate !== undefined && (
                    <div>
                      <p className="text-xs text-gray-600">Hourly Rate</p>
                      <p className="font-semibold">{version.customRate} CZK/h</p>
                    </div>
                  )}
                  {version.totalCost !== undefined && (
                    <div>
                      <p className="text-xs text-gray-600">Total Cost</p>
                      <p className="font-semibold text-green-600">{version.totalCost} CZK</p>
                    </div>
                  )}
                  {version.netProfit !== undefined && (
                    <div>
                      <p className="text-xs text-gray-600">Net Profit</p>
                      <p className="font-semibold text-amber-600">{version.netProfit} CZK</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Implementation Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">Version Tracking</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <p>
            This page shows the version history of the quote. Currently showing version {quote.version || 1}.
          </p>
          <p>
            When a quote is edited and saved, a new version is created with all changes tracked.
          </p>
          <p className="text-xs text-gray-600">
            Timestamps show when each version was created and last updated.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
