# 🚀 Quick Start - Gestão de Eventos

## Para Testar AGORA (Frontend)

### 1. Testar como Organizador

No arquivo `/App.tsx`, linha 44:

```typescript
const [userRole, setUserRole] = React.useState<UserRole>('organizer');
```

Depois:
1. Navegue para **Perfil** (último ícone do navbar)
2. Veja botão **"Gerenciar Eventos"** ao lado de "Editar"
3. Clique nele
4. Veja a página de gestão (vazia pois backend não está conectado)

### 2. Testar como Admin

No arquivo `/App.tsx`, linha 44:

```typescript
const [userRole, setUserRole] = React.useState<UserRole>('admin');
```

Depois:
1. Navegue para **Perfil**
2. Veja botão **"Painel Admin"**
3. Clique nele
4. Na página de gestão, botões de deletar aparecem nos eventos

### 3. Testar como User Normal

No arquivo `/App.tsx`, linha 44:

```typescript
const [userRole, setUserRole] = React.useState<UserRole>('user');
```

Depois:
1. Navegue para **Perfil**
2. **NÃO** vê botão de gestão
3. Experiência normal de usuário

---

## Para Integrar com Backend

### Passo 1: Implementar Endpoint de Auth

```typescript
// GET /api/auth/me
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "organizer" // ou "admin" ou "user"
  },
  "authenticated": true
}
```

### Passo 2: Implementar Endpoint de Gestão

```typescript
// GET /api/events/management
// Headers: Authorization: Bearer <token>
{
  "stats": {
    "totalEvents": 12,
    "activeEvents": 3,
    "totalProjects": 47,
    "totalParticipants": 284
  },
  "events": [
    {
      "id": "1",
      "name": "Hackathon Mackenzie 2025",
      "description": "...",
      "startDate": "2025-03-15T00:00:00Z",
      "endDate": "2025-03-17T23:59:59Z",
      "location": "Campus Higienópolis",
      "status": "active",
      "registeredParticipants": 127,
      "submittedProjects": 18,
      "formedTeams": 24,
      "organizer": "user-uuid",
      "categories": ["IA", "IoT", "Mobile"],
      "tags": ["innovation", "tech"],
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Passo 3: Conectar no Frontend

No `/App.tsx`:

```typescript
React.useEffect(() => {
  const loadUserAndEvents = async () => {
    try {
      // 1. Get user role
      const authRes = await fetch('/api/auth/me');
      const { user, authenticated } = await authRes.json();
      
      if (authenticated) {
        setIsLoggedIn(true);
        setUserRole(user.role);
        
        // 2. If organizer/admin, load events
        if (user.role === 'organizer' || user.role === 'admin') {
          const eventsRes = await fetch('/api/events/management', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const eventsData = await eventsRes.json();
          
          setEventsStats(eventsData.stats);
          setEvents(eventsData.events);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  loadUserAndEvents();
}, []);
```

---

## Checklist de Integração

### Backend
- [ ] Implementar autenticação JWT
- [ ] Criar endpoint `GET /api/auth/me`
- [ ] Criar endpoint `GET /api/events/management`
- [ ] Implementar filtro por role (organizer vê só seus eventos)
- [ ] Criar endpoints de CRUD de eventos
- [ ] Criar endpoints de aprovação de projetos
- [ ] Validar permissões em cada endpoint

### Frontend
- [ ] Substituir `userRole` state por chamada real ao backend
- [ ] Criar hook `useAuth()` para gerenciar autenticação
- [ ] Criar hook `useEvents()` para carregar eventos
- [ ] Adicionar loading states
- [ ] Adicionar error handling
- [ ] Adicionar toast notifications
- [ ] Criar modal/form para criar evento
- [ ] Criar modal/form para editar evento
- [ ] Implementar ação de aprovar/rejeitar projeto

---

## Estrutura de Pastas Atual

```
/pages/
  EventsManagementPage.tsx      ← Página principal de gestão
  ProfilePage.tsx               ← Modificado: botão de gestão
  
/components/
  EventCard.tsx                 ← Card de evento reutilizável
  
/examples/
  events-integration-example.ts ← Exemplos de código prontos
  
/
  EVENTS_MICROSERVICE_INTEGRATION.md  ← API completa
  README_FINAL_EVENTOS.md             ← Documentação final
  QUICK_START_EVENTOS.md              ← Este arquivo
```

---

## Links Úteis

- **API Completa**: `/EVENTS_MICROSERVICE_INTEGRATION.md`
- **Arquitetura**: `/EVENTOS_E_PROJETOS.md`
- **Exemplos de Código**: `/examples/events-integration-example.ts`
- **Checklist Completo**: `/CHECKLIST_IMPLEMENTACAO.md`

---

## Suporte Rápido

### "Não vejo o botão de gestão no perfil"

✅ Verifique se `userRole` está como 'organizer' ou 'admin' no `App.tsx`

### "Página de gestão está vazia"

✅ Normal! Sem backend conectado, não há dados para exibir. Conecte os endpoints.

### "Como faço para criar um evento?"

✅ O botão "Criar Evento" está pronto. Você precisa implementar o form/modal e conectar com `POST /api/events`.

### "Projetos não aparecem"

✅ Precisa implementar `GET /api/events/:eventId/projects` no backend e passar para a página via props.

---

**Pronto para começar! 🎉**
