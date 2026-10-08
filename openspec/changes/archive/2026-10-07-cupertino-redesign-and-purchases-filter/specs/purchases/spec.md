# Spec Delta: Purchases

## MODIFIED Requirements

### Requirement: Listagem e Filtros de Compras
O sistema SHALL disponibilizar uma visualização consolidada de todas as compras de todos os cartões com suporte a filtros cruzados por cartão de crédito, por pessoa participante (incluindo o titular), combinação de cartão e pessoa, período por mês e ano (com opção de visualizar todos os períodos) e pesquisa textual por descrição. O endpoint de listagem de compras (`GET /api/purchases`) SHALL aceitar parâmetros de consulta opcionais (`month`, `year`, `creditCardId`, `personId`, `search`) para aplicar a filtragem no nível de servidor/repositório. Na interface móvel, a listagem de compras SHALL apresentar as transações agrupadas cronologicamente por dia com separadores de data.

#### Scenario: Filtragem combinada por cartão e pessoa
- **WHEN** o usuário seleciona um cartão específico (ex: "Nubank") e uma pessoa específica (ex: "Maria")
- **THEN** a listagem exibe somente as compras realizadas no "Nubank" que possuam divisão/rateio atribuído a "Maria"

#### Scenario: Filtragem por mês e ano
- **WHEN** o usuário seleciona o mês de "Março" e o ano "2026"
- **THEN** a listagem apresenta apenas as compras realizadas dentro do período especificado e recalcula os totais consolidados exibidos no cabeçalho

#### Scenario: Filtragem na API por parâmetros de consulta
- **WHEN** o cliente realiza uma requisição `GET /api/purchases` fornecendo parâmetros de busca como `month`, `year`, `creditCardId`, `personId` ou `search`
- **THEN** o servidor aplica as restrições na consulta do banco e retorna apenas as compras correspondentes aos critérios

#### Scenario: Visualização agrupada por dia na interface
- **WHEN** o usuário acessa a tela de compras com transações cadastradas em diferentes datas
- **THEN** a lista exibe as compras agrupadas por blocos de datas (ex: "Hoje", "Ontem" ou DD/MM/AAAA) com seus respectivos totais diários
