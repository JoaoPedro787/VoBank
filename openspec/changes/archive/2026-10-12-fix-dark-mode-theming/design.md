# Design: Fix Dark Mode Theming

## Context

O projeto utiliza Expo Router, NativeWind v4 (`react-native-css-interop`) e componentes no padrão Shadcn UI (React Native Reusables).
Atualmente, as variáveis CSS de cor estão definidas no [src/styles/global.css](file:///home/joaofedora/Projects/finances/src/styles/global.css) sob o seletor web `.dark { ... }`. No runtime React Native, o motor do `react-native-css-interop` requer o seletor `.dark:root { ... }` para vincular dinamicamente os valores de variáveis CSS ao nó raiz móvel quando o tema escuro estiver ativado.
Além disso, a pilha de navegação nativa no [src/app/_layout.tsx](file:///home/joaofedora/Projects/finances/src/app/_layout.tsx) não está encapsulada por um `ThemeProvider` do React Navigation, causando inconsistência no canvas sob os componentes.

## Goals / Non-Goals

**Goals:**
- Garantir que todos os componentes (`View`, `Text`, `Button`, `Input`, `Card`, etc.) recebam e exibam as cores corretas no modo escuro sem fundos brancos residuais.
- Integrar a paleta Deep Zinc / Cupertino (fundo `#09090b`, cards `#18181b`, bordas `#27272a`) de forma coesa com a TabBar e Toaster.
- Fornecer persistência confiável da preferência de tema via `expo-secure-store`.
- Manter total isolamento nos testes unitários sem dependências de `.env` ou conexões reais.

**Non-Goals:**
- Criar novos temas coloridos customizáveis (ex: sépia, azul, etc.).
- Modificar o layout estrutural das telas ou fluxos de negócio.

## Decisions

### 1. Seletor `.dark:root` no `global.css`
- **Decisão:** Substituir `.dark` por `.dark:root` no `@layer base` de [src/styles/global.css](file:///home/joaofedora/Projects/finances/src/styles/global.css).
- **Racional:** O compilador do NativeWind v4 e o `react-native-css-interop` requerem a declaração `.dark:root` para injetar os estilos globais no contexto nativo. Sem isso, classes como `bg-background` e `bg-card` permanecem avaliando apenas os valores de `:root` (light).
- **Alternativa Considerada:** Passar `vars()` inline em cada tela com React Native Context. Rejeitado por introduzir boilerplate desnecessário e degradar a performance de renderização.

### 2. Paleta Deep Zinc / Cupertino para Modo Escuro
- **Decisão:** Mapear `--background: 240 10% 4%` (`#09090b`), `--card: 240 5% 10%` (`#18181b`), `--border: 240 4% 18%` (`#27272a`) no `global.css`.
- **Racional:** Harmoniza exatamente com os tons já configurados no `TabBarStyle` (`#09090b`), `android.adaptiveIcon.backgroundColor` (`#09090b`) e SplashScreen (`#09090b`), gerando um visual premium e consistente.
- **Alternativa Considerada:** True Black (`#000000`). Rejeitado durante alinhamento de design para manter profundidade visual em cards e listas sem contraste excessivo.

### 3. Integração com React Navigation `ThemeProvider`
- **Decisão:** Criar um objeto de tema de navegação `NAV_THEME` em [src/shared/constants/theme.ts](file:///home/joaofedora/Projects/finances/src/shared/constants/theme.ts) e encapsular o `Stack` em [src/app/_layout.tsx](file:///home/joaofedora/Projects/finances/src/app/_layout.tsx) com `<ThemeProvider value={isDark ? DarkNavTheme : LightNavTheme}>`.
- **Racional:** Evita telas brancas durante transições de telas ou carregamentos modais e sincroniza o cabeçalho/fundo nativo com o NativeWind.
- **Alternativa Considerada:** Definir estilos de fundo manualmente em cada `Stack.Screen`. Rejeitado por ser frágil e não cobrir modais nativos adequadamente.

### 4. Persistência de Tema com `expo-secure-store`
- **Decisão:** Persistir a preferência (`'light' | 'dark' | 'system'`) sob a chave `vobank_theme_preference` em [src/shared/hooks/useTheme.ts](file:///home/joaofedora/Projects/finances/src/shared/hooks/useTheme.ts).
- **Racional:** `expo-secure-store` já está instalado e configurado no projeto para armazenamento seguro de tokens, permitindo leitura rápida e confiável no início do app sem novas dependências.
- **Alternativa Considerada:** `AsyncStorage`. Rejeitado para evitar adicionar mais uma biblioteca ao bundle quando `expo-secure-store` já atende com excelência.

## Risks / Trade-offs

- **[Risco]** Fita/flash de cor ao carregar o app antes da leitura assíncrona do `SecureStore`.
  - **Mitigação:** Utilizar o tema do sistema (`Appearance.getColorScheme()`) como fallback imediato síncrono enquanto o `SecureStore` carrega, garantindo que usuários com sistema escuro não sofram com flashes claros.
- **[Risco]** Testes unitários falharem por falta de mock do `expo-secure-store`.
  - **Mitigação:** Configurar mock in-memory limpo no [src/shared/tests/setup.ts](file:///home/joaofedora/Projects/finances/src/shared/tests/setup.ts) para `expo-secure-store`.

## Migration Plan

1. Atualizar [src/styles/global.css](file:///home/joaofedora/Projects/finances/src/styles/global.css).
2. Criar `NAV_THEME` e integrar `ThemeProvider` no [src/app/_layout.tsx](file:///home/joaofedora/Projects/finances/src/app/_layout.tsx).
3. Aprimorar [src/shared/hooks/useTheme.ts](file:///home/joaofedora/Projects/finances/src/shared/hooks/useTheme.ts) com persistência.
4. Atualizar testes unitários e validar suite com `pnpm check`.
