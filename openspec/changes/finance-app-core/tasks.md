# Tasks

## 1. Setup, Qualidade & Configuração Inicial

- [x] 1.1 Inicializar o projeto React Native Expo com TypeScript e Expo Router utilizando exclusivamente `pnpm` como gerenciador de pacotes e verificar que a inicialização ocorre sem erros.
- [x] 1.2 Configurar ESLint com regras para TypeScript/React e Prettier para padronização de código, validando execução sem erros de `pnpm lint` e `pnpm format:check`.
- [x] 1.3 Configurar o runner de testes (Jest / Vitest com `jest-expo`) e criar o script unificado de validação no `package.json` (`"check": "prettier --check . && eslint . && jest --passWithNoTests"`), testando sua execução com `pnpm check`.
- [x] 1.4 Configurar NativeWind v4, Tailwind CSS e base dos componentes React Native Reusables (Shadcn style) com suporte a Dark/Light Mode e verificar compilação dos estilos.
- [x] 1.5 Configurar Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `postgres`) e criar o cliente de conexão em `src/server/shared/db.ts` testando a conexão com o PostgreSQL local.

## 2. Modelagem do Banco de Dados & Migrations

- [x] 2.1 Criar schemas Drizzle para as tabelas `users`, `people`, `credit_cards`, `purchases`, `installments` e `installment_splits` com validações Zod e verificar tipagens exportadas.
- [x] 2.2 Gerar e executar migrações iniciais via `drizzle-kit generate` e `drizzle-kit migrate`, verificando a criação de todas as tabelas no banco de dados local.

## 3. Autenticação e Gestão de Sessão (TDD)

- [ ] 3.1 Escrever testes unitários (TDD) para validações de payload de autenticação com Zod, funções utilitárias de hash e JWT e services com persistência mockada, implementando o código até que todos os testes passem.
- [ ] 3.2 Criar Expo API Routes para registro, login e perfil (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`), incluindo middleware de validação JWT, e testar respostas HTTP.
- [ ] 3.3 Construir telas de autenticação (`src/app/(auth)/login.tsx` e `register.tsx`), integrando persistência de token com `expo-secure-store` e verificar fluxo de login e logout.

## 4. Gestão de Pessoas e Cartões de Crédito

- [ ] 4.1 Implementar serviços de backend (com testes unitários utilizando banco mockado) e API Routes para CRUD de pessoas (`/api/people`) e validar cadastro de nomes com cores hexadecimais.
- [ ] 4.2 Implementar serviços de backend (com testes unitários utilizando banco mockado) e API Routes para CRUD de cartões (`/api/cards`) validando dia de fechamento e dia de vencimento.
- [ ] 4.3 Desenvolver componentes e telas da interface para gerenciar Pessoas e Cartões no padrão Shadcn UI e testar adição e edição no app.

## 5. Motor de Compras, Faturas e Divisão (Rachar com TDD)

- [ ] 5.1 Escrever suíte de testes unitários (TDD - Red) cobrindo todos os cenários de cálculo do ciclo de fatura (compras antes/depois do fechamento, meses de 28, 30 e 31 dias e anos bissextos) e implementar o helper de faturas até que todos os testes passem (Green).
- [ ] 5.2 Escrever testes unitários (TDD) para a lógica matemática de divisão de compras (*split* por porcentagem e por valor fixo) e geração de parcelas individuais, implementando a função em seguida.
- [ ] 5.3 Implementar endpoint e service de cadastro de compras (`/api/purchases`) com suporte a compras à vista, débito e crédito, persistindo compras, parcelas e splits (com testes unitários mockando o banco).
- [ ] 5.4 Implementar endpoint para alternar status de pagamento de uma parcela de pessoa (`/api/installments/:id/toggle-paid`).
- [ ] 5.5 Desenvolver modal "Nova Compra" no app com seletor de método de pagamento, seletor de cartão, visualização de parcelas calculadas e controle de divisão de percentual/valor entre pessoas.

## 6. Mini Dashboard e Resumo por Pessoa

- [ ] 6.1 Implementar endpoint ou service de consolidação de faturas (`/api/dashboard`), agrupando totais do mês, valores já pagos, valores pendentes e vencidos por pessoa (com testes unitários usando dados mockados).
- [ ] 6.2 Construir telas principais do dashboard (`src/app/(tabs)/index.tsx`) com cartões coloridos por pessoa, filtros mensais e badges de status de parcelas.

## 7. Notificações Locais, Polimento e Validação Final

- [ ] 7.1 Configurar `expo-notifications` para agendar alertas locais para 1 dia antes e no dia de vencimento de parcelas pendentes, além de cancelamento automático ao pagar.
- [ ] 7.2 Adicionar micro-animações (fade, scale-up em modais e cards) e validar alternância de tema Claro/Escuro pelo sistema e manual.
- [ ] 7.3 Executar o script unificado `pnpm check` e verificar que linter ESLint, Prettier e 100% dos testes unitários executam com sucesso sem nenhum erro ou aviso.
