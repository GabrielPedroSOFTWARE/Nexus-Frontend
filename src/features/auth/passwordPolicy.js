const passwordRules = [
  { id: 'length', label: 'Pelo menos 8 caracteres', validate: value => value.length >= 8 },
  { id: 'uppercase', label: '1 letra maiúscula', validate: value => /\p{Lu}/u.test(value) },
  { id: 'special', label: '1 caractere especial', validate: value => /[^\p{L}\p{N}\s]/u.test(value) },
  { id: 'number', label: '1 número (0–9)', validate: value => /\d/.test(value) },
]

export const PASSWORD_POLICY_MESSAGE = 'A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 caractere especial e 1 número.'

export function getPasswordRequirements(password = '') {
  const value = String(password)
  return passwordRules.map(rule => ({ id: rule.id, label: rule.label, met: rule.validate(value) }))
}

export function isPasswordValid(password = '') {
  return getPasswordRequirements(password).every(requirement => requirement.met)
}
