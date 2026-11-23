export function FormRequirementsNote({ className = '', includeOptional = false }) {
  const classes = ['form-requirements-note', className].filter(Boolean).join(' ')

  return <p className={classes}>
    <span className="form-requirements-note-star" aria-hidden="true">*</span>
    {' '}Os campos com asterisco são obrigatórios.
    {includeOptional && <> Os campos marcados como <strong>(opcional)</strong> podem ficar em branco.</>}
  </p>
}
