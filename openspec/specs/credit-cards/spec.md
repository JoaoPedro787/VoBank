# Credit Cards Specification

## Purpose

Gerenciar cartões de crédito do usuário, registrando dia de fechamento e dia de vencimento para calcular automaticamente em qual ciclo de fatura uma compra parcelada se enquadra.

## Requirements

### Requirement: Cadastro de Cartão de Crédito
O sistema SHALL permitir o cadastro de cartões de crédito contendo nome, bandeira/banco, cor do cartão, dia de fechamento (1 a 31) e dia de vencimento da fatura (1 a 31).

#### Scenario: Cadastro de cartão com datas válidas
- **WHEN** o usuário informa nome "Nubank", dia de fechamento 25 e dia de vencimento 5
- **THEN** o sistema salva o cartão associado ao usuário com sucesso

#### Scenario: Validação de dias de fechamento e vencimento
- **WHEN** o usuário informa dia menor que 1 ou maior que 31
- **THEN** o sistema rejeita a operação com erro de validação de intervalo

### Requirement: Cálculo de Ciclo de Fatura para Compras
O sistema SHALL determinar a fatura de competência e a data de vencimento da primeira parcela com base na relação entre a data da compra e o dia de fechamento do cartão.

#### Scenario: Compra realizada antes ou no dia do fechamento
- **WHEN** a compra ocorre no dia 20 de um cartão que fecha no dia 25 e vence no dia 05
- **THEN** a primeira parcela é agendada para o vencimento imediato no dia 05 do mês seguinte

#### Scenario: Compra realizada após o dia do fechamento
- **WHEN** a compra ocorre no dia 26 de um cartão que fecha no dia 25 e vence no dia 05
- **THEN** a primeira parcela entra na fatura subsequente, vencendo no dia 05 com um mês adicional de prazo
