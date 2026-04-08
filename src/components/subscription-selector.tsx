import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { STRIPE_PLANS, type SubscriptionPlan } from "@/lib/stripe"

interface SubscriptionSelectorProps {
  currentPlan?: SubscriptionPlan
  onSelectPlan: (plan: SubscriptionPlan) => Promise<void>
  loading?: boolean
}

export function SubscriptionSelector({ currentPlan = "free", onSelectPlan, loading = false }: SubscriptionSelectorProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")

  const plans: Array<{
    key: SubscriptionPlan
    name: string
    description: string
    price: number
    period: string
    features: readonly string[]
    highlighted?: boolean
  }> = [
    {
      key: "free",
      name: STRIPE_PLANS.free.name,
      description: STRIPE_PLANS.free.description,
      price: 0,
      period: "Forever",
      features: STRIPE_PLANS.free.features,
    },
    {
      key: "monthly",
      name: STRIPE_PLANS.monthly.name,
      description: STRIPE_PLANS.monthly.description,
      price: billingPeriod === "monthly" ? STRIPE_PLANS.monthly.monthlyPrice : STRIPE_PLANS.monthly.annualPrice / 12,
      period: billingPeriod === "monthly" ? "/month" : "/month (annual)",
      features: STRIPE_PLANS.monthly.features,
      highlighted: true,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingPeriod("monthly")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            billingPeriod === "monthly"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Monthly Billing
        </button>
        <button
          onClick={() => setBillingPeriod("annual")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            billingPeriod === "annual"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Annual Billing
          <Badge className="ml-2 bg-green-600">Save 2 Months</Badge>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.key}
            className={`relative transition-all ${
              plan.highlighted ? "md:col-span-2 lg:col-span-1 ring-2 ring-blue-500 shadow-lg" : ""
            } ${currentPlan === plan.key ? "ring-2 ring-green-500" : ""}`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-6 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Pricing */}
              <div>
                <div className="text-4xl font-bold">
                  ${plan.price.toFixed(0)}
                  <span className="text-lg text-gray-600 font-normal">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => onSelectPlan(plan.key)}
                disabled={loading || currentPlan === plan.key}
                variant={currentPlan === plan.key ? "secondary" : plan.highlighted ? "default" : "outline"}
                className="w-full"
              >
                {currentPlan === plan.key
                  ? "Current Plan"
                  : loading
                    ? "Processing..."
                    : `Get ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
