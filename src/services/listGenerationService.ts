import {
  GenerateParams,
  PackingItemInput,
  Season,
  Transport,
  Accommodation,
  CompanionType
} from '../types';

interface ItemTemplate {
  name: string;
  category: string;
  priority: 'required' | 'recommended' | 'optional';
  weight: number;
  isLiquid?: boolean;
  condition?: (params: GenerateParams) => boolean;
}

const categoryMapping: Record<string, string> = {
  documents: '证件类',
  medicine: '医药类',
  electronics: '电子设备',
  clothing: '衣物类',
  toiletries: '洗漱类',
  children: '儿童用品',
  others: '其他'
};

const itemTemplates: ItemTemplate[] = [
  { name: '护照', category: 'documents', priority: 'required', weight: 0.1, condition: (p) => p.transport === 'plane' && !p.destination.includes('国内') },
  { name: '身份证', category: 'documents', priority: 'required', weight: 0.05 },
  { name: '签证/签证确认函', category: 'documents', priority: 'required', weight: 0.05, condition: (p) => p.transport === 'plane' && !p.destination.includes('国内') },
  { name: '机票/火车票确认单', category: 'documents', priority: 'required', weight: 0.01 },
  { name: '酒店预订单', category: 'documents', priority: 'required', weight: 0.01 },
  { name: '旅行保险单', category: 'documents', priority: 'recommended', weight: 0.01 },
  { name: '驾驶证', category: 'documents', priority: 'recommended', weight: 0.1, condition: (p) => p.transport === 'car' },
  { name: '儿童疫苗接种证明', category: 'documents', priority: 'required', condition: (p) => p.companions.some(c => c.type === 'child' || c.type === 'infant') },
  
  { name: '感冒药', category: 'medicine', priority: 'recommended', weight: 0.1 },
  { name: '止泻药', category: 'medicine', priority: 'recommended', weight: 0.1 },
  { name: '创可贴', category: 'medicine', priority: 'recommended', weight: 0.05 },
  { name: '退烧药', category: 'medicine', priority: 'recommended', weight: 0.1 },
  { name: '防晒霜', category: 'medicine', priority: 'recommended', weight: 0.2, isLiquid: true, condition: (p) => p.season === 'summer' },
  { name: '蚊虫叮咬药', category: 'medicine', priority: 'recommended', weight: 0.1, condition: (p) => ['spring', 'summer'].includes(p.season) },
  { name: '体温计', category: 'medicine', priority: 'recommended', weight: 0.05 },
  { name: '儿童退烧药', category: 'children', priority: 'required', weight: 0.15, condition: (p) => p.companions.some(c => c.type === 'child' || c.type === 'infant') },
  { name: '儿童感冒药', category: 'children', priority: 'required', weight: 0.15, condition: (p) => p.companions.some(c => c.type === 'child' || c.type === 'infant') },
  
  { name: '手机', category: 'electronics', priority: 'required', weight: 0.2 },
  { name: '手机充电器', category: 'electronics', priority: 'required', weight: 0.1 },
  { name: '充电宝', category: 'electronics', priority: 'recommended', weight: 0.3, condition: (p) => p.transport === 'plane' },
  { name: '转换插头', category: 'electronics', priority: 'recommended', weight: 0.15 },
  { name: '笔记本电脑', category: 'electronics', priority: 'recommended', weight: 1.5, condition: (p) => p.accommodation === 'hotel' },
  { name: '相机', category: 'electronics', priority: 'optional', weight: 0.5 },
  { name: '耳机', category: 'electronics', priority: 'recommended', weight: 0.2 },
  { name: '平板电脑', category: 'children', priority: 'recommended', weight: 0.5, condition: (p) => p.companions.some(c => c.type === 'child') },
  
  { name: '内衣', category: 'clothing', priority: 'required', weight: 0.15, quantityFormula: (p) => p.days + 2 },
  { name: '袜子', category: 'clothing', priority: 'required', weight: 0.08, quantityFormula: (p) => p.days },
  { name: '外套', category: 'clothing', priority: 'required', weight: 0.8, quantityFormula: (p) => Math.ceil(p.days / 3) },
  { name: '长裤/裙子', category: 'clothing', priority: 'required', weight: 0.5, quantityFormula: (p) => Math.ceil(p.days / 2) },
  { name: '睡衣', category: 'clothing', priority: 'recommended', weight: 0.4 },
  { name: '运动鞋', category: 'clothing', priority: 'required', weight: 0.8 },
  { name: '拖鞋', category: 'clothing', priority: 'recommended', weight: 0.3 },
  
  { name: '短袖T恤', category: 'clothing', priority: 'required', weight: 0.3, quantityFormula: (p) => Math.ceil(p.days / 2), condition: (p) => ['spring', 'summer', 'autumn'].includes(p.season) },
  { name: '短裤', category: 'clothing', priority: 'required', weight: 0.25, quantityFormula: (p) => Math.ceil(p.days / 3), condition: (p) => p.season === 'summer' },
  { name: '防晒衣', category: 'clothing', priority: 'recommended', weight: 0.25, condition: (p) => p.season === 'summer' },
  { name: '泳衣', category: 'clothing', priority: 'optional', weight: 0.3, condition: (p) => ['spring', 'summer'].includes(p.season) },
  
  { name: '羽绒服', category: 'clothing', priority: 'required', weight: 1.2, condition: (p) => p.season === 'winter' },
  { name: '毛衣', category: 'clothing', priority: 'required', weight: 0.6, quantityFormula: (p) => Math.ceil(p.days / 3), condition: (p) => ['autumn', 'winter'].includes(p.season) },
  { name: '保暖内衣', category: 'clothing', priority: 'required', weight: 0.4, condition: (p) => p.season === 'winter' },
  { name: '围巾', category: 'clothing', priority: 'recommended', weight: 0.2, condition: (p) => ['autumn', 'winter'].includes(p.season) },
  { name: '手套', category: 'clothing', priority: 'recommended', weight: 0.15, condition: (p) => p.season === 'winter' },
  { name: '帽子', category: 'clothing', priority: 'recommended', weight: 0.15 },
  
  { name: '长袖衬衫', category: 'clothing', priority: 'required', weight: 0.4, quantityFormula: (p) => Math.ceil(p.days / 2), condition: (p) => ['spring', 'autumn'].includes(p.season) },
  { name: '风衣', category: 'clothing', priority: 'recommended', weight: 0.6, condition: (p) => ['spring', 'autumn'].includes(p.season) },
  { name: '轻薄外套', category: 'clothing', priority: 'recommended', weight: 0.4, condition: (p) => ['spring', 'autumn'].includes(p.season) },
  
  { name: '牙刷', category: 'toiletries', priority: 'required', weight: 0.03 },
  { name: '牙膏', category: 'toiletries', priority: 'required', weight: 0.1, isLiquid: true },
  { name: '洗发水', category: 'toiletries', priority: 'recommended', weight: 0.3, isLiquid: true },
  { name: '沐浴露', category: 'toiletries', priority: 'recommended', weight: 0.3, isLiquid: true },
  { name: '护肤品', category: 'toiletries', priority: 'recommended', weight: 0.2, isLiquid: true },
  { name: '毛巾', category: 'toiletries', priority: 'required', weight: 0.15 },
  { name: '剃须刀', category: 'toiletries', priority: 'recommended', weight: 0.1, condition: (p) => p.companions.some(c => c.type === 'adult') },
  { name: '化妆品', category: 'toiletries', priority: 'optional', weight: 0.2, isLiquid: true },
  { name: '梳子', category: 'toiletries', priority: 'recommended', weight: 0.05 },
  
  { name: '尿布', category: 'children', priority: 'required', weight: 0.05, condition: (p) => p.companions.some(c => c.type === 'infant') },
  { name: '配方奶', category: 'children', priority: 'required', weight: 0.5, condition: (p) => p.companions.some(c => c.type === 'infant') },
  { name: '奶瓶', category: 'children', priority: 'required', weight: 0.2, condition: (p) => p.companions.some(c => c.type === 'infant') },
  { name: '儿童餐具', category: 'children', priority: 'required', weight: 0.3, condition: (p) => p.companions.some(c => c.type === 'child' || c.type === 'infant') },
  { name: '儿童水杯', category: 'children', priority: 'required', weight: 0.2, condition: (p) => p.companions.some(c => c.type === 'child' || c.type === 'infant') },
  { name: '推车', category: 'children', priority: 'recommended', weight: 6.0, condition: (p) => p.companions.some(c => c.type === 'infant') && p.transport !== 'plane' },
  { name: '儿童背包', category: 'children', priority: 'recommended', weight: 0.3, condition: (p) => p.companions.some(c => c.type === 'child') },
  { name: '儿童玩具', category: 'children', priority: 'optional', weight: 0.5, condition: (p) => p.companions.some(c => c.type === 'child' || c.type === 'infant') },
  { name: '绘本', category: 'children', priority: 'optional', weight: 0.3, condition: (p) => p.companions.some(c => c.type === 'child') },
  { name: '安全座椅', category: 'children', priority: 'required', weight: 8.0, condition: (p) => p.companions.some(c => c.type === 'child' || c.type === 'infant') && p.transport === 'car' },
  
  { name: '雨伞', category: 'others', priority: 'recommended', weight: 0.3 },
  { name: '雨衣', category: 'others', priority: 'optional', weight: 0.2 },
  { name: '眼镜/隐形眼镜', category: 'others', priority: 'recommended', weight: 0.05 },
  { name: '现金', category: 'others', priority: 'required', weight: 0.01 },
  { name: '银行卡', category: 'others', priority: 'required', weight: 0.01 },
  { name: '常用联系人卡片', category: 'others', priority: 'recommended', weight: 0.01 },
  { name: '纸巾', category: 'others', priority: 'required', weight: 0.2 },
  { name: '湿巾', category: 'others', priority: 'recommended', weight: 0.15, isLiquid: true },
  { name: '垃圾袋', category: 'others', priority: 'optional', weight: 0.05 },
  { name: '锁具', category: 'others', priority: 'optional', weight: 0.1, condition: (p) => p.accommodation === 'hostel' },
  { name: '隔脏睡袋', category: 'others', priority: 'optional', weight: 0.3, condition: (p) => ['hostel', 'camping'].includes(p.accommodation) },
  { name: '手电筒', category: 'others', priority: 'recommended', weight: 0.15, condition: (p) => p.accommodation === 'camping' },
  { name: '帐篷', category: 'others', priority: 'required', weight: 3.0, condition: (p) => p.accommodation === 'camping' },
  { name: '野餐垫', category: 'others', priority: 'optional', weight: 0.5, condition: (p) => p.accommodation === 'camping' },
];

export class ListGenerationService {
  private getStableItemId(name: string, category: string): string {
    const normalized = name.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
      .substring(0, 20);
    const catNormalized = category.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
      .substring(0, 10);
    return `${catNormalized}-${normalized}`;
  }

  generatePackingList(params: GenerateParams): PackingItemInput[] {
    const items: PackingItemInput[] = [];
    
    for (const template of itemTemplates) {
      if (template.condition && !template.condition(params)) {
        continue;
      }

      const quantity = (template as any).quantityFormula 
        ? (template as any).quantityFormula(params)
        : 1;

      const category = categoryMapping[template.category] || template.category;
      
      items.push({
        id: this.getStableItemId(template.name, category),
        name: template.name,
        category: category,
        priority: template.priority,
        weight: template.weight,
        isLiquid: template.isLiquid || false,
        isPacked: false,
        quantity,
        note: ''
      });
    }

    return items;
  }

  getCategories(): string[] {
    return Object.values(categoryMapping);
  }

  getSeasonalItems(season: Season): PackingItemInput[] {
    const seasonalParams: GenerateParams = {
      destination: 'test',
      days: 7,
      season,
      transport: 'plane' as Transport,
      accommodation: 'hotel' as Accommodation,
      companions: [{ type: 'adult' as CompanionType, count: 1 }]
    };
    
    return this.generatePackingList(seasonalParams).filter(item => 
      item.name.includes('羽绒服') ||
      item.name.includes('毛衣') ||
      item.name.includes('围巾') ||
      item.name.includes('短袖') ||
      item.name.includes('短裤') ||
      item.name.includes('防晒')
    );
  }

  getTransportSpecificItems(transport: Transport): PackingItemInput[] {
    const transportParams: GenerateParams = {
      destination: 'test',
      days: 7,
      season: 'spring' as Season,
      transport: transport as Transport,
      accommodation: 'hotel' as Accommodation,
      companions: [{ type: 'adult' as CompanionType, count: 1 }]
    };
    
    return this.generatePackingList(transportParams).filter(item =>
      item.name.includes('护照') ||
      item.name.includes('驾驶证') ||
      item.name.includes('充电宝') ||
      item.name.includes('安全座椅') ||
      item.name.includes('推车')
    );
  }

  getAccommodationSpecificItems(accommodation: Accommodation): PackingItemInput[] {
    const accommodationParams: GenerateParams = {
      destination: 'test',
      days: 7,
      season: 'spring' as Season,
      transport: 'plane' as Transport,
      accommodation: accommodation as Accommodation,
      companions: [{ type: 'adult' as CompanionType, count: 1 }]
    };
    
    return this.generatePackingList(accommodationParams).filter(item =>
      item.name.includes('锁具') ||
      item.name.includes('隔脏') ||
      item.name.includes('手电筒') ||
      item.name.includes('帐篷') ||
      item.name.includes('野餐垫')
    );
  }
}

export default new ListGenerationService();
