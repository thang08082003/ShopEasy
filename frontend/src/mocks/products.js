/**
 * Mock products data for development and testing
 */
const mockProducts = [
  {
    _id: '60d21b4667d0d8992e610c85',
    name: 'Smartphone X Pro',
    description: 'Latest flagship smartphone with high-end specs and an amazing camera.',
    price: 999.99,
    salePrice: 899.99,
    category: {
      _id: '60d21b4667d0d8992e610c75',
      name: 'Electronics'
    },
    stock: 50,
    images: [
      'https://via.placeholder.com/500x500?text=Smartphone+X+Pro'
    ],
    ratings: {
      average: 4.7,
      count: 128
    }
  },
  {
    _id: '60d21b4667d0d8992e610c86',
    name: 'Laptop Ultra',
    description: 'Thin and light laptop with powerful performance for professionals.',
    price: 1299.99,
    salePrice: 0,
    category: {
      _id: '60d21b4667d0d8992e610c75',
      name: 'Electronics'
    },
    stock: 25,
    images: [
      'https://via.placeholder.com/500x500?text=Laptop+Ultra'
    ],
    ratings: {
      average: 4.5,
      count: 96
    }
  },
  {
    _id: '60d21b4667d0d8992e610c87',
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with noise cancellation and long battery life.',
    price: 249.99,
    salePrice: 199.99,
    category: {
      _id: '60d21b4667d0d8992e610c75',
      name: 'Electronics'
    },
    stock: 100,
    images: [
      'https://via.placeholder.com/500x500?text=Wireless+Headphones'
    ],
    ratings: {
      average: 4.8,
      count: 215
    }
  },
  {
    _id: '60d21b4667d0d8992e610c88',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking and notifications.',
    price: 199.99,
    salePrice: 0,
    category: {
      _id: '60d21b4667d0d8992e610c76',
      name: 'Wearables'
    },
    stock: 75,
    images: [
      'https://via.placeholder.com/500x500?text=Smart+Watch'
    ],
    ratings: {
      average: 4.3,
      count: 142
    }
  },
  {
    _id: '60d21b4667d0d8992e610c89',
    name: 'Gaming Console',
    description: 'Next-generation gaming console with 4K capabilities.',
    price: 499.99,
    salePrice: 0,
    category: {
      _id: '60d21b4667d0d8992e610c77',
      name: 'Gaming'
    },
    stock: 30,
    images: [
      'https://via.placeholder.com/500x500?text=Gaming+Console'
    ],
    ratings: {
      average: 4.9,
      count: 87
    }
  }
];

export default mockProducts;
