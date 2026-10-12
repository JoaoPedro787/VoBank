# Proposal

## Why

Atualmente, o aplicativo possui múltiplos modais espalhados nas features (`credit-cards`, `people`, `purchases`), cada um duplicando manualmente dezenas de linhas de infraestrutura com `Modal` do React Native, backdrop, animações e listeners de teclado. Além disso, modais controladas puramente por estado local dificultam o deep-linking, o histórico de navegação e a experiência nativa no Android e iOS.

Migrar para modais nativas baseadas em rotas do **Expo Router** (`(modals)/...` com `presentation: "formSheet"`), envelopadas por um componente padronizado `ModalSheet` (Compound Components com `.Header`, `.Body`, `.Footer`), elimina o boilerplate, garante suporte nativo no iOS (detents, grabber, safe areas) e Android (transição nativa de modal e hardware back button), e estabelece um padrão arquitetural coeso em todo o projeto.

## What Changes

- Configuração de `presentation: "formSheet"` em `src/app/(modals)/_layout.tsx` e `src/app/_layout.tsx`, com detents (`[0.6, 0.9]`), grabber visível e cantos arredondados nativos.
- Criação do componente reutilizável `ModalSheet` em `src/shared/components/ModalSheet.tsx` (com subcomponentes `ModalSheet.Header`, `ModalSheet.Body`, `ModalSheet.Footer` e `ModalGrabHandle`) para estruturar o layout interno das telas modais.
- Criação das rotas dedicadas em `src/app/(modals)/`:
  - `src/app/(modals)/card.tsx`: Rota de criação e edição de cartões de crédito.
  - `src/app/(modals)/person.tsx`: Rota de criação e edição de pessoas.
  - `src/app/(modals)/purchase.tsx`: Rota de criação e edição de compras.
- Manutenção da lógica de negócios, formulários e validações nas pastas das features (`src/[feat]/components/`), sendo consumidos pelas rotas modais finas.
- Atualização das telas de listagem (`cards.tsx`, `people.tsx`, `index.tsx`) para disparar a navegação via `router.push('/(modals)/...')` e atualizar dados reativamente via `useFocusEffect` ao retornar (`router.back()`).

## Capabilities

### New Capabilities
- `modal-sheet`: Modal baseada em rotas nativas do Expo Router com `formSheet`, estruturada pelo componente componível `ModalSheet` e padronizada para todas as features.

### Modified Capabilities
<!-- Nenhuma regra de negócio dos specs existentes está mudando, apenas a camada de apresentação/UI e navegação -->

## Impact

- **Navegação & Rotas**: Novas rotas em `src/app/(modals)/card.tsx`, `src/app/(modals)/person.tsx` e `src/app/(modals)/purchase.tsx`; ajuste de `options` no `_layout.tsx`.
- **Código compartilhado**: Componente `ModalSheet` em `src/shared/components/ModalSheet.tsx` exportado em `src/shared/components/index.ts`.
- **Features impactadas**: `src/credit-cards/`, `src/people/`, `src/purchases/` e as telas de abas em `src/app/(tabs)/`.
- **Testes**: Testes unitários para o `ModalSheet` e adaptação dos testes das telas/modais de features.
