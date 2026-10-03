# Design

## Context

O sistema já possui modelos e regras de negócio para cálculo de faturas e divisão proporcional de compras (`calculateInstallmentDates`, `calculatePurchaseSplitsAndInstallments`), persistência via Drizzle ORM com PostgreSQL, rotas de API em Expo Router (`src/app/api/purchases`) e componentes estilizados com NativeWind v4 e Shadcn primitives. A tela inicial (`src/app/(tabs)/index.tsx`) foca na visão mensal agregada do dashboard. Veja `proposal.md` para as motivações e objetivos gerais.

## Goals / Non-Goals

**Goals:**
- Criar a aba `(tabs)/purchases.tsx` com visual moderno, cabeçalho de totais acumulados e filtros responsivos em tempo real (mês/ano com alternador "Todos", cartão, pessoa, pessoa + cartão e busca textual).
- Adicionar o endpoint `PUT /api/purchases/[id]` com validação Zod (`updatePurchaseSchema`) e execução atômica via `db.transaction`.
- Criar o componente `EditPurchaseModal` permitindo edição de valor total, descrição, data de compra, cartão/método e splits, com bloqueio estrito da quantidade de parcelas.
- Atualizar o `NewPurchaseModal` para suportar seleção opcional de data de compra (com fallback para a data/hora atual quando omitida).
- Atualizar `purchases-api.service.ts` e o hook `use-purchases.ts` para fornecer métodos de atualização (`update`) e listagem filtrada.

**Non-Goals:**
- Permitir edição na quantidade de parcelas de uma compra existente (regra fechada para proteger o histórico financeiro).
- Permitir edição de compras de outros usuários (controle restrito por `userId` em nível de repositório e middleware de autenticação).

## Decisions

### 1. Navegação: 4ª Aba Dedicada no `(tabs)/_layout.tsx`
- **Decisão**: Adicionar a tela `purchases.tsx` como a segunda ou terceira aba da barra de navegação com ícone `ShoppingBag` do `lucide-react-native`.
- **Alternativas consideradas**:
  - Acessar compras apenas através de um botão no Dashboard: Rejeitado porque Compras é uma entidade central do app e merece acesso primário de nível 1.

### 2. Estratégia de Atualização Transacional no Backend
- **Decisão**: No `updatePurchase`, o backend valida a invariância de `totalInstallments` (mantendo o número de parcelas original). Caso haja alteração de valor total, data de compra, cartão ou rateios, o serviço executa dentro de `db.transaction`:
  1. Atualiza a tabela `purchases`.
  2. Mapeia se parcelas existentes estavam marcadas como `isPaid: true` (para preservar o status de pagamento nas parcelas correspondentes recalculadas).
  3. Remove as parcelas antigas e insere as novas calculadas por `calculatePurchaseSplitsAndInstallments`.
- **Alternativas consideradas**:
  - Fazer updates individuais em cada linha de `installments`: Muito suscetível a erros de arredondamento de centavos e dessincronização de datas.

### 3. Filtros Cruzados no Client com Alta Performance
- **Decisão**: A listagem de compras busca os registros do usuário e aplica os filtros reativos em memória via `useMemo`. Com isso, a alternância entre chips de cartões, pessoas, meses e digitação na busca textual tem resposta imediata (< 16ms) sem spinners ou requisições desnecessárias.
- **Alternativas consideradas**:
  - Fazer requisição HTTP a cada clique de filtro: Criaria latência perceptível e complexidade excessiva de paginação no backend para o volume típico de compras pessoais.

### 4. Componente de Seleção de Data da Compra
- **Decisão**: Campo com máscara/formatação visual amigável (DD/MM/AAAA) com atalhos de toque rápido ("Hoje", "Ontem") e suporte a data retroativa no `NewPurchaseModal` e `EditPurchaseModal`. Se não informado no cadastro, envia `new Date()`.

## Risks / Trade-offs

- **[Risco] Perda de status `isPaid` ao recalcular parcelas na edição**:
  - *Mitigação*: O repositório armazena o mapa `(installmentNumber, personId) -> isPaid` antes da deleção e reaplica o status de pago nas novas parcelas geradas de mesmo número para a mesma pessoa.
- **[Risco] Data da compra antes do fechamento vs depois do fechamento**:
  - *Mitigação*: A data da compra fornecida é passada diretamente para `calculateInstallmentDates`, garantindo que os dias de fechamento (`closingDay`) e vencimento (`dueDay`) do cartão continuem sendo a única fonte da verdade matemática.
