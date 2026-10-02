# Auth Specification

## Purpose

Gerenciar o ciclo de vida de autenticação, registro seguro de usuários, emissão de tokens JWT e persistência de sessão no dispositivo móvel.

## Requirements

### Requirement: Registro de Novo Usuário
O sistema SHALL permitir que um novo usuário crie uma conta fornecendo email válido e senha segura (mínimo de 6 caracteres), gerando hash criptográfico antes de persistir no banco.

#### Scenario: Registro com dados válidos
- **WHEN** o usuário submete um email não cadastrado e senha com 6 ou mais caracteres
- **THEN** o sistema cria o registro do usuário com a senha criptografada e retorna status de sucesso

#### Scenario: Registro com email duplicado
- **WHEN** o usuário tenta se registrar com um email já existente na base
- **THEN** o sistema recusa o cadastro e retorna erro 409 informando que o email já está em uso

### Requirement: Login e Emissão de Token JWT
O sistema SHALL autenticar credenciais de email e senha, retornando um token de acesso JWT válido quando as credenciais estiverem corretas.

#### Scenario: Autenticação bem-sucedida
- **WHEN** o usuário envia email e senha correspondentes ao cadastro
- **THEN** o sistema valida o hash da senha e emite um token JWT contendo o identificador do usuário

#### Scenario: Credenciais inválidas
- **WHEN** o usuário envia senha incorreta ou email inexistente
- **THEN** o sistema rejeita a requisição com código 401 e mensagem de credenciais inválidas

### Requirement: Persistência Segura e Logout
O aplicativo móvel SHALL armazenar o token JWT de forma criptografada usando armazenamento seguro do dispositivo e permitir encerramento de sessão (*logout*).

#### Scenario: Logout do usuário
- **WHEN** o usuário aciona a ação de deslogar
- **THEN** o aplicativo remove o token do armazenamento seguro e redireciona para a tela de autenticação
