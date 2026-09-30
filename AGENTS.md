# Project Guidelines & Rules

## 1. Padrão Arquitetural & Design de Código

### Feature-Based Architecture

O projeto segue estritamente uma arquitetura baseada em features tanto no client-side (mobile) quanto no server-side (API Routes):

- `src/app/`: Rotas do Expo Router (`(auth)`, `(tabs)`, `(modals)`, `api/`).
- `src/[feat]/`: Módulos de features do app (`components/`, `hooks/`, `services/`, `stores/`, `types/`, `utils/`, `tests/`).
- `src/shared/`: Recursos globais e reutilizáveis (`components/`, `constants/`, `hooks/`, `types/`, `utils/`, `lib/`, `tests/`).
- `src/server/`: Lógica de backend isolada (`server/shared/` para db/middleware e `server/[feat]/` para services, repositories, schemas Zod e `tests/`).

### Stack & Tecnologias

- **Gerenciador de Pacotes:** `pnpm` (obrigatório em todos os comandos de instalação e scripts).
- **Mobile:** React Native Expo com TypeScript.
- **Roteamento:** Expo Router (com API Routes integradas em `app/api/...`).
- **Banco de Dados & ORM:** Drizzle ORM conectado diretamente ao PostgreSQL local.
- **Segurança & Auth:** Autenticação com JWT, hashing seguro de senhas, armazenamento seguro com `expo-secure-store`.

### Qualidade de Código, TDD & Scripts

- **Linter & Formatação:** ESLint configurado para capturar erros ocultos e Prettier para formatação padrão.
- **Testes (TDD):** Implementação orientada a testes (TDD) para validar regras de negócio críticas. Os testes devem ficar organizados dentro da pasta `tests/` de cada feature (`src/[feat]/tests/`, `src/server/[feat]/tests/` e `src/shared/tests/`), evitando pastas globais soltas.
- **Testes Isolados e In-Memory (Sem .env/DB em CI):** Testes unitários/automatizados (executados em CI/GitHub Actions via `pnpm check`) **NUNCA** devem depender de variáveis de ambiente de banco de dados (`.env`, `DATABASE_URL`) nem de conexão ativa com banco de dados real. Não teste as rotas finais (`src/app/api/...`) diretamente caso elas importem a conexão com o banco de dados; em vez disso, teste os componentes isolados da rota em memória (services com repositórios in-memory/mocks, middlewares de autenticação, schemas Zod e utilitários de resposta HTTP).
- **Script Unificado de Validação:** Deve existir um script no `package.json` (ex: `pnpm check` ou `pnpm validate`) que executa em sequência:
  1. Verificação do Prettier (`prettier --check .`)
  2. Linter ESLint (`eslint .`)
  3. Suíte de testes (`jest` ou `vitest`)

### Design System & UI/UX

- **Componentes:** Estilo Shadcn UI adaptado para React Native (NativeWind v4 + React Native Reusables).
- **Tema:** Suporte completo a Modo Claro e Escuro, detectando as preferências do sistema (`useColorScheme()`) com opção de toggle.
- **Transições & Animações:** Micro-animações suaves (fade, scale-up, feedback tátil via haptics).
- **Boas Práticas de UI/UX:** Alinhadas com os padrões das skills de design e `ui-ux-pro-max`.

### Regras de Negócio Fundamentais

1. **Pessoas:** Cada usuário pode cadastrar pessoas (com nome e cor identificadora) para vincular despesas.
2. **Rachar Compras:** Suporte para dividir o valor de compras entre o titular e uma ou mais pessoas cadastradas (porcentagem ou valores fixos), gerando parcelas individuais de acerto de contas.
3. **Cartões & Faturas:**
   - Todo cartão de crédito possui **dia de fechamento** e **dia de vencimento**.
   - O cálculo das parcelas deve considerar se a data da compra foi antes ou depois do fechamento para atribuir a fatura correta.
   - Status de parcela por pessoa: controle de quais parcelas foram pagas ou estão pendentes em cada mês.
4. **Notificações:** Alertas de vencimento de parcelas/faturas locais via `expo-notifications` (1 dia antes e no dia do vencimento).

---

## 2. Sugestão Obrigatória de Commits

Ao final de cada etapa, tarefa implementada ou arquivo significativo criado/alterado, o assistente deve **sempre sugerir ideias de mensagens de commit** formatadas no padrão **Conventional Commits**:

- `feat(...)`: Novas funcionalidades.
- `fix(...)`: Correção de bugs.
- `refactor(...)`: Refatoração sem mudança de comportamento.
- `chore(...)`: Configurações de ambiente, dependências ou infra.
- `docs(...)`: Alterações de documentação e planejamento.

---

## 3. Fluxo de Execução de Tarefas (Tasks)

- **Execução por Grupo Principal:** O assistente deve implementar as tarefas agrupadas pelo seu número principal (ex: concluir todas as subtasks do grupo `1` como `1.1`, `1.2`, `1.3`, etc.).
- **Pausa Obrigatória:** Sempre **parar e aguardar confirmação/validação do usuário** imediatamente após finalizar um grupo completo de tasks (ex: terminou todas as do bloco `1`, pare antes de iniciar o bloco `2`).
- **Relatório e Commits:** Ao parar no final de cada grupo, apresentar um resumo do que foi entregue, o status das tarefas e a sugestão de commits correspondentes.
