# Design: Cupertino Balance Redesign e Filtros na API de Compras

## Context

O projeto conta com uma arquitetura baseada em features (`src/shared/`, `src/[feat]/`, `src/server/`, `src/app/`) e suporte a testes isolados em memória. O design implementado originalmente usava componentes genéricos com paleta monocromática padrão de Shadcn. O usuário desenvolveu no Google Stitch o design system **Cupertino Balance** (`projects/13225192410199995362`), trazendo a estética moderna do iOS com cores semânticas vibrantes (System Blue `#007AFF`, Indigo `#5856D6`, Mint Green `#34C759`, Amber `#FF9500`, Coral Red `#FF3B30`), materiais táteis e tipografia com alinhamento numérico tabular.

Adicionalmente, a tela de compras requer visualização agrupada cronologicamente por dia e suporte a filtros de consulta diretamente no endpoint `GET /api/purchases`.

Veja `proposal.md` para os objetivos gerais e motivações.

## Goals / Non-Goals

**Goals:**
- Atualizar a fundação de tokens visuais (`tailwind.config.js` e `global.css`) para o tema Cupertino Balance, garantindo suporte completo a Light e Dark Mode.
- Refatorar os componentes no `src/shared/components/` (`Button`, `Input`, `Badge`, `Card`) e adicionar o `ModalGrabHandle`, mantendo compatibilidade de API e adicionando o novo visual.
- Implementar filtros de consulta no backend:
  - Schema de validação Zod para os query params (`month`, `year`, `creditCardId`, `personId`, `search`).
  - Suporte a filtros no repositório Drizzle e no repositório In-Memory (para testes unitários).
  - Atualização do endpoint `GET /api/purchases+api.ts`.
- Atualizar o serviço do client (`purchasesApiService.list`) e o hook `usePurchases` para suportar filtros opcionais.
- Implementar visualização de compras agrupadas por dia na tela `purchases.tsx`.
- Padronizar as telas de `Dashboard`, `Cartões`, `Pessoas` e `Autenticação` com os novos componentes do `shared`.

**Non-Goals:**
- Alterar o banco de dados relacional existente ou migrations (as colunas e tabelas existentes já comportam todos os campos).
- Depender de bibliotecas visuais externas proprietárias (mantém NativeWind v4 e React Native primitivo).

## Decisions

### 1. Sistema de Tokens Cupertino Balance
- **Decisão**: Configurar as variáveis CSS e a paleta do Tailwind com os valores exatos do Stitch:
  - `primary`: `#007AFF` (System Blue)
  - `secondary`: `#5856D6` (System Indigo)
  - `success`: `#34C759` (System Mint Green)
  - `warning`: `#FF9500` (System Amber)
  - `destructive`: `#FF3B30` (System Coral Red)
  - `background / canvas`: `#F2F2F7` (Light) e `#000000` (Dark)
  - `card / surface`: `#FFFFFF` (Light) e `#1C1C1E` (Dark)
  - `border / outline`: `rgba(0,0,0,0.06)` (Light) e `rgba(255,255,255,0.08)` (Dark)
- **Alternativas consideradas**:
  - Manter tema preto e branco com pequenas alterações: Rejeitado porque não atende ao design system projetado no Stitch.

### 2. Contratos e Retrocompatibilidade dos Componentes `shared`
- **Decisão**: Atualizar as implementações internas dos componentes em `src/shared/components/` preservando os nomes das props existentes:
  - `Button`: aceita `variant`, `size`, `label`, `loading`, `children`, e inclui a micro-animação de escala `active:scale-[0.97]`.
  - `Input`: preserva `label`, `error`, `placeholderTextColor`, estilizado com fundo `#F2F2F7` / `#2C2C2E` e anel de foco azul.
  - `Badge`: mantém as variantes existentes (`default`, `secondary`, `destructive`, `success`, `warning`, `outline`) com o mapeamento das novas cores suaves e texto semibold.
  - `Card`: mantém `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` com `rounded-2xl` e elevação Apple.
  - `ModalGrabHandle`: novo componente para o pill central de modais inferiores.

### 3. Filtros na API `GET /api/purchases`
- **Decisão**:
  - Criar `listPurchasesQuerySchema` em `src/server/purchases/schemas/purchases.schema.ts`:
    ```typescript
    export const listPurchasesQuerySchema = z.object({
      month: z.coerce.number().min(1).max(12).optional(),
      year: z.coerce.number().min(2000).max(2100).optional(),
      creditCardId: z.string().optional(),
      personId: z.string().optional(),
      search: z.string().optional(),
    });
    ```
  - Interface `ListPurchasesFilters` compartilhada no repositório.
  - `DrizzlePurchasesRepository`:
    - Filtro de período: se `month` e `year` forem passados, filtra por range de data `purchaseDate >= startOfMonth` e `< endOfMonth`.
    - Filtro de cartão: `creditCardId === "none"` filtra `isNull(purchases.creditCardId)`, caso contrário `eq(purchases.creditCardId, id)`.
    - Filtro de busca: `ilike(purchases.description, `%${search}%`)`.
    - Filtro de pessoa: valida se a compra possui divisão com `personId` (ou titular quando `personId === "user"`).
  - `InMemoryPurchasesRepository`: implementa os mesmos predicados para garantir cobertura de testes TDD sem banco de dados.

### 4. Agrupamento Diário na Tela de Compras
- **Decisão**: Implementar a função utilitária `groupPurchasesByDay(purchases: PurchaseClient[])` que organiza a lista por chave de data (`AAAA-MM-DD`), fornecendo rótulos amigáveis ("Hoje", "Ontem" ou data formatada em português) e o somatório total daquele dia.
- A listagem renderiza os blocos cronológicos com separadores visuais elegantes.

## Risks / Trade-offs

- **[Risco] Quebra de testes de componentes existentes**:
  - *Mitigação*: Como as props públicas dos componentes `shared` são estritamente preservadas, os testes existentes de renderização e animação continuam passando.
- **[Risco] Compatibilidade de filtros cliente vs servidor**:
  - *Mitigação*: O client pode enviar os filtros para a API na chamada inicial e manter a reatividade instantânea em memória caso o usuário altere filtros rapidamente, garantindo que o servidor já receba a carga filtrada quando solicitado.
