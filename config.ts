export const config = {
  api: {
    baseUrl: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/api'
  },
  app: {
    name: 'Urban Frame'
  }
};