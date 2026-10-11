# Spec Delta: People

## ADDED Requirements

### Requirement: Confirmação de Exclusão de Pessoa com Diálogo Nativo
O sistema SHALL exibir o diálogo de confirmação nativo `DeleteConfirmationDialog` (`AlertDialog` no Android e `Alert` no iOS via `@expo/ui`) ao solicitar a remoção de uma pessoa cadastrada, alertando o usuário sobre o impacto nas despesas e divisões atribuídas àquela pessoa, substituindo alertas legados de sistema (`Alert.alert`).

#### Scenario: Acionamento da exclusão de pessoa
- **WHEN** o usuário toca no ícone de lixeira em uma pessoa da lista de pessoas
- **THEN** o sistema exibe o `DeleteConfirmationDialog` nativo com o nome da pessoa a ser excluída e as opções de cancelamento e confirmação destrutiva
