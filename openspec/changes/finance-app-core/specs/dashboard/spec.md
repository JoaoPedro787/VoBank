# Spec Delta: Dashboard

## Purpose

Fornecer métricas financeiras consolidadas e detalhadas por pessoa cadastrada, destacando compromissos do mês, valores já acertados e pendências em atraso.

## ADDED Requirements

### Requirement: Mini Dashboard por Pessoa
O sistema SHALL apresentar um painel individualizado para cada pessoa (incluindo o titular), sumarizando: total comprometido no mês corrente, total já pago no mês, parcelas pendentes e parcelas com vencimento atrasado.

#### Scenario: Visualização do resumo de um mês específico
- **WHEN** o usuário seleciona um perfil de pessoa no mês de referência
- **THEN** o sistema exibe os totais consolidados de valores a pagar, já pagos e quantidade de parcelas restantes daquela pessoa

#### Scenario: Alerta de parcelas vencidas
- **WHEN** existem parcelas com data de vencimento anterior à data de hoje cujo status continua pendente
- **THEN** o sistema destaca visualmente essas parcelas como vencidas e contabiliza no total em atraso
