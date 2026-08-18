import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production';

export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
