# Resumo - Frontend para Microsserviço de Eventos

## O que foi implementado

Foi criada uma **interface completa de gestão de eventos** para a plataforma de Inovação Colaborativa, pronta para integração com seu microsserviço de backend.

## Arquivos Criados/Modificados

### 1. Páginas

#### `/pages/EventsManagementPage.tsx` ⭐ **PRINCIPAL**
Página completa de gestão de eventos com:
- **Visão geral**: Estatísticas (total de eventos, ativos, projetos, participantes)
- **Aba Eventos**: 
  - Lista todos os eventos
  - Filtros por status (draft, published, active, finished)
  - Busca por nome/descrição
  - Cards de eventos com informações completas
  - Ações: ver, editar, configurar, deletar (conforme permissões)
- **Aba Projetos**:
  - Lista todos os projetos vinculados aos eventos
  - Status visual (draft, submitted, approved, rejected)
  - Ações de aprovar/rejeitar projetos
  - Exportação de dados

**Diferenças por Role**:
- `organizer`: Vê apenas seus próprios eventos
- `admin`: Vê todos os eventos + botão de deletar

### 2. Componentes

#### `/components/EventCard.tsx`
Card reutilizável para exibir eventos em diferentes contextos:
- **Modo compacto**: Para listas densas
- **Modo completo**: Com todas as informações e ações
- Props para customizar comportamento
- Badges de status visual
- Botões de ação contextuais

### 3. App Principal

#### `/App.tsx` (Modificado)
Adicionado:
- Type `UserRole` = 'user' | 'organizer' | 'admin'
- State `userRole` para controlar tipo de usuário
- Página `events-management` no roteamento
- **Seletor temporário de roles** (canto superior direito) para testar diferentes visualizações
- Dados mock para demonstração

### 4. Documentação

#### `/EVENTS_MICROSERVICE_INTEGRATION.md` ⭐ **IMPORTANTE**
Documento COMPLETO de integração com:
- Todos os endpoints necessários
- Modelos de dados (TypeScript interfaces)
- Exemplos de requests/responses
- Fluxos de integração
- Regras de negócio
- Validações esperadas
- Tratamento de erros

#### `/EVENTOS_E_PROJETOS.md`
Explicação conceitual de como eventos e projetos se relacionam:
- Por que projetos ficam dentro de eventos
- Arquitetura de dados
- Fluxos de usuário completos
- Diferenças entre visualizações (user/organizer/admin)
- Adaptações necessárias no frontend

#### `/BACKEND_INTEGRATION.md` (Atualizado)
Seção completa sobre eventos adicionada ao documento principal

#### `/RESUMO_PARA_GRUPO_EVENTOS.md` (Este arquivo)
Resumo executivo do que foi feito

## Como Funciona

### Fluxo Básico

```
1. Usuário faz login
   ↓
2. Backend retorna role: 'user' | 'organizer' | 'admin'
   ↓
3. Se role = 'organizer' ou 'admin':
   - Acesso à página /events-management
   - Vê estatísticas e eventos
   - Pode criar/editar eventos
   - Pode aprovar/rejeitar projetos
```

### Estrutura de Dados

```
Event (Evento)
  ├── id
  ├── name
  ├── description
  ├── startDate / endDate
  ├── status: draft | published | active | finished
  ├── categories: string[]
  └── stats
      ├── registeredParticipants
      ├── submittedProjects
      └── formedTeams

Project (Projeto)
  ├── id
  ├── eventId ← VINCULADO AO EVENTO
  ├── title
  ├── teamName
  ├── status: draft | submitted | approved | rejected
  └── skills: string[]
```

### Relação Eventos ↔ Projetos

**IMPORTANTE**: Projetos SEMPRE ficam dentro de eventos.

```sql
-- Um projeto SEM evento é INVÁLIDO
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  -- outros campos
);
```

## Endpoints que Vocês Devem Implementar

### Essenciais (Prioridade Alta)

1. `GET /api/auth/me` - Retorna usuário e role
2. `GET /api/events/management` - Lista eventos + stats (requer auth)
3. `POST /api/events` - Cria evento (requer organizer/admin)
4. `GET /api/events/:id` - Detalhes de um evento
5. `GET /api/events/:id/projects` - Projetos de um evento
6. `PATCH /api/events/:id/projects/:projectId/status` - Aprovar/rejeitar projeto

### Importantes (Prioridade Média)

7. `PUT /api/events/:id` - Editar evento
8. `DELETE /api/events/:id` - Deletar evento (admin only)
9. `PATCH /api/events/:id/status` - Mudar status (draft → published → active → finished)
10. `GET /api/events/available` - Eventos disponíveis para inscrição
11. `POST /api/events/:id/register` - Inscrever usuário em evento

### Complementares (Prioridade Baixa)

12. `GET /api/events/stats/overview` - Estatísticas gerais
13. `GET /api/events/:id/stats` - Estatísticas de um evento
14. `POST /api/events/:id/projects` - Criar projeto dentro de evento

Consulte `/EVENTS_MICROSERVICE_INTEGRATION.md` para detalhes completos de cada endpoint.

## Como Testar o Frontend

### 1. Visualizar como Organizador

```typescript
// No App.tsx, o seletor de roles está no canto superior direito
// Clique em "Organizador"
```

Isso vai:
- Setar `userRole = 'organizer'`
- Navegar para `/events-management`
- Mostrar dados mock de eventos

### 2. Visualizar como Admin

```typescript
// Clique em "Admin"
```

Diferenças:
- Botão de deletar eventos aparece
- Pode editar qualquer evento
- Vê todos os projetos de todos os eventos

### 3. Visualizar como Usuário

```typescript
// Clique em "Usuário"
```

- Volta para o feed normal
- Não vê opção de gestão de eventos

## Dados Mock Incluídos

O App.tsx já possui dados mock para demonstração:

```typescript
stats: {
  totalEvents: 12,
  activeEvents: 3,
  totalProjects: 47,
  totalParticipants: 284,
}

events: [
  "Hackathon Mackenzie 2025" (active),
  "Desafio Startup Weekend" (published),
  "Game Jam Mackenzie" (draft),
  "Robótica Competitiva 2024" (finished),
]

projects: [
  "SmartPark - Estacionamento Inteligente" (submitted),
  "EcoTrack - Monitoramento Ambiental" (approved),
  "HealthAI - Diagnóstico Assistido" (submitted),
  "TrafficFlow - Otimização de Tráfego" (draft),
]
```

## Integração com Backend

### Passo 1: Substituir dados mock

No `App.tsx`, localize:

```typescript
{currentPage === 'events-management' && (
  <EventsManagementPage
    userRole={userRole === 'admin' ? 'admin' : 'organizer'}
    // TODO: Pass events data from backend microservice
    // stats={eventsStats}
    // events={events}
    // projects={eventProjects}
    
    // Mock data for demonstration
    stats={{ ... }}
    events={[ ... ]}
    projects={[ ... ]}
  />
)}
```

Substitua pelos dados do backend:

```typescript
const [eventsData, setEventsData] = useState(null);

useEffect(() => {
  const loadEvents = async () => {
    const response = await fetch('/api/events/management', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    setEventsData(data);
  };
  
  if (userRole === 'organizer' || userRole === 'admin') {
    loadEvents();
  }
}, [userRole]);

// Depois, usar:
<EventsManagementPage
  userRole={userRole}
  stats={eventsData?.stats}
  events={eventsData?.events}
  projects={eventsData?.projects}
/>
```

### Passo 2: Implementar ações

Os componentes já têm callbacks preparados. Exemplo:

```typescript
// No EventsManagementPage.tsx, adicionar:
const handleCreateEvent = async (eventData) => {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });
  
  if (response.ok) {
    toast.success('Evento criado com sucesso!');
    // Recarregar lista
  }
};
```

### Passo 3: Validar permissões

O backend DEVE validar:

```typescript
// Exemplo de middleware de autorização
const requireOrganizer = (req, res, next) => {
  if (!['organizer', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  next();
};

// Usar nos endpoints
app.post('/api/events', requireOrganizer, createEventHandler);
```

## Regras de Negócio Importantes

### 1. Status de Eventos

```
draft → published → active → finished
   ↓         ↓         ↓
Rascunho  Inscrições  Em andamento  Finalizado
          abertas
```

**Validações**:
- Projetos só podem ser submetidos se evento está `active`
- Evento não pode voltar para status anterior
- Apenas admin pode deletar eventos `finished`

### 2. Projetos

**Validações**:
- `eventId` é obrigatório
- `category` deve estar em `event.categories`
- `status: submitted` → pode ser aprovado/rejeitado
- `status: approved` ou `rejected` → não pode mais mudar

### 3. Permissões

**Organizador**:
- ✅ Criar eventos
- ✅ Editar próprios eventos
- ✅ Aprovar projetos dos próprios eventos
- ❌ Deletar eventos
- ❌ Editar eventos de outros

**Admin**:
- ✅ Tudo que organizador pode
- ✅ Editar qualquer evento
- ✅ Deletar eventos
- ✅ Aprovar qualquer projeto

## Próximos Passos (Seu Grupo)

### Backend - Implementação

1. ✅ **Banco de Dados**
   - Criar tabelas `events` e `projects`
   - Garantir foreign key `projects.event_id → events.id`

2. ✅ **Autenticação**
   - Implementar JWT
   - Endpoint `GET /api/auth/me` que retorna role

3. ✅ **Endpoints Essenciais**
   - Começar pelos 6 endpoints de prioridade alta

4. ✅ **Validações**
   - Status de evento
   - Permissões por role
   - Vinculação projeto → evento

5. ✅ **Testes**
   - Testar cada endpoint
   - Verificar permissões
   - Validar edge cases

### Frontend - Adaptações (Se necessário)

1. ⏳ **Criar modal de criação de evento**
   - Usar `GlassCard` e `GlassInput` existentes
   - Validações de formulário

2. ⏳ **Adicionar paginação**
   - Se lista de eventos ficar grande

3. ⏳ **Toast notifications**
   - Já tem Sonner configurado
   - Adicionar feedbacks de sucesso/erro

4. ⏳ **Loading states**
   - Skeleton components

## Design System

Todo o design já segue o padrão da plataforma:

- **Glass Material**: Superfícies translúcidas com blur
- **Cores**: Verde (teal/emerald) como primária
- **Fonte**: Ubuntu em todos os textos
- **Dark Mode**: Fundo sólido cinza estilo GitHub
- **Badges**: Estilo consistente (outline quando não selecionado, gradiente quando selecionado)

## Componentes Reutilizáveis Disponíveis

Vocês podem usar:

- `<GlassCard>` - Cards com efeito glass
- `<GlassButton>` - Botões com variantes (filled, ghost, outline)
- `<GlassInput>` - Inputs estilizados
- `<Badge>` - Tags e labels
- `<EmptyState>` - Estados vazios
- `<EventCard>` - Card de evento (novo)
- `<Tabs>` - Abas (Shadcn)
- `<Dialog>` - Modais (Shadcn)
- `<Select>`, `<Checkbox>`, etc. (Shadcn)

## Arquivos de Referência

```
/pages/EventsManagementPage.tsx          ← Interface principal
/components/EventCard.tsx                ← Card de evento
/EVENTS_MICROSERVICE_INTEGRATION.md      ← Documentação completa de API
/EVENTOS_E_PROJETOS.md                   ← Conceitos e arquitetura
/BACKEND_INTEGRATION.md                  ← Endpoints gerais
/App.tsx                                 ← Roteamento e controle de roles
```

## Dúvidas Comuns

### "Como funciona o controle de acesso?"

O backend retorna o role do usuário em `GET /api/auth/me`. O frontend guarda isso em `userRole` state e:
- Mostra/esconde páginas
- Mostra/esconde botões
- Mas o BACKEND é quem VALIDA de verdade

### "Projetos podem existir sem eventos?"

**NÃO**. Todo projeto DEVE ter um `event_id`. É uma constraint no banco de dados.

### "Organizador pode deletar eventos?"

**NÃO**. Apenas admin pode deletar.

### "O que é soft delete?"

Em vez de remover do banco, marcar como deletado:

```sql
UPDATE events SET deleted_at = NOW() WHERE id = ?;
```

Depois, filtrar em queries:

```sql
SELECT * FROM events WHERE deleted_at IS NULL;
```

### "Como notificar equipes sobre aprovação?"

Depende do microsserviço de mensagens. Vocês podem:
1. Emitir evento para fila (RabbitMQ/Kafka)
2. Chamar API de notificações
3. Gravar notificação no banco para o frontend buscar

## Contato e Suporte

Este frontend foi desenvolvido como **casca plug&play**. Todos os TODOs estão comentados nos arquivos indicando onde conectar com o backend.

Se precisarem de ajustes na interface ou novos componentes, os principais arquivos estão bem organizados e comentados.

**Boa sorte com a implementação do microsserviço de eventos! 🚀**
