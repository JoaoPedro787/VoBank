# Proposal: Fix Dark Mode Theming

## Why

Atualmente no aplicativo mobile, o Dark Mode aplica-se apenas parcialmente (em componentes isolados como `DateTimePicker`, `NavigationTab`, `Toaster` e `Switch`), enquanto as telas, fundos e botões continuam sempre brancos.
Isso ocorre porque o NativeWind v4 e o motor de estilos do React Native (`react-native-css-interop`) não reconhecem o seletor web `.dark { ... }` para variáveis CSS declaradas no `global.css`, exigindo o seletor `.dark:root { ... }`. Além disso, o React Navigation no `_layout.tsx` raiz não possui `ThemeProvider` integrado com as cores do tema, causando fundos nativos brancos sob as telas, e a alternância de tema no botão do dashboard não persiste a preferência do usuário entre reinicializações do app.

## What Changes

- **Correção de Seletor CSS**: Atualizar [src/styles/global.css](file:///home/joaofedora/Projects/finances/src/styles/global.css) alterando o seletor `.dark` para `.dark:root` para que o NativeWind v4 e `react-native-css-interop` resolvam as variáveis CSS (`--background`, `--card`, `--foreground`, etc.) nos componentes React Native.
- **Paleta Deep Zinc / Cupertino no Dark Mode**: Refinar os tokens de Dark Mode para seguir o estilo Shadcn UI / Cupertino escuro (Fundo `#09090b` / Cards `#18181b` / Bordas `#27272a`), combinando com a TabBar e a Splash Screen.
- **Integração com React Navigation Theme**: Configurar `ThemeProvider` do `@react-navigation/native` no [src/app/_layout.tsx](file:///home/joaofedora/Projects/finances/src/app/_layout.tsx) com `DarkTheme` e `DefaultTheme` mapeados para as variáveis do design system, evitando flashes e telas de fundo branco no container de navegação.
- **Persistência de Preferência de Tema**: Atualizar [src/shared/hooks/useTheme.ts](file:///home/joaofedora/Projects/finances/src/shared/hooks/useTheme.ts) para persistir e recuperar a escolha do usuário (`light`, `dark` ou `system`) utilizando `expo-secure-store`, mantendo o tema do sistema operacional como padrão se nenhuma preferência manual foi salva.
- **Testes Unitários**: Criar e atualizar testes automatizados para `useTheme` e persistência sem dependência de ambiente de banco de dados ou `.env`.

## Capabilities

### New Capabilities
- `dark-mode-theming`: Suporte abrangente e reativo a Modo Escuro e Claro em toda a interface do app, com persistência local de preferência do usuário via `expo-secure-store` e sincronização automática com o sistema operacional.

### Modified Capabilities
<!-- Nenhuma especificação anterior teve seus requisitos alterados. -->

## Impact

- [src/styles/global.css](file:///home/joaofedora/Projects/finances/src/styles/global.css): Correção do seletor `.dark:root` e tokens de cores escuras.
- [src/app/_layout.tsx](file:///home/joaofedora/Projects/finances/src/app/_layout.tsx): Inclusão de `ThemeProvider` do React Navigation e inicialização de tema.
- [src/shared/hooks/useTheme.ts](file:///home/joaofedora/Projects/finances/src/shared/hooks/useTheme.ts): Suporte a persistência com `expo-secure-store`.
- [src/shared/tests/useTheme.test.ts](file:///home/joaofedora/Projects/finances/src/shared/tests/useTheme.test.ts): Cobertura de testes unitários para o hook de tema e persistência.
