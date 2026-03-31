import { createFileRoute, useRouteContext } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUpIcon, FileTextIcon, DollarSignIcon, UsersIcon } from "lucide-react"

export const Route = createFileRoute("/app/dashboard/")({
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useRouteContext({ from: "/app" })

  const stats = [
    {
      title: t("dashboard.totalQuotes"),
      value: "0",
      icon: <FileTextIcon className="size-4 text-muted-foreground" />,
    },
    {
      title: t("dashboard.activeQuotes"),
      value: "0",
      icon: <TrendingUpIcon className="size-4 text-muted-foreground" />,
    },
    {
      title: t("dashboard.revenue"),
      value: "€0",
      icon: <DollarSignIcon className="size-4 text-muted-foreground" />,
    },
    {
      title: t("dashboard.clients"),
      value: "0",
      icon: <UsersIcon className="size-4 text-muted-foreground" />,
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("dashboard.welcome", { name: user.name })}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.recentQuotes")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileTextIcon className="size-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t("dashboard.noQuotesYet")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.profitOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <TrendingUpIcon className="size-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{t("dashboard.noDataYet")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
