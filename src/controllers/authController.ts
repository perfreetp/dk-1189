import { Response } from 'express';
import authService from '../services/authService';
import { AuthRequest, ApiResponse } from '../types';
import { registerSchema, loginSchema } from '../utils/validation';

export class AuthController {
  async register(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(
        validatedData.email,
        validatedData.password,
        validatedData.name
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message || '注册失败'
        }
      });
    }
  }

  async login(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(
        validatedData.email,
        validatedData.password
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message || '登录失败'
        }
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const user = await authService.getProfile(req.userId!);

      res.json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: error.message || '获取用户信息失败'
        }
      });
    }
  }
}

export default new AuthController();
