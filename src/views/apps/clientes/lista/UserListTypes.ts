export type LicenseRow = {
  id: string
  codFilial: number
  codGrupo: number
  nome: string
  documento: string
  ativo: boolean
  matriz: boolean
  dataCadastroApi: string
  produto?: string
  stats?: {
    ativas: number
    inativas: number
  }
  subRows?: LicenseRow[]
}

export type LicenseApiResponse = {
  data: any[]
  meta: {
    total: number
  }
}
