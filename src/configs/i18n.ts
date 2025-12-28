export const i18n = {
  defaultLocale: 'pt_BR',
  locales: ['en', 'pt_BR'],
  langDirection: {
    en: 'ltr',
    pt_BR: 'ltr'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
