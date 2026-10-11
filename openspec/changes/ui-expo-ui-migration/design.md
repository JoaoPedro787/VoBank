# Design: UI Expo UI Migration

## Context

Consulte `proposal.md` para a motivação da mudança.
O projeto utiliza Expo SDK 57, React Native 0.86, NativeWind v4 e Tailwind CSS. Os tokens visuais existentes estabelecem raio de borda de 14px (`rounded-[14px]`), azul primário `#007AFF`, vermelho destrutivo `#EF4444`, feedback tátil via `expo-haptics` e paleta Cupertino para dark e light mode.

## Goals / Non-Goals

**Goals:**
- Adotar a biblioteca oficial `@expo/ui` para elevar a fluidez e a fidelidade nativa dos componentes compartilhados.
- Priorizar componentes universais (`@expo/ui`) para iOS e Android com base de código única.
- Adotar split por plataforma (`.ios.tsx` com `@expo/ui/swift-ui` e `.android.tsx` com `@expo/ui/jetpack-compose`) estritamente em componentes que não possuam cobertura universal.
- Padronizar confirmações destrutivas com o novo diálogo nativo `DeleteConfirmationDialog` em Cartões, Pessoas e Compras.
- Disponibilizar seletor nativo de data via calendário (`@expo/ui/community/datetime-picker`) em criação, edição e navegação de filtros (mantendo navegação por setas `<` e `>`).
- Preservar a API pública dos componentes em `src/shared/components/` para evitar quebras nas telas existentes.

**Non-Goals:**
- Reescrever telas inteiras em SwiftUI/Compose puro (apenas os componentes compartilhados em `src/shared/components/` adotam a biblioteca).
- Substituir `Card` ou `Badge` (ambos não possuem equivalente nativo conceitual no Expo UI e permanecem com React Native / NativeWind).
- Alterar rotas ou arquitetura de backend/banco de dados.

## Decisions

### 1. Camada Universal com Fallback por Plataforma

- **Decisão:** Importar componentes da raiz de `@expo/ui` encapsulados em `<Host matchContents>`. Caso um componente necessite de recursos específicos ausentes na camada universal, criar o split em arquivos `.ios.tsx` (usando `@expo/ui/swift-ui`) e `.android.tsx` (usando `@expo/ui/jetpack-compose`) dentro de `src/shared/components/`.
- **Alternativas consideradas:**
  - Manter apenas React Native puro (descartado pelo objetivo de adotar componentes nativos reais do Expo UI).
  - Escrever todas as telas separadas por plataforma (descartado por duplicidade de código excessiva e dificuldade de manutenção).

### 2. Padrão Adapter em `src/shared/components/`

- **Decisão:** Manter os contratos de props estabelecidos em `ButtonProps`, `InputProps` e `ModalSheetProps`, adaptando as chamadas internas para os componentes do `@expo/ui`.
- **Benefício:** Zero impacto de quebra nas telas consumidoras (`app/(tabs)/...`, `app/(modals)/...`).

### 3. Confirmação de Exclusão com Diálogo Nativo (`DeleteConfirmationDialog`)

- **Decisão:** Utilizar cada componente nativo do sistema via `@expo/ui` com divisão de arquivos por plataforma:
  - **Android (`DeleteConfirmationDialog.android.tsx`):** Utilizar `AlertDialog` do Jetpack Compose (`@expo/ui/jetpack-compose`), com botões nativos de confirmação e dispensa (`AlertDialog.ConfirmButton`, `AlertDialog.DismissButton`, `AlertDialog.Title`, `AlertDialog.Text`), sob `<Host>`.
  - **iOS (`DeleteConfirmationDialog.ios.tsx`):** Utilizar `Alert` do SwiftUI (`@expo/ui/swift-ui`), com gatilhos, botões de ação e mensagem nativos (`Alert`, `Alert.Trigger`, `Alert.Actions`, `Alert.Message`), sob `<Host>`.
  - **Contrato Universal (`DeleteConfirmationDialog.tsx`):** Definir o contrato comum de props (`isOpen`, `onClose`, `onConfirm`, `title`, `description`, `confirmText`, `cancelText`, `isLoading`, `destructive`) e fallback para plataformas não nativas.
- **Alternativas consideradas:**
  - `ModalSheet` / BottomSheet customizado (descartado pela decisão explícita do usuário de utilizar diálogos nativos do sistema operacional).
  - `Alert.alert` imperativo do React Native (descartado em favor dos componentes declarativos nativos modernos do `@expo/ui`).

### 4. Calendário Nativo (`@expo/ui/community/datetime-picker`)

- **Decisão:** Utilizar o drop-in nativo de datetime-picker do `@expo/ui` com gatilho clicável no campo de texto e no título do seletor de mês.
- **Alternativas consideradas:**
  - Calendário manual desenhado em React Native (descartado pela decisão explícita do usuário de usar o nativo de cada plataforma).

## Risks / Trade-offs

- **[Dependência @expo/ui]** → Instalar a versão correspondente ao Expo SDK 57 via `pnpm add @expo/ui` ou `npx expo install @expo/ui`.
- **[Layout no Android/iOS com Host]** → Todo nó nativo do `@expo/ui` deve residir sob `<Host>`. Usaremos `<Host matchContents>` nos adapters ou no topo dos containers compartilhados para evitar colapso de dimensões.
- **[Ajuste em Testes In-Memory]** → Os testes automatizados em CI rodam via Jest. Mocks dos componentes nativos do `@expo/ui` devem ser adicionados na configuração de testes para evitar falhas em ambiente Node.
