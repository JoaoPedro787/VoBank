# Design

## Context

O aplicativo utilizava modais renderizadas via componente `<Modal>` do React Native acionadas por estados booleanos locais (`useState(false)`). Essa abordagem causava duplicação de dezenas de linhas de infraestrutura em cada tela e criava inconsistências visuais e de navegação (como avisos de shared value do Reanimated ao tentar gerenciar animações de gestos manualmente). 

A nova abordagem delega a apresentação da folha modal diretamente ao motor nativo do **Expo Router** (`(modals)` com `presentation: "formSheet"`), enquanto o componente `ModalSheet` fornece o arcabouço visual e estrutural interno padronizado.

## Goals / Non-Goals

**Goals:**
- Configurar o grupo `(modals)` no Expo Router com apresentação nativa `formSheet`, cantos arredondados e suporte a detents.
- Criar o componente container `ModalSheet` em `src/shared/components/ModalSheet.tsx` com subcomponentes `Header`, `Body` e `Footer`.
- Criar rotas dedicadas por entidade: `(modals)/card.tsx`, `(modals)/person.tsx` e `(modals)/purchase.tsx`.
- Preservar os formulários e lógica de negócio desacoplados nas pastas das features (`src/[feat]/components/`).
- Atualizar as telas de listagem (`cards.tsx`, `people.tsx`, `index.tsx`) para usar navegação e sincronização com `useFocusEffect`.

**Non-Goals:**
- Não criar schemas ou endpoints de banco de dados novos (os contratos de dados e rotas de API continuam os mesmos).
- Não utilizar bibliotecas pesadas de terceiros; todo o controle de aberturas de folhas nativas é provido pelo Expo Router (`react-native-screens`).

## Decisions

### 1. Expo Router `formSheet` vs `<Modal>` React Native Customizado
- **Decisão:** Utilizar rotas no grupo `(modals)` com `presentation: "formSheet"`, `sheetAllowedDetents: [0.6, 0.9]` (ou fitToContents), `sheetGrabberVisible: true` e `sheetCornerRadius: 24`.
- **Racional:** O iOS oferece a folha nativa do sistema com detents e física impecável; o Android lida com a transição nativa de modal e o botão de voltar do hardware automaticamente. Elimina completamente erros de ciclo de vida e render warnings do Reanimated.
- **Alternativas:** Modal controlada por estado com Reanimated/GestureHandler manual (descartada devido à complexidade desnecessária e render warnings).

### 2. `ModalSheet` como Container Componível (Compound Components)
- **Decisão:** Manter o `ModalSheet` como componente estrutural para o interior das telas modais:
  - `ModalSheet.Header`: Exibe título, subtítulo e botão de fechar (`router.back()`).
  - `ModalSheet.Body`: `ScrollView` com `keyboardShouldPersistTaps="handled"` e espaçamento pré-configurado.
  - `ModalSheet.Footer`: Container fixado na base com respeito à Safe Area (`useSafeAreaInsets().bottom`).
- **Racional:** Oferece uniformidade visual instantânea entre todas as telas modais sem acoplamento rígido.

### 3. Rotas Finas em `(modals)/` e Formulários em `src/[feat]/components/`
- **Decisão:** As telas em `src/app/(modals)/` apenas interpretam parâmetros de rota (`useLocalSearchParams<{ id?: string }>()`), injetam os hooks da feature e renderizam os formulários que residem em `src/[feat]/components/`.
- **Racional:** Mantém a arquitetura baseada em features do projeto (`AGENTS.md`) 100% preservada e facilita a testabilidade unitária dos formulários.

### 4. Sincronização via `useFocusEffect`
- **Decisão:** As telas em `src/app/(tabs)/` utilizam `useFocusEffect` para revalidar/recarregar os dados quando a rota modal é fechada com `router.back()`.
- **Racional:** Evita acoplamento entre telas por callbacks ou listeners de eventos globais.

## Risks / Trade-offs

- **[Comportamento de altura em telas pequenas no Android]** → Mitigação: O `ModalSheet.Body` utiliza `ScrollView` com flexibilidade para telas menores, garantindo que botões e inputs continuem acessíveis com teclado ativo.
- **[Acessibilidade e botão voltar]** → Mitigação: No iOS, o gesto de swipe para baixo fecha a modal nativamente; no Android, tanto o botão voltar do sistema quanto o botão no header disparam `router.back()`.

## Migration Plan

1. **Grupo 1 (Base & Validação Inicial):**
   - Configurar `presentation: "formSheet"` no `_layout.tsx` de modais.
   - Construir o componente `ModalSheet` em `src/shared/components/ModalSheet.tsx` com testes unitários.
   - Criar uma rota de exemplo/preview em `(modals)/example.tsx` e validar visualmente (iOS & Android).
   - Pausa para aprovação do usuário.
2. **Grupo 2 (Migração das Rotas de Features):**
   - Criar `src/app/(modals)/person.tsx` e refatorar `PersonModal` / `PersonForm`.
   - Criar `src/app/(modals)/card.tsx` e refatorar `CreditCardModal` / `CreditCardForm`.
   - Criar `src/app/(modals)/purchase.tsx` e refatorar compras.
   - Atualizar chamadas de abertura nas abas (`cards.tsx`, `people.tsx`, `index.tsx`) para usar `router.push`.
   - Executar validação global com `pnpm check`.
