import { RiskAlert } from '../types';

interface DocumentInfo {
  type: string;
  expiryDate?: Date;
  issueDate?: Date;
}

export class ReminderService {
  checkDocumentExpiration(documents: DocumentInfo[]): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    const now = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(now.getMonth() + 6);
    
    for (const doc of documents) {
      if (doc.expiryDate) {
        const expiry = new Date(doc.expiryDate);
        
        if (expiry < now) {
          alerts.push({
            type: 'danger',
            category: '证件过期',
            item: doc.type,
            message: `${doc.type}已过期`,
            suggestion: '请立即更新或续办相关证件'
          });
        } else if (expiry < sixMonthsLater) {
          const monthsLeft = this.getMonthsDifference(now, expiry);
          alerts.push({
            type: 'warning',
            category: '证件临期',
            item: doc.type,
            message: `${doc.type}将在${monthsLeft}个月后过期（${this.formatDate(expiry)}）`,
            suggestion: '部分国家要求护照有效期至少6个月，建议考虑更新'
          });
        }
      }
    }
    
    return alerts;
  }

  checkLiquidRestrictions(items: Array<{
    name: string;
    isLiquid?: boolean;
    quantity?: number;
    weight?: number;
  }>, transport: string): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    
    if (transport !== 'plane') {
      return alerts;
    }
    
    const liquidItems = items.filter(item => item.isLiquid);
    const oversizedLiquids = liquidItems.filter(
      item => (item.quantity || 1) > 1 || (item.weight || 0) > 0.1
    );
    
    if (oversizedLiquids.length > 0) {
      alerts.push({
        type: 'warning',
        category: '液体限制',
        item: oversizedLiquids.map(i => i.name).join(', '),
        message: `${oversizedLiquids.length}件液体物品可能超过100ml限制`,
        suggestion: '航空公司规定：单瓶液体不超过100ml，总量不超过1L，需装在透明可封口袋中'
      });
    }
    
    const totalLiquidWeight = liquidItems.reduce(
      (sum, item) => sum + (item.weight || 0) * (item.quantity || 1),
      0
    );
    
    if (totalLiquidWeight > 1) {
      alerts.push({
        type: 'danger',
        category: '液体超量',
        item: '所有液体物品',
        message: `预估液体总量约${totalLiquidWeight.toFixed(2)}kg，超过1L限制`,
        suggestion: '建议减少液体物品数量，或将大瓶换成旅行装（≤100ml）'
      });
    }
    
    return alerts;
  }

  getPreTripReminder(daysUntilTrip: number, items: Array<{
    name: string;
    priority: string;
    isPacked?: boolean;
  }>): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    
    if (daysUntilTrip <= 0) {
      return alerts;
    }
    
    if (daysUntilTrip <= 1) {
      const unpackedRequired = items.filter(
        item => item.priority === 'required' && !item.isPacked
      );
      
      if (unpackedRequired.length > 0) {
        alerts.push({
          type: 'danger',
          category: '紧急提醒',
          item: unpackedRequired.map(i => i.name).join(', '),
          message: '明天出发，这些必带物品还未打包！',
          suggestion: '立即打包所有必带物品！'
        });
      }
      
      alerts.push({
        type: 'info',
        category: '出发检查',
        item: '出发前清单',
        message: '最后检查：证件、手机、钱包、钥匙、充电器',
        suggestion: '确认所有重要物品已打包，闹钟已设置'
      });
    }
    
    if (daysUntilTrip <= 3) {
      const unpackedRecommended = items.filter(
        item => item.priority === 'recommended' && !item.isPacked
      );
      
      if (unpackedRecommended.length > 0) {
        alerts.push({
          type: 'warning',
          category: '临行提醒',
          item: `${unpackedRecommended.length}件推荐物品未打包`,
          message: '距离出发还有3天，建议开始打包',
          suggestion: '可以先打包不易变质的物品，如衣物、书籍等'
        });
      }
    }
    
    if (daysUntilTrip <= 7) {
      const unpackedOptional = items.filter(
        item => item.priority === 'optional' && !item.isPacked
      );
      
      if (unpackedOptional.length > 0) {
        alerts.push({
          type: 'info',
          category: '准备提醒',
          item: `${unpackedOptional.length}件可选物品`,
          message: '距离出发还有一周，可以开始准备',
          suggestion: '建议提前购买需要准备的东西，留出时间整理行李'
        });
      }
    }
    
    return alerts;
  }

  getReturnTripReminder(items: Array<{
    name: string;
    category: string;
    isPacked?: boolean;
  }>): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    
    const unpackedItems = items.filter(item => !item.isPacked);
    
    if (unpackedItems.length > 0) {
      alerts.push({
        type: 'warning',
        category: '返程提醒',
        item: unpackedItems.map(i => i.name).join(', '),
        message: `${unpackedItems.length}件物品尚未打包`,
        suggestion: '返程时请确保所有物品都已打包，尤其是纪念品和礼物'
      });
    }
    
    const liquidItems = items.filter(
      item => item.category === '洗漱类' || item.isPacked
    );
    
    if (liquidItems.length > 0) {
      alerts.push({
        type: 'info',
        category: '返程液体提醒',
        item: '洗漱用品',
        message: '返程时请检查液体物品是否符合航空规定',
        suggestion: '确保所有液体≤100ml，装在透明塑料袋中'
      });
    }
    
    return alerts;
  }

  private getMonthsDifference(date1: Date, date2: Date): number {
    const months = (date2.getFullYear() - date1.getFullYear()) * 12;
    return months + date2.getMonth() - date1.getMonth();
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

export default new ReminderService();
