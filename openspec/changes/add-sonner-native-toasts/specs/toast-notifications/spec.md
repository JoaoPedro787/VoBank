# Spec Delta: toast-notifications

## Purpose

Fornece confirmações visuais e táteis imediatas no topo da tela para ações críticas do aplicativo (compras, cartões, pessoas e parcelas) através de alertas toast transitórios e não-bloqueantes.

## ADDED Requirements

### Requirement: Top-anchored toast notification container
O sistema SHALL renderizar um container unificado de notificações toast (`Toaster`) na raiz da aplicação, posicionado no topo da tela (`top-center`), respeitando as áreas seguras do dispositivo (`SafeAreaInsets`, Dynamic Island e entalhes) e sincronizado com o modo claro ou escuro ativo.

#### Scenario: Toast visível acima das telas e modais
- **WHEN** uma operação é disparada a partir de uma tela ou modal (`formSheet`)
- **THEN** o container no topo exibe a notificação de forma visível e persistente mesmo se o modal for fechado imediatamente com `router.back()`.

### Requirement: Transient action feedback without interactive buttons
O sistema SHALL exibir notificações toast estritamente informativas de sucesso ou erro, sem botões de ação clicáveis adicionais, desaparecendo automaticamente após alguns segundos (~3 a 4 segundos) ou através de gesto de swipe para cima pelo usuário.

#### Scenario: Notificação com fechamento automático
- **WHEN** uma ação de sucesso ou falha é disparada
- **THEN** o toast é apresentado com seu respectivo ícone/estilo sem botões interativos e é recolhido automaticamente sem intervenção do usuário.

#### Scenario: Notificação descartada por gesto
- **WHEN** o usuário desliza o dedo para cima sobre a notificação exibida
- **THEN** o toast é descartado e fechado instantaneamente.

### Requirement: Coordinated haptic and visual feedback
O sistema SHALL sincronizar a resposta háptica tátil (`expo-haptics`) com a exibição do toast correspondente, emitindo feedback de sucesso nas operações bem-sucedidas e feedback de erro nas falhas.

#### Scenario: Feedback tátil em operação bem-sucedida
- **WHEN** uma ação de mutação é concluída com sucesso e o toast de sucesso é disparado
- **THEN** o sistema executa simultaneamente o feedback háptico de sucesso (`hapticFeedback.notificationSuccess`).

#### Scenario: Feedback tátil em falha de operação
- **WHEN** uma ação de mutação falha e o toast de erro é disparado
- **THEN** o sistema executa simultaneamente o feedback háptico de erro (`hapticFeedback.notificationError`).

### Requirement: Consistent feedback across purchases, credit cards, people, and split payments
O sistema SHALL disparar notificações toast de confirmação para todas as operações de mutação de dados em Compras, Cartões, Pessoas e Rateios/Parcelas, informando claramente o desfecho.

#### Scenario: Notificação ao registrar, editar ou excluir compra
- **WHEN** o usuário salva uma nova compra, altera uma existente ou confirma sua exclusão
- **THEN** o sistema exibe toast de sucesso correspondente ("Compra registrada com sucesso!", "Compra atualizada com sucesso!" ou "Compra excluída com sucesso!"), ou toast de erro em caso de falha.

#### Scenario: Notificação ao registrar, editar ou excluir cartão
- **WHEN** o usuário salva um cartão ou confirma sua exclusão na listagem
- **THEN** o sistema exibe toast de sucesso correspondente ("Cartão cadastrado com sucesso!", "Cartão atualizado com sucesso!" ou "Cartão excluído com sucesso!"), ou toast de erro em caso de falha.

#### Scenario: Notificação ao registrar, editar ou excluir pessoa
- **WHEN** o usuário salva uma pessoa ou confirma sua exclusão na listagem
- **THEN** o sistema exibe toast de sucesso correspondente ("Pessoa cadastrada com sucesso!", "Pessoa atualizada com sucesso!" ou "Pessoa excluída com sucesso!"), ou toast de erro em caso de falha.

#### Scenario: Notificação ao alternar pagamento de parcela/split
- **WHEN** o usuário clica no botão de status de uma parcela no dashboard para marcar como paga ou pendente
- **THEN** o sistema exibe toast de sucesso informando o novo estado ("Parcela marcada como paga!" ou "Parcela marcada como pendente!"), ou toast de erro em caso de falha na requisição.
