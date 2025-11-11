# 🧪 Guia de Teste Local

Este guia explica como testar a aplicação localmente com autenticação mockada.

## 📋 Pré-requisitos

- Python 3.12+ instalado
- Node.js 18+ instalado
- Dependências Python instaladas (se necessário)

## 🚀 Passo a Passo

### 1. Iniciar os Serviços Backend

O script `start_services.py` já configura automaticamente:
- ✅ `DEV_AUTH_ENABLED=true` para todos os serviços
- ✅ URLs dos serviços para comunicação interna
- ✅ CORS habilitado para `localhost:3000`, `localhost:5173`, etc.

```bash
# Na raiz do projeto
python start_services.py
```

Você verá algo como:
```
Starting backend microservices (Ctrl+C to stop)...

[BOOT] auth-service -> http://localhost:8001
[BOOT] events-service -> http://localhost:8002
[BOOT] projects-service -> http://localhost:8003
[BOOT] participants-service -> http://localhost:8004
[BOOT] notifications-service -> http://localhost:8005
[BOOT] gateway -> http://localhost:8080

All services launched. Press Ctrl+C to terminate.
```

### 2. Iniciar o Frontend

Em **outro terminal**, navegue até a pasta `frontend` e inicie o servidor de desenvolvimento:

```bash
cd frontend
npm install  # Se ainda não instalou as dependências
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (ou outra porta se 5173 estiver ocupada).

### 3. Configurar Usuário Mock no Frontend

1. Abra o frontend no navegador: `http://localhost:5173`
2. Use o **DevRoleToggle** (componente flutuante no canto da tela) para:
   - ✅ **Ativar Login** (`isLoggedIn = true`)
   - ✅ **Definir Role** como `organizer` ou `admin`

### 4. Testar Rotas Protegidas

Agora você pode acessar rotas que requerem autenticação:

- **Gestão de Eventos**: Navegue até "Gestão de Eventos" no perfil
- **Criar Evento**: Acesse a página de criação de eventos
- **Projetos**: Acesse projetos vinculados a eventos

## 🔍 Como Funciona o Mock de Autenticação

### Backend (Automático)

Quando `DEV_AUTH_ENABLED=true` está configurado (já está no `start_services.py`):

1. Se uma requisição chegar **sem** `Authorization` header
2. O backend cria automaticamente um usuário mockado:
   ```python
   User(
       id="dev-user",
       role="admin",  # ou o valor de DEV_USER_ROLE
       email="dev@example.com",
       name="Dev User"
   )
   ```

### Frontend (Manual)

Você precisa usar o `DevRoleToggle` para:
- Simular que o usuário está logado (`isLoggedIn = true`)
- Definir a role do usuário (`userRole = 'organizer'` ou `'admin'`)

**Importante**: O frontend **não** envia token de autenticação quando está em modo mock. O backend detecta isso e usa o usuário mockado automaticamente.

## 🧪 Testando Rotas Específicas

### Testar `/api/events/management`

```bash
# Sem token (deve funcionar com DEV_AUTH_ENABLED=true)
curl http://localhost:8080/api/events/management

# Ou via navegador
# Abra: http://localhost:8080/api/events/management
```

### Testar outras rotas protegidas

```bash
# Listar eventos disponíveis
curl http://localhost:8080/api/events/available

# Criar evento (POST)
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Event","description":"Test","startDate":"2024-01-01","endDate":"2024-01-02","location":"SP","categories":["tech"]}'
```

## 🔧 Configurações Avançadas

### Mudar Role do Usuário Mock

Se quiser mudar a role do usuário mockado, você pode:

1. **Via variável de ambiente** (antes de iniciar os serviços):
   ```bash
   export DEV_USER_ROLE=admin  # ou 'organizer', 'user'
   python start_services.py
   ```

2. **Ou editar diretamente no `start_services.py`**:
   ```python
   env.setdefault("DEV_USER_ROLE", "admin")  # Linha ~58
   ```

### Desabilitar Mock de Autenticação

Se quiser testar com autenticação real:

```bash
export DEV_AUTH_ENABLED=false
python start_services.py
```

Agora você precisará de um token JWT válido para acessar rotas protegidas.

## 🐛 Troubleshooting

### Erro: "Missing Authorization header"

**Causa**: `DEV_AUTH_ENABLED` não está configurado ou está como `false`.

**Solução**: 
- Verifique se o `start_services.py` está configurando `DEV_AUTH_ENABLED=true` (já está por padrão)
- Ou defina manualmente: `export DEV_AUTH_ENABLED=true`

### Erro CORS no Frontend

**Causa**: O frontend está rodando em uma porta diferente da configurada.

**Solução**: 
- Verifique em qual porta o Vite está rodando (geralmente `5173`)
- O `start_services.py` já configura CORS para `localhost:5173` automaticamente
- Se estiver em outra porta, adicione no `start_services.py`:

```python
env.setdefault(
    "ALLOW_ORIGINS",
    json.dumps([
        "http://localhost:5173",  # Vite padrão
        "http://localhost:3000",  # Outras portas comuns
        # ... adicione sua porta aqui
    ]),
)
```

### Serviços não iniciam

**Causa**: Porta já em uso ou dependências faltando.

**Solução**:
- Verifique se as portas 8001-8005 e 8080 estão livres
- Instale dependências Python se necessário:
  ```bash
  pip install fastapi uvicorn pydantic pydantic-settings httpx
  ```

## 📝 Notas Importantes

1. **Produção**: Nunca deixe `DEV_AUTH_ENABLED=true` em produção! Isso permite acesso sem autenticação.

2. **Token Real**: Para testar com token real, você precisará:
   - Fazer login via `/api/auth/login` para obter um token
   - Enviar o token no header: `Authorization: Bearer <token>`

3. **Frontend**: O `DevRoleToggle` é apenas para desenvolvimento. Em produção, remova ou desabilite (`enabled={false}`).

## ✅ Checklist de Teste

- [ ] Todos os serviços backend iniciaram sem erros
- [ ] Frontend está rodando e acessível
- [ ] `DevRoleToggle` está visível e funcional
- [ ] Login mockado está ativado (`isLoggedIn = true`)
- [ ] Role está definida como `organizer` ou `admin`
- [ ] Página "Gestão de Eventos" carrega sem erros
- [ ] Requisições para `/api/events/management` funcionam
- [ ] CORS não está bloqueando requisições

## 🎯 Próximos Passos

Após testar localmente e confirmar que tudo funciona:

1. Fazer commit das mudanças:
   ```bash
   git add main.bicep backend/gateway/app/__init__.py
   git commit -m "feat: enable dev auth bypass and fix CORS"
   git push
   ```

2. Aguardar deploy automático ou executar:
   ```bash
   ./deploy-bicep.sh
   ```

3. Testar em produção com o mesmo fluxo (usando `DevRoleToggle` no frontend)

