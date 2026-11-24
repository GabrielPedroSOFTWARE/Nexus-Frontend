export function normalizeCpf(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function formatCpf(value) {
  const digits = normalizeCpf(value).slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function formatCpfOrDemo(value, allowDemo = false) {
  const raw = String(value ?? '')
  if (allowDemo && /[a-zA-Z]/.test(raw)) return raw.slice(0, 32)
  return formatCpf(raw)
}
