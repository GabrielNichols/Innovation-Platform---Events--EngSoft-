# Gateway Routing

| Route prefix                          | Target service            |
| ------------------------------------ | ------------------------- |
| `/api/auth/**`                        | Auth service (`8001`)     |
| `/api/events/**`                      | Events service (`8002`)   |
| `/api/events/*/projects/**`           | Projects service (`8003`) |
| `/api/events/*/(participants|register)` | Participants service (`8004`) |
| `/api/notifications/**`               | Notifications service (`8005`) |

The gateway forwards HTTP method, body, headers, and query string transparently.
