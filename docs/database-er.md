# Database ER Diagram

```mermaid
erDiagram
    users {
        serial id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar role
        timestamptz created_at
    }

    doctors {
        serial id PK
        int user_id FK,UK
        varchar specialization
        int experience_years
        numeric consultation_fee
        text bio
    }

    slots {
        serial id PK
        int doctor_id FK
        timestamptz start_time
        timestamptz end_time
        varchar status
    }

    appointments {
        serial id PK
        int patient_id FK
        int slot_id FK,UK
        varchar status
        timestamptz created_at
    }

    users ||--o| doctors : "has profile"
    doctors ||--o{ slots : "offers"
    users ||--o{ appointments : "books"
    slots ||--o| appointments : "reserved by"
```

## Indexes

| Table         | Index              | Purpose                    |
|---------------|--------------------|----------------------------|
| slots         | doctor_id          | Filter slots by doctor     |
| slots         | start_time         | Sort/filter by time        |
| appointments  | patient_id         | Patient appointment lookup |
| appointments  | status             | Filter by status           |

## Constraints

| Constraint                    | Type    | Purpose                              |
|-------------------------------|---------|--------------------------------------|
| users.email                   | UNIQUE  | One account per email                |
| doctors.user_id               | UNIQUE  | One doctor profile per user          |
| appointments.slot_id          | UNIQUE  | One appointment per slot             |
| no_overlapping_slots          | EXCLUDE | Prevent overlapping doctor slots     |
| slots.end_time > start_time   | CHECK   | Valid time range                     |

## Overlap Prevention (Database Level)

```sql
CONSTRAINT no_overlapping_slots EXCLUDE USING gist (
  doctor_id WITH =,
  tstzrange(start_time, end_time, '[)') WITH &&
)
```

This rejects any INSERT that would create overlapping time ranges for the same doctor.
