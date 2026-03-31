import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/app/analytics/")({
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 p-12 text-center">
      <svg
        width="180"
        height="160"
        viewBox="0 0 180 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="20" y="20" width="140" height="120" rx="8" fill="currentColor" className="text-muted/20" />
        <rect x="35" y="100" width="20" height="30" rx="3" fill="currentColor" className="text-primary/30" />
        <rect x="62" y="80" width="20" height="50" rx="3" fill="currentColor" className="text-primary/40" />
        <rect x="89" y="60" width="20" height="70" rx="3" fill="currentColor" className="text-primary/50" />
        <rect x="116" y="45" width="20" height="85" rx="3" fill="currentColor" className="text-primary/60" />
        <path
          d="M35 95 L55 75 L82 65 L109 48 L136 38"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        <circle cx="55" cy="75" r="3" fill="currentColor" className="text-primary" />
        <circle cx="82" cy="65" r="3" fill="currentColor" className="text-primary" />
        <circle cx="109" cy="48" r="3" fill="currentColor" className="text-primary" />
        <circle cx="136" cy="38" r="3" fill="currentColor" className="text-primary" />
      </svg>
      <div>
        <h2 className="text-xl font-semibold">{t("placeholder.comingSoon")}</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          {t("placeholder.analyticsDescription")}
        </p>
      </div>
    </div>
  )
}
