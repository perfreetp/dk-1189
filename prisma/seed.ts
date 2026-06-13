import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const categories = [
    { name: '证件类', description: '护照、身份证、签证等重要证件', icon: 'passport' },
    { name: '医药类', description: '常用药品和急救用品', icon: 'medicine' },
    { name: '电子设备', description: '手机、充电器、笔记本电脑等', icon: 'electronics' },
    { name: '衣物类', description: '根据季节和天数准备的衣服', icon: 'clothing' },
    { name: '洗漱类', description: '牙刷、洗发水、护肤品等', icon: 'toiletries' },
    { name: '儿童用品', description: '尿布、奶粉、玩具等儿童专用物品', icon: 'children' },
    { name: '其他', description: '雨具、现金等其他必需品', icon: 'others' }
  ];

  for (const cat of categories) {
    await prisma.itemCategory.upsert({
      where: { name: cat.name },
      update: cat,
      create: cat
    });
  }

  const docCategory = await prisma.itemCategory.findUnique({ where: { name: '证件类' } });
  const medCategory = await prisma.itemCategory.findUnique({ where: { name: '医药类' } });
  const elecCategory = await prisma.itemCategory.findUnique({ where: { name: '电子设备' } });
  const clothCategory = await prisma.itemCategory.findUnique({ where: { name: '衣物类' } });
  const toiletCategory = await prisma.itemCategory.findUnique({ where: { name: '洗漱类' } });
  const childCategory = await prisma.itemCategory.findUnique({ where: { name: '儿童用品' } });

  const items = [
    { categoryId: docCategory!.id, name: '护照', description: '国际旅行必备', priority: 'required', weight: 0.1 },
    { categoryId: docCategory!.id, name: '身份证', description: '国内旅行必备', priority: 'required', weight: 0.05 },
    { categoryId: docCategory!.id, name: '签证确认函', description: '入境所需签证文件', priority: 'required', weight: 0.01 },
    { categoryId: docCategory!.id, name: '机票确认单', description: '航班预订确认', priority: 'required', weight: 0.01 },
    { categoryId: docCategory!.id, name: '酒店预订单', description: '住宿预订确认', priority: 'required', weight: 0.01 },
    { categoryId: docCategory!.id, name: '旅行保险单', description: '旅游保险证明', priority: 'recommended', weight: 0.01 },
    { categoryId: docCategory!.id, name: '驾驶证', description: '自驾必备', priority: 'recommended', weight: 0.1 },

    { categoryId: medCategory!.id, name: '感冒药', description: '治疗感冒症状', priority: 'recommended', weight: 0.1 },
    { categoryId: medCategory!.id, name: '止泻药', description: '治疗腹泻', priority: 'recommended', weight: 0.1 },
    { categoryId: medCategory!.id, name: '创可贴', description: '处理小伤口', priority: 'recommended', weight: 0.05 },
    { categoryId: medCategory!.id, name: '退烧药', description: '退热降温', priority: 'recommended', weight: 0.1 },
    { categoryId: medCategory!.id, name: '防晒霜', description: '防晒保护', priority: 'recommended', weight: 0.2, isLiquid: true },
    { categoryId: medCategory!.id, name: '蚊虫叮咬药', description: '驱蚊止痒', priority: 'recommended', weight: 0.1 },

    { categoryId: elecCategory!.id, name: '手机', description: '通讯工具', priority: 'required', weight: 0.2 },
    { categoryId: elecCategory!.id, name: '手机充电器', description: '手机充电', priority: 'required', weight: 0.1 },
    { categoryId: elecCategory!.id, name: '充电宝', description: '移动电源', priority: 'recommended', weight: 0.3 },
    { categoryId: elecCategory!.id, name: '转换插头', description: '出国用电转换', priority: 'recommended', weight: 0.15 },
    { categoryId: elecCategory!.id, name: '笔记本电脑', description: '办公娱乐', priority: 'recommended', weight: 1.5 },
    { categoryId: elecCategory!.id, name: '相机', description: '拍照留念', priority: 'optional', weight: 0.5 },

    { categoryId: clothCategory!.id, name: '内衣', description: '贴身衣物', priority: 'required', weight: 0.15 },
    { categoryId: clothCategory!.id, name: '袜子', description: '足部保暖', priority: 'required', weight: 0.08 },
    { categoryId: clothCategory!.id, name: '外套', description: '保暖外套', priority: 'required', weight: 0.8 },
    { categoryId: clothCategory!.id, name: '长裤', description: '下身衣物', priority: 'required', weight: 0.5 },
    { categoryId: clothCategory!.id, name: '睡衣', description: '休息穿着', priority: 'recommended', weight: 0.4 },
    { categoryId: clothCategory!.id, name: '运动鞋', description: '日常行走', priority: 'required', weight: 0.8 },
    { categoryId: clothCategory!.id, name: '拖鞋', description: '住宿使用', priority: 'recommended', weight: 0.3 },

    { categoryId: toiletCategory!.id, name: '牙刷', description: '口腔清洁', priority: 'required', weight: 0.03 },
    { categoryId: toiletCategory!.id, name: '牙膏', description: '牙齿清洁', priority: 'required', weight: 0.1, isLiquid: true },
    { categoryId: toiletCategory!.id, name: '洗发水', description: '头发清洁', priority: 'recommended', weight: 0.3, isLiquid: true },
    { categoryId: toiletCategory!.id, name: '沐浴露', description: '身体清洁', priority: 'recommended', weight: 0.3, isLiquid: true },
    { categoryId: toiletCategory!.id, name: '护肤品', description: '皮肤护理', priority: 'recommended', weight: 0.2, isLiquid: true },
    { categoryId: toiletCategory!.id, name: '毛巾', description: '擦拭使用', priority: 'required', weight: 0.15 },

    { categoryId: childCategory!.id, name: '尿布', description: '婴儿必备', priority: 'required', weight: 0.05 },
    { categoryId: childCategory!.id, name: '配方奶', description: '婴儿喂养', priority: 'required', weight: 0.5 },
    { categoryId: childCategory!.id, name: '奶瓶', description: '婴儿喂养', priority: 'required', weight: 0.2 },
    { categoryId: childCategory!.id, name: '儿童餐具', description: '儿童用餐', priority: 'required', weight: 0.3 },
    { categoryId: childCategory!.id, name: '推车', description: '儿童出行', priority: 'recommended', weight: 6.0 },
    { categoryId: childCategory!.id, name: '儿童玩具', description: '娱乐用品', priority: 'optional', weight: 0.5 }
  ];

  for (const item of items) {
    await prisma.packingItem.upsert({
      where: { id: item.name },
      update: item,
      create: { ...item, id: item.name }
    });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@luggage.com' },
    update: {},
    create: {
      email: 'demo@luggage.com',
      password: await bcrypt.hash('demo123', 10),
      name: '演示用户'
    }
  });

  console.log('Seed completed successfully!');
  console.log(`Demo user created: ${demoUser.email} / demo123`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
