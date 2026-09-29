# Proposal: Finance App Core

## Why

Gerenciar despesas pessoais quando há compras feitas para terceiros ou divididas entre amigos e familiares em cartões de crédito é confuso e propenso a erros manuais. A maioria dos aplicativos de controle financeiro trata despesas como pertencentes exclusivamente a uma única pessoa ou conta, ignorando o ciclo real de faturas de cartões (fechamento vs. vencimento) e a cobrança de quem deve cada parcela. 

Este projeto cria o núcleo do aplicativo mobile de finanças com React Native Expo, Expo Router (API routes), Drizzle ORM e PostgreSQL local, permitindo controle preciso de pessoas, divisão de compras (*split*), cálculo automático de faturas e lembretes de vencimento.

## What Changes

- Inicialização da estrutura de pastas *feature-based* (client e server) e configuração do Expo Router com API Routes.
- Configuração do Drizzle ORM conectado a uma base PostgreSQL local com migrations automáticas.
- Implementação de autenticação JWT segura (registro, login, recuperação de senha, logout e armazenamento seguro com `expo-secure-store`).
- Gestão de "Pessoas" vinculadas à conta do usuário (nome, cor de identificação, avatar).
- Gestão de Cartões de Crédito com configuração de **dia de fechamento** e **dia de vencimento**.
- Cadastro e rastreamento de compras (à vista, crédito, débito), com geração de parcelas calculadas com base no ciclo de faturas do cartão.
- Funcionalidade de **rachar compras** entre o titular e outras pessoas cadastradas (por percentual ou valor fixo), controlando o status de pagamento individual mês a mês.
- Mini Dashboard por pessoa, exibindo resumo mensal, total já pago, total a vencer e parcelas pendentes/vencidas.
- Sistema de notificações locais (`expo-notifications`) disparando alertas 1 dia antes e no dia do vencimento.
- Interface baseada no Shadcn UI com NativeWind v4 e React Native Reusables, com alternância de tema Claro/Escuro (compatível com as configurações do sistema) e micro-animações.

## Capabilities

### New Capabilities

- `auth`: Autenticação e gestão de usuários (registro, login com JWT, recuperação de senha, hashing seguro e sessão).
- `people`: Cadastro, edição e listagem de pessoas (com identificador visual por cor) associadas à conta.
- `credit-cards`: Cadastro e gerenciamento de cartões de crédito com dia de fechamento e dia de vencimento para cálculo de faturas.
- `purchases`: Lançamento de despesas à vista, débito e crédito parcelado, cálculo do ciclo de fatura e divisão de compras (*split*) entre pessoas com acompanhamento de parcelas pagas/pendentes.
- `dashboard`: Visão analítica consolidada e filtrada por pessoa com totais do mês, valores pendentes, pagos e vencidos.
- `notifications`: Agendamento de alertas locais de vencimento de parcelas (1 dia antes e na data de vencimento).

### Modified Capabilities

<!-- Nenhuma capacidade existente está sendo modificada, pois este é o início do projeto. -->

## Impact

- **Código e Estrutura:** Criação da estrutura base `src/app/`, `src/[feat]/`, `src/shared/` e `src/server/`.
- **Dependências:** Adição do Expo SDK, Expo Router, Drizzle ORM, `pg` / `postgres`, NativeWind v4, React Native Reusables, Zod, `expo-secure-store` e `expo-notifications`.
- **Infraestrutura:** Requer PostgreSQL em execução localmente (ex: localhost:5432).
