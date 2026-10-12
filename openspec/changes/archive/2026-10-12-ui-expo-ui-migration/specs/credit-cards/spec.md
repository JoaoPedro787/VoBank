# Spec Delta: Credit Cards

## ADDED Requirements

### Requirement: Confirmação de Exclusão de Cartão com Diálogo Nativo
O sistema SHALL exibir o diálogo de confirmação nativo `DeleteConfirmationDialog` (`AlertDialog` no Android e `Alert` no iOS via `@expo/ui`) ao solicitar a remoção de um cartão de crédito, alertando o usuário sobre o impacto na exclusão de faturas e parcelas vinculadas, substituindo alertas legados de sistema (`Alert.alert`).

#### Scenario: Acionamento da exclusão de cartão
- **WHEN** o usuário toca no ícone de lixeira em um cartão da lista de cartões
- **THEN** o sistema exibe o `DeleteConfirmationDialog` nativo com o nome do cartão a ser excluído e as opções de cancelamento e confirmação destrutiva
