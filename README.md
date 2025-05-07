# Xeno CRM Platform

A modern CRM platform with AI-powered features for customer segmentation and campaign management.

## Features

- 🔍 Dynamic Customer Segmentation
- 📊 Campaign Management
- 📈 Delivery Analytics
- 🤖 AI-Powered Features
- 🔐 Google OAuth Authentication

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Query
- Zustand (State Management)

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma (ORM)
- PostgreSQL

### AI Integration
- OpenAI API
- LangChain

### Infrastructure
- Docker
- GitHub Actions (CI/CD)
- Vercel (Frontend Deployment)
- Railway (Backend Deployment)

## Project Structure

```
xeno-crm/
├── frontend/           # Next.js frontend application
├── backend/           # Node.js backend application
├── docs/             # Project documentation
└── docker/           # Docker configuration files
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Local Development Setup

1. Clone the repository
```bash
git clone https://github.com/Hemannshu/xeno-crm-project.git
cd xeno-crm
```

2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

3. Backend Setup
```bash
cd backend
npm install
npm run dev
```

4. Environment Variables
Create `.env` files in both frontend and backend directories following the `.env.example` templates.

## API Documentation

API documentation is available at `/api-docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenAI for AI capabilities
- Next.js team for the amazing framework
- All contributors who participate in this project 