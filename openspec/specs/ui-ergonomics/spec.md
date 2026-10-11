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
O componente de campo de texto (`Input`) SHALL manter dimensões e borda de 1.5px estáveis entre o estado de repouso e foco para evitar saltos de layout (*layout shift*), oferecer suporte a ícones prefixados e sufixados, e permitir a alternância de visibilidade de campos de senha por meio de ícone interativo de olho. O componente de botão (`Button`) SHALL preservar suas dimensões visuais quando estiver no estado de carregamento (`loading`).

#### Scenario: Foco no campo de texto sem salto de layout
- **WHEN** o usuário seleciona e foca um campo de entrada
- **THEN** a borda do campo altera sua cor destacando o foco sem alterar sua espessura física e sem deslocar elementos vizinhos

#### Scenario: Alternância de visibilidade de senha
- **WHEN** o usuário toca no ícone de olho em um campo de senha
- **THEN** o campo alterna entre a exibição mascarada e o texto legível, atualizando o ícone indicador

### Requirement: Apresentação Padrão de Modais em Bottom Sheet
Todos os modais de ação (criação e edição de pessoas, cartões e compras) SHALL ser renderizados como Bottom Sheets ancorados na extremidade inferior da tela, dispondo de alça superior de apoio (`ModalGrabHandle`), cantos superiores arredondados e suporte a ajuste automático em relação ao teclado.

#### Scenario: Abertura de modal em dispositivo móvel
- **WHEN** o usuário abre qualquer modal de cadastro ou edição
- **THEN** o modal surge da parte inferior da tela com formato de folha deslizante (Bottom Sheet) e permanece operável com uma só mão
