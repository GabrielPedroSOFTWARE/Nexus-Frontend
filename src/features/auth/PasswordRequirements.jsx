import { getPasswordRequirements } from './passwordPolicy.js'

export function PasswordRequirements({ value = '' }) {
  return <ul className="password-requirements" aria-label="Requisitos da senha">
    {getPasswordRequirements(value).map(requirement => <li className={requirement.met ? 'is-met' : ''} aria-label={`${requirement.label}: ${requirement.met ? 'atendido' : 'pendente'}`} key={requirement.id}>
      <span aria-hidden="true">{requirement.met ? '✓' : '○'}</span>{requirement.label}
    </li>)}
  </ul>
}
