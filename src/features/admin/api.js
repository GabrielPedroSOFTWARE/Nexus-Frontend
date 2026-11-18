import { apiRequest } from '../../shared/api/httpClient.js'
import { normalizeCpf } from '../../shared/cpf.js'

const idPath = id => encodeURIComponent(String(id))
const publicUser = ({ id, cpf, nome, email, setor, telefone, justificativa, perfil, status, ehAdmin, dataHoraCadastro }) => ({ id: id ?? cpf, cpf, nome, email, setor, telefone, justificativa, perfil, status, ehAdmin, dataHoraCadastro })

export async function listOrders() {
  const data = await apiRequest('/backoffice/listar-pedidos')
  if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar pedidos.')
  return data.map(({ id, idPC, idUsuario, cpfUsuario, apelido, status, prioridade, problema, frequencia, dataInicioManutencao, dataFinalManutencao, idTecnico, tecnico, descricao, observacoesTecnico, foto, nomeArquivoFoto, tipoArquivoFoto }) => ({ id, idPC, idUsuario: idUsuario ?? cpfUsuario, cpfUsuario, apelido, status, prioridade, problema, frequencia, dataInicioManutencao, dataFinalManutencao, idTecnico, tecnico, descricao, observacoesTecnico, foto, nomeArquivoFoto, tipoArquivoFoto }))
}
export const getTotals = () => apiRequest('/backoffice/totalUsuarios')
export async function listUsers() {
  const data = await apiRequest('/adm/retornar-todos-menos-atual')
  if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar usuários.')
  return data.map(publicUser)
}
export async function listPendingUsers() {
  const data = await apiRequest('/adm/usuarios-pendentes')
  if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar solicitações.')
  return data.map(publicUser)
}
export const approveUser = (id, perfil) => apiRequest('/adm/aceitar-sollicitacao/' + idPath(id), { method: 'PUT', body: perfil })
export const rejectUser = id => apiRequest('/adm/negar-solicitacao-usuario/' + idPath(id), { method: 'DELETE' })
export const updateUser = (user, changes) => apiRequest('/adm/salvar-alteracoes-usuarios', { method: 'PUT', body: [{ id: user.id ?? user.cpf, perfil: user.perfil, ehAdmin: user.ehAdmin, status: user.status, ...changes }] })
export const changeOrderStatus = (id, values) => apiRequest('/backoffice/alterar-status-pedido/' + idPath(id), { method: 'PATCH', body: values })
export const assignTechnician = (id, technicianId) => apiRequest('/adm/atribuir-tecnico/' + idPath(id), { method: 'PATCH', body: technicianId, rawBody: true })

export function registerUser(user) {
  const cpf = normalizeCpf(user.cpf)
  if (cpf.length !== 11) throw new Error('Informe os 11 dígitos do CPF.')
  return apiRequest('/cadastrar', { method: 'POST', body: { ...user, cpf } })
}
