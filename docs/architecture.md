# Architecture

## System Overview

```mermaid
flowchart TB
    subgraph Client
        Browser[React SPA - Vercel]
    end

    subgraph Server
        API[Express API - Render]
    end

    subgraph Data
        DB[(PostgreSQL - Neon)]
    end

    Browser -->|HTTPS + JWT| API
    API -->|pg pool + transactions| DB
```

## Request Flow — Booking an Appointment

```mermaid
sequenceDiagram
    participant P as Patient (Browser)
    participant A as Express API
    participant S as AppointmentService
    participant DB as PostgreSQL

    P->>A: POST /api/appointments { slotId }
    A->>A: JWT verify + authorize(PATIENT)
    A->>S: bookAppointment(patientId, slotId)
    S->>DB: BEGIN
    S->>DB: SELECT * FROM slots WHERE id=$1 FOR UPDATE
    alt Slot AVAILABLE
        S->>DB: INSERT INTO appointments
        S->>DB: UPDATE slots SET status='BOOKED'
        S->>DB: COMMIT
        S-->>A: 201 Success
    else Slot BOOKED
        S->>DB: ROLLBACK
        S-->>A: 409 Conflict
    end
    A-->>P: JSON response
```

## Layered Architecture

| Layer        | Responsibility                          |
|--------------|-----------------------------------------|
| Routes       | HTTP routing, middleware chain          |
| Controllers  | Parse request, call service, send response |
| Services     | Business logic, SQL queries, transactions |
| Middleware   | Auth, validation, error handling        |
| Database     | Connection pool, schema, migrations     |

## Security

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT for stateless authentication
- Parameterized SQL queries throughout (SQL injection prevention)
- Role-based authorization on sensitive endpoints
- CORS enabled for frontend origin
