# ✅ Checklist de Implementação - Microsserviço de Eventos

## Frontend (Já Implementado)

- ✅ Página de Gestão de Eventos (`/pages/EventsManagementPage.tsx`)
- ✅ Componente EventCard (`/components/EventCard.tsx`)
- ✅ Sistema de roles (user/organizer/admin)
- ✅ Seletor de roles para testes (canto superior direito no Feed)
- ✅ Dados mock para demonstração
- ✅ Documentação completa de integração
- ✅ Exemplos de código de integração
- ✅ Design system aplicado (Glass Material, cores verde/teal)

## Backend (A Implementar - Seu Grupo)

### 📋 Fase 1: Infraestrutura (Prioridade: Alta)

- [ ] **1.1 Banco de Dados**
  - [ ] Criar tabela `events`
    - [ ] Campos: id, name, description, start_date, end_date, location, status, organizer_id, etc.
    - [ ] Índices: id (PK), organizer_id, status
  - [ ] Criar tabela `projects`
    - [ ] Campos: id, event_id (FK), title, description, team_name, status, etc.
    - [ ] Constraint: event_id NOT NULL
    - [ ] Foreign key: event_id → events(id)
  - [ ] Criar tabela `event_participants`
    - [ ] Campos: event_id, user_id, role, registered_at
    - [ ] Primary key composta: (event_id, user_id)
  - [ ] Scripts de migração
  - [ ] Seed data para testes

- [ ] **1.2 Autenticação**
  - [ ] Sistema de JWT
  - [ ] Middleware de autenticação
  - [ ] Middleware de autorização (verificar roles)
  - [ ] Endpoint `GET /api/auth/me`
    - [ ] Retorna: { user: {...}, role: 'user'|'organizer'|'admin', authenticated: true }

- [ ] **1.3 Configuração do Servidor**
  - [ ] Express/FastAPI/Spring Boot setup
  - [ ] CORS configurado
  - [ ] Rate limiting
  - [ ] Logging
  - [ ] Error handling middleware

### 📋 Fase 2: Endpoints Essenciais (Prioridade: Alta)

- [ ] **2.1 Gestão de Eventos**
  - [ ] `GET /api/events/management`
    - [ ] Retorna eventos + estatísticas
    - [ ] Filtra por organizador se role = 'organizer'
    - [ ] Mostra todos se role = 'admin'
    - [ ] Requer autenticação
  
  - [ ] `POST /api/events`
    - [ ] Cria novo evento
    - [ ] Validações: nome (≥5 chars), descrição (≥20 chars), datas
    - [ ] Status inicial: 'draft'
    - [ ] Organizer_id = usuário autenticado
    - [ ] Requer role: organizer ou admin
  
  - [ ] `GET /api/events/:id`
    - [ ] Retorna detalhes do evento
    - [ ] Público (não requer auth)
    - [ ] Incluir flag `isUserRegistered` se usuário está autenticado

- [ ] **2.2 Projetos de Eventos**
  - [ ] `GET /api/events/:eventId/projects`
    - [ ] Lista projetos do evento
    - [ ] Filtrar por status se necessário
    - [ ] Público ou restrito conforme regras
  
  - [ ] `POST /api/events/:eventId/projects`
    - [ ] Cria projeto vinculado ao evento
    - [ ] Validar: evento existe e está 'active'
    - [ ] Validar: categoria está em event.categories
    - [ ] Validar: usuário está inscrito no evento
    - [ ] Status inicial: 'draft'
  
  - [ ] `PATCH /api/events/:eventId/projects/:projectId/status`
    - [ ] Aprova ou rejeita projeto
    - [ ] Validar: apenas status 'submitted' pode ser alterado
    - [ ] Validar: organizador do evento ou admin
    - [ ] Se rejeitado, reason é obrigatório
    - [ ] TODO: Notificar equipe

- [ ] **2.3 Validações**
  - [ ] Validar datas (startDate < endDate)
  - [ ] Validar transições de status
  - [ ] Validar permissões por role
  - [ ] Validar event_id em projetos

### 📋 Fase 3: Endpoints Complementares (Prioridade: Média)

- [ ] **3.1 Atualização e Deleção**
  - [ ] `PUT /api/events/:id`
    - [ ] Validar: organizador do evento ou admin
    - [ ] Validar: campos obrigatórios
  
  - [ ] `DELETE /api/events/:id`
    - [ ] Soft delete (marcar como deletado)
    - [ ] Apenas admin
    - [ ] Arquivar projetos relacionados
  
  - [ ] `PATCH /api/events/:id/status`
    - [ ] Validar transição: draft → published → active → finished
    - [ ] Não permite voltar status
    - [ ] Validar: organizador ou admin

- [ ] **3.2 Participação**
  - [ ] `GET /api/events/available`
    - [ ] Lista eventos com status 'published' ou 'active'
    - [ ] Ordenar por data
    - [ ] Incluir flag isUserRegistered
  
  - [ ] `POST /api/events/:id/register`
    - [ ] Inscreve usuário no evento
    - [ ] Validar: evento está 'published'
    - [ ] Validar: não atingiu maxParticipants
    - [ ] Validar: usuário não está já inscrito
  
  - [ ] `DELETE /api/events/:id/register`
    - [ ] Cancela inscrição
    - [ ] Apenas se evento não iniciou

- [ ] **3.3 Estatísticas**
  - [ ] `GET /api/events/:id/stats`
    - [ ] Retorna estatísticas do evento
    - [ ] Heatmap de skills
  
  - [ ] `GET /api/events/stats/overview`
    - [ ] Estatísticas gerais
    - [ ] Requer: organizer ou admin

### 📋 Fase 4: Regras de Negócio (Prioridade: Alta)

- [ ] **4.1 Status de Eventos**
  - [ ] Projetos só podem ser submetidos se evento está 'active'
  - [ ] Inscrições só abertas se evento está 'published'
  - [ ] Status só pode avançar (não voltar)
  - [ ] Eventos 'finished' não aceitam mudanças

- [ ] **4.2 Permissões**
  - [ ] Organizador só vê/edita próprios eventos
  - [ ] Admin vê/edita todos os eventos
  - [ ] Apenas admin pode deletar eventos
  - [ ] Organizador pode aprovar projetos dos próprios eventos
  - [ ] Admin pode aprovar qualquer projeto

- [ ] **4.3 Integridade de Dados**
  - [ ] Projeto SEM event_id = INVÁLIDO
  - [ ] Deletar evento arquiva projetos (soft delete em cascata)
  - [ ] Categoria do projeto deve estar em event.categories
  - [ ] Status 'approved' ou 'rejected' é final (não pode mais mudar)

### 📋 Fase 5: Testes (Prioridade: Alta)

- [ ] **5.1 Testes Unitários**
  - [ ] Validações de dados
  - [ ] Regras de negócio
  - [ ] Helpers e utilitários

- [ ] **5.2 Testes de Integração**
  - [ ] Fluxo completo: criar evento → publicar → inscrever → submeter projeto → aprovar
  - [ ] Testes de permissões
  - [ ] Testes de validações
  - [ ] Testes de edge cases

- [ ] **5.3 Testes com Frontend**
  - [ ] Testar cada endpoint via Postman/Insomnia
  - [ ] Integrar com frontend real
  - [ ] Testar fluxos completos na UI

### 📋 Fase 6: Features Avançadas (Prioridade: Baixa)

- [ ] **6.1 Notificações**
  - [ ] Notificar quando projeto é aprovado/rejeitado
  - [ ] Notificar organizador sobre novo projeto submetido
  - [ ] Notificar participantes sobre mudanças no evento

- [ ] **6.2 Busca e Filtros**
  - [ ] Busca por nome/descrição de evento
  - [ ] Filtros por categoria, tag, localização
  - [ ] Ordenação por data, popularidade

- [ ] **6.3 Exportação**
  - [ ] Exportar lista de participantes (CSV/Excel)
  - [ ] Exportar projetos submetidos
  - [ ] Relatórios de estatísticas

- [ ] **6.4 Cronograma**
  - [ ] Criar/editar cronograma do evento
  - [ ] Visualizar timeline do evento

### 📋 Fase 7: Deploy e Monitoramento (Prioridade: Média)

- [ ] **7.1 Deploy**
  - [ ] Containerização (Docker)
  - [ ] CI/CD pipeline
  - [ ] Variáveis de ambiente
  - [ ] Deploy em produção

- [ ] **7.2 Monitoramento**
  - [ ] Logs estruturados
  - [ ] Métricas (requests/s, latência, erros)
  - [ ] Alertas
  - [ ] Health check endpoint

- [ ] **7.3 Documentação**
  - [ ] API documentation (Swagger/OpenAPI)
  - [ ] README do microsserviço
  - [ ] Instruções de setup local
  - [ ] Diagrama de arquitetura

## Integração Frontend-Backend

### Passo a Passo

1. [ ] **Configurar URL da API no frontend**
   - [ ] Criar arquivo `.env` com `REACT_APP_API_URL`
   - [ ] Exemplo: `REACT_APP_API_URL=http://localhost:3000/api`

2. [ ] **Substituir dados mock por chamadas reais**
   - [ ] No `App.tsx`, substituir arrays hardcoded
   - [ ] Criar hooks `useEvents()`, `useEventProjects()`
   - [ ] Ver arquivo `/examples/events-integration-example.ts`

3. [ ] **Implementar tratamento de erros**
   - [ ] Toast notifications (já configurado com Sonner)
   - [ ] Loading states
   - [ ] Error boundaries

4. [ ] **Implementar ações**
   - [ ] Criar evento
   - [ ] Editar evento
   - [ ] Aprovar/rejeitar projeto
   - [ ] Inscrever em evento

5. [ ] **Testar fluxos completos**
   - [ ] Organizador cria evento
   - [ ] Usuário se inscreve
   - [ ] Usuário cria projeto
   - [ ] Organizador aprova projeto

## Recursos Disponíveis

### Documentação
- [ ] Ler `/EVENTS_MICROSERVICE_INTEGRATION.md` (Documentação completa da API)
- [ ] Ler `/EVENTOS_E_PROJETOS.md` (Conceitos e arquitetura)
- [ ] Ler `/RESUMO_PARA_GRUPO_EVENTOS.md` (Resumo executivo)
- [ ] Consultar `/examples/events-integration-example.ts` (Exemplos de código)

### Código Frontend
- [ ] Estudar `/pages/EventsManagementPage.tsx` (Interface principal)
- [ ] Estudar `/components/EventCard.tsx` (Componente de evento)
- [ ] Ver props e tipos esperados

### Design System
- [ ] Usar componentes existentes: `<GlassCard>`, `<GlassButton>`, `<Badge>`
- [ ] Seguir padrão de cores (verde/teal)
- [ ] Manter consistência visual

## Dicas Importantes

### Backend
- ⚠️ **SEMPRE validar permissões no backend** (não confiar no frontend)
- ⚠️ **Usar transactions** para operações que alteram múltiplas tabelas
- ⚠️ **Fazer soft delete** em vez de deletar permanentemente
- ⚠️ **Registrar logs** de todas as ações importantes
- ⚠️ **Validar foreign keys** antes de deletar

### Frontend
- ✅ Usar `fetchWithAuth()` do arquivo de exemplos
- ✅ Sempre mostrar loading states
- ✅ Sempre tratar erros com try/catch
- ✅ Usar toast notifications para feedback
- ✅ Validar dados antes de enviar ao backend

### Colaboração
- 🤝 Comunicar com outros grupos sobre:
  - Estrutura de dados de usuários (autenticação)
  - Notificações (quando projeto é aprovado)
  - Integração com perfis de usuários
- 🤝 Compartilhar endpoints e contratos de API
- 🤝 Testar integração entre microsserviços

## Timeline Sugerida

### Semana 1: Fundação
- Dia 1-2: Setup do projeto, banco de dados, autenticação básica
- Dia 3-4: Endpoints essenciais (GET/POST eventos)
- Dia 5-7: Testes e validações

### Semana 2: Core Features
- Dia 1-2: Endpoints de projetos
- Dia 3-4: Sistema de aprovação/rejeição
- Dia 5-7: Permissões e roles

### Semana 3: Integração
- Dia 1-3: Integrar frontend com backend
- Dia 4-5: Testes end-to-end
- Dia 6-7: Correções e refinamentos

### Semana 4: Polimento
- Dia 1-2: Features complementares
- Dia 3-4: Documentação
- Dia 5-7: Deploy e apresentação

## Contatos e Suporte

- Frontend: Já está pronto e documentado
- Dúvidas sobre endpoints: Ver `/EVENTS_MICROSERVICE_INTEGRATION.md`
- Dúvidas sobre integração: Ver `/examples/events-integration-example.ts`
- Dúvidas sobre UI: Ver componentes em `/pages` e `/components`

---

**Última atualização**: {{ data_atual }}

**Status**: 
- ✅ Frontend completo
- ⏳ Backend a implementar
- ⏳ Integração pendente

**Próximo passo**: Começar Fase 1 - Infraestrutura
