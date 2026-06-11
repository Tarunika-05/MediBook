# API Documentation

Base URL: `http://localhost:5000/api` (development)

All protected routes require header: `Authorization: Bearer <token>`

---

## Authentication

### POST /auth/register

Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "PATIENT"
}
```

Doctor registration (additional fields):
```json
{
  "name": "Dr. Smith",
  "email": "dr.smith@example.com",
  "password": "password123",
  "role": "DOCTOR",
  "specialization": "Cardiologist",
  "experienceYears": 10,
  "consultationFee": 150,
  "bio": "Board-certified cardiologist."
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "PATIENT",
  "token": "eyJhbG..."
}
```

### POST /auth/login

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):** Same shape as register response.

### POST /auth/logout

Protected. Returns `{ "message": "Logged out successfully" }`.

---

## Doctors

### GET /doctors

List doctors with optional filters.

**Query params:**
- `search` — filter by doctor name
- `specialization` — filter by specialization
- `page` — page number (default: 1)
- `limit` — results per page (default: 10)

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "specialization": "Cardiologist",
      "experienceYears": 12,
      "consultationFee": 150,
      "bio": "...",
      "user": { "name": "Dr. Sarah Smith", "email": "dr.smith@example.com" }
    }
  ],
  "meta": { "total": 2, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### GET /doctors/:id

Get doctor profile with available future slots.

### GET /doctors/:id/slots

Get slots for a doctor. Optional query: `status=AVAILABLE|BOOKED`.

---

## Slots

### POST /slots

Protected. Doctor only. Create a new appointment slot.

**Body:**
```json
{
  "startTime": "2026-06-15T10:00:00.000Z",
  "endTime": "2026-06-15T10:30:00.000Z"
}
```

**Errors:**
- `409` — Slot overlaps with existing slot

### GET /slots

Protected. Doctor only. List own slots.

### DELETE /slots/:id

Protected. Doctor only. Delete an available slot.

---

## Appointments

### POST /appointments

Protected. Patient only. Book an appointment.

**Body:**
```json
{
  "slotId": 1
}
```

**Success (201):**
```json
{
  "message": "Appointment booked successfully",
  "appointment": { "id": 1, "patientId": 2, "slotId": 1, "status": "BOOKED" }
}
```

**Errors:**
- `409` — `{ "message": "Slot already booked" }`
- `404` — Slot not found

### GET /appointments

Protected. Returns appointments for the authenticated user (patient or doctor view).

### DELETE /appointments/:id

Protected. Patient only. Cancel a booked appointment.

**Response (200):**
```json
{ "message": "Appointment cancelled successfully" }
```

### GET /appointments/schedule/daily

Protected. Doctor only. View daily schedule.

**Query params:**
- `date` — ISO date string (default: today)

---

## Error Responses

All errors return:
```json
{
  "message": "Error description"
}
```

| Status | Meaning              |
|--------|----------------------|
| 400    | Validation error     |
| 401    | Not authenticated    |
| 403    | Not authorized       |
| 404    | Resource not found   |
| 409    | Conflict (booking/overlap) |
| 500    | Internal server error |
