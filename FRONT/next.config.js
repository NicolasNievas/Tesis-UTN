module.exports = {
  images: {
    domains: ['*'], // Esto no es recomendado
    // O usar remotePatterns con un patrón más permisivo
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};