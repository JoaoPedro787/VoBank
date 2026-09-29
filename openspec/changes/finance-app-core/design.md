# Technical Design: Finance App Core

## Context

O projeto consiste em um aplicativo móvel construído em React Native Expo com Expo Router, Drizzle ORM e PostgreSQL local. A arquitetura segue rigorosamente a organização *feature-based* (definida em [AGENTS.md](file:///home/joaofedora/Projects/finances/AGENTS.md) e [prompt.md](file:///home/joaofedora/Projects/finances/prompt.md)), com separação de módulos no app client e no backend serverless (Expo API Routes).

## Goals / Non-Goals

**Goals:**
- Implementar uma arquitetura modular por features (`src/[feat]/` e `src/server/[feat]/`) com compartilhamento de types entre client e server.
- Modelar e persistir entidades no PostgreSQL via Drizzle ORM: `users`, `people`, `credit_cards`, `purchases`, `installments`, `installment_splits`.
- Implementar o algoritmo de ciclo de faturas para cartões de crédito (fechamento vs. vencimento).
- Estruturar a funcionalidade de divisão de compras (*split*) com rastreamento individual do status de pagamento das parcelas.
- Estabelecer o design system inspirado no Shadcn UI com NativeWind v4 e React Native Reusables, suportando Dark Mode automático e manual.
- Agendar notificações locais de vencimento usando `expo-notifications`.
- Garantir rigor de qualidade com `pnpm`, ESLint, Prettier, testes automatizados (TDD) e script unificado de checagem.

**Non-Goals:**
- Integração com Open Finance / APIs bancárias automatizadas (os lançamentos são inseridos pelo usuário).
- Gateway de pagamento real (Pix/cartão no app); o app gerencia o acerto de contas e controle financeiro, não a liquidação bancária.
- Multi-tenancy ou sincronização em tempo real entre diferentes dispositivos de terceiros (o titular cadastra "pessoas" como perfis virtuais dentro da sua própria conta).

## Decisions

### 1. Drizzle ORM com Driver PostgreSQL Local
- **Escolha:** Drizzle ORM (`drizzle-orm` + `postgres`).
- **Motivação:** Performance superior, geração de migrations declarativas leves (`drizzle-kit`), TypeScript-first com inferência de tipos direta do schema, sem overhead de binários pesados como o Prisma.
- **Alternativas consideradas:** Prisma (descartado por footprint maior e complexidade de compilação de binários nativos no ambiente Expo API Routes).

### 2. Expo API Routes (`app/api/...`)
- **Escolha:** Utilizar os endpoints integrados do Expo Router para processamento server-side.
- **Motivação:** Monorepo unificado onde tipos TypeScript (Zod schemas, Drizzle models) são diretamente reaproveitados entre a interface mobile e os endpoints de backend sem necessidade de pacotes compartilhados complexos.
- **Alternativas consideradas:** Backend autônomo em Fastify/Express (descartado para evitar manter dois serviços e configurações separadas de deploy/execução neste estágio).

### 3. NativeWind v4 + React Native Reusables (Shadcn UI Style)
- **Escolha:** React Native Reusables (RNR) com Tailwind CSS v3/NativeWind v4.
- **Motivação:** Permite replicar exatamente o visual, tokens de cores e componentes do Shadcn UI (Radix-like primitives no React Native), facilitando o suporte nativo a temas Claro/Escuro usando variáveis CSS/Tailwind e classes utilitárias.
- **Alternativas consideradas:** UI Kitten / React Native Paper (descartados por terem linguagens visuais proprietárias que desviam do padrão Shadcn solicitado).

### 4. Modelagem de Divisão de Compras em Duas Camadas
- **Escolha:** 
  - `Purchase`: registro mestre (valor total, cartão, número de parcelas, data).
  - `Installment`: cada fatura/mês da compra.
  - `InstallmentSplit`: rateio de cada parcela por pessoa, contendo `amount`, `is_paid` e `paid_at`.
- **Motivação:** Permite que, se uma compra for parcelada em 3x e dividida entre 2 pessoas, cada pessoa tenha 3 registros de parcela independentes. Assim, você pode dar baixa quando a pessoa te pagar o mês 1, mesmo que os meses 2 e 3 ainda estejam pendentes.

```txt
  +-----------------------------------------------------------+
  | Purchase: R$ 300 em 3x (R$ 100/mês)                       |
  +-----------------------------+-----------------------------+
                                |
             +------------------+------------------+
             v                                     v
  [ Installment 1 (Nov) - R$ 100 ]     [ Installment 2 (Dez) - R$ 100 ]
      ├── Split Titular: R$ 50 [x]         ├── Split Titular: R$ 50 [ ]
      └── Split Lucas:   R$ 50 [x]         └── Split Lucas:   R$ 50 [ ]
```

### 5. Notificações Locais (`expo-notifications`)
- **Escolha:** Agendamento local via OS (`scheduleNotificationAsync`).
- **Motivação:** Elimina custos e dependência de serviços externos de push (Firebase Cloud Messaging/Apple Push Notification service servers) ou rotinas cron em nuvem durante o desenvolvimento local. As notificações funcionam mesmo sem sinal de internet.

### 6. Qualidade de Código, pnpm, TDD e Testes Co-localizados por Feature
- **Escolha:** Gerenciador `pnpm`, linter ESLint, formatador Prettier, runner de testes Jest/Vitest seguindo TDD e script consolidado `"check": "prettier --check . && eslint . && jest"`.
- **Organização de Testes por Feature:** Os testes NÃO devem ficar centralizados em uma pasta global solta. Cada módulo deve ter sua própria pasta `tests/`:
  - `src/[feat]/tests/`: Testes unitários e de integração de componentes, custom hooks e stores da feature.
  - `src/server/[feat]/tests/`: Testes de regras de negócio de backend, repositories, services e schemas Zod.
  - `src/shared/tests/`: Testes de helpers e funções utilitárias puras compartilhadas.
- **Motivação:** A co-locação de testes reforça o princípio da arquitetura orientada a features: máxima coesão e baixo acoplamento. Quando uma feature é movida, refatorada ou excluída, seus testes acompanham o ciclo de vida naturalmente.

## Risks / Trade-offs

- **[Risco] Acesso do App Mobile ao Backend Local (`localhost`):**
  - Dispositivos físicos ou emuladores não conseguem acessar `http://localhost:8081` diretamente (no Android, localhost é o próprio dispositivo, exigindo `10.0.2.2`, ou o IP da rede local).
  - *Mitigação:* Criar um helper utilitário de configuração de base URL da API que detecta automaticamente `Constants.expoConfig?.hostUri` durante o desenvolvimento.

- **[Risco] Cálculo de datas em meses com menos de 31 dias:**
  - Vencimento cadastrado no dia 31 gerando parcelas em Fevereiro ou meses com 30 dias.
  - *Mitigação:* Helper de aritmética de datas seguro que limita o dia ao último dia útil/válido do mês correspondente (`clampDateToMonthEnd`).
