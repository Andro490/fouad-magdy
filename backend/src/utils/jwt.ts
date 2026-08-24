import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const getJwtSecret = () => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return JWT_SECRET;
};

export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, getJwtSecret(), {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, getJwtSecret());
};
