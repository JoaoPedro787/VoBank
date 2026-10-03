# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Listagem e Filtros de Compras
O sistema SHALL disponibilizar uma visualização consolidada de todas as compras de todos os cartões com suporte a filtros cruzados em tempo real por cartão de crédito, por pessoa participante (incluindo o titular), combinação de cartão e pessoa, período por mês e ano (com opção de visualizar todos os períodos) e pesquisa textual por descrição.

#### Scenario: Filtragem combinada por cartão e pessoa
- **WHEN** o usuário seleciona um cartão específico (ex: "Nubank") e uma pessoa específica (ex: "Maria")
- **THEN** a listagem exibe somente as compras realizadas no "Nubank" que possuam divisão/rateio atribuído a "Maria"

#### Scenario: Filtragem por mês e ano
- **WHEN** o usuário seleciona o mês de "Março" e o ano "2026"
- **THEN** a listagem apresenta apenas as compras realizadas dentro do período especificado e recalcula os totais consolidados exibidos no cabeçalho

### Requirement: Edição e Exclusão de Compras
O sistema SHALL permitir a edição dos dados de uma compra existente (descrição, valor total, data de compra, cartão de crédito associado e rateio entre pessoas). O sistema SHALL proibir explicitamente a alteração da quantidade de parcelas da compra para proteger a integridade dos ciclos de fatura e registros já gerados. O sistema SHALL também permitir a exclusão completa de uma compra, removendo em cascata suas parcelas e rateios associados.

#### Scenario: Edição de valor e rateio mantendo quantidade de parcelas
- **WHEN** o usuário altera o valor total de uma compra em 3 parcelas de R$ 300 para R$ 450 e redistribui o percentual entre os participantes
- **THEN** o sistema atualiza a compra mantendo 3 parcelas, recalculando o valor de cada parcela para R$ 150 e reajustando os valores dos rateios correspondentes

#### Scenario: Bloqueio de alteração no número de parcelas
- **WHEN** o usuário visualiza o formulário de edição de uma compra existente
- **THEN** o controle de quantidade de parcelas é apresentado em estado desabilitado/somente leitura, impedindo o incremento ou decremento das parcelas

#### Scenario: Exclusão de compra existente
- **WHEN** o usuário confirma a exclusão de uma compra existente
- **THEN** o sistema exclui a compra mestre, suas parcelas e divisões no banco de dados e atualiza a listagem removendo o item
