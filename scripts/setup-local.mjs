import { randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(projectRoot, '.env.local')

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  const values = {}
  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match) values[match[1]] = match[2].replace(/^['\"]|['\"]$/g, '')
  }
  return values
}

const env = readEnvFile(envPath)
const values = {
  ...env,
  VITE_API_BASE_URL: env.VITE_API_BASE_URL || '/api',
  NEXUS_BACKEND_DIR: env.NEXUS_BACKEND_DIR || '../Nexus',
  NEXUS_DB_URL: env.NEXUS_DB_URL || 'jdbc:mysql://127.0.0.1:3306/banco_teste?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC',
  NEXUS_DB_USERNAME: env.NEXUS_DB_USERNAME || 'nexus_local',
  NEXUS_DB_PASSWORD: env.NEXUS_DB_PASSWORD || randomBytes(24).toString('hex'),
  NEXUS_JWT_SECRET: env.NEXUS_JWT_SECRET || randomBytes(48).toString('hex'),
  NEXUS_ADMIN_LOGIN: env.NEXUS_ADMIN_LOGIN || 'admin-local',
  NEXUS_ADMIN_PASSWORD: env.NEXUS_ADMIN_PASSWORD || randomBytes(24).toString('base64url'),
}

if (!/^[A-Za-z0-9_]+$/.test(values.NEXUS_DB_USERNAME)) {
  throw new Error('NEXUS_DB_USERNAME deve conter apenas letras, números e sublinhado.')
}
if (!/^[A-Za-z0-9_-]+$/.test(values.NEXUS_DB_PASSWORD)) {
  throw new Error('NEXUS_DB_PASSWORD deve conter apenas letras, números, sublinhado ou hífen.')
}

const serialized = [
  '# Configuração privada deste computador; não envie este arquivo ao Git.',
  ...Object.entries(values).map(([key, value]) => key + '=' + value),
  '',
].join('\n')
writeFileSync(envPath, serialized, { mode: 0o600 })
chmodSync(envPath, 0o600)

try {
  execFileSync('mysqladmin', ['--protocol=socket', 'ping'], { stdio: 'ignore' })
} catch {
  throw new Error('MySQL não está iniciado. No macOS com Homebrew, execute: brew services start mysql')
}

const user = values.NEXUS_DB_USERNAME
const password = values.NEXUS_DB_PASSWORD
const sql = [
  'CREATE DATABASE IF NOT EXISTS banco_teste CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;',
  "CREATE USER IF NOT EXISTS '" + user + "'@'127.0.0.1' IDENTIFIED BY '" + password + "';",
  "ALTER USER '" + user + "'@'127.0.0.1' IDENTIFIED BY '" + password + "';",
  "GRANT ALL PRIVILEGES ON banco_teste.* TO '" + user + "'@'127.0.0.1';",
  'FLUSH PRIVILEGES;',
].join('\n')

try {
  execFileSync('mysql', ['--protocol=socket', '-u', 'root'], { input: sql, stdio: ['pipe', 'inherit', 'inherit'] })
} catch {
  throw new Error('Não foi possível criar o banco local com o usuário root do MySQL. Confira as permissões locais do MySQL.')
}

console.log('Banco banco_teste preparado para o NEXUS.')
console.log('Arquivo local criado: .env.local (ignorado pelo Git).')
console.log('Login inicial do administrador: ' + values.NEXUS_ADMIN_LOGIN)
console.log('A senha local foi guardada em .env.local.')
