import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Ajusta os caminhos dos arquivos para o nome do repositório durante a publicação no Pages.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isAccountSite = repository?.endsWith('.github.io')
const base = process.env.GITHUB_ACTIONS && repository && !isAccountSite
  ? '/' + repository + '/'
  : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
