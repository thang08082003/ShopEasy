const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopEasy API',
      version: '1.0.0',
      description: 'ShopEasy E-commerce REST API documentation',
      contact: {
        name: 'API Support',
        email: 'support@shopeasy.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.shopeasy.com' 
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' 
          ? 'Production Server' 
          : 'Development Server'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication operations' },
      { name: 'Products', description: 'Product operations' },
      { name: 'Categories', description: 'Category operations' },
      { name: 'Cart', description: 'Shopping cart operations' },
      { name: 'Orders', description: 'Order operations' },
      { name: 'Reviews', description: 'Product review operations' },
      { name: 'Payments', description: 'Payment processing operations' },
      { name: 'Wishlist', description: 'Wishlist operations' },
      { name: 'Coupons', description: 'Coupon operations' },
      { name: 'Analytics', description: 'Data analytics operations' },
      { name: 'System', description: 'System operations' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            salePrice: { type: 'number' },
            category: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            stock: { type: 'integer' },
            ratings: {
              type: 'object',
              properties: {
                average: { type: 'number' },
                count: { type: 'integer' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        // Add other schema definitions here...
      }
    },
    security: [
      { bearerAuth: [] }
    ]
  },
  apis: ['./routes/*.js', './swagger/*.js'] // Path to the API docs
};

const specs = swaggerJsDoc(options);

module.exports = specs;
