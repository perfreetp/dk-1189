import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { config } from '../config';
import { UserProfile } from '../types';

export class AuthService {
  async register(email: string, password: string, name: string): Promise<{
    user: UserProfile;
    token: string;
  }> {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('该邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token
    };
  }

  async login(email: string, password: string): Promise<{
    user: UserProfile;
    token: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('邮箱或密码错误');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      },
      token
    };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('用户不存在');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };
  }
}

export default new AuthService();
