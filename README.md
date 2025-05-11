# Xeno Mini CRM Platform

A modern CRM platform built with Spring Boot and Next.js, featuring AI-powered campaign management and customer segmentation.

## Features

- Customer and Order Data Management
- AI-Powered Campaign Creation
- Dynamic Customer Segmentation
- Campaign Delivery and Analytics
- Google OAuth Authentication
- Natural Language to Segment Rules
- AI-Driven Message Suggestions
- Campaign Performance Analytics

## Tech Stack

### Backend
- Spring Boot 3.x
- Spring Security with OAuth2
- Apache Kafka
- MySQL
- JUnit & Mockito
- Swagger/OpenAPI

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React DnD
- Chart.js

### AI Integration
- OpenAI GPT API
- Google Vision API

## Project Structure

```
xeno/
├── backend/           # Spring Boot application
├── frontend/         # Next.js application
└── docs/            # Documentation
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0
- Apache Kafka
- OpenAI API key
- Google OAuth credentials

### Backend Setup
1. Navigate to the backend directory
2. Configure application.properties with your database and OAuth credentials
3. Run `./mvnw spring-boot:run`

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development server: `npm run dev`

## API Documentation
API documentation is available at `/swagger-ui.html` when running the backend server.

## License
MIT 