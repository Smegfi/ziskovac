import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/app/lifecycle/")({
  component: LifecyclePage,
})

function LifecyclePage() {
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
        <rect x="20" y="30" width="140" height="100" rx="8" fill="currentColor" className="text-muted/20" />
        <rect x="35" y="50" width="50" height="8" rx="4" fill="currentColor" className="text-muted-foreground/30" />
        <rect x="35" y="65" width="80" height="6" rx="3" fill="currentColor" className="text-muted-foreground/20" />
        <rect x="35" y="78" width="65" height="6" rx="3" fill="currentColor" className="text-muted-foreground/20" />
        <circle cx="130" cy="60" r="16" fill="currentColor" className="text-primary/20" />
        <path d="M124 60 L128 64 L136 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary/60" />
        <rect x="35" y="95" width="110" height="1" fill="currentColor" className="text-border" />
        <rect x="35" y="105" width="30" height="6" rx="3" fill="currentColor" className="text-muted-foreground/20" />
        <rect x="72" y="105" width="30" height="6" rx="3" fill="currentColor" className="text-muted-foreground/20" />
        <rect x="109" y="105" width="30" height="6" rx="3" fill="currentColor" className="text-muted-foreground/20" />
      </svg>
      <div>
        <h2 className="text-xl font-semibold">{t("placeholder.comingSoon")}</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          {t("placeholder.lifecycleDescription")}
        </p>
      </div>
    </div>
  )
}
