# 🛠️ Guia do DevRoleToggle

## O que é?

O **DevRoleToggle** é um componente de debug provisório que permite:
- ✅ **Alternar entre diferentes roles** (user/organizer/admin)
- ✅ **Simular login/logout** com perfil mock
- ✅ **Testar a interface completa** sem modificar código ou conectar backend

## Localização

Você vai encontrar um **botão flutuante no canto inferior direito** da tela (acima do navbar mobile) com:
- Ícone `</>` (código)
- Ícone de login/logout (verde se logado, vermelho se deslogado)
- Ícone do role atual
- Nome do role

## Como Usar

### 1. Abrir o Painel

Clique no botão flutuante no canto inferior direito.

### 2. Toggle de Login/Logout

**No topo do painel**, você verá o toggle de login:

- **ON (Verde)** = Logado como "John Doe" com perfil mock completo
- **OFF (Vermelho)** = Deslogado, mostra tela de login no perfil

**Perfil Mock "John Doe"**:
- Nome completo, bio, localização
- Skills (10+ tecnologias)
- Portfolio com 4 projetos
- Rating 4.8 ⭐
- Verificado ✓
- Disponível 15h/semana

O perfil **se adapta ao role selecionado**:
- **User**: Desenvolvedor Full Stack
- **Organizer**: Organizador de Eventos  
- **Admin**: Administrador da Plataforma

### 3. Selecionar um Role

Escolha entre:

- **👤 Usuário** - Visualização normal (padrão)
  - Vê: Feed, Search, Profile, Messages, Create
  - Não vê: Gestão de eventos

- **📅 Organizador** - Gerenciar eventos
  - Tudo que user tem
  - Botão "Gerenciar Eventos" no perfil
  - Acesso à página de gestão de eventos
  - Pode criar/editar próprios eventos
  - Pode aprovar projetos dos próprios eventos

- **🛡️ Admin** - Acesso total
  - Tudo que organizer tem
  - Botão "Painel Admin" no perfil
  - Pode editar/deletar qualquer evento
  - Pode aprovar qualquer projeto
  - Vê botão de deletar eventos

### 4. Testar a Interface

Após configurar login e role:

1. O painel fecha automaticamente
2. Navegue para **Perfil** para ver as mudanças
3. Se role = organizer/admin, verá botão de gestão
4. Teste as funcionalidades específicas do role

## Onde Aparece?

O toggle aparece em **TODAS as páginas** para facilitar o teste.

## Desabilitar para Produção

### Opção 1: Via Prop

No `App.tsx`:

```typescript
<DevRoleToggle 
  currentRole={userRole} 
  onRoleChange={setUserRole}
  enabled={false} // ← Mude para false
/>
```

### Opção 2: Via Variável de Ambiente

Crie um arquivo `.env`:

```
REACT_APP_DEV_MODE=false
```

No `App.tsx`:

```typescript
<DevRoleToggle 
  currentRole={userRole} 
  onRoleChange={setUserRole}
  enabled={process.env.REACT_APP_DEV_MODE === 'true'}
/>
```

### Opção 3: Remover Completamente

Para produção final, simplesmente remova:

```typescript
// Remover import
import { DevRoleToggle } from './components/DevRoleToggle';

// Remover componente
<DevRoleToggle ... />
```

E delete o arquivo `/components/DevRoleToggle.tsx`.

## Features do Toggle

✅ **Visual Clean** - Design integrado com o sistema Glass Material
✅ **Discreto** - Botão pequeno que não atrapalha
✅ **Login/Logout Simulado** - Toggle on/off para simular autenticação
✅ **Perfil Mock Completo** - Dados realistas do "John Doe"
✅ **Perfil Adaptativo** - Muda conforme o role selecionado
✅ **Informativo** - Mostra status de login e role atual
✅ **Backdrop** - Clique fora para fechar
✅ **Responsivo** - Funciona em mobile e desktop
✅ **Acessível** - Tooltips e labels claros
✅ **Fácil de Remover** - Um toggle simples para desabilitar

## Fluxo de Teste Recomendado

### Teste 1: Login/Logout

1. DevToggle: Desative o toggle de login (OFF)
2. Navegue para **Perfil**
3. Veja tela pedindo para fazer login
4. DevToggle: Ative o toggle de login (ON)
5. Veja perfil completo do "John Doe" aparecer
6. Explore portfolio, skills, rating, etc.

### Teste 3: User → Organizer

1. DevToggle: Ative login (ON)
2. DevToggle: Selecione **Usuário**
3. Navegue para **Perfil**
4. Veja perfil de "John Doe - Desenvolvedor Full Stack"
5. Confirme que NÃO vê botão de gestão
6. DevToggle: Mude para **Organizador**
7. Veja perfil mudar para "Organizador de Eventos"
8. Veja botão "Gerenciar Eventos" aparecer
9. Clique no botão
10. Veja página de gestão (vazia se sem backend)

### Teste 4: Organizer → Admin

1. DevToggle: Selecione **Organizador**
2. Navegue para **Gestão de Eventos**
3. Observe que não há botões de deletar
4. DevToggle: Mude para **Admin**
5. Volte para **Gestão de Eventos**
6. Veja botões de deletar aparecerem
7. Botão no perfil muda para "Painel Admin"

### Teste 5: Admin → User

1. DevToggle: Ative login (ON)
2. DevToggle: Selecione **Admin**
3. Navegue para **Perfil**
4. Veja perfil de "John Doe (Admin) - Administrador"
5. Veja "Painel Admin"
6. DevToggle: Mude para **Usuário**
7. Perfil muda para desenvolvedor
8. Botão de gestão desaparece
9. Interface volta ao normal

### Teste 6: Perfis Diferentes por Role

1. DevToggle: Ative login (ON)
2. DevToggle: Mude entre roles e observe:
   - **User**: Portfolio focado em projetos técnicos
   - **Organizer**: Portfolio com eventos organizados
   - **Admin**: Portfolio com gestão de plataforma
3. Skills, bio e projetos mudam automaticamente!

## Estilo Visual

O toggle usa o design system da plataforma:

- **Glass Material** - Efeito de vidro fosco
- **Cores por Role**:
  - User: Azul
  - Organizer: Verde (teal/emerald)
  - Admin: Roxo
- **Badge "Ativo"** - Mostra qual role está selecionado
- **Animações Suaves** - Hover e transições

## Atalhos

- **Clique no botão** - Abre/fecha painel
- **Clique no backdrop** - Fecha painel
- **Seleciona role** - Fecha automaticamente

## Dados do Perfil Mock

### User (Desenvolvedor)
- **Nome**: John Doe
- **Role**: Desenvolvedor Full Stack & Designer
- **Skills**: React, TypeScript, Node.js, Python, Figma, UI/UX, PostgreSQL, Docker, AWS, ML
- **Portfolio**: 4 projetos (E-commerce IA, App Saúde Mental, Dashboard Analytics, Sistema Agendamento)

### Organizer
- **Nome**: John Doe
- **Role**: Organizador de Eventos & Tech Lead
- **Skills**: Gestão de Eventos, Liderança, React, Node.js, Mentoria, Scrum, Design Thinking, Pitch
- **Portfolio**: Hackathon Mackenzie 2024, Startup Weekend, Programa Mentoria Tech

### Admin
- **Nome**: John Doe (Admin)
- **Role**: Administrador da Plataforma
- **Skills**: Gestão de Plataforma, Moderação, Analytics, DevOps, Security, Community Management
- **Portfolio**: Sistema Moderação, Dashboard Analytics, Programa de Qualidade

**Todos os perfis têm**:
- Rating: 4.8 ⭐
- Verificado: ✓
- Localização: São Paulo, SP
- Disponibilidade: 15h/semana

## Troubleshooting

### "Não vejo o botão flutuante"

✅ Verifique se `enabled={true}` no App.tsx (linha ~118)

### "Não vejo o perfil mesmo logado"

✅ Certifique-se que o toggle de login está ON (verde)
✅ Navegue para **Perfil**
✅ Dados aparecem automaticamente

### "Mudei o role mas perfil não mudou"

✅ O perfil muda automaticamente quando você troca o role
✅ Bio, skills e portfolio se adaptam ao role
✅ Navegue para outra página e volte se necessário

### "Botão está em cima do navbar"

✅ Normal! Está em `bottom: 80px` (20px acima do navbar de 60px)

### "Quero mudar a posição"

No arquivo `/components/DevRoleToggle.tsx`, linha ~48:

```typescript
className="fixed bottom-20 right-4 z-50 ..."
//              ↑ Mude aqui
```

Opções:
- `bottom-4` - Mais embaixo
- `left-4` - Canto esquerdo
- `top-4` - Canto superior

## Exemplo de Uso em Produção

```typescript
// App.tsx
const isDevelopment = process.env.NODE_ENV === 'development';

<DevRoleToggle 
  currentRole={userRole} 
  onRoleChange={setUserRole}
  enabled={isDevelopment}
/>
```

Assim o toggle só aparece em modo de desenvolvimento!

## Integração com Backend (Futuro)

Quando conectar com backend real:

```typescript
// App.tsx
React.useEffect(() => {
  const loadUser = async () => {
    const response = await fetch('/api/auth/me');
    const { user } = await response.json();
    setUserRole(user.role); // ← Backend define o role
  };
  loadUser();
}, []);

// DevToggle continua funcionando para testes mesmo com backend
<DevRoleToggle 
  currentRole={userRole} 
  onRoleChange={setUserRole} // ← Sobrescreve role do backend (só em dev)
  enabled={isDevelopment}
/>
```

## Conclusão

O **DevRoleToggle** é uma ferramenta provisória extremamente útil para:

- ✅ Testar diferentes visualizações rapidamente
- ✅ Demonstrar funcionalidades para o cliente
- ✅ Debug de permissões
- ✅ Validar UI/UX por role

**Lembre-se**: Desabilite para produção! 🔒

---

**Desenvolvido para facilitar o desenvolvimento e testes da plataforma InnovaConnect**
