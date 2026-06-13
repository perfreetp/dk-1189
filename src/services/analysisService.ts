import {
  PackingItemInput,
  WeightEstimate,
  RiskAlert,
  ShoppingItem,
  ReturnPackingItem,
  AirlineTip,
  AnalysisReport,
  CategoryWeight
} from '../types';

export class AnalysisService {
  estimateWeight(items: PackingItemInput[]): WeightEstimate {
    const categoryMap = new Map<string, CategoryWeight>();
    
    for (const item of items) {
      const category = item.category;
      const itemWeight = (item.weight || 0) * (item.quantity || 1);
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          weight: 0,
          items: []
        });
      }
      
      const categoryData = categoryMap.get(category)!;
      categoryData.weight += itemWeight;
      categoryData.items.push({
        name: item.name,
        weight: itemWeight,
        count: item.quantity || 1
      });
    }
    
    const totalWeight = Array.from(categoryMap.values())
      .reduce((sum, cat) => sum + cat.weight, 0);
    
    const limit = 23;
    const withinLimit = totalWeight <= limit;
    const overWeight = Math.max(0, totalWeight - limit);
    
    return {
      totalWeight: Math.round(totalWeight * 100) / 100,
      byCategory: Array.from(categoryMap.values()),
      withinLimit,
      limit,
      overWeight: Math.round(overWeight * 100) / 100
    };
  }

  detectRisks(items: PackingItemInput[], params: {
    days: number;
    transport: string;
    season: string;
    companions: Array<{ type: string; count: number }>;
  }): RiskAlert[] {
    const risks: RiskAlert[] = [];
    
    const liquidItems = items.filter(item => item.isLiquid);
    const totalLiquidWeight = liquidItems.reduce(
      (sum, item) => sum + (item.weight || 0) * (item.quantity || 1), 
      0
    );
    
    if (params.transport === 'plane') {
      const oversizedLiquids = liquidItems.filter(
        item => (item.quantity || 1) > 1 && (item.weight || 0) > 0.1
      );
      
      if (oversizedLiquids.length > 0) {
        risks.push({
          type: 'warning',
          category: '液体限制',
          item: oversizedLiquids.map(i => i.name).join(', '),
          message: '部分液体可能超过航空公司的100ml限制',
          suggestion: '建议将液体分装至100ml以下的容器中，或选择旅行装产品'
        });
      }
      
      if (totalLiquidWeight > 1) {
        risks.push({
          type: 'danger',
          category: '液体限制',
          item: '总液体量',
          message: `总液体量约${totalLiquidWeight.toFixed(2)}kg，超过1L限制`,
          suggestion: '航空公司规定所有液体物品单瓶不超过100ml，总量不超过1L'
        });
      }
    }
    
    const packedItems = items.filter(item => item.isPacked);
    const unpackedRequired = items.filter(
      item => item.priority === 'required' && !item.isPacked
    );
    
    if (unpackedRequired.length > 0) {
      risks.push({
        type: 'danger',
        category: '必带物品',
        item: unpackedRequired.map(i => i.name).join(', '),
        message: `${unpackedRequired.length}件必带物品尚未打包`,
        suggestion: '请尽快打包这些必带物品，避免临行时遗漏'
      });
    }
    
    const hasChild = params.companions.some(c => c.type === 'child' || c.type === 'infant');
    if (hasChild) {
      const childItems = items.filter(item => 
        ['儿童用品', '医药类'].includes(item.category) && 
        item.priority === 'required'
      );
      const unpackedChildItems = childItems.filter(item => !item.isPacked);
      
      if (unpackedChildItems.length > 0) {
        risks.push({
          type: 'warning',
          category: '儿童物品',
          item: unpackedChildItems.map(i => i.name).join(', '),
          message: '有儿童必带物品尚未打包',
          suggestion: '带儿童出行建议提前打包儿童必需品'
        });
      }
    }
    
    const seasonLower = params.season.toLowerCase();
    if (seasonLower === 'winter') {
      const winterItems = items.filter(item =>
        item.name.includes('羽绒服') ||
        item.name.includes('保暖') ||
        item.name.includes('围巾') ||
        item.name.includes('手套')
      );
      if (winterItems.length === 0) {
        risks.push({
          type: 'warning',
          category: '季节提醒',
          item: '冬季衣物',
          message: '冬季出行但未添加保暖衣物',
          suggestion: '建议添加羽绒服、保暖内衣、围巾、手套等冬季用品'
        });
      }
    }
    
    if (seasonLower === 'summer') {
      const summerItems = items.filter(item =>
        item.name.includes('防晒') ||
        item.name.includes('短袖') ||
        item.name.includes('短裤')
      );
      if (summerItems.length === 0) {
        risks.push({
          type: 'info',
          category: '季节提醒',
          item: '夏季衣物',
          message: '夏季出行建议准备防晒和轻薄衣物',
          suggestion: '添加防晒霜、短袖、短裤、凉鞋等夏季用品'
        });
      }
    }
    
    return risks;
  }

  generateShoppingList(items: PackingItemInput[]): ShoppingItem[] {
    const shoppingItems: ShoppingItem[] = [];
    const processed = new Set<string>();
    
    for (const item of items) {
      const key = `${item.name}-${item.category}`;
      if (processed.has(key)) continue;
      
      if (!item.isPacked && item.priority === 'required') {
        shoppingItems.push({
          name: item.name,
          category: item.category,
          quantity: item.quantity || 1,
          priority: item.priority,
          reason: '必带物品，尚未打包'
        });
        processed.add(key);
      } else if (!item.isPacked && item.priority === 'recommended') {
        const similar = items.filter(
          i => i.name === item.name && i.isPacked
        );
        if (similar.length === 0) {
          shoppingItems.push({
            name: item.name,
            category: item.category,
            quantity: item.quantity || 1,
            priority: item.priority,
            reason: '推荐物品，可根据需要购买'
          });
          processed.add(key);
        }
      }
    }
    
    return shoppingItems.sort((a, b) => {
      const priorityOrder = { required: 0, recommended: 1, optional: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  generateReturnPackingList(items: PackingItemInput[], days: number): ReturnPackingItem[] {
    const returnItems: ReturnPackingItem[] = [];
    
    const essentialItems = items.filter(item => 
      item.isPacked && 
      (item.priority === 'required' || item.priority === 'recommended')
    );
    
    for (const item of essentialItems) {
      let note = '';
      let quantity = item.quantity || 1;
      
      if (item.name.includes('洗漱') || item.name.includes('化妆品')) {
        if (quantity > 1) {
          quantity = Math.ceil(quantity / 2);
          note = '使用了一半，可只带一半量';
        }
      }
      
      if (item.name.includes('零食') || item.name.includes('食品')) {
        note = '确认未开封，可带回国';
      }
      
      if (item.name.includes('礼物') || item.name.includes('纪念品')) {
        note = ' souvenirs 纪念品，建议保护好';
      }
      
      returnItems.push({
        name: item.name,
        category: item.category,
        quantity,
        note: note || '确认打包完整'
      });
    }
    
    return returnItems;
  }

  getAirlineTips(transport: string): AirlineTip[] {
    if (transport !== 'plane') {
      return [];
    }
    
    const tips: AirlineTip[] = [
      {
        airline: '中国国际航空 (CA)',
        freeCheckedBag: '经济舱20kg，公务舱30kg，头等舱40kg',
        freeCarryOn: '1件不超过5kg，尺寸55×40×20cm',
        overweightFee: '超1-10kg按机票价格的1.5%计费',
        liquidRestriction: '单瓶不超过100ml，总量不超过1L，装在透明塑料袋中',
        specialItems: ['运动器材需额外付费', '乐器需提前申请', '宠物需托运']
      },
      {
        airline: '中国南方航空 (CZ)',
        freeCheckedBag: '经济舱23kg，公务舱32kg，头等舱45kg',
        freeCarryOn: '1件不超过5kg，尺寸100×60×40cm',
        overweightFee: '超重费每kg按票价的1.5%收取',
        liquidRestriction: '单瓶不超过100ml，总量不超过1L',
        specialItems: ['婴儿车需托运', '折叠自行车需打包', '吉他需额外占座']
      },
      {
        airline: '中国东方航空 (MU)',
        freeCheckedBag: '经济舱23kg，公务舱32kg，头等舱45kg',
        freeCarryOn: '1件不超过10kg，尺寸长宽高不超过115cm',
        overweightFee: '超重费每kg按成人全价的1.5%收取',
        liquidRestriction: '单瓶不超过100ml，总量不超过1L',
        specialItems: ['易碎物品需申报', '贵重物品建议随身携带', '锂电池需随身携带']
      },
      {
        airline: '春秋航空 (9C)',
        freeCheckedBag: '无免费托运行额，需额外购买',
        freeCarryOn: '婴儿车可免费托运一件',
        overweightFee: '托运费7kg起售，价格较高',
        liquidRestriction: '单瓶不超过100ml，总量不超过1L',
        specialItems: ['提前购买行李额更便宜', '无免费餐食', '机上温度较低建议带外套']
      }
    ];
    
    return tips;
  }

  generateAnalysisReport(
    items: PackingItemInput[], 
    params: {
      days: number;
      transport: string;
      season: string;
      companions: Array<{ type: string; count: number }>;
    }
  ): AnalysisReport {
    const packedItems = items.filter(item => item.isPacked);
    
    return {
      completionRate: items.length > 0 
        ? Math.round((packedItems.length / items.length) * 100) 
        : 0,
      totalItems: items.length,
      packedItems: packedItems.length,
      risks: this.detectRisks(items, params),
      weightEstimate: this.estimateWeight(items)
    };
  }
}

export default new AnalysisService();
