# Xeno CRM

A modern Customer Relationship Management (CRM) system built with TypeScript, featuring AI-powered campaign management and customer segmentation.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Google OAuth integration
  - Role-based access control
  - Session management with Prisma Session Store

- **Campaign Management**
  - Create and manage marketing campaigns
  - AI-powered message generation
  - Campaign statistics and analytics
  - Real-time delivery status tracking

- **Customer Segmentation**
  - Dynamic customer segmentation
  - Rule-based segment creation
  - Customer profile management
  - Segment-based campaign targeting

- **AI Integration**
  - Smart message generation
  - Campaign optimization suggestions
  - Customer behavior analysis
  - Automated content recommendations

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT, Passport.js
- **API Documentation**: Swagger
- **Testing**: Jest
- **Logging**: Winston
- **Monitoring**: Prometheus & Grafana

### Frontend
- **Framework**: React
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI
- **Form Handling**: React Hook Form
- **API Client**: Axios
- **Testing**: React Testing Library

## 📦 Project Structure

```
xeno-crm/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Application entry point
│   ├── prisma/             # Database schema and migrations
│   ├── tests/              # Test files
│   └── postman/            # API collection
└── frontend/               # frontend
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v13 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hemannshu/xeno-crm.git
cd xeno-crm
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/xeno_crm"
JWT_SECRET="your-secret-key"
SESSION_SECRET="your-session-secret"
FRONTEND_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### API Documentation
Access the API documentation at `http://localhost:3001/api-docs`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/session` - Check session status

### Campaigns
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/campaigns/:id/stats` - Get campaign statistics

### Segments
- `GET /api/segments` - List all segments
- `POST /api/segments` - Create new segment
- `GET /api/segments/:id` - Get segment details
- `PUT /api/segments/:id` - Update segment
- `DELETE /api/segments/:id` - Delete segment

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer details
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### AI Features
- `POST /api/ai/generate-message` - Generate campaign message
- `POST /api/ai/analyze-campaign` - Analyze campaign performance

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation
- SQL injection prevention (via Prisma)
- XSS protection
- Session management

## 📊 Monitoring

The application includes:
- Request logging
- Error tracking
- Performance monitoring
- Database query logging
- API usage statistics

Access monitoring dashboard at `http://localhost:3001/monitoring`

## 🚀 Deployment

### Backend Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy the backend:
```bash
cd backend
vercel
```

4. Set up environment variables in Vercel dashboard:
- Go to your project settings
- Add the following environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `SESSION_SECRET`
  - `FRONTEND_URL`
  - `NODE_ENV=production`

### Frontend Deployment (Vercel)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set up environment variables in Vercel dashboard:
- `REACT_APP_API_URL` (your backend URL)
- `REACT_APP_ENV=production`

### Database Setup

For production, you'll need a hosted MySQL database. Options include:
- PlanetScale
- AWS RDS
- DigitalOcean Managed Databases

Update your `DATABASE_URL` in Vercel environment variables with your production database URL.

### Important Notes

1. Make sure your database allows connections from Vercel's IP ranges
2. Update CORS settings in your backend to allow requests from your frontend domain
3. Set up proper SSL certificates for secure connections
4. Configure proper error logging and monitoring for production

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Authors

-Himanshu Sharma - Initial work

