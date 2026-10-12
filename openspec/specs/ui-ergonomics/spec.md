# UI Ergonomics Specification

## Purpose

Define padrões de interface móvel ergonômica, suporte a Safe Areas dinâmicas, feedback tátil com Haptics, formulários consistentes sem deslocamento e modais Bottom Sheet.

## Requirements

### Requirement: Navegação e Safe Areas Dinâmicas
O sistema SHALL adaptar dinamicamente o espaçamento da barra inferior de navegação (Tab Bar) e os cabeçalhos das telas com base nas áreas seguras do dispositivo (`useSafeAreaInsets`), garantindo que ícones, títulos e botões não sejam sobrepostos pela barra de gestos ou pela barra de status e entalhes (notches/Dynamic Island).

#### Scenario: Ajuste da Tab Bar em dispositivos com indicador de início
- **WHEN** o aplicativo é executado em um dispositivo com indicador de gestos inferior (ex: iOS recente)
- **THEN** a barra de abas calcula sua altura e espaçamento inferior considerando o inset da área segura, mantendo os ícones e rótulos totalmente visíveis

#### Scenario: Ajuste do cabeçalho em dispositivos com entalhe
- **WHEN** uma tela principal é carregada em um dispositivo com entalhe ou Dynamic Island
- **THEN** o cabeçalho aplica o espaçamento superior dinâmico correspondente ao status bar real, impedindo sobreposição de texto

### Requirement: Feedback Tátil e Micro-animações
O sistema SHALL fornecer respostas hápticas suaves (`expo-haptics`) ao usuário em ações interativas relevantes (como toques em botões principais, marcação de quitação de parcelas e alternância de abas), além de manter micro-animações otimizadas para taxa de quadros estável a 60 FPS sem engasgos durante a rolagem de listas.

#### Scenario: Toque em botão interativo
- **WHEN** o usuário pressiona um botão de ação primária ou secundária
- **THEN** o dispositivo produz uma vibração háptica suave confirmando a recepção do toque

#### Scenario: Rolagem de listas com itens animados
- **WHEN** o usuário rola rapidamente a lista de compras ou parcelas
- **THEN** a renderização dos itens mantém fluidez constante sem engasgos na thread de interface

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

### Requirement: Diálogo de Confirmação de Exclusão Padronizado
O sistema SHALL fornecer um componente reutilizável de confirmação de exclusão nativo (`DeleteConfirmationDialog`), utilizando componentes nativos do `@expo/ui` com divisão por plataforma: `AlertDialog` (`@expo/ui/jetpack-compose`) no Android e `Alert` (`@expo/ui/swift-ui`) no iOS, encapsulados por `<Host>` do `@expo/ui`. O diálogo exibirá título descritivo da ação, aviso explicativo das entidades afetadas e opções de cancelar e confirmar a exclusão com estilo destrutivo.

#### Scenario: Exibição do diálogo de exclusão nativo
- **WHEN** o usuário toca no ícone de lixeira ou botão de exclusão de qualquer entidade (cartão, pessoa ou compra)
- **THEN** o sistema exibe o diálogo nativo do sistema operacional (`AlertDialog` no Android e `Alert` no iOS) com título, mensagem descritiva e opções de Cancelar e Confirmar Exclusão

