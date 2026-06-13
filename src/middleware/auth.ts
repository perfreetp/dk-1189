import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthRequest, ApiResponse } from '../types';

export const authMiddleware = (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未提供认证令牌'
        }
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: '无效或过期的认证令牌'
      }
    });
  }
};
