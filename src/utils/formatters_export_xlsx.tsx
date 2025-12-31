// src/utils/formatters.ts

export const formatCurrency = (val: number | null | undefined) => {
  if (val === undefined || val === null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export const maskDocumento = (doc: string | null | undefined) => {
  if (!doc) return ''
  const v = doc.replace(/\D/g, '')
  if (v.length === 11) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  if (v.length === 14) return v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  return doc
}

export const maskPhone = (phone: string | null | undefined) => {
  if (!phone) return ''
  let v = phone.replace(/\D/g, '')
  if (v.length > 11 && v.startsWith('55')) v = v.substring(2)
  if (v.length === 11) return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (v.length === 10) return v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return phone
}
