# Proposal

## Why

A interface móvel do aplicativo apresenta inconformidades de usabilidade e acabamento visual identificadas durante o uso: valores monetários e descrições transbordam de suas caixas em telas de diferentes densidades, a barra de navegação (Tab Bar) e os cabeçalhos utilizam espaçamentos estáticos que conflitam com entalhes/Dynamic Island e a barra de gestos inferior, os formulários possuem pequenos saltos de layout no foco do teclado, e os modais eram exibidos como diálogos centralizados flutuantes com alça de arraste (*grab handle*), em vez de Bottom Sheets ergonômicos na base da tela. Esta mudança consolida um padrão refinado de UI/UX, ergonomia de uso com uma só mão e robustez contra estouro de texto.

## What Changes

- **Prevenção de Estouro de Texto (Overflow Protection)**: Implementação de auto-scaling tipográfico (`adjustsFontSizeToFit`, `minimumFontScale={0.7}`, `numberOfLines={1}`) e paddings resilientes nos cartões de métricas do Dashboard (`MonthlyMetricsCard`), nos resumos por pessoa (`PersonSummaryCard`) e nos cartões de compras (`PurchaseCard`), garantindo legibilidade para quantias de qualquer magnitude.
- **Navegação & Safe Areas Dinâmicas**: Cálculo de insets com `useSafeAreaInsets()` na Tab Bar (`src/app/(tabs)/_layout.tsx`) e nos cabeçalhos das telas (`index`, `purchases`, `cards`, `people`), eliminando sobreposição da barra de gestos e do topo do dispositivo.
- **Feedback Tátil & Micro-animações**: Integração de `expo-haptics` com helper utilitário para disparar vibrações hápticas táteis suaves nos botões, abas e ações de liquidação de parcelas, além de refatoração do `AnimatedScaleFade` para garantir 60 FPS constantes em listas.
- **Componentes Fundamentais Estáveis (Input & Button)**:
  - `Input`: Borda contínua de 1.5px (eliminando layout shift ao focar), suporte a ícones prefix/suffix e alternância visual de senha (olho aberto/fechado nos fluxos de autenticação).
  - `Button`: Preservação de dimensões durante o estado de `loading`, alinhamento otimizado de ícones e acionamento de feedback tátil nativo.
  - `Badge`: Propagação consistente de cores e variantes para elementos filhos (ícones e textos).
- **Modais como Bottom Sheets Ergonômicos**: Conversão dos modais de Nova Compra, Editar Compra, Cartão e Pessoa em Bottom Sheets autênticos (ancorados na base com `rounded-t-[28px]`, alça de manipulação `ModalGrabHandle` e integração fluida com `KeyboardAvoidingView`).
- **Correções de Sintaxe e Alinhamento**: Eliminação de bugs de atributos em classes CSS (ex: `numberOfLines={1}` inserido acidentalmente dentro de `className` no modal de edição de compras).

## Capabilities

### New Capabilities
- `ui-ergonomics`: Estabelece as diretrizes de ergonomia móvel, cálculo dinâmico de Safe Areas em barras e cabeçalhos, feedback tátil via haptics, formulários estáveis sem layout shift e apresentação padrão de Bottom Sheets.

### Modified Capabilities
- `dashboard`: Atualiza os requisitos de exibição das métricas gerais e por pessoa, exigindo layout resiliente a números extensos com auto-scaling sem truncamento inadequado ou quebra de caixa.
- `purchases`: Atualiza o requisito de interface dos formulários de criação e edição de compras para apresentação em Bottom Sheet ergonômico e padroniza a exibição de badges de status de parcelas com contraste correto.

## Impact

- **Dependências**: Adição de `expo-haptics` no `package.json`.
- **Componentes Compartilhados**: `Input.tsx`, `Button.tsx`, `Badge.tsx`, `AnimatedScaleFade.tsx`.
- **Telas**: `src/app/(tabs)/_layout.tsx`, `index.tsx`, `purchases.tsx`, `cards.tsx`, `people.tsx`, `login.tsx`, `register.tsx`.
- **Modais**: `NewPurchaseModal.tsx`, `EditPurchaseModal.tsx`, `CreditCardModal.tsx`, `PersonModal.tsx`.
- **Testes e Validação**: Execução e conformidade contínua com `pnpm check` (Prettier, ESLint, TypeScript e Jest).
