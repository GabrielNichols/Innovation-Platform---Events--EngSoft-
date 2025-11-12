
# Check-in Service

Microsserviço FastAPI para emissão de tickets, geração de payload de QR e check-in de participantes em eventos.

## Endpoints

- `POST /api/checkin/tickets` emite 1 ticket para `event_id` e `participant_id`.
- `POST /api/checkin/tickets/bulk` emite vários tickets.
- `GET /api/checkin/tickets/{ticket_id}` busca ticket.
- `GET /api/checkin/tickets/{ticket_id}/qr` payload assinado para gerar QR no frontend.
- `POST /api/checkin/tickets/{ticket_id}/checkin` realiza check-in.
- `GET /healthz` healthcheck.

## Variáveis de ambiente
- `STORAGE_PATH` diretório para JSON (padrão: `data`).
- `ALLOW_ORIGINS` CORS (padrão: `*`).
- `NOTIFICATIONS_URL` URL do notifications-service para webhook opcional.
- `GATEWAY_SHARED_SECRET` segredo simples compartilhado com o gateway (opcional).

## Rodando local
```bash
uvicorn app.main:app --reload --port 8006
```

## Docker
```bash
docker build -t checkin-service:latest .
docker run -p 8006:8006 -e STORAGE_PATH=/data -v $(pwd)/data:/data checkin-service:latest
```

## Integração com o gateway (exemplo)
- Adicione a rota no gateway para `/api/checkin/*` apontando para `CHECKIN_SERVICE_URL=http://localhost:8006`.
- Envie `X-Shared-Secret: <segredo>` se habilitar `GATEWAY_SHARED_SECRET` aqui e no gateway.

## Testes
```bash
pytest -q
```
