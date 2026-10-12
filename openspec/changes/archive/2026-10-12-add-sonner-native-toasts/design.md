# Design: Feedback Visual com Toasts Nativos (Sonner Native)

## Context

O aplicativo utiliza Expo Router com telas em abas e telas modais (`formSheet`), além de React Native Reanimated e NativeWind. O usuário solicitou feedback visual imediato em formato toast para avisar se ações de criação, edição ou exclusão deram certo ou não, sem botões interativos e posicionado no topo da tela. A biblioteca escolhida é a `sonner-native` (port do Sonner para React Native).
Ver motivação detalhada em `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Prover notificações flutuantes no topo da tela (`top-center`), transitórias e com estilo nativo elegante.
- Disparar toasts informativos nas ações de:
  - Compras (criar, editar, excluir)
  - Cartões (criar, editar, excluir)
  - Pessoas (criar, editar, excluir)
  - Parcelas no Dashboard (marcar como paga ou pendente)
- Disparar simultaneamente o feedback háptico adequado (`hapticFeedback.notificationSuccess` ou `notificationError`).
- Isolar a implementação em um helper (`src/shared/utils/toast.ts`) e garantir mock completo no Jest (`src/shared/tests/setup.ts`) para manter a suíte `pnpm check` rápida e verde.

**Non-Goals:**
- Telas de autenticação (Login e Registro): permanecem com tratamento inline dentro dos cartões de formulário por preferência explícita do usuário.
- Toasts interativos com botões de ação ("Desfazer", "Ver detalhes"): escopo limitado estritamente a avisos informativos de status.

## Decisions

### Decisão 1: Montagem do `<Toaster />` na Raiz (`src/app/_layout.tsx`)
- **Escolha**: Inserir `<Toaster position="top-center" />` dentro de `GestureHandlerRootView` e `SafeAreaProvider` no layout raiz do Expo Router.
- **Racional**: As ações de criação e edição ocorrem em rotas modais (`src/app/(modals)/*`). Ao salvar, a rota modal executa `router.back()`. Estando o `<Toaster />` na raiz, a notificação permanece visível e suavemente animada sobre a tela que reaparece (lista de compras, cartões, etc.).
- **Alternativas consideradas**:
  - *Colocar o Toaster dentro de cada modal*: Descartado, pois o toast desapareceria abruptamente junto com o fechamento do modal.
  - *Usar Alerts nativos do sistema (`Alert.alert`)*: Descartado por ser modal, intrusivo e exigir clique obrigatório do usuário.

### Decisão 2: Criação de Wrapper Unificado (`src/shared/utils/toast.ts`)
- **Escolha**: Encapsular as chamadas do `sonner-native` em uma interface `showToast`:
  ```ts
  export const showToast = {
    success: (message: string, description?: string) => {
      hapticFeedback.notificationSuccess();
      toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
      hapticFeedback.notificationError();
      toast.error(message, { description });
    },
  };
  ```
- **Racional**: Desacopla as telas da biblioteca externa, une visual + vibração háptica em uma única chamada e simplifica a padronização das mensagens.
- **Alternativas consideradas**:
  - *Importar `toast` diretamente em cada tela*: Descartado por espalhar chamadas de haptics repetitivas e dificultar mocks em testes.

### Decisão 3: Mock em `src/shared/tests/setup.ts` para Jest
- **Escolha**: Adicionar mock global para `sonner-native` em `setup.ts`, gravando as chamadas em funções `jest.fn()`.
- **Racional**: `sonner-native` faz uso de módulos nativos de animação e worklets que não executam nativamente em ambiente Node/Jest puro. O mock assegura que os testes unitários de componentes e rotas executem em memória de forma isolada e sem dependências de ambiente.

## Risks / Trade-offs

- **[Risco: Sobreposição da barra de status / Dynamic Island]** → *Mitigação*: `sonner-native` respeita `SafeAreaInsets` por padrão; configuramos `offset` se necessário para garantir espaçamento visual confortável abaixo do entalhe.
- **[Risco: Dependência peer de worklets (`react-native-worklets`)]** → *Mitigação*: Instalação conjunta de `sonner-native` e `react-native-worklets` via `pnpm`, validando tipos com `tsc --noEmit`.
- **[Risco: Conflito de tema escuro/claro]** → *Mitigação*: Passar `theme={isDark ? "dark" : "light"}` baseado no `useColorScheme` do `nativewind` no `<Toaster />`.
