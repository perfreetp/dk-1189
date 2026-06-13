import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(6, '密码至少6个字符'),
  name: z.string().min(1, '姓名不能为空')
});

export const loginSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(1, '密码不能为空')
});

export const companionSchema = z.object({
  type: z.enum(['adult', 'child', 'infant']),
  count: z.number().int().positive()
});

export const generateListSchema = z.object({
  destination: z.string().min(1, '目的地不能为空'),
  days: z.number().int().positive().max(365, '天数不能超过365天'),
  season: z.enum(['spring', 'summer', 'autumn', 'winter']),
  transport: z.enum(['plane', 'train', 'car', 'ship']),
  accommodation: z.enum(['hotel', 'hostel', 'camping', 'homestay']),
  companions: z.array(companionSchema).min(1, '至少需要一位同行人'),
  name: z.string().optional()
});

export const updateListSchema = z.object({
  name: z.string().optional(),
  isCompleted: z.boolean().optional()
});

export const addItemSchema = z.object({
  name: z.string().min(1, '物品名称不能为空'),
  category: z.string().min(1, '分类不能为空'),
  priority: z.enum(['required', 'recommended', 'optional']).default('recommended'),
  weight: z.number().positive().optional(),
  isLiquid: z.boolean().default(false),
  quantity: z.number().int().positive().default(1)
});

export const updateItemSchema = z.object({
  isPacked: z.boolean().optional(),
  quantity: z.number().int().positive().optional(),
  note: z.string().optional(),
  priority: z.enum(['required', 'recommended', 'optional']).optional(),
  expiryDate: z.string().optional()
});

export const updateDocumentSchema = z.object({
  documentId: z.string().min(1, '证件ID不能为空'),
  expiryDate: z.string().min(1, '有效期不能为空')
});

export const shareListSchema = z.object({
  sharedWith: z.string().email('请提供有效的邮箱地址'),
  permission: z.enum(['view', 'edit']).default('view')
});
