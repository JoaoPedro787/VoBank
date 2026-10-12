# Spec Delta: Purchases

## MODIFIED Requirements

### Requirement: Lançamento de Compras
O sistema SHALL permitir registrar compras com descrição, valor total, data da compra opcional (assumindo a data e hora do momento da criação caso não seja informada), método de pagamento (à vista, débito, crédito), cartão de crédito associado (obrigatório se crédito), quantidade de parcelas e divisão/rateio opcional. O campo de data de compra SHALL oferecer um botão interativo com ícone de calendário que aciona o seletor nativo de data (`DatePicker` via `@expo/ui/community/datetime-picker`) e atalhos rápidos ("Hoje" e "Ontem") para preenchimento ágil. O formulário de registro de nova compra SHALL ser exibido na interface móvel em formato de Bottom Sheet ancorado na base da tela, com alça de arraste superior, cantos superiores arredondados e ajuste dinâmico à altura do teclado virtual. Quando uma data específica for informada, o sistema SHALL utilizá-la como referência temporal para o ciclo de fechamento e vencimento das faturas.

#### Scenario: Registro de compra com data selecionada via calendário nativo
- **WHEN** o usuário toca no botão de calendário no campo de data da nova compra e seleciona um dia no seletor nativo
- **THEN** o campo é preenchido com a data escolhida e os cálculos de vencimento são atualizados de acordo

#### Scenario: Registro de compra com data retroativa informada
- **WHEN** o usuário cria uma compra com data específica no mês anterior e associa a um cartão de crédito
- **THEN** o sistema registra a data da compra especificada e calcula o vencimento das parcelas com base nessa data e nos dias de fechamento/vencimento do cartão

#### Scenario: Registro de compra sem informar a data de compra
- **WHEN** o usuário cadastra uma compra omitindo a data de compra
- **THEN** o sistema define automaticamente a data da compra como a data/hora atual da submissão

#### Scenario: Registro de compra parcelada no crédito
- **WHEN** o usuário cria uma compra de R$ 600 em 3 parcelas associada a um cartão
- **THEN** o sistema cria o registro mestre da compra e gera 3 parcelas de R$ 200 com datas de vencimento alinhadas ao ciclo do cartão

#### Scenario: Apresentação ergonômica em Bottom Sheet
- **WHEN** o usuário aciona a ação de registrar nova compra
- **THEN** o sistema abre a interface em uma folha deslizante (Bottom Sheet) a partir da base da tela, permitindo rolagem fluida e adaptação aos limites do teclado

### Requirement: Listagem e Filtros de Compras
O sistema SHALL disponibilizar uma visualização consolidada de todas as compras de todos os cartões com suporte a filtros cruzados por cartão de crédito, por pessoa participante (incluindo o titular), combinação de cartão e pessoa, período por mês e ano (com opção de visualizar todos os períodos) e pesquisa textual por descrição. O seletor de mês e ano SHALL manter setas de navegação lateral (`<` e `>`) para avançar ou retroceder um mês com um único toque, e SHALL permitir tocar no título central do mês/ano para abrir o seletor nativo de data/período e navegar diretamente a qualquer mês ou ano desejado. O endpoint de listagem de compras (`GET /api/purchases`) SHALL aceitar parâmetros de consulta opcionais (`month`, `year`, `creditCardId`, `personId`, `search`) para aplicar a filtragem no nível de servidor/repositório. Na interface móvel, a listagem de compras SHALL apresentar as transações agrupadas cronologicamente por dia com separadores de data.

#### Scenario: Navegação de período por setas
- **WHEN** o usuário toca na seta esquerda ou direita do seletor de mês
- **THEN** a listagem atualiza instantaneamente para o mês anterior ou posterior

#### Scenario: Seleção direta de período via seletor nativo
- **WHEN** o usuário toca sobre o texto do mês e ano no seletor
- **THEN** o seletor de data é exibido permitindo selecionar diretamente outro mês ou ano, atualizando a listagem

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

### Requirement: Edição e Exclusão de Compras
O sistema SHALL permitir a edição dos dados de uma compra existente restrita a descrição, data da compra e rateio/atribuição entre pessoas. O campo de data na edição SHALL disponibilizar botão com ícone de calendário que abre o seletor nativo de data (`DatePicker`), além de atalhos rápidos "Hoje" e "Ontem". O formulário de edição de compra SHALL ser apresentado em formato de Bottom Sheet ancorado na base da tela, prevenindo bugs de classes utilitárias e mantendo a integridade visual dos dados fixos da compra. O sistema SHALL proibir explicitamente a alteração do método de pagamento (e cartão de crédito associado), do valor total da compra e da quantidade de parcelas para proteger a integridade dos ciclos de fatura, conciliação financeira e pagamentos já liquidados. Ao acionar a exclusão da compra, o sistema SHALL exibir o diálogo nativo padronizado de confirmação (`DeleteConfirmationDialog` via `@expo/ui`: `AlertDialog` no Android e `Alert` no iOS) ao invés de um cartão estático na rolagem, removendo em cascata a compra, suas parcelas e rateios associados após a confirmação.

#### Scenario: Seleção de nova data de compra via calendário na edição
- **WHEN** o usuário edita a compra e seleciona uma nova data utilizando o botão de calendário
- **THEN** o campo de data é atualizado com o valor escolhido

#### Scenario: Confirmação de exclusão da compra via DeleteConfirmationDialog
- **WHEN** o usuário toca no botão de excluir compra na tela de edição
- **THEN** o sistema abre o `DeleteConfirmationDialog` apresentando os avisos de exclusão e solicitando confirmação nativa

#### Scenario: Bloqueio de campos estruturais na edição
- **WHEN** o usuário visualiza o formulário de edição de uma compra existente
- **THEN** os campos de método de pagamento, cartão de crédito associado, valor total e quantidade de parcelas são apresentados em estado desabilitado/somente leitura, impedindo qualquer modificação

#### Scenario: Reatribuição de pessoa com abono de parcelas quitadas
- **WHEN** o usuário reatribui uma compra parcelada (ex: 3 parcelas) para uma nova pessoa, onde a parcela 1 já foi quitada pela pessoa anteriormente atribuída
- **THEN** o sistema concede abono sobre a parcela 1 (preservando o status de quitada no histórico da compra sem gerar cobrança para a nova pessoa) e atribui a responsabilidade das parcelas restantes (parcelas 2 e 3) para a nova pessoa

#### Scenario: Exclusão de compra existente
- **WHEN** o usuário confirma a exclusão de uma compra existente
- **THEN** o sistema exclui a compra mestre, suas parcelas e divisões no banco de dados e atualiza a listagem removendo o item

#### Scenario: Visualização do modal de edição como Bottom Sheet
- **WHEN** o usuário toca para editar uma compra existente
- **THEN** a tela de edição abre como um Bottom Sheet na base do dispositivo, exibindo botões e campos de entrada devidamente espaçados
