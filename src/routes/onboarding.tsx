import { createFileRoute, redirect, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSession } from "@/lib/session"
import { CheckIcon, PlusIcon, TrashIcon, TrendingUpIcon } from "lucide-react"

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: "/onboarding" } })
    }
    return { user: session.user }
  },
  component: OnboardingPage,
})

type OverheadRow = {
  id: string
  label: string
  amount: string
}

const STEP_COUNT = 4

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? "size-3 bg-emerald-600"
              : i === current
                ? "size-3.5 bg-emerald-600 ring-2 ring-emerald-200"
                : "size-3 bg-muted"
          }`}
        />
      ))}
    </div>
  )
}

function OnboardingPage() {
  const { user } = Route.useRouteContext()
  const { t } = useTranslation()
  const router = useRouter()

  const [step, setStep] = useState(0)

  // Step 1 state
  const [targetIncome, setTargetIncome] = useState("")
  const [currency, setCurrency] = useState("CZK")

  // Step 2 state
  const [overheadRows, setOverheadRows] = useState<OverheadRow[]>([
    { id: "1", label: t("onboarding.overhead.preset1"), amount: "" },
    { id: "2", label: t("onboarding.overhead.preset2"), amount: "" },
    { id: "3", label: t("onboarding.overhead.preset3"), amount: "" },
  ])

  // Step 3 state
  const [billableHours, setBillableHours] = useState("120")

  const totalOverhead = overheadRows.reduce((sum, row) => {
    const val = Number.parseFloat(row.amount)
    return sum + (Number.isNaN(val) ? 0 : val)
  }, 0)

  const targetIncomeNum = Number.parseFloat(targetIncome) || 0
  const billableHoursNum = Number.parseInt(billableHours) || 1
  const minimumRate = (targetIncomeNum + totalOverhead) / billableHoursNum

  function addRow() {
    setOverheadRows((prev) => [
      ...prev,
      { id: String(Date.now()), label: "", amount: "" },
    ])
  }

  function removeRow(id: string) {
    setOverheadRows((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRow(id: string, field: "label" | "amount", value: string) {
    setOverheadRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    )
  }

  async function saveExpenses() {
    const rows = overheadRows.filter((r) => r.label && r.amount)
    if (rows.length === 0) return
    const today = new Date().toISOString().slice(0, 10)
    await Promise.allSettled(
      rows.map((r) =>
        fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: r.label,
            amount: Math.round(Number.parseFloat(r.amount) * 100),
            currency,
            date: today,
            note: t("onboarding.overhead.savedNote"),
          }),
        }),
      ),
    )
  }

  async function handleFinish() {
    await saveExpenses()
    await router.navigate({ to: "/app/dashboard" })
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Logo / brand */}
        <div className="text-center">
          <span className="text-2xl font-bold tracking-tight text-emerald-700">ZISKovač</span>
        </div>

        {/* Progress */}
        <StepIndicator current={step} />

        {/* Step content */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {t("onboarding.step1.title", { name: user.name.split(" ")[0] })}
              </CardTitle>
              <CardDescription>{t("onboarding.step1.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="target-income">{t("onboarding.step1.incomeLabel")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="target-income"
                    type="number"
                    min={0}
                    placeholder={t("onboarding.step1.incomePlaceholder")}
                    value={targetIncome}
                    onChange={(e) => setTargetIncome(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="text"
                    maxLength={3}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                    className="w-20 text-center"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("onboarding.step1.incomeHint")}</p>
              </div>
              <Button
                onClick={() => setStep(1)}
                disabled={!targetIncome || Number.parseFloat(targetIncome) <= 0}
                className="w-full"
              >
                {t("onboarding.next")}
              </Button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-muted-foreground hover:text-foreground text-center underline underline-offset-4"
              >
                {t("onboarding.skip")}
              </button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("onboarding.step2.title")}</CardTitle>
              <CardDescription>{t("onboarding.step2.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {overheadRows.map((row) => (
                  <div key={row.id} className="flex gap-2 items-center">
                    <Input
                      placeholder={t("onboarding.overhead.labelPlaceholder")}
                      value={row.label}
                      onChange={(e) => updateRow(row.id, "label", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={row.amount}
                      onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                      className="w-28"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(row.id)}
                      className="shrink-0"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addRow} className="self-start">
                <PlusIcon className="size-4" />
                {t("onboarding.overhead.addRow")}
              </Button>
              {totalOverhead > 0 && (
                <div className="rounded-lg bg-muted px-4 py-3 flex justify-between text-sm font-medium">
                  <span>{t("onboarding.overhead.total")}</span>
                  <span>
                    {new Intl.NumberFormat("cs-CZ", {
                      style: "currency",
                      currency,
                      maximumFractionDigits: 0,
                    }).format(totalOverhead)}
                  </span>
                </div>
              )}
              <Button onClick={() => setStep(2)} className="w-full">
                {t("onboarding.next")}
              </Button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-muted-foreground hover:text-foreground text-center underline underline-offset-4"
              >
                {t("onboarding.skip")}
              </button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{t("onboarding.step3.title")}</CardTitle>
              <CardDescription>{t("onboarding.step3.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="billable-hours">{t("onboarding.step3.hoursLabel")}</Label>
                <Input
                  id="billable-hours"
                  type="number"
                  min={1}
                  max={744}
                  value={billableHours}
                  onChange={(e) => setBillableHours(e.target.value)}
                  className="w-36"
                />
                <p className="text-xs text-muted-foreground">{t("onboarding.step3.hoursHint")}</p>
              </div>

              {minimumRate > 0 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 flex flex-col items-center gap-1 text-center">
                  <TrendingUpIcon className="size-8 text-emerald-600 mb-1" />
                  <p className="text-sm text-emerald-700 font-medium">{t("onboarding.step3.rateLabel")}</p>
                  <p className="text-4xl font-bold text-emerald-800">
                    {new Intl.NumberFormat("cs-CZ", {
                      style: "currency",
                      currency,
                      maximumFractionDigits: 0,
                    }).format(minimumRate)}
                    <span className="text-lg font-normal text-emerald-600">
                      /{t("onboarding.step3.perHour")}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("onboarding.step3.rateFormula", {
                      income: targetIncomeNum,
                      overhead: Math.round(totalOverhead),
                      hours: billableHoursNum,
                      currency,
                    })}
                  </p>
                </div>
              )}

              <Button onClick={() => setStep(3)} className="w-full">
                {t("onboarding.next")}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-100">
                <CheckIcon className="size-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl text-center">{t("onboarding.step4.title")}</CardTitle>
              <CardDescription className="text-center">{t("onboarding.step4.description")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {minimumRate > 0 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center mb-1">
                  <p className="text-sm text-emerald-700 mb-1">{t("onboarding.step4.yourRate")}</p>
                  <p className="text-3xl font-bold text-emerald-800">
                    {new Intl.NumberFormat("cs-CZ", {
                      style: "currency",
                      currency,
                      maximumFractionDigits: 0,
                    }).format(minimumRate)}
                    <span className="text-base font-normal text-emerald-600">
                      /{t("onboarding.step3.perHour")}
                    </span>
                  </p>
                </div>
              )}
              <Button onClick={() => void handleFinish()} className="w-full">
                {t("onboarding.step4.ctaDashboard")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Back link for steps > 0 */}
        {step > 0 && step < 3 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="text-xs text-muted-foreground hover:text-foreground text-center"
          >
            ← {t("onboarding.back")}
          </button>
        )}
      </div>
    </div>
  )
}
