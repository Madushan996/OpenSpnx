import { CURRENCIES } from '../constants'

const SYMBOL_MAP = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.symbol]))

export const formatAmount = (amount, currency = 'LKR') => {
  const n = Number(amount) || 0
  const symbol = SYMBOL_MAP[currency] || currency
  return `${symbol} ${n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Legacy alias — kept so existing code that imports formatLKR still works
export const formatLKR = (amount) => formatAmount(amount, 'LKR')

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const monthLabel = (yearMonth) => {
  const [year, month] = yearMonth.split('-')
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}
