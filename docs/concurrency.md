# Concurrency Design Explanation

## Problem

Two patients attempt to book the same appointment slot at the exact same time. Without proper concurrency control, both requests could read `status = 'AVAILABLE'`, both create appointments, and the slot gets double-booked.

## Solution: Pessimistic Row-Level Locking

We use PostgreSQL's `SELECT ... FOR UPDATE` within a transaction to serialize access to the slot row.

### Booking Transaction Flow

```sql
BEGIN;

-- Step 1: Lock the slot row (blocks concurrent requests)
SELECT * FROM slots WHERE id = $1 FOR UPDATE;

-- Step 2: Verify availability
-- If status != 'AVAILABLE', ROLLBACK and return 409

-- Step 3: Create appointment
INSERT INTO appointments (patient_id, slot_id, status)
VALUES ($1, $2, 'BOOKED');

-- Step 4: Mark slot as booked
UPDATE slots SET status = 'BOOKED' WHERE id = $1;

COMMIT;
```

On any failure: `ROLLBACK`.

### Why FOR UPDATE?

| Approach            | Pros                          | Cons                              |
|---------------------|-------------------------------|-----------------------------------|
| No locking          | Fast                          | Race conditions, double booking   |
| Optimistic locking  | Good for low contention       | Requires retry logic              |
| **FOR UPDATE**      | **Guaranteed serialization**  | Slight wait under contention      |

`FOR UPDATE` acquires an exclusive row lock. The second transaction **blocks** until the first commits or rolls back, then reads the updated status.

### Defense in Depth

1. **Application level**: Check `status === 'AVAILABLE'` inside the locked transaction
2. **Database level**: `UNIQUE` constraint on `appointments.slot_id` — even if application logic fails, PostgreSQL rejects the duplicate insert
3. **Slot overlap prevention**: `EXCLUDE` constraint on `slots` prevents doctors from creating overlapping availability

## Test Results

The concurrency test (`tests/concurrency.test.js`) sends two simultaneous `POST /api/appointments` requests for the same slot:

```
Patient 1 ──POST /appointments──┐
                                 ├──► Promise.all ──► One 201, One 409
Patient 2 ──POST /appointments──┘
```

**Expected outcome:**
- One request: `201` — `"Appointment booked successfully"`
- Other request: `409` — `"Slot already booked"`
- Database: exactly **1** appointment row, slot status = `BOOKED`

Run the test:

```bash
cd backend
npm run test:concurrency
```

## Timeline Under Contention

```
Time ──────────────────────────────────────────────►

Request A:  BEGIN ── FOR UPDATE (acquires lock) ── INSERT ── UPDATE ── COMMIT
Request B:  BEGIN ── FOR UPDATE (waits...) ──────────────────────────── reads BOOKED ── ROLLBACK
```

Request B waits at the `FOR UPDATE` step until Request A commits, then sees the slot is already booked.

## Production Considerations

- Connection pool size should accommodate concurrent booking requests
- Transaction scope is kept minimal (only the booking operation)
- Failed bookings return clear `409 Conflict` responses for client retry UX
- Neon/Render PostgreSQL fully supports `FOR UPDATE` row locking
