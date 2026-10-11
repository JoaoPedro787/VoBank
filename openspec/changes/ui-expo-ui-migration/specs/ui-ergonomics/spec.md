# Spec Delta: UI Ergonomics

## MODIFIED Requirements

### Requirement: Formulários e Componentes Fundamentais Estáveis
O componente de campo de texto (`Input`) SHALL utilizar as capacidades nativas do `@expo/ui` com dimensões e borda estáveis entre repouso e foco, suporte a ícones prefixados/sufixados e alternância de visibilidade de senha por meio de ícone interativo de olho. O componente de botão (`Button`) SHALL utilizar o botão nativo do `@expo/ui` preservando dimensões no estado de carregamento (`loading`), variantes semânticas (`default`, `secondary`, `destructive`, `outline`, `ghost`) e feedback tátil (`expo-haptics`). Controles de alternância de formulário SHALL utilizar o componente nativo `Switch` do `@expo/ui`. Quando um componente ou modificador não estiver disponível na camada universal do `@expo/ui`, o sistema SHALL adotar implementações divididas por plataforma (`.ios.tsx` com `@expo/ui/swift-ui` e `.android.tsx` com `@expo/ui/jetpack-compose`), sempre encapsuladas por `<Host>` universal.

#### Scenario: Foco no campo de texto sem salto de layout
- **WHEN** o usuário seleciona e foca um campo de entrada
- **THEN** a borda do campo destaca o foco visualmente sem alterar a espessura física e sem deslocar elementos vizinhos

#### Scenario: Alternância de visibilidade de senha
- **WHEN** o usuário toca no ícone de olho em um campo de senha
- **THEN** o campo alterna entre a exibição mascarada e o texto legível, atualizando o ícone indicador

#### Scenario: Pressionar botão com resposta tátil nativa
- **WHEN** o usuário pressiona um botão de ação
- **THEN** o componente aciona feedback tátil e executa a ação mantendo os estilos nativos do sistema

### Requirement: Apresentação Padrão de Modais em Bottom Sheet
Todos os modais de ação (criação e edição de pessoas, cartões e compras) SHALL ser renderizados utilizando o `BottomSheet` universal do `@expo/ui` ancorado na base da tela, suportando detents/snap points nativos, alça de arraste superior (`ModalGrabHandle`), cantos superiores arredondados e suporte a ajuste automático em relação ao teclado virtual.

#### Scenario: Abertura de modal em dispositivo móvel
- **WHEN** o usuário abre qualquer modal de cadastro ou edição
- **THEN** o modal surge da parte inferior da tela utilizando o BottomSheet universal do `@expo/ui`, adaptando-se confortavelmente ao uso com uma mão

## ADDED Requirements

### Requirement: Diálogo de Confirmação de Exclusão Padronizado
O sistema SHALL fornecer um componente reutilizável de confirmação de exclusão em formato de Bottom Sheet (`DeleteConfirmationSheet`), exibindo ícone de alerta destrutivo, título descritivo da ação, aviso explicativo das entidades afetadas e dois botões de ação: botão secundário para cancelar e botão destrutivo (`destructive`) para confirmar a remoção com estado de carregamento.

#### Scenario: Exibição do diálogo de exclusão
- **WHEN** o usuário toca no ícone de lixeira ou botão de exclusão de qualquer entidade (cartão, pessoa ou compra)
- **THEN** o sistema exibe o Bottom Sheet de confirmação com detalhes claros dos dados que serão excluídos e botões de Cancelar e Confirmar Exclusão
