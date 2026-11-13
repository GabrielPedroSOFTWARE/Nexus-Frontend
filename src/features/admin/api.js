import { apiRequest } from '../../shared/api/httpClient.js'

const idPath = id => encodeURIComponent(String(id))
const publicUser = ({ id, nome, login, email, setor, telefone, justificativa, perfil, status, ehAdmin, dataHoraCadastro }) => ({ id, nome, login, email, setor, telefone, justificativa, perfil, status, ehAdmin, dataHoraCadastro })

export async function listOrders() {
  const data = await apiRequest('/listar-pedidos')
  if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar pedidos.')
  return data.map(({ id, idPC, idUsuario, apelido, status, prioridade, problema, frequencia, dataInicioManutencao, dataFinalManutencao, idTecnico, tecnico, descricao, observacoesTecnico, foto, nomeArquivoFoto, tipoArquivoFoto }) => ({ id, idPC, idUsuario, apelido, status, prioridade, problema, frequencia, dataInicioManutencao, dataFinalManutencao, idTecnico, tecnico, descricao, observacoesTecnico, foto, nomeArquivoFoto, tipoArquivoFoto }))
}
export const getTotals = () => apiRequest('/totalUsuarios')
export async function listUsers() {
  const data = await apiRequest('/admin/retornar-todos-menos-atual')
  if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar usuários.')
  return data.map(publicUser)
}
export async function listPendingUsers() {
  const data = await apiRequest('/admin/usuarios-pendentes')
  if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar solicitações.')
  return data.map(publicUser)
}
export const approveUser = (id, perfil) => apiRequest('/admin/aceitar-sollicitacao/' + idPath(id), { method: 'PUT', body: perfil })
export const rejectUser = id => apiRequest('/admin/negar-solicitacao-usuario/' + idPath(id), { method: 'DELETE' })
export const updateUser = (user, changes) => apiRequest('/admin/salvar-alteracoes-usuarios', { method: 'PUT', body: [{ id: user.id, perfil: user.perfil, ehAdmin: user.ehAdmin, status: user.status, ...changes }] })
export const changeOrderStatus = (id, values) => apiRequest('/admin/alterar-status-pedido/' + idPath(id), { method: 'PATCH', body: values })
export const assignTechnician = (id, technicianId) => apiRequest('/admin/atribuir-tecnico/' + idPath(id), { method: 'PATCH', body: technicianId, rawBody: true })

export const registerUser = user => apiRequest('/cadastrar', { method: 'POST', body: user })
