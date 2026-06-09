# HookLine

A production-grade Webhook Delivery Engine SaaS built with Node.js, Express, MongoDB, Redis, and BullMQ.

HookLine lets developers register webhook endpoints, fire events via a simple API, and reliably delivers payloads with automatic retries, HMAC signing, delivery logs, and a real-time queue dashboard.

**Competitors:** Svix, Hookdeck — HookLine is the indie alternative.

---

## Features

- **Multi-tenant** — each project gets its own API key and signing secret
- **Reliable delivery** — BullMQ queue with exponential backoff retries (up to 5 attempts)
- **HMAC-SHA256 signing** — every payload is signed so receivers can verify authenticity
- **Dead-letter queue** — failed jobs are preserved for inspection and manual replay
- **Circuit breaker** — endpoints that fail 10 times in a row are auto-paused
- **Delivery logs** — full history of every attempt with status code, latency, response body
- **Manual replay** — resend any failed webhook with a single API call
- **Plan limits** — free (1k/mo), pro (10k/mo), business (100k/mo)
- **Razorpay billing** — upgrade plans via payment orders and webhook verification
- **Bull Board** — real-time queue monitoring dashboard at `/admin/queues`
- **Rate limiting** — per-route rate limits to prevent abuse
- **Docker ready** — runs with a single command locally and on any VPS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + ES Modules |
| Framework | Express 5 |
| Database | MongoDB 7 + Mongoose |
| Queue | BullMQ + Redis 7 |
| HTTP client | Axios |
| Signing | HMAC-SHA256 (Node crypto) |
| Billing | Razorpay |
| Monitoring | Bull Board |
| Rate limiting | express-rate-limit |
| Containerization | Docker + Docker Compose |

---

## Project Structure
hookline/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   ├── redis.js           # Redis connection config
│   │   ├── bullBoard.js       # Bull Board dashboard setup
│   │   ├── rateLimiter.js     # Rate limiting config
│   │   └── plans.js           # Plan limits and pricing
│   ├── models/
│   │   ├── Project.js         # Tenant model (API key, plan, usage)
│   │   ├── Endpoint.js        # Webhook destination URL
│   │   ├── Event.js           # Fired event + payload
│   │   └── Delivery.js        # Delivery attempt log
│   ├── queues/
│   │   ├── deliveryQueue.js   # BullMQ queue definition
│   │   └── worker.js          # Worker process
│   ├── routes/
│   │   ├── auth.js            # POST /auth/projects
│   │   ├── endpoints.js       # CRUD /endpoints
│   │   ├── events.js          # POST /events
│   │   ├── deliveries.js      # GET /deliveries + replay
│   │   └── billing.js         # Razorpay billing
│   ├── middleware/
│   │   ├── authenticate.js    # API key validation
│   │   └── planLimits.js      # Monthly usage enforcement
│   ├── services/
│   │   └── deliveryService.js # HMAC signing + HTTP delivery
│   └── app.js
├── worker.js                  # Worker entry point
├── server.js                  # API entry point
├── docker-compose.yml         # Local development
├── docker-compose.prod.yml    # Production deployment
└── Dockerfile

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- pnpm

### Local Development

```bash
# Clone the repo
git clone https://github.com/yourusername/hookline
cd hookline

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Start MongoDB and Redis
docker compose up -d

# Terminal 1 — API server
pnpm dev

# Terminal 2 — Worker process
pnpm worker
```

---

## API Reference

### Authentication
All protected routes require:

Authorization: Bearer <your_api_key>

### Create a Project
POST /auth/projects
Body: { "name": "My App" }

### Register an Endpoint
POST /endpoints
Body: { "url": "https://yourserver.com/webhooks", "description": "Production" }

### Fire an Event
POST /events
Body: { "eventType": "order.created", "payload": { ...any JSON } }

### View Delivery Logs
GET /deliveries
GET /deliveries?eventId=xxx
GET /deliveries?status=failed

### Replay a Failed Delivery
POST /deliveries/:id/replay

### Billing
GET  /billing/plans
GET  /billing/usage
POST /billing/order    — { "plan": "pro" }
POST /billing/verify   — verify Razorpay payment

### Queue Dashboard
http://localhost:3000/admin/queues

---

## Webhook Signature Verification

Every delivery includes an `X-HookLine-Signature` header. Verify it on your server:

```js
const crypto = require('crypto')

const verifySignature = (payload, signature, secret) => {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
  return `sha256=${expected}` === signature
}
```

---

## Deployment

```bash
# Build and run everything on a VPS
docker compose -f docker-compose.prod.yml up -d
```

Runs four containers: MongoDB, Redis, API server, Worker.

---

## Environment Variables
PORT=3000
MONGO_URI=mongodb://localhost:27017/hookline
REDIS_HOST=localhost
REDIS_PORT=6379
API_KEY_SECRET=your_secret
HMAC_SECRET=your_hmac_secret
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
CLIENT_URL=http://localhost:3000

---

Built by Rahul Singh — [LinkedIn](https://linkedin.com/in/rahulsingh-dev01)