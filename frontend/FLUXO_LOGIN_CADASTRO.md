# 🔐 Fluxo de Login e Cadastro - Atualizado

## Mudanças Implementadas

### ✅ Problemas Corrigidos

1. **Login vs Cadastro Separados**
   - Criada `LoginPage.tsx` dedicada
   - `OnboardingPage.tsx` agora é só para cadastro
   - Botão "Fazer login" redireciona corretamente

2. **Validação de Campos**
   - Nome, email e senha são obrigatórios
   - Email validado com regex
   - Senha mínimo 6 caracteres
   - Mensagens de erro em vermelho

3. **Admin Removido do Onboarding**
   - Opção "Administrador" removida da seleção
   - Admin é role atribuída pelo backend
   - Apenas: Idealizador, Colaborador, Organizador

4. **Skills Apenas para Colaborador**
   - Tela de skills aparece só se escolher "Colaborador"
   - Idealizador/Organizador: cadastro completa após escolha de perfil
   - Fluxo específico por tipo de usuário

5. **Design Glass Material Consistente**
   - Removido gradient colorido da tela de skills
   - Aplicado `page-background` padrão
   - Botões de skill com classes `glass-subtle` e `glass`
   - Visual unificado com resto da plataforma

6. **Mock Profile Não Ativa Automaticamente**
   - Onboarding não ativa mais mock do John Doe
   - Mock só ativa via DevRoleToggle
   - Cadastro real fica limpo

---

## Fluxos de Uso

### 📝 Fluxo de Cadastro

```
1. Usuário não logado clica "Criar Conta" no perfil
   ↓
2. OnboardingPage - Tela de Boas-vindas
   ↓
3. OnboardingPage - Criar Conta (nome, email, senha)
   - ✅ Validação de campos
   - ✅ Botão "Fazer login" leva para LoginPage
   ↓
4. OnboardingPage - Selecionar Perfil
   - Idealizador (role: user)
   - Colaborador (role: user)
   - Organizador (role: organizer)
   - ❌ Admin não aparece
   ↓
5a. Se Colaborador: Skills & Interesses
    - Selecionar skills
    - Mínimo 1 skill obrigatório
    - Design Glass Material
    ↓
    Concluir → Feed (logado como user)

5b. Se Idealizador/Organizador: 
    Concluir → Feed (logado com role respectivo)
```

### 🔑 Fluxo de Login

```
1. Usuário clica "Fazer Login" no perfil ou no onboarding
   ↓
2. LoginPage
   - Email e senha
   - ✅ Validação de campos
   - Login com Google/GitHub (OAuth)
   - Botão "Criar conta" → OnboardingPage
   - Botão "Voltar" → Feed
   ↓
3. Feed (logado com role do backend)
```

### 🛠️ Dev Mode (Teste)

```
1. DevRoleToggle (canto inferior direito)
   ↓
2. Ativar login toggle (ON)
   ↓
3. Selecionar role (User/Organizer/Admin)
   ↓
4. Ir para Perfil → Ver mock do John Doe
```

---

## Arquivos Criados/Modificados

### Novos Arquivos

1. **`/pages/LoginPage.tsx`**
   - Página dedicada de login
   - Validação de campos
   - OAuth com Google/GitHub
   - Link para criar conta

### Arquivos Modificados

1. **`/pages/OnboardingPage.tsx`**
   - Removida opção "Admin"
   - Adicionada validação de campos (nome, email, senha)
   - Skills só para colaborador
   - Design Glass Material na tela de skills
   - Callback `onComplete` agora retorna role
   - Adicionado prop `onLogin`

2. **`/App.tsx`**
   - Adicionado estado `login` no type Page
   - LoginPage integrada
   - onLogin do perfil vai para LoginPage (não onboarding)
   - Onboarding só para cadastro

3. **`/QUICK_DEV_GUIDE.md`**
   - Atualizado com informações sobre login/cadastro

4. **`/FLUXO_LOGIN_CADASTRO.md`** (este arquivo)
   - Documentação completa do fluxo

---

## Roles Disponíveis

### Durante Cadastro (Onboarding)

| Perfil Selecionado | Role Atribuída | Próximo Passo |
|-------------------|----------------|---------------|
| Idealizador       | `user`         | Concluir cadastro |
| Colaborador       | `user`         | Selecionar skills |
| Organizador       | `organizer`    | Concluir cadastro |

### Durante Login (Backend)

O backend retorna o role após autenticação:

```typescript
// POST /api/auth/login
// Response:
{
  user: { id, name, email, ... },
  token: "...",
  role: "user" | "organizer" | "admin"
}
```

### Admin

- ❌ **NÃO** selecionável no cadastro
- ✅ **Atribuído pelo backend** em tabela de permissões
- ✅ Pode ser testado via DevRoleToggle

---

## Integração com Backend

### Cadastro

```typescript
// POST /api/auth/register
// Body:
{
  name: string;
  email: string;
  password: string;
  profileType: 'idealizador' | 'colaborador' | 'organizador';
  skills?: string[]; // Apenas se profileType === 'colaborador'
}

// Response:
{
  user: { id, name, email, ... },
  token: string,
  role: 'user' | 'organizer'
}
```

### Login

```typescript
// POST /api/auth/login
// Body:
{
  email: string;
  password: string;
}

// Response:
{
  user: { id, name, email, ... },
  token: string,
  role: 'user' | 'organizer' | 'admin'
}
```

### OAuth (Google/GitHub)

```typescript
// GET /api/auth/google (redireciona para OAuth)
// GET /api/auth/github (redireciona para OAuth)

// Callback:
// GET /api/auth/callback?provider=google&code=...
// Response: (mesmo formato do login)
```

---

## Validações Implementadas

### Tela de Criar Conta

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| Nome  | Obrigatório | "Nome é obrigatório" |
| Email | Obrigatório + formato válido | "Email inválido" |
| Senha | Obrigatório + mínimo 6 chars | "Senha deve ter no mínimo 6 caracteres" |

### Tela de Selecionar Perfil

- Pelo menos 1 perfil deve ser selecionado
- Botão "Continuar" desabilitado sem seleção

### Tela de Skills (Colaborador)

- Pelo menos 1 skill deve ser selecionada
- Botão "Concluir" desabilitado sem seleção

### Tela de Login

- Email e senha obrigatórios
- Botão "Entrar" desabilitado sem ambos

---

## Exemplo de Uso Completo

### Cenário 1: Cadastro como Colaborador

```
1. Usuário acessa a plataforma pela primeira vez
2. Vai para Perfil → Vê botões de login/cadastro
3. Clica "Criar Conta"
4. Onboarding:
   - Boas-vindas → "Começar"
   - Preenche: João Silva, joao@email.com, senha123
   - Seleciona: Colaborador
   - Seleciona skills: React, TypeScript, Node.js
   - Concluir
5. Logado como user no Feed
6. Perfil agora mostra dados de João (quando backend integrado)
```

### Cenário 2: Cadastro como Organizador

```
1. Usuário acessa a plataforma pela primeira vez
2. Vai para Perfil → Clica "Criar Conta"
3. Onboarding:
   - Boas-vindas → "Começar"
   - Preenche: Maria Santos, maria@uni.com, senha456
   - Seleciona: Organizador
   - Concluir (sem tela de skills)
4. Logado como organizer no Feed
5. Vai para Perfil → Vê botão "Gerenciar Eventos"
```

### Cenário 3: Login Existente

```
1. Usuário já cadastrado
2. Vai para Perfil → Clica "Fazer Login"
3. LoginPage:
   - Preenche: joao@email.com, senha123
   - Entrar
4. Backend retorna role (user/organizer/admin)
5. Logado no Feed com role do backend
```

### Cenário 4: Teste com Dev Mode

```
1. Qualquer momento → Abre DevRoleToggle
2. Ativa login toggle (ON)
3. Seleciona Admin
4. Vai para Perfil → Vê John Doe (Admin)
5. Vê botão "Painel Admin"
6. Testa funcionalidades de admin
```

---

## Próximos Passos (Backend)

### Para Integrar

1. **Endpoint de Registro**
   ```
   POST /api/auth/register
   ```

2. **Endpoint de Login**
   ```
   POST /api/auth/login
   ```

3. **Endpoint de OAuth**
   ```
   GET /api/auth/google
   GET /api/auth/github
   GET /api/auth/callback
   ```

4. **Endpoint de Verificação**
   ```
   GET /api/auth/me (retorna user logado)
   ```

5. **Atribuição de Admin**
   - Tabela de permissões no banco
   - Script para promover usuários a admin
   - Apenas backend pode definir admin

---

## Resumo Visual

```
ANTES (❌ Problemas):
- Login e cadastro misturados
- Admin selecionável no cadastro
- Skills para todos os perfis
- Sem validação de campos
- Design inconsistente
- Mock ativava automaticamente

DEPOIS (✅ Corrigido):
- Login e cadastro separados
- Admin só via backend
- Skills apenas para colaborador
- Validação completa
- Design Glass Material
- Mock só via DevRoleToggle
```

---

**Desenvolvido para InnovaConnect - Plataforma de Inovação Colaborativa**
