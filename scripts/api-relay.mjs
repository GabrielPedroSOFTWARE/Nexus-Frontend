import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { request as httpRequest, createServer } from 'node:http'
import { request as httpsRequest } from 'node:https'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localEnvPath = path.join(projectRoot, '.env.local')

function readLocalEnv() {
  if (!existsSync(localEnvPath)) return {}
  const values = {}
  for (const line of readFileSync(localEnvPath, 'utf8').split(/\r?\n/)) {
    const match = line.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (match) values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return values
}

const localEnv = readLocalEnv()
const backendBase = new URL(process.env.NEXUS_BACKEND_URL || localEnv.NEXUS_BACKEND_URL || 'http://127.0.0.1:8080')
if (!['http:', 'https:'].includes(backendBase.protocol)) {
  throw new Error('NEXUS_BACKEND_URL deve usar HTTP ou HTTPS.')
}

const port = Number(process.env.NEXUS_PROXY_PORT || localEnv.NEXUS_PROXY_PORT || 8081)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('NEXUS_PROXY_PORT deve ser uma porta entre 1 e 65535.')
}

const defaultOrigins = [
  'https://gabrielpedrosoftware.github.io',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
]
const extraOrigins = (process.env.NEXUS_PROXY_ORIGINS || localEnv.NEXUS_PROXY_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)
const allowedOrigins = new Set([...defaultOrigins, ...extraOrigins])
const allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
const allowedHeaders = new Set(['authorization', 'content-type'])

function getCorsHeaders(request) {
  const origin = request.headers.origin
  if (!origin) return { allowed: true, headers: {} }
  if (!allowedOrigins.has(origin)) return { allowed: false, headers: {} }

  const requestedMethod = String(request.headers['access-control-request-method'] || '').toUpperCase()
  if (requestedMethod && !allowedMethods.has(requestedMethod)) return { allowed: false, headers: {} }

  const requestedHeaders = String(request.headers['access-control-request-headers'] || '')
    .split(',')
    .map(header => header.trim().toLowerCase())
    .filter(Boolean)
  if (requestedHeaders.some(header => !allowedHeaders.has(header))) return { allowed: false, headers: {} }

  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
  }
  return { allowed: true, headers }
}

function replyJson(response, status, value, corsHeaders = {}) {
  const body = Buffer.from(JSON.stringify(value))
  response.writeHead(status, {
    ...corsHeaders,
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': String(body.length),
  })
  response.end(body)
}

const server = createServer((request, response) => {
  const cors = getCorsHeaders(request)
  if (!cors.allowed) {
    return replyJson(response, 403, { message: 'Origem ou cabeçalho não permitido pelo relay local.' })
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, { ...cors.headers, 'Cache-Control': 'no-store' })
    return response.end()
  }

  if (request.method === 'GET' && request.url === '/healthz') {
    return replyJson(response, 200, { status: 'ok' }, cors.headers)
  }

  if (!allowedMethods.has(request.method)) {
    return replyJson(response, 405, { message: 'Método não permitido pelo relay local.' }, cors.headers)
  }

  const incomingUrl = new URL(request.url || '/', 'http://127.0.0.1')
  // Fetch no navegador não envia corpo em GET; o relay adapta somente este contrato do backend.
  const bridgeEquipmentLookup = request.method === 'GET'
    && incomingUrl.pathname === '/adm/equipamentos-por-usuario'
  const cpfBody = bridgeEquipmentLookup ? incomingUrl.searchParams.get('cpfUsuario') : null
  if (bridgeEquipmentLookup && !cpfBody) {
    return replyJson(response, 400, { message: 'Informe o CPF do usuário para consultar os ativos.' }, cors.headers)
  }

  const backendPath = backendBase.pathname.replace(/\/+$/, '')
  const upstreamUrl = new URL(`${backendPath}${incomingUrl.pathname}${incomingUrl.search}`, backendBase.origin)
  const headers = { ...request.headers }
  for (const header of [
    'host',
    'origin',
    'connection',
    'access-control-request-method',
    'access-control-request-headers',
    'access-control-request-private-network',
  ]) delete headers[header]

  let body
  if (bridgeEquipmentLookup) {
    body = Buffer.from(cpfBody, 'utf8')
    headers['content-type'] = 'text/plain;charset=UTF-8'
    headers['content-length'] = String(body.length)
    delete headers['transfer-encoding']
  }

  const transport = upstreamUrl.protocol === 'https:' ? httpsRequest : httpRequest
  const upstreamRequest = transport(upstreamUrl, {
    method: request.method,
    headers,
  }, upstreamResponse => {
    const responseHeaders = { ...upstreamResponse.headers }
    for (const header of Object.keys(responseHeaders)) {
      if (header.startsWith('access-control-')) delete responseHeaders[header]
    }
    responseHeaders['Cache-Control'] = 'no-store'
    Object.assign(responseHeaders, cors.headers)
    response.writeHead(upstreamResponse.statusCode || 502, responseHeaders)
    upstreamResponse.pipe(response)
  })

  upstreamRequest.on('error', () => {
    if (!response.headersSent) {
      replyJson(response, 502, { message: 'Não foi possível conectar ao backend local.' }, cors.headers)
    } else {
      response.destroy()
    }
  })

  if (bridgeEquipmentLookup) upstreamRequest.end(body)
  else request.pipe(upstreamRequest)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Relay local NEXUS: http://127.0.0.1:${port}`)
  console.log(`Backend configurado: ${backendBase.origin}`)
  console.log('Mantenha este processo em execução enquanto usar o frontend com a API local.')
})
