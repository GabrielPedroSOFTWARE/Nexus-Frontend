export function normalizeCpf(value) {
  return String(value ?? '').replace(/\D/g, '')
}
