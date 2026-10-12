# Tasks: Feedback Visual com Toasts Nativos (Sonner Native)

## 1. Infraestrutura, Toaster na Raiz e Helper de Toast

- [x] 1.1 Instalar dependências `sonner-native` e `react-native-worklets` via `pnpm add` e verificar registro no `package.json`
- [x] 1.2 Criar utilitário `src/shared/utils/toast.ts` integrando `showToast.success` e `showToast.error` ao `hapticFeedback`
- [x] 1.3 Configurar mock de `sonner-native` em `src/shared/tests/setup.ts` e adicionar suíte de testes unitários em `src/shared/tests/toast.test.ts`
- [x] 1.4 Adicionar container `<Toaster position="top-center" />` no layout raiz `src/app/_layout.tsx` com detecção de tema (claro/escuro) e verificar compilação de tipos

## 2. Integração de Toasts em Compras e Rateios do Dashboard

- [x] 2.1 Integrar `showToast` no modal de compras `src/app/(modals)/purchase.tsx` para cadastro, atualização e exclusão, verificando chamadas de sucesso e captura de erro
- [x] 2.2 Integrar `showToast` na alternância de status de pagamento de parcelas (pago/pendente) em `src/app/(tabs)/index.tsx`
- [x] 2.3 Atualizar ou adicionar testes unitários em `src/purchases/tests/` e `src/dashboard/tests/` verificando os disparos de toast

## 3. Integração de Toasts em Cartões e Pessoas e Validação Completa

- [ ] 3.1 Integrar `showToast` no modal de cartões `src/app/(modals)/card.tsx` e no fluxo de exclusão em `src/app/(tabs)/cards.tsx`
- [ ] 3.2 Integrar `showToast` no modal de pessoas `src/app/(modals)/person.tsx` e no fluxo de exclusão em `src/app/(tabs)/people.tsx`
- [ ] 3.3 Atualizar ou adicionar testes unitários em `src/credit-cards/tests/` e `src/people/tests/` cobrindo o feedback visual
- [ ] 3.4 Executar a validação completa do projeto (`pnpm check`) garantindo Prettier, ESLint, TypeScript e 100% dos testes unitários passando
