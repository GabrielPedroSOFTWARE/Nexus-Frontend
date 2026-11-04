<p align="center">
  <img src="public/nexus-logo.png" alt="Logotipo do NEXUS" width="148" />
</p>

<h1 align="center">NEXUS</h1>

<p align="center">
  Sistema de gestão de manutenção de equipamentos de TI
</p>

<p align="center">
  <a href="https://gabrielpedrosoftware.github.io/Nexus-Frontend/"><strong>Acessar demonstração</strong></a>
  ·
  <a href="#instalação-e-execução"><strong>Executar localmente</strong></a>
</p>

<p align="center">
  <a href="https://github.com/GabrielPedroSOFTWARE/Nexus-Frontend/actions/workflows/pages.yml">
    <img src="https://img.shields.io/badge/Publica%C3%A7%C3%A3o-autom%C3%A1tica-2ea44f?logo=github&logoColor=white" alt="Publicação automática no GitHub Pages" />
  </a>
  <img src="https://img.shields.io/badge/React-19.3.1-087ea4?logo=react&logoColor=white" alt="React 19.3.1" />
  <img src="https://img.shields.io/badge/Vite-8.3.5-646CFF?logo=vite&logoColor=white" alt="Vite 8.3.5" />
</p>

## Sobre o projeto

O NEXUS é uma aplicação web para acompanhar solicitações e manutenções de equipamentos de TI. Esta versão apresenta, em uma interface responsiva, os fluxos de quem solicita atendimento e da equipe administrativa.

Este repositório contém a interface do sistema. As telas usam dados demonstrativos para apresentar a navegação e as interações disponíveis.

## Captura de tela

<p align="center">
  <img src="docs/imagens/painel-administrativo.png" alt="Painel administrativo do NEXUS com resumo das ordens de serviço, manutenções ativas, alertas e estatísticas" width="100%" />
</p>

<p align="center"><sub>Os números e registros exibidos são dados de demonstração.</sub></p>

## Funcionalidades demonstradas

### Área do solicitante

- Consultar computadores vinculados ao usuário.
- Acompanhar o histórico de solicitações.
- Simular a abertura de uma solicitação de manutenção.
- Demonstrar a leitura das informações de um equipamento.

### Área administrativa

- Visualizar um resumo de ordens de serviço e manutenções.
- Acompanhar indicadores e gráficos de desempenho.
- Consultar ordens de serviço e detalhes de uma manutenção.
- Filtrar manutenções por situação.
- Demonstrar a atualização da situação de uma ordem de serviço.

## Tecnologias

- [React](https://react.dev/) para a construção da interface.
- [Vite](https://vite.dev/) para desenvolvimento e compilação do projeto.
- [React Router](https://reactrouter.com/) com `HashRouter` para navegação em hospedagem estática.
- [Recharts](https://recharts.org/) para os gráficos.
- [Lucide React](https://lucide.dev/) para os ícones.
- [Tailwind CSS](https://tailwindcss.com/) e CSS para os estilos.

## Instalação e execução

### Pré-requisitos

- Node.js que atenda a `^20.19.0 || >=22.12.0`, requisito da versão do Vite usada neste projeto.
- npm, incluído na instalação do Node.js.

### Preparar o projeto

```bash
git clone https://github.com/GabrielPedroSOFTWARE/Nexus-Frontend.git
cd Nexus-Frontend
npm ci
npm run dev
```

Depois, abra o endereço exibido no terminal. Por padrão, o Vite inicia em <http://localhost:5173>.

### Comandos disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Gera a versão de produção na pasta `dist/`. |
| `npm run preview` | Abre localmente uma prévia da versão compilada. |

## Páginas da demonstração

As páginas podem ser acessadas pelas rotas abaixo. Como o projeto usa `HashRouter`, cada rota começa com `/#/`.

| Rota | Página |
| --- | --- |
| `/#/` | Entrada do sistema. |
| `/#/home` | Início do solicitante. |
| `/#/meus-pcs` | Equipamentos do solicitante. |
| `/#/historico` | Histórico de solicitações. |
| `/#/admin` | Início da área administrativa. |
| `/#/admin/ordens` | Ordens de serviço e indicadores. |
| `/#/admin/manutencoes` | Manutenções ativas. |
| `/#/admin/cadastro-usuario` | Cadastro demonstrativo de usuário. |

## Publicação no GitHub Pages

A publicação é feita pelo GitHub Actions, usando o fluxo de trabalho [`pages.yml`](.github/workflows/pages.yml). Ele compila o projeto e publica o conteúdo da pasta `dist/` quando há uma atualização no ramo `main`; também pode ser iniciado manualmente pela aba **Ações** do repositório.

Para configurar uma cópia do projeto, selecione **Configurações → Pages → GitHub Actions** como origem da publicação. O arquivo `vite.config.js` ajusta automaticamente o caminho-base para o endereço do repositório durante a execução do fluxo de trabalho.

**Demonstração publicada:** [gabrielpedrosoftware.github.io/Nexus-Frontend](https://gabrielpedrosoftware.github.io/Nexus-Frontend/)

## Estrutura do projeto

```text
.
├── .github/workflows/pages.yml       # Publicação no GitHub Pages
├── docs/imagens/                     # Imagens da documentação
├── public/                           # Imagens e logotipo da aplicação
├── src/
│   ├── App.jsx                       # Telas e navegação
│   ├── main.jsx                      # Inicialização do React
│   └── styles.css                    # Estilos da aplicação
├── index.html                        # Documento HTML principal
├── package.json                      # Dependências e comandos
├── package-lock.json                 # Versões das dependências
├── vite.config.js                    # Configuração do Vite e do caminho-base
└── README.md                         # Documentação do projeto
```

## Escopo atual

Esta versão é um protótipo de interface. A autenticação, os cadastros e as alterações apresentados são demonstrações; os dados não são enviados a um servidor nem salvos em um banco de dados. A autenticação institucional, a API Java/Spring Boot e o banco MySQL ainda não estão integrados.

## Dúvidas e sugestões

Registre dúvidas, sugestões ou problemas na [área de problemas do repositório](https://github.com/GabrielPedroSOFTWARE/Nexus-Frontend/issues).
