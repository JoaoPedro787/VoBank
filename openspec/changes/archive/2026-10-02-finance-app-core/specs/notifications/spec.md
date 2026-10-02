# Spec Delta: Notifications

## Purpose

Agendar e gerenciar alertas locais no dispositivo móvel para notificar o usuário sobre parcelas que estão prestes a vencer ou vencendo no dia.

## ADDED Requirements

### Requirement: Agendamento de Alertas de Vencimento
O aplicativo SHALL agendar notificações locais no sistema operacional para parcelas com vencimento futuro, disparando 1 dia antes da data de vencimento e no próprio dia do vencimento às 09:00 da manhã.

#### Scenario: Agendamento automático após registro de compra
- **WHEN** uma nova compra parcelada é cadastrada
- **THEN** o aplicativo agenda notificações locais para cada parcela pendente para D-1 e D-0 do vencimento

### Requirement: Cancelamento de Alertas ao Pagar
O aplicativo SHALL cancelar o agendamento de notificações de uma parcela específica quando ela for marcada como paga antecipadamente.

#### Scenario: Parcela quitada antes da data
- **WHEN** o usuário marca uma parcela como paga antes da data de vencimento
- **THEN** o aplicativo remove os alertas locais agendados para aquela parcela específica
