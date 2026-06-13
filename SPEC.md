# 行李智能清单后端服务规范

## 1. 项目概述

### 项目名称
LuggageSmart - 行李智能清单后端服务

### 项目类型
Node.js/Express RESTful API 服务

### 核心功能
为旅行预订平台、亲子出行App和出差助手提供智能行李清单生成和管理能力，通过分析旅行参数自动生成个性化行李建议，支持协作共享和智能提醒。

### 目标用户
- 旅行预订平台
- 亲子出行App
- 出差助手应用
- 终端个人用户

## 2. 技术架构

### 技术栈
- **运行环境**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: SQLite (开发环境) / PostgreSQL (生产环境)
- **ORM**: Prisma
- **认证**: JWT Token
- **验证**: Zod
- **文档**: Swagger/OpenAPI

### 项目结构
```
src/
├── controllers/          # 控制器层
├── services/             # 业务逻辑层
├── models/               # 数据模型
├── routes/               # 路由定义
├── middleware/           # 中间件
├── utils/                # 工具函数
├── types/                # TypeScript类型定义
├── config/               # 配置文件
└── prisma/               # 数据库schema
```

## 3. 数据模型

### User (用户)
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  packingLists  PackingList[]
  sharedLists   SharedList[]
}
```

### PackingList (行李清单)
```prisma
model PackingList {
  id              String    @id @default(uuid())
  userId          String
  name            String
  destination     String
  days            Int
  season          String    // spring, summer, autumn, winter
  transport       String    // plane, train, car, ship
  accommodation   String    // hotel, hostel, camping, homestay
  companions      Json      // [{type: "adult"|"child"|"infant", count: number}]
  generatedItems  Json      // 自动生成的物品列表
  customItems     Json      // 用户自定义物品
  isCompleted     Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id])
  sharedWith      SharedList[]
}
```

### SharedList (共享清单)
```prisma
model SharedList {
  id          String      @id @default(uuid())
  packingListId String
  sharedBy    String      // 用户ID
  sharedWith  String      // 被共享的用户邮箱
  permission  String      // view, edit
  createdAt   DateTime    @default(now())
  packingList PackingList @relation(fields: [packingListId], references: [id])
}
```

### ItemCategory (物品分类)
```prisma
model ItemCategory {
  id          String    @id @default(uuid())
  name        String    @unique
  description String
  icon        String
  items       PackingItem[]
}

model PackingItem {
  id          String        @id @default(uuid())
  categoryId  String
  name        String
  description String?
  priority    String        // required, recommended, optional
  weight      Float?        // 重量(kg)
  isLiquid    Boolean       @default(false)
  category    ItemCategory  @relation(fields: [categoryId], references: [id])
}
```

## 4. API接口规范

### 认证模块
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 清单管理
- `POST /api/lists/generate` - 根据旅行参数生成清单
- `GET /api/lists` - 获取用户所有清单
- `GET /api/lists/:id` - 获取清单详情
- `PUT /api/lists/:id` - 更新清单
- `DELETE /api/lists/:id` - 删除清单

### 物品管理
- `POST /api/lists/:id/items` - 添加自定义物品
- `PUT /api/lists/:id/items/:itemId` - 更新物品状态
- `DELETE /api/lists/:id/items/:itemId` - 删除物品

### 协作共享
- `POST /api/lists/:id/share` - 共享清单
- `GET /api/shared` - 获取被共享的清单
- `DELETE /api/shared/:id` - 取消共享

### 分析和建议
- `GET /api/lists/:id/analysis` - 获取分析报告
- `GET /api/lists/:id/weight-estimate` - 估算箱包重量
- `GET /api/lists/:id/risks` - 获取遗漏风险提醒
- `GET /api/lists/:id/shopping-list` - 生成购买清单
- `GET /api/lists/:id/return-list` - 生成返程收纳清单
- `GET /api/lists/:id/airline-tips` - 获取航司行李提示

### 提醒功能
- `GET /api/reminders/documents` - 证件临期提醒
- `GET /api/reminders/liquids` - 液体限制提醒

## 5. 业务逻辑

### 5.1 智能清单生成算法

#### 输入参数
```typescript
interface GenerateParams {
  destination: string;      // 目的地
  days: number;            // 天数
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  transport: 'plane' | 'train' | 'car' | 'ship';
  accommodation: 'hotel' | 'hostel' | 'camping' | 'homestay';
  companions: Array<{
    type: 'adult' | 'child' | 'infant';
    count: number;
  }>;
}
```

#### 生成规则

**证件类 (Documents)**
- 护照/身份证 (必选)
- 签证/签证确认函
- 机票/酒店预订单
- 旅行保险单
- 驾驶证(自驾)
- 儿童疫苗接种证明(亲子出行)

**医药类 (Medicine)**
- 基础药品: 感冒药、止泻药、创可贴
- 处方药(如需)
- 儿童药品(如有儿童同行)
- 防晒霜/蚊虫叮咬药

**电子设备 (Electronics)**
- 手机+充电器
- 充电宝 (需符合航空规定: ≤100Wh)
- 转换插头
- 相机(可选)
- 笔记本电脑(商务)
- 儿童平板/玩具(亲子)

**衣物类 (Clothing)**
根据天数和季节:
- 内衣: 天数 + 2
- 外衣: 天数 / 3 (向上取整)
- 睡衣: 1
- 袜子: 天数
- 鞋子: 2双(日常+正式)
- 季节性: 
  - 夏季: 短袖、短裤、凉鞋、防晒衣
  - 冬季: 羽绒服、毛衣、保暖内衣、手套围巾
  - 春秋: 长袖、外套、风衣

**洗漱用品 (Toiletries)**
- 牙刷、牙膏
- 洗发水、沐浴露 (分装≤100ml如航空)
- 护肤品、防晒霜
- 剃须刀/化妆品
- 毛巾

**儿童用品 (Children Items)**
- 尿布/训练裤(婴幼儿)
- 配方奶/辅食
- 儿童餐具
- 安全座椅(自驾)
- 推车
- 儿童玩具/绘本

**其他 (Others)**
- 雨具
- 眼镜/隐形眼镜
- 常用联系人卡片
- 现金/银行卡

### 5.2 权重估算算法

```typescript
interface WeightEstimate {
  totalWeight: number;      // 总重量(kg)
  byCategory: {
    category: string;
    weight: number;
    items: Array<{name: string; weight: number; count: number}>;
  }[];
  withinLimit: boolean;     // 是否在免费托运限额内
  limit: number;            // 免费托运限额(kg)
  overWeight: number;       // 超重重量(kg)
}
```

### 5.3 风险识别

```typescript
interface RiskAlert {
  type: 'warning' | 'danger' | 'info';
  category: string;
  item: string;
  message: string;
  suggestion: string;
}
```

风险类型:
- 证件临期 (< 6个月有效期)
- 液体超量 (单瓶>100ml, 总量>1L)
- 违禁品提醒
- 季节性物品遗漏
- 儿童必备物品检查

### 5.4 购买清单生成

根据已打包状态和物品优先级:
- 未打包且优先级=required → 需购买
- 未打包且数量不足 → 需购买
- 返程时可能需要添加的物品

### 5.5 航司行李提示

针对不同航空公司提供:
- 免费托运行李额
- 免费手提行李额
- 超重费标准
- 液体限制
- 特殊物品规定(运动器材、乐器等)

## 6. 核心功能模块

### 6.1 清单生成服务 (ListGenerationService)
- 分析旅行参数
- 匹配物品数据库
- 应用生成规则
- 考虑用户偏好

### 6.2 协作服务 (CollaborationService)
- 清单共享
- 权限管理
- 实时同步

### 6.3 分析服务 (AnalysisService)
- 重量估算
- 风险识别
- 购买建议

### 6.4 提醒服务 (ReminderService)
- 证件有效期检查
- 液体限制提醒
- 临行检查清单

## 7. 安全要求

- 所有API需要JWT认证(公开接口除外)
- 密码使用bcrypt加密
- 输入数据严格验证
- 防止SQL注入
- 敏感信息不记录日志

## 8. 错误处理

统一错误响应格式:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

## 9. 数据库初始化

需要预置的物品分类和基础物品:
1. 证件类 - 护照、签证、机票等
2. 医药类 - 常用药品、急救用品
3. 电子设备 - 手机、充电器、充电宝等
4. 衣物类 - 根据季节分类
5. 洗漱类 - 基本洗漱用品
6. 儿童用品 - 尿布、奶粉、玩具等
7. 其他 - 雨具、现金等

## 10. 扩展性考虑

- 支持更多交通方式
- 支持更多住宿类型
- 国际化支持
- 离线同步能力
- 多语言物品名称
