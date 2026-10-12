# Tasks

## 1. Design Tokens & CSS Runtime Configuration

- [x] 1.1 Atualizar `src/styles/global.css` substituindo o seletor `.dark` por `.dark:root` e refinando os tokens de tema escuro para a paleta Deep Zinc / Cupertino (`--background: 240 10% 4%`, `--card: 240 5% 10%`, `--border: 240 4% 18%`), verificando a correta compilação pelo NativeWind
- [x] 1.2 Criar `src/shared/constants/theme.ts` exportando as constantes `NAV_THEME` (`light` e `dark`) com mapeamento tipado de cores para o Expo Router

## 2. Theme Persistence & Root Navigation Synchronization

- [x] 2.1 Atualizar `src/shared/hooks/useTheme.ts` para persistir e carregar a preferência do usuário (`light`, `dark`, `system`) via `expo-secure-store`, mantendo o tema do sistema operacional como fallback inicial
- [x] 2.2 Atualizar `src/app/_layout.tsx` encapsulando a árvore do Expo Router no `ThemeProvider` do `expo-router` sincronizado com o `colorScheme` ativo e disparando a inicialização da preferência persistida

## 3. Testes Automatizados & Validação de Qualidade

- [x] 3.1 Atualizar a suíte de testes unitários em `src/shared/tests/useTheme.test.ts` mockando `expo-secure-store` em memória e validando o ciclo de vida de persistência e alternância de temas
- [x] 3.2 Executar o script unificado de validação `pnpm check` (prettier, eslint, tsc e jest) garantindo 100% de sucesso sem pendências
