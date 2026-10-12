# People Specification

## Purpose

Permitir ao usuário cadastrar pessoas (perfis/tags) com nome e cor personalizada para identificar e segregar responsabilidades de compras e parcelas.

## Requirements

### Requirement: Cadastro de Pessoas
O sistema SHALL permitir que o usuário autenticado crie perfis de pessoas fornecendo nome e código de cor hexadecimal para identificação visual.

#### Scenario: Criação bem-sucedida de pessoa
- **WHEN** o usuário envia nome "Lucas" e cor "#3B82F6"
- **THEN** o sistema cadastra a pessoa vinculada ao id do usuário autenticado e a retorna com status 201

#### Scenario: Validação de campos obrigatórios
- **WHEN** o usuário tenta cadastrar uma pessoa sem nome ou com cor em formato inválido
- **THEN** o sistema rejeita a operação com erro de validação 400

### Requirement: Listagem e Gerenciamento de Pessoas
O sistema SHALL listar todas as pessoas cadastradas pelo usuário autenticado e permitir edição de dados ou desativação.

#### Scenario: Listagem de pessoas do usuário
- **WHEN** o usuário solicita a lista de pessoas
- **THEN** o sistema retorna apenas as pessoas pertencentes à conta do usuário autenticado

#### Scenario: Edição de dados de uma pessoa
- **WHEN** o usuário altera a cor ou nome de uma pessoa cadastrada
- **THEN** o sistema atualiza o registro e reflete a nova cor/nome em todas as visualizações associadas

### Requirement: Confirmação de Exclusão de Pessoa com Diálogo Nativo
O sistema SHALL exibir o diálogo de confirmação nativo `DeleteConfirmationDialog` (`AlertDialog` no Android e `Alert` no iOS via `@expo/ui`) ao solicitar a remoção de uma pessoa cadastrada, alertando o usuário sobre o impacto nas despesas e divisões atribuídas àquela pessoa, substituindo alertas legados de sistema (`Alert.alert`).

#### Scenario: Acionamento da exclusão de pessoa
- **WHEN** o usuário toca no ícone de lixeira em uma pessoa da lista de pessoas
- **THEN** o sistema exibe o `DeleteConfirmationDialog` nativo com o nome da pessoa a ser excluída e as opções de cancelamento e confirmação destrutiva

