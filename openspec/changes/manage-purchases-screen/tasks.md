# Tasks

## 1. Backend: Schemas, Serviços e Persistência de Compras

- [x] 1.1 Atualizar `createPurchaseSchema` em `src/server/purchases/schemas/purchases.schema.ts` para tornar `purchaseDate` opcional com default para a data atual, e criar `updatePurchaseSchema` validando a invariância de `paymentMethod`, `creditCardId`, `totalAmount` e `totalInstallments`. Verificar com testes unitários em `src/server/purchases/tests/purchases.schema.test.ts`.
- [x] 1.2 Implementar método `updatePurchase` na interface `IPurchasesRepository` e nos repositórios `InMemoryPurchasesRepository` e `DrizzlePurchasesRepository` com execução transacional e preservação de status `isPaid` com suporte a abono.
- [x] 1.3 Adicionar método `updatePurchase` em `PurchasesService` em `src/server/purchases/services/purchases.service.ts` implementando a regra de abono (preservar parcelas pagas como quitadas e atribuir as parcelas restantes para a nova pessoa) e bloqueando mutações estruturais.
- [x] 1.4 Escrever testes unitários em memória para `PurchasesService.updatePurchase` cobrindo sucesso, abono de parcelas já quitadas, atribuição das parcelas restantes para a nova pessoa e bloqueio de alteração no total de parcelas, método de pagamento e valor total em `src/server/purchases/tests/purchases.service.test.ts`.

## 2. API Routes e Camada de Serviço Client-Side

- [x] 2.1 Adicionar manipulador `PUT` em `src/app/api/purchases/[id]+api.ts` autenticado com `requireAuth` para processar atualizações de compra e retornar o registro atualizado.
- [x] 2.2 Criar testes unitários para a rota `PUT` em `src/server/purchases/tests/purchases.routes.test.ts`.
- [x] 2.3 Atualizar `src/purchases/services/purchases-api.service.ts` e `src/purchases/hooks/use-purchases.ts` adicionando método `update(id, data)` e tipos TypeScript correspondentes.

## 3. Componentes de Modais e Seleção de Data

- [x] 3.1 Atualizar `src/purchases/components/NewPurchaseModal.tsx` com campo opcional de seleção de data da compra (com atalhos rápidos "Hoje" e "Ontem" e máscara DD/MM/AAAA), recalculando o ciclo do cartão em tempo real ao selecionar a data.
- [x] 3.2 Criar o componente `src/purchases/components/EditPurchaseModal.tsx` com edição restrita a descrição, data de compra e splits, exibindo método de pagamento, cartão, valor total e número de parcelas como campos desabilitados/somente leitura e botão de exclusão com confirmação.
- [x] 3.3 Adicionar testes unitários/componente para a lógica de formulário de edição e criação com data opcional em `src/purchases/tests/purchases-modal.test.ts`.

## 4. Nova Tela de Compras e Filtros Cruzados

- [x] 4.1 Criar o componente `PurchaseCard.tsx` em `src/purchases/components/` com visual moderno, badges de cartão e participantes, valor, data formatada, status de pagamento e gatilho de edição.
- [x] 4.2 Criar a tela `src/app/(tabs)/purchases.tsx` contendo cabeçalho com métricas (gasto acumulado e quantidade), barra de busca textual, seletor de mês/ano com opção "Todos os períodos", chips de cartão e chips de pessoa.
- [x] 4.3 Integrar a aba "Compras" em `src/app/(tabs)/_layout.tsx` com o ícone `ShoppingBag` e navegação fluida.

## 5. Validação Unificada e Qualidade

- [ ] 5.1 Executar a suíte unificada de validação do projeto (`pnpm check`: Prettier, ESLint e Jest) e corrigir eventuais inconsistências ou avisos.
