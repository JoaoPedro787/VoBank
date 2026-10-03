# Proposal

## Why

Atualmente, o aplicativo permite cadastrar compras e visualizar parcelas resumidas por mês na tela inicial (Dashboard), mas os usuários não possuem uma visão consolidada de todas as compras realizadas em seus cartões. Não há como consultar o histórico geral de compras, filtrar despesas por cartão e pessoa simultaneamente, filtrar compras por mês/ano, nem editar detalhes de uma compra existente (como descrição, valor, data ou rateio entre pessoas) ou especificar retroativamente a data em que a compra ocorreu.

Esta mudança introduz uma tela dedicada de Compras com filtros avançados (pessoa, cartão, pessoa/cartão, mês/ano e busca por texto), capacidade de editar e excluir compras com integridade de parcelas (bloqueando a alteração da quantidade de parcelas para preservar o histórico financeiro), e inclusão do campo de data da compra opcional no cadastro e na edição.

## What Changes

- **Nova Aba e Tela de Compras (`(tabs)/purchases.tsx`)**: Uma nova aba no rodapé do app exibindo a lista consolidada de compras de todos os cartões com métricas de resumo (total gasto e quantidade de compras).
- **Filtros Avançados e Busca**: Filtros em tempo real por cartão de crédito, por pessoa participante, combinação cartão + pessoa, seleção de período por mês/ano (com alternador para ver todos os períodos) e busca textual por descrição.
- **Edição de Compras (`EditPurchaseModal`)**:
  - Permite alterar descrição, data da compra e distribuição/rateio com outras pessoas (% ou valor fixo).
  - Bloqueio explícito de método de pagamento (e cartão associado), valor total e número de parcelas: esses campos permanecem somente leitura na edição para proteger o histórico financeiro e conciliação contábil.
  - Regra de abono em reatribuições: ao atribuir uma compra a uma nova pessoa (ou alterar o rateio), se houver parcelas já pagas, o sistema concede um abono sobre as parcelas já quitadas (mantendo o registro de quitação original sem cobrar retroativamente a nova pessoa), atribuindo a responsabilidade da nova pessoa exclusivamente às parcelas restantes em aberto.
  - Exclusão de compra com confirmação e remoção em cascata no banco de dados.
- **Data da Compra Opcional no Cadastro (`NewPurchaseModal`)**:
  - Campo opcional de data da compra: se não fornecido, utiliza a data/hora atual da criação; se fornecido, utiliza a data selecionada para calcular em qual fatura do cartão a despesa incidirá de acordo com o dia de fechamento.
- **Backend & APIs**:
  - Endpoint `PUT /api/purchases/[id]` para atualizar compra e suas parcelas/rateios de forma transacional.
  - Suporte a filtros de consulta por período, cartão ou pessoa na listagem de compras ou processamento no cliente.

## Capabilities

### Modified Capabilities
- `purchases`: Expande os requisitos de compras para incluir suporte a data de compra opcional no cadastro, edição controlada de compras com parcelas fixadas, exclusão completa e listagem com filtros cruzados (pessoa, cartão e período mês/ano).

## Impact

- **Client**: `src/app/(tabs)/_layout.tsx` (nova aba), `src/app/(tabs)/purchases.tsx` (nova tela), `src/purchases/components/NewPurchaseModal.tsx`, `src/purchases/components/EditPurchaseModal.tsx`, `src/purchases/components/PurchaseCard.tsx`, `src/purchases/hooks/use-purchases.ts`, `src/purchases/services/purchases-api.service.ts`.
- **Server**: `src/server/purchases/schemas/purchases.schema.ts` (schema de atualização e data opcional), `src/server/purchases/services/purchases.service.ts`, `src/server/purchases/repositories/purchases.repository.interface.ts`, `src/server/purchases/repositories/drizzle-purchases.repository.ts`, `src/app/api/purchases/[id]+api.ts` (método PUT).
- **Database**: Sem necessidade de alterações no schema das tabelas Drizzle existentes (`purchaseDate` já é timestamp; apenas a lógica de persistência e validação é enriquecida).
