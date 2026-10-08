# Design

## Context

O aplicativo de finanças móvel é construído sobre Expo (SDK 57, React Native 0.86, React 19), NativeWind v4 e Expo Router v57. Durante a exploração da interface e alinhamento no `/grill-me`, foram diagnosticados problemas de layout:
- Métricas consolidadas em 3 colunas horizontais (`MonthlyMetricsCard`) e resumos por pessoa (`PersonSummaryCard`) sofrem quebras ou cortes com valores monetários de 5 ou mais dígitos.
- A barra de abas (`Tab Bar`) possui altura estática (`height: 60`), gerando sobreposição com o indicador de início (Home Indicator) do iOS e a barra de gestos do Android.
- Os cabeçalhos das telas utilizam `pt-14` estático, desconsiderando a Dynamic Island e entalhes variados.
- O componente `Input` altera a espessura da borda no foco, gerando *layout shift* de 0.5px.
- Os modais são renderizados como diálogos flutuantes no centro da tela, mas possuem uma alça de arraste (`ModalGrabHandle`), o que quebra o padrão visual de Bottom Sheets.
- O modal de edição possui bugs de atributos CSS (ex: `numberOfLines={1}` inserido acidentalmente dentro de `className`).

Ver `proposal.md` para motivação e `specs/` para os requisitos contratuais.

## Goals / Non-Goals

**Goals:**
- Garantir taxa de 60 FPS e zero transbordamento de texto em qualquer resolução móvel.
- Adaptar cabeçalhos e barra inferior dinamicamente via `useSafeAreaInsets()`.
- Incorporar feedback tátil refinado (`expo-haptics`) com suporte seguro em Jest/Web.
- Transformar modais de formulário em Bottom Sheets ergonômicos ancorados na base (`rounded-t-[28px]`).
- Estabilizar `Input` e `Button` com toggle nativo de visibilidade de senha e retenção dimensional em loading.
- Manter 100% dos testes e verificações automatizadas passando em `pnpm check`.

**Non-Goals:**
- Não alterar endpoints de API ou esquemas de banco de dados (Drizzle ORM / PostgreSQL).
- Não substituir o Expo Router por navegadores customizados fora da estrutura padrão.
- Não reescrever toda a renderização para worklets complexos de Reanimated onde componentes nativos atendem com alta performance.

## Decisions

### Decisão 1: Auto-scaling tipográfico em valores monetários
- **Abordagem**: Utilizar `numberOfLines={1}`, `adjustsFontSizeToFit` e `minimumFontScale={0.7}` nos valores de `MonthlyMetricsCard`, `PersonSummaryCard` e `PurchaseCard`, associado a paddings otimizados (`px-2 py-2.5`).
- **Justificativa**: Preserva a leitura de valores com centavos e até 8 dígitos (ex: R$ 999.999,99) sem quebrar o layout em múltiplas linhas e sem esconder centavos.
- **Alternativas consideradas**:
  - Grid 2x2 ou cartões verticais: ocuparia espaço vertical excessivo no topo do dashboard.
  - Abreviar para `R$ 1,2k`: inadequado para conciliação contábil e rateio de centavos entre pessoas.

### Decisão 2: Safe Areas Dinâmicas Centralizadas
- **Abordagem**: Utilizar `useSafeAreaInsets` em `src/app/(tabs)/_layout.tsx` para definir `height: 54 + insets.bottom` e `paddingBottom: Math.max(insets.bottom, 6)`. Nos cabeçalhos de tela, substituir `pt-14` por `paddingTop: Math.max(insets.top, 16)`.
- **Justificativa**: Garante conformidade com telas desde o iPhone SE até iPhone 16 Pro Max e Androids com entalhes punch-hole.
- **Alternativas consideradas**:
  - `SafeAreaView` nativo envolvendo toda a tela: causa flickering durante animações de transição e desperdiça área útil.

### Decisão 3: Helper Seguro de Feedback Tátil (`haptics.ts`)
- **Abordagem**: Criar um módulo `src/shared/utils/haptics.ts` que encapsula `expo-haptics` com tratamento de exceções silencioso (para ambientes sem haptics, Web e testes Jest).
- **Justificativa**: Evita que testes unitários quebrem por falta de mocks e padroniza os padrões de vibração (`impactLight`, `selection`, `notificationSuccess`).
- **Alternativas consideradas**:
  - Invocar `Haptics.*` diretamente nos componentes: causaria quebras em testes de componentes com Jest sem setup complexo de mocks em cada arquivo.

### Decisão 4: Eliminação de Layout Shift no `Input`
- **Abordagem**: Definir borda constante com `border-[1.5px]` e alternar apenas a cor (`border-transparent` no repouso para `border-[#007AFF]` no foco). Adicionar suporte a ícones prefix/suffix e botão de alternância de senha.
- **Justificativa**: Remove o micro-deslocamento perceptível de 0.5px que causava tremor visual no foco do teclado.
- **Alternativas consideradas**:
  - Usar `outline` do CSS Web: não tem suporte nativo idêntico no React Native.

### Decisão 5: Bottom Sheets Ergonômicos para Modais
- **Abordagem**: Estruturar os modais (`NewPurchaseModal`, `EditPurchaseModal`, `CreditCardModal`, `PersonModal`) com `justify-end`, `bg-black/60`, folha com `rounded-t-[28px]`, `ModalGrabHandle` no topo e `ScrollView` interno compatível com `KeyboardAvoidingView`.
- **Justificativa**: Melhora drasticamente a ergonomia em uso com uma mão em dispositivos móveis modernos e valoriza a alça de manipulação existente.
- **Alternativas consideradas**:
  - Manter diálogos centralizados: desvaloriza a alça de arraste e dificulta o alcance com o polegar.

## Risks / Trade-offs

- **[Risco]** `expo-haptics` falhar em ambiente de testes Jest ou Web.
  → **Mitigação**: O helper `src/shared/utils/haptics.ts` verifica a disponibilidade de suporte e encapsula todas as chamadas em blocos `try/catch`.
- **[Risco]** Abertura de teclado virtual cobrir campos inferiores do Bottom Sheet em telas compactas.
  → **Mitigação**: `KeyboardAvoidingView` configurado com `behavior={Platform.OS === 'ios' ? 'padding' : undefined}` com `ScrollView` interno (`keyboardShouldPersistTaps="handled"`).
