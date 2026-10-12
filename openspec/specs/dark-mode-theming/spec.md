# dark-mode-theming Specification

## Purpose
Gerencia a aparência visual do aplicativo (Modo Claro e Modo Escuro) com propagação completa para todos os componentes de interface, suporte à paleta Deep Zinc / Cupertino e persistência local da preferência do usuário.

## Requirements

### Requirement: Dark Mode Theme Propagation
O sistema SHALL aplicar o modo escuro a todos os componentes, telas, cartões, formulários, botões e recipientes de navegação da aplicação, resolvendo variáveis CSS de estilo sem manter elementos de fundo ou texto estáticos no modo claro quando o tema escuro estiver ativo.

#### Scenario: Visualização do app em modo escuro
- **WHEN** o modo escuro está ativado no aplicativo ou pelo sistema operacional
- **THEN** todas as telas, cards, botões secundários, bordas e textos adotam as tonalidades correspondentes ao tema escuro (fundo escuro #09090b, cards #18181b e textos claros), sem flashes brancos no fundo da tela

#### Scenario: Visualização do app em modo claro
- **WHEN** o modo claro está ativado no aplicativo ou pelo sistema operacional
- **THEN** as telas e componentes exibem a paleta padrão clara com fundo claro e textos escuros com alto contraste

### Requirement: Theme Preference Persistence
O sistema SHALL persistir a escolha de tema do usuário (`light`, `dark` ou `system`) no armazenamento seguro local do dispositivo, restaurando a preferência automaticamente na inicialização da aplicação.

#### Scenario: Usuário altera o tema manualmente pelo dashboard
- **WHEN** o usuário toca no botão de alternância de tema no cabeçalho do Dashboard
- **THEN** a interface atualiza imediatamente o esquema de cores para o novo estado e a preferência é salva no armazenamento local do dispositivo

#### Scenario: Inicialização do aplicativo após fechamento
- **WHEN** o aplicativo é aberto após ser completamente fechado
- **THEN** o sistema lê a preferência previamente salva no armazenamento local e aplica o tema correspondente imediatamente, ou segue as preferências do sistema operacional caso nenhuma preferência personalizada tenha sido salva

### Requirement: Navigation Container Theme Synchronization
O sistema SHALL sincronizar o contêiner de navegação raiz do Expo Router com o tema ativo através do `ThemeProvider` da biblioteca de navegação, mantendo o fundo nativo e a barra de status consistentes com a paleta em exibição.

#### Scenario: Navegação e transições de tela
- **WHEN** o usuário navega entre abas ou abre um modal
- **THEN** o fundo estrutural do container de navegação e a barra de status acompanham o tema ativo (`light` para fundo escuro com status bar clara, ou vice-versa), prevenindo qualquer canvas branco subjacente
