# Proposal: Redesign Cupertino Balance e Filtros na API de Compras

## Why

Atualmente, o aplicativo de finanças possui um visual baseado no padrão monocromático básico do Shadcn/Tailwind, distante da experiência visual premium concebida no projeto Google Stitch (**Cupertino Balance**). O Stitch estabelece um design refinado baseado nas diretrizes de interface da Apple (Apple Human Interface Guidelines / iOS Moderno), caracterizado por:
- Paleta semântica com **System Blue (`#007AFF`)**, **System Indigo (`#5856D6`)**, **System Mint Green (`#34C759`)**, **System Amber (`#FF9500`)** e **System Coral Red (`#FF3B30`)**.
- Superfícies em camadas (`Canvas #F2F2F7` light e `#000000`/`#1C1C1E` dark) com elevação subtil e bordas ultrafinas translúcidas.
- Tipografia com alinhamento tabular (`tabular-nums`) para evitar oscilações na renderização de valores monetários.
- Componentes e controles táteis (`Button` com escala `0.97`, `Input` com foco azul e cantos orgânicos, `Badge` com status pills de alta legibilidade, `ModalGrabHandle` ergonômico).

Além disso, a rota de consulta de compras (`GET /api/purchases`) atualmente carrega todos os registros do usuário de forma indiscriminada do banco de dados, delegando todo o trabalho de filtro (mês, ano, cartão, participante e busca por texto) para a memória do client. À medida que o histórico de transações cresce, a ausência de parâmetros de filtro no servidor compromete o desempenho, o consumo de banda e a consistência da API.

Esta mudança introduz:
1. **Padronização Visual Completa no `src/shared/components/` e Telas**: Conversão e modernização dos botões, inputs, cards, badges e modais do projeto de acordo com o design system Cupertino Balance do Stitch, preservando estritamente os contratos arquiteturais das camadas (`shared`, `[feat]`, `app`).
2. **Feature de Filtros na API de Compras (`GET /api/purchases`)**: Capacidade do backend aceitar, validar e processar filtros dinâmicos de período (mês/ano), cartão de crédito, participante/pessoa e busca textual diretamente no banco de dados e na camada de repositório/serviço.
3. **Agrupamento por Dia na Tela de Compras**: Nova visualização em seções cronológicas diárias conforme a tela desenhada no Stitch ("Compras - Agrupado por Dia").

## What Changes

- **Design System & Tokens Globais (`tailwind.config.js` e `src/styles/global.css`)**:
  - Ajuste das variáveis CSS e tokens do Tailwind para a paleta e raio de bordas do Cupertino Balance (`#007AFF`, `#5856D6`, `#34C759`, `#FF9500`, `#FF3B30`).
  - Suporte refinado aos modos Claro e Escuro com materiais e cores nativas iOS.
- **Componentes Base Padronizados (`src/shared/components/`)**:
  - `Button.tsx`: Atualizado com feedback tátil de escala (`transform: scale(0.97)` ao pressionar), altura padronizada de 48px, raio de curvatura de 14px e novas variantes de cor Cupertino.
  - `Input.tsx`: Superfície sutil (`#F2F2F7` em light / `#2C2C2E` em dark), anel de foco System Blue de 1.5px, altura de 48px e tipografia nítida.
  - `Badge.tsx`: Badges em formato pill (`rounded-full`) com as cores exatas de status do Stitch (`Pago` / `#34C759`, `Pendente` / `#FF9500`, `Vencido` / `#FF3B30`, `Parcela` / `#F2F2F7`).
  - `Card.tsx`: Cantos contínuos `rounded-2xl` (16-20px), elevação Apple nível 1/2 com borda ultrafina translúcida (`rgba(0,0,0,0.04)` light / `rgba(255,255,255,0.08)` dark).
  - `ModalGrabHandle.tsx` (novo): Indicador visual ergonômico de arraste para modais inferiores (36x5px, `rounded-full`, `#C7C7CC`).
- **Feature de Filtros na API (`src/server/purchases/` e `src/app/api/purchases+api.ts`)**:
  - Schema de validação Zod `listPurchasesQuerySchema` para parâmetros de query: `month`, `year`, `creditCardId`, `personId` e `search`.
  - Suporte a filtros nos métodos `findByUserId` de `DrizzlePurchasesRepository` e `InMemoryPurchasesRepository`.
  - Atualização de `PurchasesService.listPurchases(userId, filters)` para aplicar os critérios no servidor.
  - Atualização do manipulador `GET /api/purchases+api.ts` para extrair e validar os query params da requisição.
  - Atualização de `purchasesApiService.list(token, filters)` e hook `usePurchases` no client para integração com os filtros de API.
- **Refatoração das Telas e Features do App**:
  - `src/app/(tabs)/purchases.tsx` e `src/purchases/components/`: Exibição agrupada por dia ("Hoje", "Ontem" ou datas formatadas), cards e filtros padronizados com o novo shared.
  - `src/app/(tabs)/index.tsx` e `src/dashboard/components/`: Tipografia monetária com `tabular-nums`, seletor de pessoa "Geral" vs "Você" com destaque System Blue, cartões de métricas Cupertino.
  - `src/app/(tabs)/cards.tsx` e `src/credit-cards/components/`: Cartões realistas com gradiente, destaque para datas de fechamento/vencimento.
  - `src/app/(tabs)/people.tsx` e `src/people/components/`: Lista limpa com avatares e chips de pessoas no novo estilo.
  - `src/app/(auth)/login.tsx` e `register.tsx`: Layout e campos de autenticação alinhados ao visual limpo Cupertino.

## Capabilities

### Modified Capabilities
- `purchases`:
  - `GET /api/purchases` agora suporta filtragem no servidor por período (`month`/`year`), cartão de crédito (`creditCardId`), participante (`personId`) e busca por texto (`search`).
  - A interface de listagem de compras suporta visualização agrupada cronologicamente por dia.

## Impact

- **Client (`src/shared/`, `src/purchases/`, `src/dashboard/`, `src/credit-cards/`, `src/people/`, `src/auth/`, `src/app/`)**:
  - Componentes do `shared` ganham novo visual Cupertino mantendo 100% de compatibilidade de props e contratos com os consumidores existentes.
  - Telas passam a utilizar os novos botões, inputs, badges e cards padronizados.
- **Server (`src/server/purchases/`, `src/app/api/purchases+api.ts`)**:
  - Novo schema de validação para query parameters.
  - Métodos de repositório e serviço enriquecidos com filtros opcionais.
- **Testes**:
  - Testes unitários para `listPurchasesQuerySchema`.
  - Testes para repositório in-memory e serviço de compras validando os novos filtros.
  - Testes de renderização/utilitários atualizados para garantir 100% de aprovação na suíte de testes (`pnpm check`).
