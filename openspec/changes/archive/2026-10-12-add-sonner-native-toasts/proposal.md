# Proposal: Feedback Visual com Toasts Nativos (Sonner Native)

## Why

Atualmente, operações de criação, edição e exclusão de compras, cartões e pessoas, bem como a alteração do status de pagamento de parcelas, encerram o fluxo ou executam mutações sem fornecer um feedback visual transitório explícito de sucesso ou falha ao usuário.
A introdução de notificações em toast nativas no topo da tela com `sonner-native` padroniza o feedback de ações, assegurando que o usuário tenha confirmação imediata e suave (60 FPS com spring animations e feedback tátil) de que sua operação foi concluída ou se ocorreu algum erro, sem poluir a interface com botões desnecessários.

## What Changes

- Instalação e integração do pacote `sonner-native` (e `react-native-worklets`) no projeto Expo.
- Configuração do `<Toaster />` no nível raiz da aplicação (`src/app/_layout.tsx`), posicionado no topo (`top-center`), respeitando Safe Area / Dynamic Island e alternando o tema conforme o modo claro/escuro.
- Criação de um utilitário centralizado (`src/shared/utils/toast.ts` ou `src/shared/components/Toaster.tsx`) com métodos diretos `showToast.success(message)` e `showToast.error(message)`.
- Disparo automático de feedback háptico (`hapticFeedback.notificationSuccess()` e `notificationError()`) integrado aos alertas toast.
- Vinculação de notificações nas ações das seguintes entidades:
  - **Compras**: Cadastro de nova compra, edição de compra e exclusão de compra.
  - **Cartões**: Cadastro de cartão, edição de cartão e exclusão de cartão.
  - **Pessoas**: Cadastro de pessoa, edição de pessoa e exclusão de pessoa.
  - **Rateios / Parcelas**: Alteração de status de quitação (marcar como pago ou pendente).
- Testes unitários isolados e mocks do toaster configurados em `src/shared/tests/setup.ts` para garantir 100% de conformidade com `pnpm check`.

## Capabilities

### New Capabilities
- `toast-notifications`: Sistema de toasts nativos transitórios no topo da tela utilizando `sonner-native` para confirmação visual de sucesso e erro em ações do aplicativo (compras, cartões, pessoas e rateios), sem botões interativos ou ações bloqueantes.

### Modified Capabilities
<!-- Nenhuma especificação anterior teve seus requisitos alterados. -->

## Impact

- **Dependências**: Adição de `sonner-native` e `react-native-worklets` no `package.json`.
- **Rotas e UI**:
  - `src/app/_layout.tsx`: inclusão do container `<Toaster />`.
  - `src/app/(modals)/purchase.tsx`: chamada de toasts de sucesso e erro ao salvar ou excluir compra.
  - `src/app/(modals)/card.tsx` e `src/app/(tabs)/cards.tsx`: chamada de toasts ao salvar ou excluir cartão.
  - `src/app/(modals)/person.tsx` e `src/app/(tabs)/people.tsx`: chamada de toasts ao salvar ou excluir pessoa.
  - `src/app/(tabs)/index.tsx`: chamada de toasts na alternância de pagamento de parcelas/splits.
- **Testes**: Mocks em `src/shared/tests/setup.ts` e testes unitários do helper em `src/shared/tests/toast.test.ts`.
