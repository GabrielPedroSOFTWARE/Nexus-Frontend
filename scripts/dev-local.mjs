import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(projectRoot, '.env.local')

if (!existsSync(envPath)) {
  console.error('Execute primeiro: npm run setup:local')
  process.exit(1)
}

const localEnv = {}
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match) localEnv[match[1]] = match[2].replace(/^['\"]|['\"]$/g, '')
}

const backendPath = path.resolve(projectRoot, localEnv.NEXUS_BACKEND_DIR || '../Nexus')
if (!existsSync(path.join(backendPath, 'gradlew')) && process.platform !== 'win32') {
  console.error('Backend não encontrado em ' + backendPath + '. Ajuste NEXUS_BACKEND_DIR no .env.local.')
  process.exit(1)
}

const javaCandidates = [
  process.env.JAVA_HOME,
  '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
  '/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home',
]
const javaHome = javaCandidates.find(candidate => candidate && existsSync(path.join(candidate, 'bin', 'java')))
if (!javaHome) {
  console.error('Instale o JDK 21 ou defina JAVA_HOME para o JDK 21.')
  process.exit(1)
}

const env = {
  ...process.env,
  ...localEnv,
  JAVA_HOME: javaHome,
  PATH: path.join(javaHome, 'bin') + path.delimiter + process.env.PATH,
}
const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
const gradleArgs = ['bootRun', '--args=--spring.profiles.active=local']
const backend = spawn(gradleCommand, gradleArgs, {
  cwd: backendPath,
  env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
})
const vite = spawn(process.execPath, [path.join(projectRoot, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1'], {
  cwd: projectRoot,
  env,
  stdio: 'inherit',
})

console.log('Frontend: http://localhost:5173')
console.log('Backend:  http://localhost:8080')
console.log('Pare os dois serviços com Ctrl+C.')

let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  backend.kill('SIGTERM')
  vite.kill('SIGTERM')
  process.exitCode = code
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
backend.on('error', error => {
  console.error('Não foi possível iniciar o backend:', error.message)
  stop(1)
})
vite.on('error', error => {
  console.error('Não foi possível iniciar o frontend:', error.message)
  stop(1)
})
backend.on('exit', code => {
  if (!stopping && code !== 0) {
    console.error('O backend encerrou com erro.')
    stop(code || 1)
  }
})
vite.on('exit', code => {
  if (!stopping && code !== 0) {
    console.error('O frontend encerrou com erro.')
    stop(code || 1)
  }
})
