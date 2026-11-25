import { apiRequest } from '../../shared/api/httpClient.js'
import { normalizeCpf } from '../../shared/cpf.js'
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from '../auth/passwordPolicy.js'

const idPath = id => encodeURIComponent(String(id))
const publicUser = ({ id, cpf, cpfDescriptografado, nome, email, setor, telefone, justificativa, perfil, status, ehAdmin, dataHoraCadastro }) => ({ id: id ?? cpf, cpf, cpfExibicao: cpfDescriptografado ?? cpf, nome, email, setor, telefone, justificativa, perfil, status, ehAdmin, dataHoraCadastro })

export async function listOrders() {
  const data = await apiRequest('/backoffice/listar-pedidos')
  if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar pedidos.')
  return data.map(({ id, idPC, idUsuario, cpfUsuario, cpfUsuarioDescriptografado, telefoneUsuario, nomeUsuario, apelido, status, prioridade, problema, frequencia, dataHoraAbertura, dataHoraAtribuicaoTecnico, dataHoraInicioDiagnostico, dataHoraProntaRetirada, dataHoraConclusao, dataInicioManutencao, dataFinalManutencao, estahAtrasada, idTecnico, cpfTecnico, cpfTecnicoDescriptografado, tecnico, descricao, observacoesTecnico, foto, nomeArquivoFoto, tipoArquivoFoto }) => ({ id, idPC, idUsuario: idUsuario ?? cpfUsuarioDescriptografado ?? cpfUsuario, cpfUsuario, cpfUsuarioDescriptografado, telefoneUsuario, nomeUsuario, apelido, status, prioridade, problema, frequencia, dataHoraAbertura, dataHoraAtribuicaoTecnico, dataHoraInicioDiagnostico, dataHoraProntaRetirada, dataHoraConclusao, dataInicioManutencao, dataFinalManutencao, estahAtrasada, idTecnico: idTecnico ?? cpfTecnicoDescriptografado ?? cpfTecnico, cpfTecnico, cpfTecnicoDescriptografado, tecnico, descricao, observacoesTecnico, foto, nomeArquivoFoto, tipoArquivoFoto }))
}
export async function listAssignedOrders() {
  const data = await apiRequest('/backoffice/listar-pedidos-atribuidos')
  if (!Array.isArray(data)) throw new Error('Resposta inválida ao consultar ordens atribuídas.')
  return data.map(({ id, idPC, idUsuario, cpfUsuario, cpfUsuarioDescriptografado, telefoneUsuario, nomeUsuario, apelido, status, prioridade, problema, frequencia, dataHoraAbertura, dataHoraAtribuicaoTecnico, dataHoraInicioDiagnostico, dataHoraProntaRetirada, dataHoraConclusao, dataInicioManutencao, dataFinalManutencao, estahAtrasada, idTecnico, cpfTecnico, cpfTecnicoDescriptografado, tecnico, descricao, observacoesTecnico, foto, nomeArquivoFoto, tipoArquivoFoto }) => ({ id, idPC, idUsuario: idUsuario ?? cpfUsuarioDescriptografado ?? cpfUsuario, cpfUsuario, cpfUsuarioDescriptografado, telefoneUsuario, nomeUsuario, apelido, status, prioridade, problema, frequencia, dataHoraAbertura, dataHoraAtribuicaoTecnico, dataHoraInicioDiagnostico, dataHoraProntaRetirada, dataHoraConclusao, dataInicioManutencao, dataFinalManutencao, estahAtrasada, idTecnico: idTecnico ?? cpfTecnicoDescriptografado ?? cpfTecnico, cpfTecnico, cpfTecnicoDescriptografado, tecnico, descricao, observacoesTecnico, foto, nomeArquivoFoto, tipoArquivoFoto }))
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
export const approveUser = (cpf, perfil) => apiRequest('/adm/aceitar-solicitacao', { method: 'PUT', body: { cpf, perfil } })
export const rejectUser = cpf => apiRequest('/adm/negar-solicitacao-usuario', { method: 'DELETE', body: cpf, rawBody: true })
export const saveUsersInBatch = alteracoes => apiRequest('/adm/salvar-alteracoes-usuarios', { method: 'PUT', body: alteracoes })
export const changeOrderStatus = (id, values) => apiRequest('/backoffice/alterar-status-pedido/' + idPath(id), { method: 'PATCH', body: values })
export const cancelOrder = (id, justification) => {
  const reason = String(justification || '').trim()
  if (!reason) throw new Error('Informe a justificativa para cancelar a O.S.')
  return apiRequest('/backoffice/cancelar-pedido/' + idPath(id), { method: 'PATCH', body: reason, rawBody: true })
}
export const assignTechnician = (id, technicianCpf) => apiRequest('/backoffice/atribuir-tecnico/' + idPath(id), { method: 'PATCH', body: technicianCpf, rawBody: true })
export const returnOrderToQueue = (id, justification) => {
  const reason = String(justification || '').trim()
  if (!reason) throw new Error('Informe a justificativa para devolver a O.S. à fila.')
  return apiRequest('/backoffice/devolver-a-fila/' + idPath(id), { method: 'PATCH', body: reason, rawBody: true })
}

function normalizeIndicatorNumber(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function normalizeIndicator(data) {
  if (!data || typeof data !== 'object') throw new Error('Resposta inválida ao consultar indicador.')
  const points = Array.isArray(data.grafico) ? data.grafico : Array.isArray(data.dados) ? data.dados : []
  return {
    periodo: data.periodoReferencia ?? data.periodo ?? '',
    mediaGeral: normalizeIndicatorNumber(data.valorPrincipal ?? data.mediaGeral),
    dados: points.map(point => ({
      mes: point?.mes,
      media: normalizeIndicatorNumber(point?.valor ?? point?.media),
    })),
  }
}

async function getIndicator(name, ano, mes) {
  const query = new URLSearchParams()
  if (ano != null) query.set('ano', String(ano))
  if (mes != null) query.set('mes', String(mes))
  const queryString = query.toString()
  const suffix = queryString ? `?${queryString}` : ''
  return normalizeIndicator(await apiRequest(`/backoffice/dashboard/${name}${suffix}`))
}

export const getMtbf = (ano, mes) => getIndicator('mtbf', ano, mes)
export const getMttr = (ano, mes) => getIndicator('mttr', ano, mes)

export function registerUser(user) {
  const cpf = normalizeCpf(user.cpf)
  if (cpf.length !== 11) throw new Error('Informe os 11 dígitos do CPF.')
  if (!isPasswordValid(user.senha)) throw new Error(PASSWORD_POLICY_MESSAGE)
  return apiRequest('/cadastrar', { method: 'POST', body: { ...user, cpf } })
}
