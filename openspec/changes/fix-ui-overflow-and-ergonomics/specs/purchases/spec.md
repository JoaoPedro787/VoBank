# Spec Delta: Purchases

## MODIFIED Requirements

### Requirement: Lançamento de Compras
O sistema SHALL permitir registrar compras com descrição, valor total, data da compra opcional (assumindo a data e hora do momento da criação caso não seja informada), método de pagamento (à vista, débito, crédito), cartão de crédito associado (obrigatório se crédito), quantidade de parcelas e divisão/rateio opcional. O formulário de registro de nova compra SHALL ser exibido na interface móvel em formato de Bottom Sheet ancorado na base da tela, com alça de arraste superior, cantos superiores arredondados e ajuste dinâmico à altura do teclado virtual. Quando uma data específica for informada, o sistema SHALL utilizá-la como referência temporal para o ciclo de fechamento e vencimento das faturas.

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

### Requirement: Edição e Exclusão de Compras
O sistema SHALL permitir a edição dos dados de uma compra existente restrita a descrição, data da compra e rateio/atribuição entre pessoas. O formulário de edição de compra SHALL ser apresentado em formato de Bottom Sheet ancorado na base da tela, prevenindo bugs de classes utilitárias e mantendo a integridade visual dos dados fixos da compra. O sistema SHALL proibir explicitamente a alteração do método de pagamento (e cartão de crédito associado), do valor total da compra e da quantidade de parcelas para proteger a integridade dos ciclos de fatura, conciliação financeira e pagamentos já liquidados. O sistema SHALL também permitir a exclusão completa de uma compra, removendo em cascata suas parcelas e rateios associados.

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

## ADDED Requirements

### Requirement: Integridade Visual do Cartão de Compra
O cartão de compra na listagem cronológica SHALL renderizar informações de descrição, parcelas, participantes e status de quitação de forma resiliente, aplicando cores harmônicas e contraste adequado para ícones e rótulos de status em modo claro e escuro.

#### Scenario: Renderização com badge de status e participantes
- **WHEN** uma compra possui múltiplos participantes e parcelas em aberto ou quitadas
- **THEN** os badges de participantes e o badge de status exibem ícones e textos com cores legíveis correspondentes ao tema ativo, sem ultrapassar a largura do cartão
