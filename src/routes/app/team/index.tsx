import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/app/team/")({
  component: TeamPage,
})

function TeamPage() {
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
        <circle cx="90" cy="55" r="20" fill="currentColor" className="text-primary/25" />
        <path d="M58 130 C58 108 70 96 90 96 C110 96 122 108 122 130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-primary/30" />
        <circle cx="50" cy="70" r="14" fill="currentColor" className="text-muted/40" />
        <path d="M25 130 C25 113 34 104 50 104 C62 104 70 110 73 118" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-muted-foreground/30" />
        <circle cx="130" cy="70" r="14" fill="currentColor" className="text-muted/40" />
        <path d="M107 118 C110 110 118 104 130 104 C146 104 155 113 155 130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-muted-foreground/30" />
        <circle cx="90" cy="55" r="8" fill="currentColor" className="text-primary/50" />
      </svg>
      <div>
        <h2 className="text-xl font-semibold">{t("placeholder.comingSoon")}</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          {t("placeholder.teamDescription")}
        </p>
      </div>
    </div>
  )
}
