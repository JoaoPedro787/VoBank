# Tasks

## 1. Instalação e Configuração Base do Expo UI

- [x] 1.1 Instalar `@expo/ui` e registrar dependência no `package.json` utilizando `pnpm`
- [x] 1.2 Configurar suporte a testes unitários (mocks dos componentes nativos do `@expo/ui` para Jest) garantindo que `pnpm check` execute sem erros de importação nativa

## 2. Renovação dos Componentes Base Compartilhados

- [ ] 2.1 Renovar o componente `Button` (`src/shared/components/Button.tsx`) integrando o botão nativo do `@expo/ui`, preservando variantes, tamanhos, feedback háptico e loading
- [ ] 2.2 Renovar o componente `Input` (`src/shared/components/Input.tsx`) integrando o `TextInput` do `@expo/ui`, preservando rótulos, erros, ícones e alternância de senha
- [ ] 2.3 Criar o componente universal `Switch` (`src/shared/components/Switch.tsx`) utilizando `@expo/ui`, conectando à opção de rachar despesas nos formulários de compra
- [ ] 2.4 Renovar o componente `ModalSheet` (`src/shared/components/ModalSheet.tsx`) integrando a apresentação em `BottomSheet` universal do `@expo/ui`
- [ ] 2.5 Atualizar o índice `src/shared/components/index.ts` exportando os novos componentes e validar que não há quebras de tipagem em `pnpm typecheck`

## 3. Implementação e Integração do Seletor de Data Nativo

- [ ] 3.1 Criar o componente `DatePicker` (`src/shared/components/DatePicker.tsx`) utilizando `@expo/ui/community/datetime-picker` com suporte aos pickers nativos de iOS e Android
- [ ] 3.2 Integrar o `DatePicker` no formulário de criação de compras (`src/purchases/components/NewPurchaseForm.tsx`), mantendo os atalhos rápidos "Hoje" e "Ontem"
- [ ] 3.3 Integrar o `DatePicker` no formulário de edição de compras (`src/purchases/components/EditPurchaseForm.tsx`)
- [ ] 3.4 Integrar o seletor nativo de mês/ano no Dashboard (`src/dashboard/components/MonthSelector.tsx`) e na listagem de Compras (`src/app/(tabs)/purchases.tsx`), preservando os botões de seta `<` e `>` para navegação rápida mês a mês

## 4. Implementação e Integração do Diálogo de Exclusão

- [ ] 4.1 Criar o componente `DeleteConfirmationSheet` (`src/shared/components/DeleteConfirmationSheet.tsx`) baseado no `ModalSheet` e nos botões do `@expo/ui`
- [ ] 4.2 Integrar a confirmação de exclusão na tela de Cartões (`src/app/(tabs)/cards.tsx`), substituindo o `Alert.alert` pelo `DeleteConfirmationSheet`
- [ ] 4.3 Integrar a confirmação de exclusão na tela de Pessoas (`src/app/(tabs)/people.tsx`), substituindo o `Alert.alert` pelo `DeleteConfirmationSheet`
- [ ] 4.4 Integrar a confirmação de exclusão na tela de Edição de Compra (`src/purchases/components/EditPurchaseForm.tsx`), substituindo o card estático pelo `DeleteConfirmationSheet`

## 5. Validação Integrada e Qualidade de Código

- [ ] 5.1 Executar a suíte de validação unificada (`pnpm check`: Prettier, ESLint, TypeScript e Jest) corrigindo qualquer inconsistência
- [ ] 5.2 Validar conformidade visual, contraste e ergonomia dos componentes em modo claro e escuro
