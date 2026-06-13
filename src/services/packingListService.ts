import prisma from '../utils/prisma';
import listGenerationService from './listGenerationService';
import analysisService from './analysisService';
import reminderService from './reminderService';
import {
  GenerateParams,
  PackingListResponse,
  PackingItemInput,
  Companion
} from '../types';

export class PackingListService {
  async generateList(userId: string, params: GenerateParams): Promise<PackingListResponse> {
    const items = listGenerationService.generatePackingList(params);
    
    const name = `${params.destination}旅行(${params.days}天)`;
    
    const packingList = await prisma.packingList.create({
      data: {
        userId,
        name,
        destination: params.destination,
        days: params.days,
        season: params.season,
        transport: params.transport,
        accommodation: params.accommodation,
        companions: JSON.stringify(params.companions),
        generatedItems: JSON.stringify(items),
        customItems: '[]',
        isCompleted: false
      }
    });

    return this.formatResponse(packingList);
  }

  async getAllLists(userId: string): Promise<PackingListResponse[]> {
    const lists = await prisma.packingList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return lists.map(list => this.formatResponse(list));
  }

  async getListById(listId: string, userId: string): Promise<PackingListResponse> {
    const list = await prisma.packingList.findFirst({
      where: {
        id: listId,
        OR: [
          { userId },
          { sharedWith: { some: { sharedWith: userId } } }
        ]
      }
    });

    if (!list) {
      throw new Error('清单不存在或无权访问');
    }

    return this.formatResponse(list);
  }

  async updateList(
    listId: string, 
    userId: string, 
    data: { name?: string; isCompleted?: boolean }
  ): Promise<PackingListResponse> {
    const list = await prisma.packingList.findFirst({
      where: {
        id: listId,
        userId
      }
    });

    if (!list) {
      throw new Error('清单不存在或无权修改');
    }

    const updatedList = await prisma.packingList.update({
      where: { id: listId },
      data: {
        name: data.name || list.name,
        isCompleted: data.isCompleted !== undefined ? data.isCompleted : list.isCompleted
      }
    });

    return this.formatResponse(updatedList);
  }

  async deleteList(listId: string, userId: string): Promise<void> {
    const list = await prisma.packingList.findFirst({
      where: {
        id: listId,
        userId
      }
    });

    if (!list) {
      throw new Error('清单不存在或无权删除');
    }

    await prisma.packingList.delete({
      where: { id: listId }
    });
  }

  async addCustomItem(
    listId: string,
    userId: string,
    item: PackingItemInput,
    permission?: 'view' | 'edit'
  ): Promise<PackingListResponse> {
    const list = await prisma.packingList.findFirst({
      where: {
        id: listId,
        OR: [
          { userId },
          { sharedWith: { some: { sharedWith: userId } } }
        ]
      }
    });

    if (!list) {
      throw new Error('清单不存在或无权访问');
    }

    if (permission === 'view') {
      throw new Error('当前权限无法添加物品');
    }

    const customItems = JSON.parse(list.customItems) as PackingItemInput[];
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newItem: PackingItemInput = {
      ...item,
      id,
      isPacked: false
    };
    
    customItems.push(newItem);

    const updatedList = await prisma.packingList.update({
      where: { id: listId },
      data: {
        customItems: JSON.stringify(customItems)
      }
    });

    return this.formatResponse(updatedList);
  }

  async updateItem(
    listId: string,
    userId: string,
    itemId: string,
    updates: { isPacked?: boolean; quantity?: number; note?: string; priority?: string; expiryDate?: string },
    permission?: 'view' | 'edit'
  ): Promise<PackingListResponse> {
    const list = await prisma.packingList.findFirst({
      where: {
        id: listId,
        OR: [
          { userId },
          { sharedWith: { some: { sharedWith: userId } } }
        ]
      }
    });

    if (!list) {
      throw new Error('清单不存在或无权访问');
    }

    if (permission === 'view') {
      throw new Error('当前权限无法修改物品');
    }

    const generatedItems = JSON.parse(list.generatedItems) as PackingItemInput[];
    const customItems = JSON.parse(list.customItems) as PackingItemInput[];
    
    let itemFound = false;
    let updatedItems: PackingItemInput[];
    
    const genIndex = generatedItems.findIndex(item => item.id === itemId);
    if (genIndex !== -1) {
      generatedItems[genIndex] = { ...generatedItems[genIndex], ...updates };
      itemFound = true;
      updatedItems = generatedItems;
    } else {
      const custIndex = customItems.findIndex(item => item.id === itemId);
      if (custIndex !== -1) {
        customItems[custIndex] = { ...customItems[custIndex], ...updates };
        itemFound = true;
        updatedItems = customItems;
      }
    }

    if (!itemFound) {
      throw new Error('物品不存在');
    }

    const updatedList = await prisma.packingList.update({
      where: { id: listId },
      data: {
        generatedItems: JSON.stringify(generatedItems),
        customItems: JSON.stringify(customItems)
      }
    });

    return this.formatResponse(updatedList);
  }

  async deleteItem(
    listId: string,
    userId: string,
    itemId: string
  ): Promise<PackingListResponse> {
    const list = await prisma.packingList.findFirst({
      where: {
        id: listId,
        userId
      }
    });

    if (!list) {
      throw new Error('清单不存在或无权修改');
    }

    const customItems = JSON.parse(list.customItems) as PackingItemInput[];
    const filteredItems = customItems.filter(item => item.id !== itemId);

    if (filteredItems.length === customItems.length) {
      throw new Error('只能删除自定义物品');
    }

    const updatedList = await prisma.packingList.update({
      where: { id: listId },
      data: {
        customItems: JSON.stringify(filteredItems)
      }
    });

    return this.formatResponse(updatedList);
  }

  async getAnalysis(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    const params = {
      days: list.days,
      transport: list.transport,
      season: list.season,
      companions: list.companions
    };

    return analysisService.generateAnalysisReport(list.items, params);
  }

  async getWeightEstimate(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    return analysisService.estimateWeight(list.items);
  }

  async getRisks(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    const params = {
      days: list.days,
      transport: list.transport,
      season: list.season,
      companions: list.companions
    };
    return analysisService.detectRisks(list.items, params);
  }

  async getShoppingList(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    return analysisService.generateShoppingList(list.items);
  }

  async getReturnPackingList(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    return analysisService.generateReturnPackingList(list.items, list.days);
  }

  async getAirlineTips(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    return analysisService.getAirlineTips(list.transport);
  }

  async getDocumentReminders(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    const documents = list.items
      .filter(item => item.category === '证件类')
      .map(item => ({
        id: item.id,
        type: item.name,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined
      }));
    return reminderService.checkDocumentExpiration(documents);
  }

  async getLiquidReminders(listId: string, userId: string) {
    const list = await this.getListById(listId, userId);
    return reminderService.checkLiquidRestrictions(list.items, list.transport);
  }

  async shareList(
    listId: string,
    userId: string,
    sharedWith: string,
    permission: 'view' | 'edit'
  ): Promise<void> {
    const list = await prisma.packingList.findFirst({
      where: {
        id: listId,
        userId
      }
    });

    if (!list) {
      throw new Error('清单不存在或无权共享');
    }

    const existingShare = await prisma.sharedList.findFirst({
      where: {
        packingListId: listId,
        sharedWith
      }
    });

    if (existingShare) {
      await prisma.sharedList.update({
        where: { id: existingShare.id },
        data: { permission }
      });
    } else {
      await prisma.sharedList.create({
        data: {
          packingListId: listId,
          sharedBy: userId,
          sharedWith,
          permission
        }
      });
    }
  }

  async getSharedLists(userId: string): Promise<any[]> {
    const sharedLists = await prisma.sharedList.findMany({
      where: { sharedWith: userId },
      include: { 
        packingList: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return sharedLists.map(share => ({
      shareId: share.id,
      permission: share.permission,
      sharedBy: share.packingList.user,
      list: this.formatResponse(share.packingList)
    }));
  }

  async getUserPermission(listId: string, userId: string): Promise<'owner' | 'edit' | 'view' | null> {
    const list = await prisma.packingList.findFirst({
      where: { id: listId }
    });

    if (!list) {
      return null;
    }

    if (list.userId === userId) {
      return 'owner';
    }

    const share = await prisma.sharedList.findFirst({
      where: {
        packingListId: listId,
        sharedWith: userId
      }
    });

    if (!share) {
      return null;
    }

    return share.permission as 'view' | 'edit';
  }

  async updateDocumentExpiry(
    listId: string,
    userId: string,
    documentId: string,
    expiryDate: string,
    permission?: 'view' | 'edit'
  ): Promise<PackingListResponse> {
    return this.updateItem(listId, userId, documentId, { expiryDate }, permission);
  }

  async unshareList(shareId: string, userId: string): Promise<void> {
    const share = await prisma.sharedList.findFirst({
      where: {
        id: shareId,
        sharedWith: userId
      }
    });

    if (!share) {
      throw new Error('共享记录不存在或无权取消');
    }

    await prisma.sharedList.delete({
      where: { id: shareId }
    });
  }

  async reuseList(listId: string, userId: string, newParams?: Partial<GenerateParams>): Promise<PackingListResponse> {
    const originalList = await this.getListById(listId, userId);
    
    const params: GenerateParams = {
      destination: newParams?.destination || originalList.destination,
      days: newParams?.days || originalList.days,
      season: (newParams?.season || originalList.season) as any,
      transport: (newParams?.transport || originalList.transport) as any,
      accommodation: (newParams?.accommodation || originalList.accommodation) as any,
      companions: newParams?.companions || originalList.companions
    };

    return this.generateList(userId, params);
  }

  private formatResponse(list: any): PackingListResponse {
    const generatedItems = JSON.parse(list.generatedItems) as PackingItemInput[];
    const customItems = JSON.parse(list.customItems) as PackingItemInput[];
    const companions = JSON.parse(list.companions) as Companion[];

    return {
      id: list.id,
      name: list.name,
      destination: list.destination,
      days: list.days,
      season: list.season,
      transport: list.transport,
      accommodation: list.accommodation,
      companions,
      items: [...generatedItems, ...customItems],
      isCompleted: list.isCompleted,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt
    };
  }
}

export default new PackingListService();
