const digitsOnly = value => String(value ?? '').replace(/\D/g, '')

export function normalizeBrazilianPhone(value) {
  const digits = digitsOnly(value)
  return /^55/.test(digits) && [12, 13].includes(digits.length) ? digits.slice(2) : digits
}

export function isBrazilianPhoneValid(value) {
  return [10, 11].includes(normalizeBrazilianPhone(value).length)
}

export function maskBrazilianPhoneInput(value) {
  const digits = normalizeBrazilianPhone(value).slice(0, 11)
  if (!digits) return ''
  if (digits.length < 2) return `(${digits}`
  if (digits.length === 2) return `(${digits})`

  const areaCode = `(${digits.slice(0, 2)})`
  const subscriber = digits.slice(2)
  if (digits.length > 10) return `${areaCode} ${subscriber.slice(0, 5)}${subscriber.length > 5 ? `-${subscriber.slice(5)}` : ''}`
  return `${areaCode} ${subscriber.slice(0, 4)}${subscriber.length > 4 ? `-${subscriber.slice(4)}` : ''}`
}

export function formatBrazilianPhone(value) {
  if (value == null || String(value).trim() === '') return ''
  return isBrazilianPhoneValid(value) ? maskBrazilianPhoneInput(value) : String(value)
}
