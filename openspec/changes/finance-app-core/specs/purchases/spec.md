# Spec Delta: Purchases

## Purpose

Permitir o registro de despesas à vista ou parceladas no cartão, com geração de parcelas individuais e capacidade de rachar (*split*) valores entre pessoas com rastreamento de status de pagamento.

## ADDED Requirements

### Requirement: Lançamento de Compras
O sistema SHALL permitir registrar compras com descrição, valor total, data da compra, método de pagamento (à vista, débito, crédito), cartão de crédito associado (obrigatório se crédito) e quantidade de parcelas.

#### Scenario: Registro de compra parcelada no crédito
- **WHEN** o usuário cria uma compra de R$ 600 em 3 parcelas associada a um cartão
- **THEN** o sistema cria o registro mestre da compra e gera 3 parcelas de R$ 200 com datas de vencimento alinhadas ao ciclo do cartão

### Requirement: Divisão de Compras (Rachar Compras)
O sistema SHALL permitir a atribuição da compra a si mesmo, a uma pessoa cadastrada ou a divisão proporcional entre múltiplas pessoas cadastradas.

#### Scenario: Divisão igualitária entre duas pessoas
- **WHEN** o usuário cadastra uma compra de R$ 300 dividida em 50% para si e 50% para uma pessoa cadastrada
- **THEN** o sistema gera divisões correspondentes de R$ 150 para cada pessoa, rateando as parcelas igualmente

### Requirement: Controle de Pagamento das Parcelas
O sistema SHALL permitir marcar individualmente se a parcela de uma pessoa em um determinado mês foi paga ou permanece pendente.

#### Scenario: Marcar parcela como paga
- **WHEN** o usuário aciona a confirmação de recebimento/pagamento de uma parcela de um amigo
- **THEN** o sistema atualiza o status da parcela daquela pessoa para "pago" e registra a data do acerto
