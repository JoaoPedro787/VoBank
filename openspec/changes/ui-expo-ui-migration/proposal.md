# Proposal: UI Expo UI Migration

## Why

Atualmente, o aplicativo utiliza componentes customizados baseados em Tailwind/NativeWind e primitivas comuns de React Native, com alertas de exclusão inconsistentes (algumas telas utilizavam `Alert.alert` do sistema e outras uma View inline estática) e preenchimento manual de datas em formato de texto sem calendário interativo. A migração para o **Expo UI (`@expo/ui`)** visa padronizar e elevar a qualidade da interface com componentes universais nativos de alta performance (SwiftUI no iOS e Jetpack Compose no Android), adicionando confirmação de exclusão elegante em BottomSheet e seletor de data nativo.

## What Changes

- **Adoção do `@expo/ui`:**
  - Instalação e configuração de `@expo/ui` no projeto.
  - Migração de `Button` e `Input` em `src/shared/components/` para utilizar as capacidades do `@expo/ui`, preservando variantes de cor, radius de 14px, dark/light mode e feedback tátil (`expo-haptics`).
  - Criação de componente universal `Switch` (`src/shared/components/Switch.tsx`) para toggles de formulário.
  - Migração de `ModalSheet` para utilizar o `BottomSheet` universal do `@expo/ui`.
  - Estratégia de fallback: quando um componente ou modificador não existir na camada universal do `@expo/ui`, implementação dividida por plataforma (`.ios.tsx` consumindo `@expo/ui/swift-ui` e `.android.tsx` consumindo `@expo/ui/jetpack-compose`), sempre encapsulados por `<Host>` da raiz do `@expo/ui`.
- **Diálogo de Exclusão Padronizado (`DeleteConfirmationSheet`):**
  - Criação do componente `DeleteConfirmationSheet` baseado no `ModalSheet`.
  - Substituição dos `Alert.alert` em Cartões (`cards.tsx`) e Pessoas (`people.tsx`).
  - Substituição da View/Card inline de confirmação de exclusão em `EditPurchaseForm.tsx`.
- **Seletor de Data Nativo (`DatePicker`):**
  - Implementação de `DatePicker` utilizando `@expo/ui/community/datetime-picker`.
  - Integração no fluxo de criação de compra (`NewPurchaseForm`) e edição de compra (`EditPurchaseForm`), mantendo os atalhos rápidos "Hoje" e "Ontem".
  - Integração no seletor de mês/período no Dashboard (`MonthSelector`) e na listagem de Compras (`purchases.tsx`), preservando os botões de seta `<` e `>` para navegação rápida mês a mês e permitindo tocar no mês/ano para abrir o seletor nativo.

## Capabilities

### Modified Capabilities

- `ui-ergonomics`: Atualização dos padrões de componentes base (`Button`, `Input`, `Switch`, `ModalSheet`) para utilizar `@expo/ui` e padronização do sheet de confirmação de exclusão.
- `purchases`: Adição de seletor nativo de data via calendário em criação/edição e nos filtros de período, além do novo diálogo de exclusão na edição de compra.
- `credit-cards`: Substituição de `Alert.alert` pelo diálogo padronizado de exclusão em BottomSheet.
- `people`: Substituição de `Alert.alert` pelo diálogo padronizado de exclusão em BottomSheet.

## Impact

- **Dependências:** Adição de `@expo/ui` ao `package.json`.
- **Código Compartilhado:** Modificação de `src/shared/components/` (`Button.tsx`, `Input.tsx`, `ModalSheet.tsx`) e adição de `DatePicker.tsx`, `Switch.tsx`, `DeleteConfirmationSheet.tsx`.
- **Telas Afetadas:**
  - `src/app/(tabs)/cards.tsx`
  - `src/app/(tabs)/people.tsx`
  - `src/app/(tabs)/purchases.tsx`
  - `src/dashboard/components/MonthSelector.tsx`
  - `src/purchases/components/NewPurchaseForm.tsx`
  - `src/purchases/components/EditPurchaseForm.tsx`
