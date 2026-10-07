# Tasks: Cupertino Balance Redesign e Filtros na API de Compras

## 1. Design System Foundation & Componentes Base (`src/shared/`)

- [ ] 1.1 Atualizar `tailwind.config.js` e `src/styles/global.css` com as cores do Cupertino Balance (System Blue `#007AFF`, Indigo `#5856D6`, Mint Green `#34C759`, Amber `#FF9500`, Coral Red `#FF3B30`, fundos `#F2F2F7` / `#000000`).
- [ ] 1.2 Refatorar `src/shared/components/Button.tsx` adicionando micro-interação de escala (`active:scale-[0.97]`), 48px de altura, radius 14px e variantes de cor Cupertino.
- [ ] 1.3 Refatorar `src/shared/components/Input.tsx` com fundo sutil (`#F2F2F7` / `#2C2C2E`), anel de foco azul de 1.5px e altura 48px.
- [ ] 1.4 Refatorar `src/shared/components/Badge.tsx` com status pills circulares (`rounded-full`) e cores semânticas exatas do Stitch.
- [ ] 1.5 Refatorar `src/shared/components/Card.tsx` com cantos `rounded-2xl` e elevação Apple nível 1/2.
- [ ] 1.6 Criar componente `src/shared/components/ModalGrabHandle.tsx` (pill ergonômico de 36x5px para modais inferiores).
- [ ] 1.7 Atualizar e validar os testes unitários do `shared` (`src/shared/tests/`).

## 2. Feature de Filtros na API de Compras (Backend & TDD)

- [ ] 2.1 Criar schema Zod `listPurchasesQuerySchema` em `src/server/purchases/schemas/purchases.schema.ts` e adicionar testes unitários em `src/server/purchases/tests/purchases.schema.test.ts`.
- [ ] 2.2 Atualizar `IPurchasesRepository` e implementar suporte aos filtros em `InMemoryPurchasesRepository` e `DrizzlePurchasesRepository`.
- [ ] 2.3 Atualizar `PurchasesService.listPurchases(userId, filters)` com validação e adicionar testes em `src/server/purchases/tests/purchases.service.test.ts`.
- [ ] 2.4 Atualizar `src/app/api/purchases+api.ts` para processar os query params da requisição e adicionar testes em `src/server/purchases/tests/purchases.routes.test.ts`.

## 3. Integração Client-Side de Compras & Agrupamento por Dia

- [ ] 3.1 Atualizar `src/purchases/services/purchases-api.service.ts` e `src/purchases/hooks/use-purchases.ts` com suporte aos parâmetros de filtro na API.
- [ ] 3.2 Criar utilitário `groupPurchasesByDay` em `src/purchases/utils/purchases-group.ts` com testes unitários em `src/purchases/tests/purchases-group.test.ts`.
- [ ] 3.3 Refatorar `src/purchases/components/PurchaseCard.tsx`, `NewPurchaseModal.tsx` e `EditPurchaseModal.tsx` para o visual Cupertino Balance com `ModalGrabHandle`.
- [ ] 3.4 Refatorar a tela `src/app/(tabs)/purchases.tsx` com a listagem agrupada por dia ("Compras - Agrupado por Dia") e filtros padronizados com o `shared`.

## 4. Redesign das Telas Restantes (Dashboard, Cartões, Pessoas e Auth)

- [ ] 4.1 Refatorar a tela de Dashboard `src/app/(tabs)/index.tsx` e componentes em `src/dashboard/components/` (tipografia tabular `tabular-nums`, seletor Geral vs Você, cards com visual iOS).
- [ ] 4.2 Refatorar a tela de Cartões `src/app/(tabs)/cards.tsx` e `src/credit-cards/components/` (cartões estilizados com gradiente, modais iOS).
- [ ] 4.3 Refatorar a tela de Pessoas `src/app/(tabs)/people.tsx` e `src/people/components/` (avatares com cores de destaque e modais iOS).
- [ ] 4.4 Refatorar as telas de Autenticação `src/app/(auth)/login.tsx` e `register.tsx` com visual limpo Cupertino.

## 5. Validação Unificada e Qualidade Final

- [ ] 5.1 Executar a suíte unificada de validação do projeto (`pnpm check`: Prettier, ESLint, TypeScript e Jest).
- [ ] 5.2 Garantir que todos os testes passem com 100% de sucesso e sem regressões.
