# TicketBoss - Event Ticketing API

A real-time event ticketing system with optimistic concurrency control for handling high-volume seat reservations without over-selling.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Technical Decisions](#technical-decisions)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Testing](#testing)

## 🎯 Overview

TicketBoss is a JSON API that manages seat reservations for events in real-time. Built for a Node.js meetup with 500 seats, it ensures no over-selling occurs while providing instant accept/deny responses to reservation requests.

## ✨ Features

- ✅ Real-time seat reservation with instant confirmation
- ✅ Optimistic concurrency control to prevent race conditions
- ✅ Automatic event seeding on startup
- ✅ RESTful API design
- ✅ Comprehensive error handling
- ✅ Input validation (1-10 seats per request)
- ✅ Reservation cancellation with seat pool restoration

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: JavaScript (ES6+ modules)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/Suyalvivek/ticketBoss>
   cd ticketBoss
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure package.json**
   
   Ensure your `package.json` has the following configuration:
   ```json
   {
     "name": "ticketboss",
     "version": "1.0.0",
     "type": "module",
     "main": "server.js",
     "scripts": {
       "start": "node server.js",
       "dev": "node --env-file=.env server.js"
     },
     "dependencies": {
       "express": "^4.18.2",
       "mongoose": "^8.0.0"
     }
   }
   ```

   **Important:**
   - `"type": "module"` - Enables ES6 module syntax (import/export)
   - `"dev"` script uses `--env-file=.env` flag for environment variables (Node.js 20.6+)

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=
   PORT=3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud database
   ```

5. **Run the application**
   ```bash
   # Development mode (loads .env automatically)
   npm run dev
   
   # Or production mode
   npm start
   ```

   The server will start on `http://localhost:3000` and automatically seed the event data.

### Alternative: Using dotenv Package

If you're using Node.js version < 20.6, use the `dotenv` package instead:

1. **Install dotenv**
   ```bash
   npm install dotenv
   ```

2. **Update package.json dev script**
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "node server.js"
   }
   ```

3. **Add to server.js (at the very top)**
   ```javascript
   import 'dotenv/config';
   import express from "express";
   // ... rest of imports
   ```

### Verify Installation

```bash
curl http://localhost:3000
```

Expected response:
```json
{
  "message": "TicketBoss API is running",
  "status": "healthy",
  "database": "connected"
}
```

## 📚 API Documentation

Base URL: `http://localhost:3000/api/v1`

### 1. Reserve Seats

Reserve seats for a partner.

**Endpoint:** `POST /api/v1/ticket/reservations`

**Request Body:**
```json
{
  "partnerId": "abc-corp",
  "seats": 3
}
```

**Validation Rules:**
- `partnerId`: Required, string
- `seats`: Required, number between 1-10

**Success Response (201 Created):**
```json
{
  "reservationId": "550e8400-e29b-41d4-a716-446655440000",
  "seats": 3,
  "status": "confirmed"
}
```

**Error Responses:**

```json
// 409 Conflict - Not enough seats
{
  "error": "Concurrency conflict or insufficient seats"
}

// 400 Bad Request - Invalid seat count
{
  "error": "Invalid seat count"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/ticket/reservations \
  -H "Content-Type: application/json" \
  -d '{"partnerId": "abc-corp", "seats": 3}'
```

---

### 2. Cancel Reservation

Cancel an existing reservation and return seats to the pool.

**Endpoint:** `DELETE /api/v1/ticket/reservations/:reservationId`

**URL Parameters:**
- `reservationId`: The unique reservation identifier

**Success Response (204 No Content):**
No body returned

**Error Responses:**

```json
// 404 Not Found
{
  "error": "Reservation not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/ticket/reservations/550e8400-e29b-41d4-a716-446655440000
```

---

### 3. List All Reservations

Get all reservations (confirmed and cancelled).

**Endpoint:** `GET /api/v1/ticket/reservations`

**Success Response (200 OK):**
```json
[
  {
    "_id": "674d2f8a9b1c2d3e4f5a6b7c",
    "reservationId": "550e8400-e29b-41d4-a716-446655440000",
    "partnerId": "abc-corp",
    "seats": 3,
    "status": "confirmed",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/ticket/reservations
```

---

### 4. Event Summary

Get current event statistics.

**Endpoint:** `GET /api/v1/event/summary`

**Success Response (200 OK):**
```json
{
  "eventId": "node-meetup-2025",
  "name": "Node.js Meet-up",
  "totalSeats": 500,
  "availableSeats": 42,
  "reservedSeats": 458,
  "version": 14
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/event/summary
```

---

## 🏗 Technical Decisions

### Optimistic Concurrency Control (OCC)

**Why OCC?**
- Prevents race conditions when multiple partners try to reserve seats simultaneously
- Better performance than pessimistic locking for read-heavy workloads
- No database locks needed - scales better under high load

**How it works:**
1. Each event has a `version` field that increments with every update
2. When reserving seats, we check if the current version matches the fetched version
3. If versions don't match, someone else modified the data - we return a conflict error
4. Client can retry the request with fresh data

**Implementation:**
```javascript
await Event.findOneAndUpdate(
  {
    eventId: "node-meetup-2025",
    availableSeats: { $gte: seats },
    version: event.version  // ✅ Version check
  },
  {
    $inc: {
      availableSeats: -seats,
      version: 1  // ✅ Increment version
    }
  }
);
```

### Storage Method

**MongoDB with Mongoose** was chosen because:
- **Flexible Schema**: Easy to extend with additional fields
- **Atomic Operations**: `$inc` operator ensures thread-safe updates
- **Rich Query Support**: Efficient filtering and aggregation
- **Scalability**: Horizontal scaling with sharding if needed

### Architecture Patterns

**Layered Architecture:**
```
Routes → Controllers → Services → Models
```

- **Routes**: Define HTTP endpoints and methods
- **Controllers**: Handle HTTP request/response, call services
- **Services**: Contain business logic (reservation, cancellation)
- **Models**: Define data schema and database interaction

**Benefits:**
- Clear separation of concerns
- Easy to test individual layers
- Maintainable and extensible codebase

### Data Models

**Event Model:**
- Tracks total and available seats
- Uses version field for OCC
- Single source of truth for seat availability

**Reservation Model:**
- Stores individual reservation details
- Status field allows soft deletion (cancelled vs confirmed)
- UUID-based reservationId for uniqueness

## 📁 Project Structure

```
ticketboss/
├── api/
│   └── v1/
│       ├── index.js              # Route aggregator
│       ├── ticket.routes.js      # Reservation routes
│       └── event.routes.js       # Event routes
├── config/
│   └── db.js                     # MongoDB connection
├── controllers/
│   ├── ticket.controller.js      # Reservation controllers
│   └── event.controller.js       # Event controllers
├── models/
│   ├── event.model.js            # Event schema
│   └── reservation.model.js      # Reservation schema
├── services/
│   └── ticket.service.js         # Business logic
├── server.js                     # Application entry point
├── package.json                  # Dependencies
├── .env                          # Environment variables
└── README.md                     # Documentation
```

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET requests |
| 201 | Created | Successful reservation |
| 204 | No Content | Successful cancellation |
| 400 | Bad Request | Invalid input (seats ≤ 0 or > 10) |
| 404 | Not Found | Reservation not found |
| 409 | Conflict | Not enough seats or concurrency conflict |
| 500 | Internal Server Error | Unexpected server errors |

### Common Error Scenarios

**Scenario 1: Concurrent Reservations**
```
Partner A and B both try to book the last 3 seats
→ One succeeds (201), other gets 409 Conflict
→ Failed partner can retry immediately
```

**Scenario 2: Invalid Seat Count**
```
Request: { "seats": 15 }
→ 400 Bad Request: "Invalid seat count"
```

**Scenario 3: Double Cancellation**
```
Cancel same reservationId twice
→ First: 204 No Content
→ Second: 404 Not Found
```

## 🧪 Testing

### Manual Testing with cURL

**Test 1: Reserve Seats**
```bash
curl -X POST http://localhost:3000/api/v1/ticket/reservations \
  -H "Content-Type: application/json" \
  -d '{"partnerId": "test-partner", "seats": 5}'
```

**Test 2: Check Event Summary**
```bash
curl http://localhost:3000/api/v1/event/summary
```

**Test 3: Cancel Reservation**
```bash
# Use reservationId from Test 1 response
curl -X DELETE http://localhost:3000/api/v1/ticket/reservations/<reservationId>
```

**Test 4: Verify Seats Restored**
```bash
curl http://localhost:3000/api/v1/event/summary
# availableSeats should increase by 5
```

### Edge Cases to Test

1. **Maximum seats per request**
   ```bash
   curl -X POST http://localhost:3000/api/v1/ticket/reservations \
     -d '{"partnerId": "test", "seats": 10}'  # Should work
   
   curl -X POST http://localhost:3000/api/v1/ticket/reservations \
     -d '{"partnerId": "test", "seats": 11}'  # Should fail
   ```

2. **Overselling prevention**
   ```bash
   # When only 2 seats remain
   curl -X POST http://localhost:3000/api/v1/ticket/reservations \
     -d '{"partnerId": "test", "seats": 3}'  # Should fail with 409
   ```

3. **Invalid input**
   ```bash
   curl -X POST http://localhost:3000/api/v1/ticket/reservations \
     -d '{"partnerId": "test", "seats": -5}'  # Should fail with 400
   ```

## 🔮 Future Enhancements

- [ ] Add retry logic with exponential backoff in service layer
- [ ] Implement MongoDB transactions for atomic operations
- [ ] Add rate limiting per partner
- [ ] Support multiple events
- [ ] Add WebSocket support for real-time seat updates
- [ ] Add comprehensive unit and integration tests
- [ ] Add authentication and authorization
## 📄 License

MIT
