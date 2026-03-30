import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import en from "../../messages/en.json"
import cs from "../../messages/cs.json"
import sk from "../../messages/sk.json"

export const SUPPORTED_LOCALES = ["en", "cs", "sk"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  cs: "Čeština",
  sk: "Slovenčina",
}

const LOCALE_STORAGE_KEY = "ziskovac-locale"

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "cs"
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
  if (stored && SUPPORTED_LOCALES.includes(stored)) return stored
  const browser = navigator.language.slice(0, 2) as Locale
  if (SUPPORTED_LOCALES.includes(browser)) return browser
  return "cs"
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    cs: { translation: cs },
    sk: { translation: sk },
  },
  lng: getInitialLocale(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
})

export function setLocale(locale: Locale) {
  i18n.changeLanguage(locale)
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }
}

export default i18n
