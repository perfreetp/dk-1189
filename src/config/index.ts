export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'luggage-smart-secret-key-2024',
  jwtExpiresIn: '7d',
  bcryptSaltRounds: 10
};
