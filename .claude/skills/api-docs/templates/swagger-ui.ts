import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '{{apiName}}',
      version: '1.0.0',
      description: 'API documentation generated from code comments',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://api.example.com', description: 'Production' },
    ],
  },
  apis: [
    './src/routes/*.ts',        // Route files with JSDoc comments
    './src/controllers/*.ts',    // Controller files
    './docs/**/*.yaml',          // Manual YAML docs
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: any) {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./swagger-spec.json');

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: '{{apiName}} API Docs',
    })
  );
}
