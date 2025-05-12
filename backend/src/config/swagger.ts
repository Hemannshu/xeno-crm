import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno CRM API Documentation',
      version: '1.0.0',
      description: 'API documentation for Xeno CRM Platform',
      contact: {
        name: 'API Support',
        email: 'support@xeno-crm.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        googleAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: '/api/auth/google',
              tokenUrl: '/api/auth/google/callback',
              scopes: {
                'profile': 'Access user profile',
                'email': 'Access user email'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options); 