# Relational Ledger API Surface

## Base URL

```
/api/practitioner
```

All endpoints require authentication. Practitioner must own the practice being accessed.

---

## Practices

### `GET /api/practitioner/practices`
List all practices owned by authenticated user.

**Response:**
```json
{
  "practices": [
    {
      "id": "uuid",
      "name": "string",
      "modes": ["clinical", "coaching"],
      "timezone": "America/Los_Angeles",
      "capacityPolicy": {
        "maxSessionsPerWeek": 20,
        "bufferMinutes": 15,
        "blackoutDays": []
      },
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ]
}
```

### `POST /api/practitioner/practices`
Create a new practice.

**Request:**
```json
{
  "name": "string",
  "modes": ["clinical"],
  "timezone": "America/Los_Angeles",
  "capacityPolicy": {}
}
```

### `GET /api/practitioner/practices/:id`
Get practice details.

### `PATCH /api/practitioner/practices/:id`
Update practice.

### `DELETE /api/practitioner/practices/:id`
Delete practice (soft delete, archives all data).

---

## People

### `GET /api/practitioner/practices/:practiceId/people`
List people in practice.

**Query params:**
- `tags` - Filter by tags (comma-separated)
- `search` - Search by name/email
- `limit`, `offset` - Pagination

**Response:**
```json
{
  "people": [
    {
      "id": "uuid",
      "displayName": "string",
      "email": "string|null",
      "phone": "string|null",
      "tags": ["string"],
      "containerCount": 2,
      "createdAt": "ISO8601"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

### `POST /api/practitioner/practices/:practiceId/people`
Create person.

**Request:**
```json
{
  "displayName": "string",
  "email": "string|null",
  "phone": "string|null",
  "notesPrivate": "string|null",
  "tags": ["string"]
}
```

### `GET /api/practitioner/people/:id`
Get person details (includes containers they're in).

### `PATCH /api/practitioner/people/:id`
Update person.

### `DELETE /api/practitioner/people/:id`
Remove person (only if not in any active containers).

---

## Containers

### `GET /api/practitioner/practices/:practiceId/containers`
List containers.

**Query params:**
- `status` - Filter by status (comma-separated)
- `type` - Filter by type
- `limit`, `offset` - Pagination

**Response:**
```json
{
  "containers": [
    {
      "id": "uuid",
      "type": "1:1",
      "status": "active",
      "scope": "string",
      "startAt": "ISO8601|null",
      "endAt": "ISO8601|null",
      "visibility": "private",
      "riskFlags": [],
      "participants": [
        {
          "id": "uuid",
          "personId": "uuid",
          "displayName": "string",
          "role": "client"
        }
      ],
      "nextSession": {
        "id": "uuid",
        "scheduledStartAt": "ISO8601"
      } | null,
      "createdAt": "ISO8601"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

### `POST /api/practitioner/practices/:practiceId/containers`
Create container.

**Request:**
```json
{
  "type": "1:1",
  "scope": "string",
  "visibility": "private",
  "participants": [
    { "personId": "uuid", "role": "client" }
  ]
}
```

### `GET /api/practitioner/containers/:id`
Get container details (full participant list, recent sessions, agreements).

### `PATCH /api/practitioner/containers/:id`
Update container (scope, visibility, risk flags).

### `POST /api/practitioner/containers/:id/transition`
Transition container status.

**Request:**
```json
{
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "container": { ... },
  "transition": {
    "from": "inquiry",
    "to": "active"
  }
}
```

**Errors:**
- `400` if transition is invalid per state machine

### `POST /api/practitioner/containers/:id/participants`
Add participant to container.

### `DELETE /api/practitioner/containers/:id/participants/:participantId`
Remove participant from container.

---

## Sessions

### `GET /api/practitioner/practices/:practiceId/sessions`
List sessions.

**Query params:**
- `containerId` - Filter by container
- `status` - Filter by status
- `from`, `to` - Date range
- `limit`, `offset`

### `POST /api/practitioner/containers/:containerId/sessions`
Create session.

**Request:**
```json
{
  "sessionType": "session",
  "scheduledStartAt": "ISO8601",
  "scheduledEndAt": "ISO8601",
  "location": "video"
}
```

### `GET /api/practitioner/sessions/:id`
Get session details (includes notes if authorized).

### `PATCH /api/practitioner/sessions/:id`
Update session.

### `POST /api/practitioner/sessions/:id/complete`
Mark session as completed.

### `POST /api/practitioner/sessions/:id/cancel`
Cancel session.

### `POST /api/practitioner/sessions/:id/no-show`
Mark as no-show.

---

## Notes

### `GET /api/practitioner/sessions/:sessionId/notes`
Get notes for a session.

### `GET /api/practitioner/containers/:containerId/notes`
Get container-level notes.

### `POST /api/practitioner/sessions/:sessionId/notes`
Create note on session.

**Request:**
```json
{
  "content": "string",
  "visibility": "private_practitioner"
}
```

### `POST /api/practitioner/containers/:containerId/notes`
Create container-level note.

### `PATCH /api/practitioner/notes/:id`
Update note.

### `DELETE /api/practitioner/notes/:id`
Delete note.

---

## Agreements

### `GET /api/practitioner/containers/:containerId/agreements`
List agreements for container.

### `POST /api/practitioner/containers/:containerId/agreements`
Create agreement.

**Request:**
```json
{
  "kind": "informed_consent",
  "content": "markdown string"
}
```

### `GET /api/practitioner/agreements/:id`
Get agreement.

### `PATCH /api/practitioner/agreements/:id`
Update agreement (creates new version if already sent).

### `POST /api/practitioner/agreements/:id/send`
Send agreement to participant(s).

### `POST /api/practitioner/agreements/:id/accept`
Record acceptance (typically via client portal).

---

## Billing

### `GET /api/practitioner/containers/:containerId/billing`
List billing items for container.

### `POST /api/practitioner/containers/:containerId/billing`
Create billing item.

**Request:**
```json
{
  "kind": "invoice",
  "amountCents": 15000,
  "currency": "USD",
  "dueAt": "ISO8601|null"
}
```

### `PATCH /api/practitioner/billing/:id`
Update billing item.

### `POST /api/practitioner/billing/:id/send`
Send invoice.

### `POST /api/practitioner/billing/:id/mark-paid`
Mark as paid.

### `POST /api/practitioner/billing/:id/void`
Void billing item.

---

## Tasks

### `GET /api/practitioner/practices/:practiceId/tasks`
List tasks.

**Query params:**
- `status` - `open` | `done`
- `containerId` - Filter by container
- `personId` - Filter by person
- `dueBefore` - Due date filter

### `POST /api/practitioner/practices/:practiceId/tasks`
Create task.

**Request:**
```json
{
  "title": "string",
  "containerId": "uuid|null",
  "personId": "uuid|null",
  "dueAt": "ISO8601|null"
}
```

### `PATCH /api/practitioner/tasks/:id`
Update task.

### `POST /api/practitioner/tasks/:id/complete`
Mark task as done.

### `DELETE /api/practitioner/tasks/:id`
Delete task.

---

## Dashboard (Stewardship)

### `GET /api/practitioner/practices/:practiceId/dashboard`
Get full dashboard data in one call.

**Response:**
```json
{
  "commitments": {
    "active": 12,
    "paused": 2,
    "closing": 1,
    "inquiry": 3
  },
  "careHorizon": {
    "sessions": [
      {
        "id": "uuid",
        "scheduledStartAt": "ISO8601",
        "sessionType": "session",
        "containerId": "uuid",
        "containerScope": "string"
      }
    ],
    "tasks": [
      {
        "id": "uuid",
        "title": "string",
        "dueAt": "ISO8601",
        "containerId": "uuid|null"
      }
    ]
  },
  "capacity": {
    "sessionsThisWeek": 15,
    "maxSessionsPerWeek": 20,
    "bufferIntegrity": "ok",
    "recoveryBlocksPresent": true
  },
  "sustainability": {
    "paidThisMonthCents": 450000,
    "pendingCents": 30000,
    "outstandingInvoices": 2
  },
  "hygiene": {
    "containersNeedingAttention": [
      {
        "id": "uuid",
        "scope": "string",
        "reason": "closing_no_next_session"
      }
    ],
    "agreementsPending": 3
  }
}
```

---

## Error Responses

All errors follow consistent format:

```json
{
  "error": "string",
  "code": "ERROR_CODE",
  "details": {} | null
}
```

### Common Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized for this resource |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `INVALID_TRANSITION` | 400 | Container status transition not allowed |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `CONFLICT` | 409 | Action conflicts with current state |

---

## Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Read | 100/minute |
| Write | 30/minute |
| Dashboard | 10/minute |

---

**End of API Surface**
