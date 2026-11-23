<p align="center">
  <img src="public/nexus-logo.png" alt="Logotipo do NEXUS" width="148" />
</p>

<h1 align="center">NEXUS</h1>

<p align="center">
  Sistema de gestão de manutenção de equipamentos de TI
</p>

<p align="center">
  <a href="https://gabrielpedrosoftware.github.io/Nexus-Frontend/"><strong>Acessar o NEXUS</strong></a>
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

Este repositório contém a interface do sistema. O GitHub Pages pode tentar acessar o backend local no computador do usuário e oferece uma opção de demonstração com dados simulados. Localmente, é possível conectar as funções disponíveis à API do backend.

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
| `/#/admin/cadastro-usuario` | Cadastro de usuário. |

## Publicação no GitHub Pages

A publicação é feita pelo GitHub Actions, usando o fluxo de trabalho [`pages.yml`](.github/workflows/pages.yml). Ele compila o projeto e publica o conteúdo da pasta `dist/` quando há uma atualização no ramo `main`; também pode ser iniciado manualmente pela aba **Ações** do repositório.

Para configurar uma cópia do projeto, selecione **Configurações → Pages → GitHub Actions** como origem da publicação. O arquivo `vite.config.js` ajusta automaticamente o caminho-base para o endereço do repositório durante a execução do fluxo de trabalho.

**Frontend publicado:** [gabrielpedrosoftware.github.io/Nexus-Frontend](https://gabrielpedrosoftware.github.io/Nexus-Frontend/)

## Estrutura do projeto

```text
.
├── .github/workflows/              # Publicação no GitHub Pages
├── docs/imagens/                   # Imagens usadas nesta documentação
├── public/                         # Imagens e identidade visual da aplicação
├── src/
│   ├── app/                        # Composição da aplicação e seleção de rotas
│   ├── assets/fonts/               # Fontes locais
│   ├── features/                   # Fluxos e dados de cada domínio
│   │   ├── access-requests/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── equipment/
│   │   ├── service-orders/
│   │   ├── service-requests/
│   │   └── users/
│   ├── pages/                      # Telas separadas por perfil e rota
│   │   ├── admin/
│   │   ├── auth/
│   │   └── user/
│   ├── shared/                    # API genérica, layout e componentes comuns
│   ├── styles/                     # Estilos base, por área e ajustes responsivos
│   └── main.jsx                    # Inicialização do React
├── index.html                      # Documento HTML principal
├── package.json                    # Dependências e comandos
├── package-lock.json               # Versões das dependências
├── vite.config.js                  # Configuração do Vite e do caminho-base
└── README.md                       # Documentação do projeto
```

`app` conecta as telas e mantém a navegação. `pages` reúne as telas completas; `features` concentra componentes, dados e chamadas da API ligados a cada fluxo; `shared` contém partes reutilizadas. Em `styles/index.css`, os arquivos CSS são carregados na ordem necessária para preservar a apresentação.

A lógica de autenticação, equipamentos e solicitações fica em hooks dentro de `features/`. Arquivos chamados `demoData.js` guardam dados de exemplo usados nas telas demonstrativas.

## Escopo atual

O GitHub Pages tenta acessar o backend local no computador do usuário. No modo de demonstração, os dados são simulados. No modo local, login, equipamentos e pedidos usam a API configurada. Na área administrativa conectada é possível consultar ordens, usuários e pendências, aprovar acessos, cadastrar usuários, alterar perfis e status e atribuir técnicos, conforme as rotas oferecidas pelo backend.

## Dúvidas e sugestões

Registre dúvidas, sugestões ou problemas na [área de problemas do repositório](https://github.com/GabrielPedroSOFTWARE/Nexus-Frontend/issues).


## Execução integrada local

Com o backend já iniciado na porta 8080 pelo responsável, configure o frontend:

```bash
cp .env.local.example .env.local
npm ci
npm run dev
```

No Windows, copie `.env.local.example` para `.env.local` pelo VS Code. Abra o endereço informado pelo Vite. O frontend encaminha as chamadas `/api` para `http://127.0.0.1:8080`; se necessário, ajuste `NEXUS_BACKEND_URL` no `.env.local` e reinicie o Vite. O arquivo `.env.local` não deve ser enviado ao Git.

O login, a leitura e o cadastro de equipamentos, os pedidos e o histórico dependem dos contratos da versão do backend em execução. A área administrativa usa os contratos da versão do backend `fd13cbb` ou compatível. A solicitação de acesso pela tela de login usa o endpoint de cadastro; a negação de solicitações permanece indisponível. Os status de 0 a 5 seguem provisoriamente a ordem do protótipo (Recebida, Em diagnóstico, Em manutenção, Aguardando peças, Pronta para retirada e Concluída). O código 6 permanece não identificado, e a correspondência e as transições devem ser confirmadas com a equipe do backend. As incompatibilidades entre versões e a segurança da API devem ser avaliadas pelo responsável pelo backend.

No GitHub Pages, o endereço da API é `http://127.0.0.1:8080` no próprio computador que abriu o site. O backend deve permitir a origem `https://gabrielpedrosoftware.github.io` por CORS, inclusive as requisições de verificação e os cabeçalhos necessários, e o navegador pode exigir permissão para acesso local. Na versão `fd13cbb` o CORS permite a origem do Pages, mas não permite `PATCH`; assim, as alterações que usam esse método dependem de ajuste pelo responsável pelo backend. A opção “Abrir demonstração” usa dados simulados. O proxy do Vite funciona apenas durante a execução local, não na hospedagem estática.

### Limitações atuais da integração

- A versão do backend `fd13cbb` não possui campo próprio para frequência. O frontend inclui a informação no texto do problema e também envia o campo `frequencia`, para compatibilidade com versões que o aceitem. Nas telas, uma frequência reconhecida é mostrada separadamente. Sem campo próprio no backend, não há consulta ou filtro independente por frequência.
- O backend retorna o anexo sem nome nem tipo original. O frontend o disponibiliza como `anexo.bin`.
- A leitura automática descreve a máquina onde o backend está rodando.
- As notificações são consultadas, mas o backend não oferece uma rota para marcá-las como lidas.
- Os indicadores de prazo, estoque e desempenho precisam de dados ou regras adicionais do backend. A correspondência provisória dos status precisa de confirmação com a equipe do backend.
- O responsável pelo backend deve revisar as permissões e os dados devolvidos pela API antes do uso com informações reais.
