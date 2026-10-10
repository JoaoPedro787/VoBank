# Spec Delta: Dashboard

## MODIFIED Requirements

### Requirement: Mini Dashboard por Pessoa
O sistema SHALL apresentar um painel individualizado para cada pessoa (incluindo o titular), sumarizando: total comprometido no mês corrente, total já pago no mês, parcelas pendentes e parcelas com vencimento atrasado. O cartão do mini dashboard SHALL utilizar layout resiliente com restrição de largura, redimensionamento automático de fonte (`adjustsFontSizeToFit`) e badges compactas para evitar que valores monetários e descrições transbordem das caixas.

#### Scenario: Visualização do resumo de um mês específico
- **WHEN** o usuário seleciona um perfil de pessoa no mês de referência
- **THEN** o sistema exibe os totais consolidados de valores a pagar, já pagos e quantidade de parcelas restantes daquela pessoa

#### Scenario: Alerta de parcelas vencidas
- **WHEN** existem parcelas com data de vencimento anterior à data de hoje cujo status continua pendente
- **THEN** o sistema destaca visualmente essas parcelas como vencidas e contabiliza no total em atraso

#### Scenario: Prevenção de estouro de valores monetários
- **WHEN** os valores de compromissos ou liquidação de uma pessoa atingem quantias com muitos dígitos (ex: centenas de milhares de reais)
- **THEN** o cartão mantém o valor contido em uma única linha com ajuste dinâmico de escala tipográfica, preservando o alinhamento da interface

## ADDED Requirements

### Requirement: Apresentação Resiliente de Métricas Mensais
O sistema SHALL exibir as métricas gerais do mês (Total Comprometido, Pago, Pendente e Vencido) em cartões com ajuste automático de tamanho de fonte (`adjustsFontSizeToFit`) e espaçamentos adaptativos, assegurando que quantias elevadas não vazem das caixas em telas de menor resolução.

#### Scenario: Exibição de valores monetários elevados no painel de métricas
- **WHEN** o total pago, pendente ou vencido no mês contém valores longos
- **THEN** os valores são renderizados inteiramente dentro de suas respectivas caixas sem quebras de linha indesejadas ou cortes na borda
