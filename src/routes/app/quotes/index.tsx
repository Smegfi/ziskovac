import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUpIcon, Plus, ChevronRight } from "lucide-react"
import { useEffect, useState, useMemo } from "react"

export const Route = createFileRoute("/app/quotes/")({
  component: QuotesPage,
})

interface Quote {
  id: string
  title: string
  clientName?: string
  billableHours?: number
  monthlyOverheadCosts?: number
  projectDurationMonths?: number
  targetMarginPercent?: number
  customRate?: number
  netProfit?: number
  currency: string
}

function QuotesPage() {
  const { t } = useTranslation()

  const [settings, setSettings] = useState<{ billableHoursTarget: number; currency: string } | null>(null)
  const [billableHours, setBillableHours] = useState<number>(160)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [calculateLoading, setCalculateLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false)

  // Form state for new quote
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    billableHours: 160,
    monthlyOverheadCosts: 0,
    projectDurationMonths: 1,
    targetMarginPercent: 30,
    customRate: 0,
  })

  const [calculatedRate, setCalculatedRate] = useState<{
    floorHourlyRate: number
    totalCosts: number
    billableHours: number
    currency: string
  } | null>(null)

  const [quotes, setQuotes] = useState<Quote[]>([])

  // Load settings and quotes on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, quotesRes] = await Promise.all([
          fetch("/api/quotes/settings"),
          fetch("/api/quotes/"),
        ])

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSettings(settingsData)
          setBillableHours(settingsData.billableHoursTarget)
        }

        if (quotesRes.ok) {
          const quotesData = await quotesRes.json()
          setQuotes(quotesData)
        }

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/quotes/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billableHoursTarget: billableHours }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      const data = await response.json()
      setSettings(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const handleCalculate = async () => {
    setCalculateLoading(true)
    const now = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    try {
      const response = await fetch("/api/quotes/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      })

      if (!response.ok) {
        throw new Error("Failed to calculate hourly rate")
      }

      const data = await response.json()
      setCalculatedRate(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate hourly rate")
    } finally {
      setCalculateLoading(false)
    }
  }

  // Reactive calculations for form
  const calculations = useMemo(() => {
    const billableHours = formData.billableHours || 160
    const overheadMonthly = formData.monthlyOverheadCosts || 0
    const projectMonths = formData.projectDurationMonths || 1

    // Calculate overhead allocation per hour
    const totalProjectOverhead = overheadMonthly * projectMonths
    const overheadPerHour = totalProjectOverhead / billableHours

    // Calculate floor hourly rate
    const floorHourlyRate = overheadPerHour

    // Use custom rate or floor rate
    const hourlyRate = formData.customRate || floorHourlyRate
    const totalCost = hourlyRate * billableHours
    const netProfit = totalCost - totalProjectOverhead
    const actualMarginPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0

    return {
      floorHourlyRate: Math.ceil(floorHourlyRate * 100) / 100,
      overheadAllocation: Math.ceil(totalProjectOverhead * 100) / 100,
      totalCost: Math.ceil(totalCost * 100) / 100,
      netProfit: Math.ceil(netProfit * 100) / 100,
      actualMarginPercent: Math.ceil(actualMarginPercent * 100) / 100,
    }
  }, [formData])

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/quotes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...calculations,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create quote")
      }

      const newQuote = await response.json()
      setQuotes([...quotes, newQuote])
      setFormData({
        title: "",
        clientName: "",
        billableHours: 160,
        monthlyOverheadCosts: 0,
        projectDurationMonths: 1,
        targetMarginPercent: 30,
        customRate: 0,
      })
      setShowNewQuoteForm(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quote")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("quotes.title", "Quote Builder")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("quotes.subtitle", "Calculate your floor hourly rate and create professional quotes")}
          </p>
        </div>
        <Button onClick={() => setShowNewQuoteForm(!showNewQuoteForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      {error && (
        <div className="flex gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {showNewQuoteForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Create New Quote</CardTitle>
            <CardDescription>Add calculation inputs to persist and reactively calculate results</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateQuote} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="title">Quote Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Website Redesign"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Client name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="billableHours">Billable Hours</Label>
                  <Input
                    id="billableHours"
                    type="number"
                    step="0.5"
                    value={formData.billableHours}
                    onChange={(e) => setFormData({ ...formData, billableHours: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="projectDurationMonths">Project Duration (months)</Label>
                  <Input
                    id="projectDurationMonths"
                    type="number"
                    step="0.1"
                    value={formData.projectDurationMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, projectDurationMonths: parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="monthlyOverheadCosts">Monthly Overhead Costs</Label>
                  <Input
                    id="monthlyOverheadCosts"
                    type="number"
                    step="0.01"
                    value={formData.monthlyOverheadCosts}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyOverheadCosts: parseFloat(e.target.value) })
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="targetMarginPercent">Target Margin %</Label>
                  <Input
                    id="targetMarginPercent"
                    type="number"
                    step="1"
                    value={formData.targetMarginPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, targetMarginPercent: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              {/* Reactive Results */}
              <Card className="bg-white border-blue-100">
                <CardHeader>
                  <CardTitle className="text-sm">Calculated Results</CardTitle>
                  <CardDescription>Updates in real-time as you edit inputs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Floor Hourly Rate</p>
                      <p className="text-xl font-bold text-blue-600">{calculations.floorHourlyRate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className="text-xl font-bold text-green-600">{calculations.totalCost}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Profit</p>
                      <p className="text-xl font-bold text-amber-600">{calculations.netProfit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Overhead Allocation</p>
                      <p className="text-xl font-bold text-purple-600">{calculations.overheadAllocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Actual Margin</p>
                      <p className="text-xl font-bold text-indigo-600">{calculations.actualMarginPercent}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving || !formData.title}>
                  {saving ? "Saving..." : "Create Quote"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewQuoteForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {quotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Quotes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quotes.map((quote) => (
              <div key={quote.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <div>
                  <p className="font-medium">{quote.title}</p>
                  {quote.clientName && <p className="text-sm text-muted-foreground">{quote.clientName}</p>}
                </div>
                <div className="text-right">
                  {quote.netProfit && <p className="font-bold text-green-600">{quote.netProfit} CZK</p>}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("quotes.settingsTitle", "Billing Settings")}</CardTitle>
          <CardDescription>{t("quotes.settingsDescription", "Configure your target billable hours per month")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading settings...</div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="billable-hours">{t("quotes.billableHours", "Target Billable Hours Per Month")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="billable-hours"
                    type="number"
                    min="1"
                    max="8760"
                    value={billableHours}
                    onChange={(e) => setBillableHours(parseInt(e.target.value) || 0)}
                  />
                  <span className="flex items-center text-sm text-muted-foreground px-2">{settings?.currency}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("quotes.billableHoursHint", "For full-time (8h/day, 20 days/month): 160")}
                </p>
              </div>
              <Button
                onClick={handleSaveSettings}
                disabled={saving || billableHours === settings?.billableHoursTarget}
                className="self-start"
              >
                {saving ? "Saving..." : t("common.save", "Save")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            {t("quotes.calculatorTitle", "Hourly Rate Calculator")}
          </CardTitle>
          <CardDescription>{t("quotes.calculatorDescription", "Calculate your floor hourly rate from monthly expenses")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="text-sm text-muted-foreground">
            {t("quotes.calculatorInfo", "Based on your expenses from this month, your floor hourly rate is:")}
          </div>

          <Button onClick={handleCalculate} disabled={calculateLoading} variant="default" className="self-start">
            {calculateLoading ? "Calculating..." : t("quotes.calculate", "Calculate Current Month")}
          </Button>

          {calculatedRate && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">{t("quotes.totalCosts", "Total Costs")}</p>
                <p className="text-2xl font-bold">
                  {calculatedRate.totalCosts.toFixed(2)} {calculatedRate.currency}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">{t("quotes.billableHours", "Billable Hours")}</p>
                <p className="text-2xl font-bold">{calculatedRate.billableHours}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">{t("quotes.floorRate", "Floor Hourly Rate")}</p>
                <p className="text-2xl font-bold text-green-600">
                  {calculatedRate.floorHourlyRate.toFixed(2)} {calculatedRate.currency}/h
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
