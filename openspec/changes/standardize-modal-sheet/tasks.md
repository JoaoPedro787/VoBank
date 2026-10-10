# Tasks

> **Nota:** Conforme especificado, consulte a skill `/react-native-best-practices` antes de aplicar qualquer alteração de código. As tarefas estão divididas em dois grupos principais. O Grupo 1 deve ser concluído e validado visualmente com o usuário antes de iniciar o Grupo 2.

## 1. Configuração do Expo Router e Componente ModalSheet Base

- [ ] 1.1 Configurar o Stack de modais em `src/app/_layout.tsx` e `src/app/(modals)/_layout.tsx` com `presentation: "formSheet"`, detents, grabber visível e cantos arredondados
- [ ] 1.2 Criar o componente container `ModalSheet` com subcomponentes `Header`, `Body` e `Footer` em `src/shared/components/ModalSheet.tsx`, exportando em `src/shared/components/index.ts`
- [ ] 1.3 Implementar testes unitários em `src/shared/tests/modal-sheet.test.tsx` cobrindo o `ModalSheet` e subcomponentes com `pnpm test src/shared/tests/modal-sheet.test.tsx`
- [ ] 1.4 Criar rota de demonstração `src/app/(modals)/example.tsx` e validar visualmente a folha modal nativa (iOS e Android), pausando e aguardando confirmação explícita do usuário antes de iniciar o Grupo 2

## 2. Migração das Rotas Modais de Features e Validação Global

- [ ] 2.1 Criar a rota `src/app/(modals)/person.tsx` conectada a `src/people/components/PersonForm.tsx` (ou equivalente refatorado), atualizar navegação na aba `people.tsx` com `useFocusEffect` e testar com `pnpm test src/people/tests/`
- [ ] 2.2 Criar a rota `src/app/(modals)/card.tsx` conectada a `src/credit-cards/components/CreditCardForm.tsx` (ou equivalente refatorado), atualizar navegação na aba `cards.tsx` com `useFocusEffect` e testar com `pnpm test src/credit-cards/tests/`
- [ ] 2.3 Criar a rota `src/app/(modals)/purchase.tsx` conectada aos formulários de compras, atualizar navegação em `src/app/(tabs)/index.tsx` e testar com `pnpm test src/purchases/tests/`
- [ ] 2.4 Limpar componentes obsoletos de modais locais, remover a rota temporária `(modals)/example.tsx` e executar validação global com `pnpm check` (Prettier, ESLint, TypeScript e testes) garantindo 100% de aprovação
