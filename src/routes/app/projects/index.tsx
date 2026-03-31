import { createFileRoute } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const Route = createFileRoute("/app/projects/")({
  component: ProjectsPage,
})

function ProjectsPage() {
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
        <rect x="20" y="50" width="65" height="80" rx="6" fill="currentColor" className="text-muted/30" />
        <rect x="95" y="30" width="65" height="100" rx="6" fill="currentColor" className="text-primary/20" />
        <rect x="30" y="65" width="45" height="5" rx="2.5" fill="currentColor" className="text-muted-foreground/30" />
        <rect x="30" y="78" width="35" height="5" rx="2.5" fill="currentColor" className="text-muted-foreground/20" />
        <rect x="30" y="91" width="40" height="5" rx="2.5" fill="currentColor" className="text-muted-foreground/20" />
        <rect x="105" y="45" width="45" height="5" rx="2.5" fill="currentColor" className="text-muted-foreground/30" />
        <rect x="105" y="58" width="35" height="5" rx="2.5" fill="currentColor" className="text-muted-foreground/20" />
        <rect x="105" y="71" width="40" height="5" rx="2.5" fill="currentColor" className="text-muted-foreground/20" />
        <rect x="105" y="84" width="30" height="5" rx="2.5" fill="currentColor" className="text-muted-foreground/20" />
        <circle cx="113" cy="108" r="8" fill="currentColor" className="text-primary/30" />
        <path d="M110 108 L112 110 L117 105" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/70" />
      </svg>
      <div>
        <h2 className="text-xl font-semibold">{t("placeholder.comingSoon")}</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          {t("placeholder.projectsDescription")}
        </p>
      </div>
    </div>
  )
}
