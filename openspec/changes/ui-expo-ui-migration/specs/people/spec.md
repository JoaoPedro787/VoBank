# Spec Delta: People

## ADDED Requirements

### Requirement: Confirmação de Exclusão de Pessoa em Bottom Sheet
O sistema SHALL exibir o diálogo de confirmação `DeleteConfirmationSheet` ancorado na base da tela ao solicitar a remoção de uma pessoa cadastrada, alertando o usuário sobre o impacto nas despesas e divisões atribuídas àquela pessoa, substituindo alertas nativos bloqueantes de sistema (`Alert.alert`).

#### Scenario: Acionamento da exclusão de pessoa
- **WHEN** o usuário toca no ícone de lixeira em uma pessoa da lista de pessoas
- **THEN** o sistema exibe o `DeleteConfirmationSheet` com o nome da pessoa a ser excluída e as opções de cancelamento e confirmação destrutiva
