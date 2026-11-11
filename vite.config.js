import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isAccountSite = repository?.endsWith('.github.io')
const base = process.env.GITHUB_ACTIONS && repository && !isAccountSite
  ? '/' + repository + '/'
  : '/'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base,
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.NEXUS_BACKEND_URL || 'http://127.0.0.1:8080',
          changeOrigin: true,
          configure: proxy => {
            proxy.on('proxyReq', proxyRequest => proxyRequest.removeHeader('origin'))
          },
          rewrite: path => path.slice(4),
        },
      },
    },
  }
})
