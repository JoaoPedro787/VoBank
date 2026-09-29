# Ideia

Minha ideia é criar um aplicativo mobile que ajude a controlar finanças.

# Stacks

- React Native Expo
- Expo Router (api)
- Drizzle com PostgreSQL

# Visual

- Visual padrão com shacn UI
- Opção de modo claro e escuro (identificar a partir do sistema também)
- Animações simples, como fade, scale up
- Transições suaves
- Utilizar a skill /frontend-design e as skills de ui-ux para boas práticas

# Design

- Feature based folder structure (Tanto front como para a API) (exemplo: {feat}/services... | {feat}/components). Pórem se for algo global, coloque na pasta /shared
- Authenticação com JWT, Criptografar senhas (utilize do expo)
- exemplo de folder structure genérico:

```txt
src/
├── app/                                 # Expo Router (Rotas e Navegação)
│   ├── _layout.tsx                      # 1. Root Layout: Providers globais, Stack base, splash screen
│   │
│   ├── (auth)/                          # 2. Route Group: Layout de autenticação (Stack sem abas)
│   │   ├── _layout.tsx                  # Header customizado e configurações de transição de login
│   │   ├── login.tsx                    # Rota: /login
│   │   └── register.tsx                 # Rota: /register
│   │
│   ├── (tabs)/                          # 3. Route Group: Layout principal com barra de abas inferior
│   │   ├── _layout.tsx                  # Configuração do componente <Tabs />
│   │   ├── index.tsx                    # Rota: / (Aba Home)
│   │   └── profile.tsx                  # Rota: /profile (Aba Perfil)
│   │
│   ├── (modals)/                        # 4. Route Group: Telas sobrepostas em formato de modal
│   │   ├── _layout.tsx                  # Configuração com presentation: "modal"
│   │   └── filter.tsx                   # Rota: /filter
│   │
│   ├── checkout/                        # 5. Rota Isolada com layout/contexto próprio
│   │   ├── _layout.tsx                  # Provider local (ex: CartContext, PaymentProvider)
│   │   ├── index.tsx                    # Rota: /checkout
│   │   └── success.tsx                  # Rota: /checkout/success
│   │
│   └── api/                             # Expo API Routes (Backend / Serverless endpoints)
│       ├── users+api.ts                 # Endpoint: /api/users (POST, GET, etc.)
│       └── [feat]+api.ts                # Endpoint: /api/[feat]
│
├── [feat]/                              # Módulos baseados em features (ex: auth, checkout, catalog)
│   ├── components/                      # Componentes de UI exclusivos desta feature
│   │   └── CustomButton.tsx
│   ├── hooks/                           # Custom hooks da feature
│   │   └── use[Feat].ts
│   ├── services/                        # Chamadas de API client-side, SDKs ou integrações
│   │   └── [feat]Service.ts
│   ├── stores/                          # Estado local/global da feature (Zustand, Redux, Context)
│   │   └── [feat]Store.ts
│   ├── types/                           # Tipagens TypeScript da feature
│   │   └── [feat].types.ts
│   ├── utils/                           # Funções puras/utilitárias da feature
│   │   └── format[Feat].ts
│   ├── helpers/                         # Funções de apoio lógico/transformações de dados
│   │   └── [feat]Helper.ts
│   ├── tests/                           # Testes unitários/integração da feature (componentes, hooks, stores)
│   │   └── use[Feat].test.ts
│   └── index.ts                         # Barrel file exportando apenas a interface pública
│
├── shared/                              # Recursos reaproveitáveis por múltiplas features
│   ├── components/                      # UI primitives globais (Button, Input, Modal, Typography)
│   ├── constants/                       # Constantes de design system, chaves de config, cores
│   ├── hooks/                           # Hooks utilitários globais (useDebounce, useOnlineStatus)
│   ├── types/                           # Tipagens globais do app (navegação, respostas de API genéricas)
│   ├── utils/                           # Utilitários puros reutilizáveis (formatação de moeda, datas)
│   ├── helpers/                         # Funções de suporte compartilhadas
│   ├── lib/                             # Instâncias e configurações de bibliotecas externas (Axios, Supabase)
│   └── tests/                           # Testes de funções e helpers globais
│       └── formatters.test.ts
│
└── server/                              # Lógica isolada para execução no backend / API Routes
    ├── shared/                          # Utilitários globais do servidor (auth middleware, logger, db client)
    │   ├── db.ts                        # Conexão com banco de dados / ORM (ex: Prisma, Drizzle)
    │   ├── middleware.ts                # Tratamento de autenticação / validação de sessão
    │   └── utils/
    └── [feat]/                          # Lógica de servidor isolada por feature (ex: auth, payments)
        ├── services/                    # Regras de negócio e processamento de dados do servidor
        │   └── [feat]ServerService.ts
        ├── repositories/                # Camada de acesso a banco de dados / queries
        │   └── [feat]Repository.ts
        ├── schemas/                     # Validação de schemas/payloads (Zod, Yup, etc.)
        │   └── [feat].schema.ts
        ├── types/                       # Tipagens de payload e resposta do backend
        │   └── [feat]Server.types.ts
        └── tests/                       # Testes de regras de negócio, services e schemas do backend
            └── [feat]ServerService.test.ts
```

# Funcionalidades

- Login
- Registro
- Recuperar senha
- Deslogar
- Dentro de cada usuário, há uma opção de criar "pessoas" (nomes), cada pessoa pode ter uma cor para identifica-las.
- É possível atribuir uma compra a voce mesmo ou a essa pessoa criada
- Dentro da compra, deve ter se foi a vista, credito, débito, quantas parcelas, qual cartão.
- O app deve informar quando acaba, vence e se a parcela daquele mês foi paga (se for cartão).
- Deve ter um mini dashboard separado por pessoas, mostrando quantas faltam para pagar, quais já foram, total daquele mes, total que foi comprado, vencidas.
- Mandar notificação para o celular quando estiver perto de vencer, alertar 1 dia antes e no dia.
