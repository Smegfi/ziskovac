import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader } from "lucide-react"
import { SubscriptionSelector } from "@/components/subscription-selector"
import type { SubscriptionPlan } from "@/lib/stripe"

export const Route = createFileRoute("/app/settings/billing")({
  component: BillingPage,
})

interface Subscription {
  id: string
  plan: SubscriptionPlan
  status: string
  currentPeriodEnd?: string
  nextBillingDate?: string
}

function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await fetch("/api/billing/subscription")
        if (response.ok) {
          const data = await response.json()
          setSubscription(data.subscription)
        } else {
          setError("Failed to load subscription")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load subscription")
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [])

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/billing/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      if (response.ok) {
        const updated = await response.json()
        setSubscription(updated)
        setSuccess(
          plan === "free"
            ? "Subscription downgraded to Free plan"
            : `Subscription upgraded to ${plan} plan. Payment required.`,
        )
      } else {
        const error = await response.json()
        setError(error.error || "Failed to update subscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing information</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-100 text-green-800">
          <span>✓ {success}</span>
        </div>
      )}

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Active plan and billing details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Current Plan</p>
                <p className="text-2xl font-bold capitalize mt-1">{subscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </p>
              </div>
              {subscription.nextBillingDate && (
                <div>
                  <p className="text-sm text-gray-600">Next Billing Date</p>
                  <p className="text-lg font-semibold mt-1">
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Choose Your Plan</CardTitle>
          <CardDescription>Select the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionSelector
            currentPlan={subscription?.plan || "free"}
            onSelectPlan={handleSelectPlan}
            loading={updating}
          />
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your invoices and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Invoice history will appear here once you have an active paid subscription.</p>
        </CardContent>
      </Card>
    </div>
  )
}
