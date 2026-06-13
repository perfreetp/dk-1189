import { RiskAlert } from '../types';

interface DocumentInfo {
  id?: string;
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
        const monthsLeft = this.getMonthsDifference(now, expiry);
        
        if (expiry < now) {
          const suggestions = this.getExpiredSuggestion(doc.type);
          alerts.push({
            type: 'danger',
            category: '证件过期',
            item: doc.type,
            message: `${doc.type}已于${this.formatDate(expiry)}过期`,
            suggestion: suggestions
          });
        } else if (monthsLeft <= 0) {
          alerts.push({
            type: 'danger',
            category: '证件过期',
            item: doc.type,
            message: `${doc.type}已过期`,
            suggestion: this.getExpiredSuggestion(doc.type)
          });
        } else if (monthsLeft < 6) {
          const suggestions = this.getExpiringSuggestion(doc.type, monthsLeft);
          alerts.push({
            type: 'warning',
            category: '证件临期',
            item: doc.type,
            message: `${doc.type}将在${monthsLeft}个月后过期（${this.formatDate(expiry)}）`,
            suggestion: suggestions
          });
        } else if (monthsLeft < 12) {
          alerts.push({
            type: 'info',
            category: '证件提示',
            item: doc.type,
            message: `${doc.type}剩余有效期约${monthsLeft}个月`,
            suggestion: '建议在有效期到期前3个月申请续办，以免影响出行'
          });
        }
      }
    }
    
    return alerts;
  }

  checkInternationalTravelDocuments(
    documents: DocumentInfo[], 
    destination: string
  ): RiskAlert[] {
    const alerts: RiskAlert[] = [];
    const isInternational = this.isInternationalDestination(destination);
    
    if (!isInternational) {
      return alerts;
    }

    const passport = documents.find(d => d.type.includes('护照'));
    const visa = documents.find(d => d.type.includes('签证'));
    
    const now = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(now.getMonth() + 6);

    if (!passport) {
      alerts.push({
        type: 'danger',
        category: '证件缺失',
        item: '护照',
        message: '国际旅行需要护照',
        suggestion: '请确认已办理护照，并确保有效期不少于6个月'
      });
    } else if (passport.expiryDate) {
      const expiry = new Date(passport.expiryDate);
      const monthsLeft = this.getMonthsDifference(now, expiry);
      
      if (expiry < now) {
        alerts.push({
          type: 'danger',
          category: '护照过期',
          item: '护照',
          message: `护照已于${this.formatDate(expiry)}过期`,
          suggestion: '请立即前往出入境管理局申请换发新护照，通常需要7-10个工作日'
        });
      } else if (monthsLeft < 6) {
        alerts.push({
          type: 'danger',
          category: '护照有效期不足',
          item: '护照',
          message: `护照有效期仅剩余${monthsLeft}个月`,
          suggestion: `
            【重要】大多数国家要求入境时护照有效期至少6个月
            建议立即办理护照换发，流程：
            1. 准备材料：身份证、旧护照、2寸照片
            2. 在线预约出入境管理局
            3. 现场办理，7-10个工作日可取
            4. 如需加急可选择EMS邮寄服务
          `
        });
      }
    }

    if (!visa) {
      alerts.push({
        type: 'warning',
        category: '签证提示',
        item: '签证',
        message: '国际旅行可能需要签证',
        suggestion: `
          请确认目的地国家的签证要求：
          • 免签国家：可直接入境
          • 落地签：抵达后办理
          • 需要提前申请：请准备材料递交使领馆
          建议提前3-4周开始办理签证手续
        `
      });
    } else if (visa.expiryDate) {
      const expiry = new Date(visa.expiryDate);
      const monthsLeft = this.getMonthsDifference(now, expiry);
      
      if (expiry < now) {
        alerts.push({
          type: 'danger',
          category: '签证过期',
          item: '签证',
          message: `签证已于${this.formatDate(expiry)}过期`,
          suggestion: `
            签证已过期，请重新申请：
            1. 确认目的地国家最新签证政策
            2. 准备申请材料（邀请函、行程单、资产证明等）
            3. 通过使领馆或签证中心提交申请
            4. 等待审批，通常需要1-2周
          `
        });
      } else if (monthsLeft < 1) {
        alerts.push({
          type: 'warning',
          category: '签证即将过期',
          item: '签证',
          message: `签证将在${monthsLeft}个月后过期`,
          suggestion: '请确认行程是否在签证有效期内，如需延期请提前申请'
        });
      }
    }

    return alerts;
  }

  private isInternationalDestination(destination: string): boolean {
    const domesticKeywords = ['中国', '北京', '上海', '广州', '深圳', '国内'];
    const internationalKeywords = ['美国', '日本', '韩国', '泰国', '欧洲', '东京', '纽约', '巴黎'];
    
    const destLower = destination.toLowerCase();
    
    if (internationalKeywords.some(kw => destination.includes(kw))) {
      return true;
    }
    
    if (domesticKeywords.some(kw => destination.includes(kw))) {
      return false;
    }
    
    return true;
  }

  private getExpiredSuggestion(docType: string): string {
    if (docType.includes('护照')) {
      return `
        护照已过期，请立即办理换发：
        1. 准备材料：身份证原件、旧护照、2寸白底照片
        2. 在线预约当地出入境管理局
        3. 现场采集指纹和拍照
        4. 等待7-10个工作日领取新护照
        【加急服务】部分城市支持3-5个工作日加急
      `;
    }
    
    if (docType.includes('签证')) {
      return `
        签证已过期，请重新申请：
        1. 查阅目的地国家最新签证政策
        2. 准备材料：护照、申请表、照片、行程单等
        3. 通过使领馆或授权签证中心提交
        4. 等待审批结果，通常需1-2周
      `;
    }
    
    if (docType.includes('身份证')) {
      return `
        身份证已过期，请及时更换：
        1. 携带旧身份证到户籍所在地派出所
        2. 现场拍照采集
        3. 20个工作日后领取新证
        【临时身份证】可当场办理，有效期3个月
      `;
    }
    
    return '请立即更新或续办相关证件';
  }

  private getExpiringSuggestion(docType: string, monthsLeft: number): string {
    if (docType.includes('护照')) {
      return `
        【重要】护照有效期不足${monthsLeft}个月
        国际旅行要求护照有效期至少6个月！
        • 建议尽快办理换发，以免影响出行计划
        • 换发周期约7-10个工作日
        • 如需加急可选择EMS邮寄服务
      `;
    }
    
    if (docType.includes('签证')) {
      return `
        签证将在${monthsLeft}个月后过期
        • 确认行程是否在有效期内
        • 如需延期请提前联系使领馆
        • 部分国家支持在线续签
      `;
    }
    
    return '部分国家要求证件有效期至少6个月，建议考虑更新';
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
