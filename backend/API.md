# Xeno CRM API Documentation

## Authentication

### Google OAuth Login
```http
GET /api/auth/google
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

## Customers

### Create Customer
```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

### Get All Customers
```http
GET /api/customers
Authorization: Bearer <token>
```

## Campaigns

### Create Campaign
```http
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Sale",
  "message": "Get 20% off on summer collection!",
  "segmentId": "<segment-id>"
}
```

### Get Campaign Stats
```http
GET /api/campaigns/:id/stats
Authorization: Bearer <token>
```

## Segments

### Create Segment
```http
POST /api/segments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "High Value Customers",
  "rules": {
    "operator": "AND",
    "conditions": [
      {
        "field": "totalSpent",
        "operator": ">",
        "value": 1000
      }
    ]
  }
}
```

## AI Features

### Generate Message
```http
POST /api/ai/generate-message
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Create a message for inactive customers"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per IP address.

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-token>
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: MySQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `FRONTEND_URL`: Frontend application URL 