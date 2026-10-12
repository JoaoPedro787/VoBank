# Modal Sheet Specification

## Purpose

Fornecer uma arquitetura de modais nativas baseada em rotas do Expo Router (`(modals)/...` com `formSheet`), complementada pelo componente padronizado `ModalSheet` (Compound Components) para substituir modais legadas em todas as features.

## Requirements

### Requirement: Configuração de Modais Nativas no Expo Router
The system SHALL configure the `(modals)` Stack layout in Expo Router with native `presentation: "formSheet"`, detents (`sheetAllowedDetents: [0.6, 0.9]`), grabber (`sheetGrabberVisible: true`), and rounded corners (`sheetCornerRadius: 24`), enabling native system sheet behavior on iOS and native modal transitions with hardware back button support on Android.

#### Scenario: Abertura de rota modal
- **WHEN** o usuário navega para qualquer rota dentro do grupo `(modals)`
- **THEN** a tela DEVE abrir como uma folha nativa `formSheet` sobreposta com cantos arredondados e suporte ao gesto de deslizar para baixo para fechar.

#### Scenario: Fechamento no Android
- **WHEN** o usuário pressiona o botão físico ou executa o gesto de voltar do sistema no Android com a rota modal aberta
- **THEN** a navegação DEVE retornar para a tela anterior sem fechar o aplicativo.

### Requirement: Componente ModalSheet Base Componível
The system SHALL provide the `ModalSheet` container component and subcomponents `ModalSheet.Header`, `ModalSheet.Body`, and `ModalSheet.Footer`, enabling declarative screen composition for modal routes.

#### Scenario: Renderização de tela modal padronizada
- **WHEN** uma rota modal renderiza o `ModalSheet` contendo `ModalSheet.Header`, `ModalSheet.Body` e `ModalSheet.Footer`
- **THEN** o cabeçalho DEVE apresentar título e botão/ação de fechar chamando `router.back()`, o corpo DEVE gerenciar rolagem com `keyboardShouldPersistTaps="handled"`, e o rodapé DEVE acomodar as ações de submissão respeitando a Safe Area.

### Requirement: Rotas Modais Dedicadas nas Features
The application SHALL provide dedicated route screens in `src/app/(modals)/` for managing core entities (`card.tsx`, `person.tsx`, `purchase.tsx`), receiving optional query parameters (e.g., `?id=123`) to switch between creation and edition modes.

#### Scenario: Criar nova entidade via rota modal
- **WHEN** o usuário aciona a criação a partir de uma tela de listagem
- **THEN** a aplicação DEVE navegar via `router.push` para a rota correspondente sem parâmetros e exibir o formulário limpo para cadastro.

#### Scenario: Editar entidade existente via rota modal
- **WHEN** o usuário aciona a edição de uma entidade existente passando o parâmetro `id`
- **THEN** a tela modal DEVE carregar os dados correspondentes e preencher os campos do formulário para edição.

### Requirement: Sincronização Reativa ao Retornar da Modal
The list screens in `src/app/(tabs)/` SHALL automatically refresh or reactively display updated records when a modal route completes and calls `router.back()`.

#### Scenario: Atualização após salvar na modal
- **WHEN** o usuário salva com sucesso um novo registro na modal e a rota chama `router.back()`
- **THEN** a tela de origem DEVE exibir imediatamente os dados atualizados sem exigir refresh manual pelo usuário.
