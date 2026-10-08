# Tasks

## 1. Design System & Componentes Fundamentais

- [x] 1.1 Instalar `expo-haptics` e criar helper seguro `src/shared/utils/haptics.ts` com fallback para ambientes sem suporte e verificar via teste unitário
- [x] 1.2 Refatorar `src/shared/components/Input.tsx` com borda fixa de 1.5px (zero layout shift no foco), suporte a ícones prefix/suffix e botão interativo de visualização de senha
- [x] 1.3 Refatorar `src/shared/components/Button.tsx` com preservação dimensional em loading, feedback tátil háptico no toque e alinhamento de ícone/texto
- [x] 1.4 Aprimorar `src/shared/components/Badge.tsx` para herdar e repassar cores adequadas a ícones e textos filhos
- [x] 1.5 Otimizar `src/shared/components/AnimatedScaleFade.tsx` para manter transições suaves a 60 FPS
- [x] 1.6 Atualizar formulários de login e cadastro (`login.tsx`, `register.tsx`) utilizando o novo Input com toggle de senha
- [x] 1.7 Executar e validar suite de testes e qualidade com `pnpm check`

## 2. Navegação e Safe Areas Dinâmicas

- [x] 2.1 Refatorar `src/app/(tabs)/_layout.tsx` para calcular altura e padding inferior da Tab Bar via `useSafeAreaInsets()`, evitando sobreposição com o indicador de gestos
- [x] 2.2 Atualizar cabeçalhos de tela em `index.tsx`, `purchases.tsx`, `cards.tsx` e `people.tsx` com `insets.top` dinâmico em vez de `pt-14` fixo
- [x] 2.3 Executar e validar suite de testes e qualidade com `pnpm check`

## 3. Resiliência de Layout e Prevenção de Estouro de Texto

- [x] 3.1 Refatorar `MonthlyMetricsCard.tsx` com `adjustsFontSizeToFit`, `numberOfLines={1}` e paddings otimizados para evitar quebra de valores monetários
- [x] 3.2 Refatorar `PersonSummaryCard.tsx` com `adjustsFontSizeToFit`, `numberOfLines={1}` e badges compactas
- [x] 3.3 Refatorar `PurchaseCard.tsx` com badges acessíveis de status de parcelas, preenchimento de ícones e contenção de texto
- [x] 3.4 Refatorar cartões em `cards.tsx` e `people.tsx` para garantir contenção de valores monetários e nomes extensos
- [x] 3.5 Executar e validar suite de testes e qualidade com `pnpm check`

## 4. Modais como Bottom Sheets Ergonômicos

- [ ] 4.1 Converter `NewPurchaseModal.tsx` em Bottom Sheet ergonômico ancorado na base (`rounded-t-[28px]`, `ModalGrabHandle`, `KeyboardAvoidingView`)
- [ ] 4.2 Converter `EditPurchaseModal.tsx` em Bottom Sheet ergonômico e corrigir o bug do atributo `numberOfLines={1}` dentro de `className`
- [ ] 4.3 Converter `CreditCardModal.tsx` em Bottom Sheet ergonômico com alça superior e adaptação a teclado
- [ ] 4.4 Converter `PersonModal.tsx` em Bottom Sheet ergonômico com alça superior e adaptação a teclado
- [ ] 4.5 Executar validação final e testes de ponta a ponta com `pnpm check`
