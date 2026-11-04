# NEXUS Maintenance System

Frontend em React para o protótipo de gestão de manutenção de equipamentos de TI.

## Desenvolvimento local

```bash
npm install
npm run dev
```

## GitHub Pages

O workflow em `.github/workflows/pages.yml` compila o frontend e publica `dist` quando há push para `main`. Para ativar, selecione **Settings → Pages → GitHub Actions** no repositório.

O build ajusta automaticamente o caminho base para sites de projeto (`/<repositório>/`). A navegação usa hash routes para funcionar em hospedagem estática.

## Escopo atual

As telas usam dados de demonstração no navegador. A autenticação corporativa, a API Spring Boot e o banco MySQL ainda não estão conectados.
