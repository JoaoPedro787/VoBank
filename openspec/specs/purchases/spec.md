# Purchases Specification

## Purpose

Permitir o registro de despesas à vista ou parceladas no cartão, com geração de parcelas individuais e capacidade de rachar (*split*) valores entre pessoas com rastreamento de status de pagamento.

## Requirements

### Requirement: Lançamento de Compras
O sistema SHALL permitir registrar compras com descrição, valor total, data da compra opcional (assumindo a data e hora do momento da criação caso não seja informada), método de pagamento (à vista, débito, crédito), cartão de crédito associado (obrigatório se crédito), quantidade de parcelas e divisão/rateio opcional. Quando uma data específica for informada, o sistema SHALL utilizá-la como referência temporal para o ciclo de fechamento e vencimento das faturas.

#### Scenario: Registro de compra com data retroativa informada
- **WHEN** o usuário cria uma compra com data específica no mês anterior e associa a um cartão de crédito
- **THEN** o sistema registra a data da compra especificada e calcula o vencimento das parcelas com base nessa data e nos dias de fechamento/vencimento do cartão

#### Scenario: Registro de compra sem informar a data de compra
- **WHEN** o usuário cadastra uma compra omitindo a data de compra
- **THEN** o sistema define automaticamente a data da compra como a data/hora atual da submissão

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

### Requirement: Listagem e Filtros de Compras
O sistema SHALL disponibilizar uma visualização consolidada de todas as compras de todos os cartões com suporte a filtros cruzados em tempo real por cartão de crédito, por pessoa participante (incluindo o titular), combinação de cartão e pessoa, período por mês e ano (com opção de visualizar todos os períodos) e pesquisa textual por descrição.

#### Scenario: Filtragem combinada por cartão e pessoa
- **WHEN** o usuário seleciona um cartão específico (ex: "Nubank") e uma pessoa específica (ex: "Maria")
- **THEN** a listagem exibe somente as compras realizadas no "Nubank" que possuam divisão/rateio atribuído a "Maria"

#### Scenario: Filtragem por mês e ano
- **WHEN** o usuário seleciona o mês de "Março" e o ano "2026"
- **THEN** a listagem apresenta apenas as compras realizadas dentro do período especificado e recalcula os totais consolidados exibidos no cabeçalho

### Requirement: Edição e Exclusão de Compras
O sistema SHALL permitir a edição dos dados de uma compra existente restrita a descrição, data da compra e rateio/atribuição entre pessoas. O sistema SHALL proibir explicitamente a alteração do método de pagamento (e cartão de crédito associado), do valor total da compra e da quantidade de parcelas para proteger a integridade dos ciclos de fatura, conciliação financeira e pagamentos já liquidados. O sistema SHALL também permitir a exclusão completa de uma compra, removendo em cascata suas parcelas e rateios associados.

#### Scenario: Bloqueio de campos estruturais na edição
- **WHEN** o usuário visualiza o formulário de edição de uma compra existente
- **THEN** os campos de método de pagamento, cartão de crédito associado, valor total e quantidade de parcelas são apresentados em estado desabilitado/somente leitura, impedindo qualquer modificação

#### Scenario: Reatribuição de pessoa com abono de parcelas quitadas
- **WHEN** o usuário reatribui uma compra parcelada (ex: 3 parcelas) para uma nova pessoa, onde a parcela 1 já foi quitada pela pessoa anteriormente atribuída
- **THEN** o sistema concede abono sobre a parcela 1 (preservando o status de quitada no histórico da compra sem gerar cobrança para a nova pessoa) e atribui a responsabilidade das parcelas restantes (parcelas 2 e 3) para a nova pessoa

#### Scenario: Exclusão de compra existente
- **WHEN** o usuário confirma a exclusão de uma compra existente
- **THEN** o sistema exclui a compra mestre, suas parcelas e divisões no banco de dados e atualiza a listagem removendo o item
