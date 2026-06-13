import { Response } from 'express';
import packingListService from '../services/packingListService';
import { AuthRequest, ApiResponse } from '../types';
import {
  generateListSchema,
  updateListSchema,
  addItemSchema,
  updateItemSchema,
  shareListSchema,
  updateDocumentSchema
} from '../utils/validation';

export class PackingListController {
  async generateList(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const validatedData = generateListSchema.parse(req.body);
      const result = await packingListService.generateList(req.userId!, validatedData);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'GENERATION_FAILED',
          message: error.message || '生成清单失败'
        }
      });
    }
  }

  async getAllLists(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const lists = await packingListService.getAllLists(req.userId!);

      res.json({
        success: true,
        data: lists
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error.message || '获取清单列表失败'
        }
      });
    }
  }

  async getListById(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const list = await packingListService.getListById(id, req.userId!);

      res.json({
        success: true,
        data: list
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'LIST_NOT_FOUND',
          message: error.message || '清单不存在'
        }
      });
    }
  }

  async updateList(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateListSchema.parse(req.body);
      const result = await packingListService.updateList(id, req.userId!, validatedData);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error.message || '更新清单失败'
        }
      });
    }
  }

  async deleteList(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      await packingListService.deleteList(id, req.userId!);

      res.json({
        success: true,
        data: { message: '清单已删除' }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error.message || '删除清单失败'
        }
      });
    }
  }

  async addItem(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = addItemSchema.parse(req.body);
      const permission = await packingListService.getUserPermission(id, req.userId!);
      const result = await packingListService.addCustomItem(id, req.userId!, validatedData, permission || 'view');

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'ADD_ITEM_FAILED',
          message: error.message || '添加物品失败'
        }
      });
    }
  }

  async updateItem(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id, itemId } = req.params;
      const validatedData = updateItemSchema.parse(req.body);
      const permission = await packingListService.getUserPermission(id, req.userId!);
      const result = await packingListService.updateItem(id, req.userId!, itemId, validatedData, permission || 'view');

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_ITEM_FAILED',
          message: error.message || '更新物品失败'
        }
      });
    }
  }

  async deleteItem(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id, itemId } = req.params;
      const result = await packingListService.deleteItem(id, req.userId!, itemId);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_ITEM_FAILED',
          message: error.message || '删除物品失败'
        }
      });
    }
  }

  async getAnalysis(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getAnalysis(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error.message || '获取分析报告失败'
        }
      });
    }
  }

  async getWeightEstimate(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getWeightEstimate(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'WEIGHT_ESTIMATE_FAILED',
          message: error.message || '获取重量估算失败'
        }
      });
    }
  }

  async getRisks(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getRisks(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'RISKS_FETCH_FAILED',
          message: error.message || '获取风险提醒失败'
        }
      });
    }
  }

  async getShoppingList(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getShoppingList(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SHOPPING_LIST_FAILED',
          message: error.message || '获取购买清单失败'
        }
      });
    }
  }

  async getReturnPackingList(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getReturnPackingList(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'RETURN_LIST_FAILED',
          message: error.message || '获取返程清单失败'
        }
      });
    }
  }

  async getAirlineTips(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getAirlineTips(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'AIRLINE_TIPS_FAILED',
          message: error.message || '获取航司提示失败'
        }
      });
    }
  }

  async shareList(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = shareListSchema.parse(req.body);
      await packingListService.shareList(id, req.userId!, validatedData.sharedWith, validatedData.permission);

      res.json({
        success: true,
        data: { message: '清单已共享' }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'SHARE_FAILED',
          message: error.message || '共享清单失败'
        }
      });
    }
  }

  async getSharedLists(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const lists = await packingListService.getSharedLists(req.userId!);

      res.json({
        success: true,
        data: lists
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SHARED_FAILED',
          message: error.message || '获取共享清单失败'
        }
      });
    }
  }

  async unshareList(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { shareId } = req.params;
      await packingListService.unshareList(shareId, req.userId!);

      res.json({
        success: true,
        data: { message: '已取消共享' }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UNSHARE_FAILED',
          message: error.message || '取消共享失败'
        }
      });
    }
  }

  async reuseList(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const newParams = req.body;
      const result = await packingListService.reuseList(id, req.userId!, newParams);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'REUSE_FAILED',
          message: error.message || '复用清单失败'
        }
      });
    }
  }

  async getDocumentReminders(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getDocumentReminders(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'DOCUMENT_REMINDERS_FAILED',
          message: error.message || '获取证件提醒失败'
        }
      });
    }
  }

  async getLiquidReminders(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getLiquidReminders(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'LIQUID_REMINDERS_FAILED',
          message: error.message || '获取液体提醒失败'
        }
      });
    }
  }

  async getPermission(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const permission = await packingListService.getUserPermission(id, req.userId!);

      res.json({
        success: true,
        data: { permission }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: error.message || '获取权限失败'
        }
      });
    }
  }

  async updateDocumentExpiry(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateDocumentSchema.parse(req.body);
      const permission = await packingListService.getUserPermission(id, req.userId!);
      const result = await packingListService.updateDocumentExpiry(
        id, 
        req.userId!, 
        validatedData.documentId, 
        validatedData.expiryDate,
        permission || 'view'
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'UPDATE_DOCUMENT_FAILED',
          message: error.message || '更新证件有效期失败'
        }
      });
    }
  }

  async getActivityLogs(req: AuthRequest, res: Response<ApiResponse>): Promise<void> {
    try {
      const { id } = req.params;
      const result = await packingListService.getActivityLogs(id, req.userId!);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'ACTIVITY_LOGS_FAILED',
          message: error.message || '获取活动日志失败'
        }
      });
    }
  }
}

export default new PackingListController();
