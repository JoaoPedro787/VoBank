# Spec Delta: Credit Cards

## ADDED Requirements

### Requirement: Confirmação de Exclusão de Cartão em Bottom Sheet
O sistema SHALL exibir o diálogo de confirmação `DeleteConfirmationSheet` ancorado na base da tela ao solicitar a remoção de um cartão de crédito, alertando o usuário sobre o impacto na exclusão de faturas e parcelas vinculadas, substituindo alertas nativos bloqueantes de sistema (`Alert.alert`).

#### Scenario: Acionamento da exclusão de cartão
- **WHEN** o usuário toca no ícone de lixeira em um cartão da lista de cartões
- **THEN** o sistema exibe o `DeleteConfirmationSheet` com o nome do cartão a ser excluído e as opções de cancelamento e confirmação destrutiva
