import { createFileRoute, useRouteContext } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/app/settings/")({
  component: SettingsPage,
})

function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useRouteContext({ from: "/app" })

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.profileSection")}</CardTitle>
          <CardDescription>{t("settings.profileDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">{t("settings.nameLabel")}</Label>
            <Input id="name" defaultValue={user.name} readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">{t("settings.emailLabel")}</Label>
            <Input id="email" type="email" defaultValue={user.email} readOnly />
          </div>
          <Button variant="outline" className="self-start" disabled>
            {t("settings.saveProfile")}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.securitySection")}</CardTitle>
          <CardDescription>{t("settings.securityDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current-password">{t("settings.currentPassword")}</Label>
            <Input id="current-password" type="password" disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">{t("settings.newPassword")}</Label>
            <Input id="new-password" type="password" disabled />
          </div>
          <Button variant="outline" className="self-start" disabled>
            {t("settings.changePassword")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
