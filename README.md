# LuggageSmart - 行李智能清单后端服务

面向旅行预订平台、亲子出行App和出差助手提供智能行李清单能力。

## 功能特性

### 核心功能
- 根据目的地、天数、季节、交通方式、住宿类型和同行人自动生成行李清单
- 支持证件、药品、充电设备、衣物、洗漱、儿童用品等分类
- 用户可勾选已打包、设置必带优先级
- 支持自定义物品添加
- 历史清单复用
- 家人协作共享

### 智能分析
- 箱包重量估算
- 遗漏风险提醒
- 临期证件提醒
- 液体限制提醒
- 航司行李规定提示
- 购买清单生成
- 返程收纳清单

## 技术栈

- Node.js 18+
- Express.js
- TypeScript
- Prisma (SQLite/PostgreSQL)
- JWT 认证

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npm run db:setup
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动。

### 4. 构建生产版本

```bash
npm run build
npm start
```

## API 接口

### 认证接口

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 获取用户信息
```
GET /api/auth/profile
Authorization: Bearer <token>
```

### 清单管理

#### 生成清单
```
POST /api/lists/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "destination": "日本东京",
  "days": 7,
  "season": "spring",
  "transport": "plane",
  "accommodation": "hotel",
  "companions": [
    { "type": "adult", "count": 2 },
    { "type": "child", "count": 1 }
  ]
}
```

#### 获取所有清单
```
GET /api/lists
Authorization: Bearer <token>
```

#### 获取清单详情
```
GET /api/lists/:id
Authorization: Bearer <token>
```

#### 更新清单
```
PUT /api/lists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新清单名称",
  "isCompleted": true
}
```

#### 删除清单
```
DELETE /api/lists/:id
Authorization: Bearer <token>
```

### 物品管理

#### 添加自定义物品
```
POST /api/lists/:id/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "额外物品",
  "category": "其他",
  "priority": "optional",
  "weight": 0.5
}
```

#### 更新物品状态
```
PUT /api/lists/:id/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "isPacked": true,
  "quantity": 2
}
```

#### 删除物品
```
DELETE /api/lists/:id/items/:itemId
Authorization: Bearer <token>
```

### 智能分析

#### 获取分析报告
```
GET /api/lists/:id/analysis
Authorization: Bearer <token>
```

#### 估算箱包重量
```
GET /api/lists/:id/weight-estimate
Authorization: Bearer <token>
```

#### 获取风险提醒
```
GET /api/lists/:id/risks
Authorization: Bearer <token>
```

#### 生成购买清单
```
GET /api/lists/:id/shopping-list
Authorization: Bearer <token>
```

#### 生成返程清单
```
GET /api/lists/:id/return-list
Authorization: Bearer <token>
```

#### 获取航司行李提示
```
GET /api/lists/:id/airline-tips
Authorization: Bearer <token>
```

### 提醒功能

#### 证件临期提醒
```
GET /api/lists/:id/reminders/documents
Authorization: Bearer <token>
```

#### 液体限制提醒
```
GET /api/lists/:id/reminders/liquids
Authorization: Bearer <token>
```

### 协作共享

#### 共享清单
```
POST /api/lists/:id/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "sharedWith": "family@example.com",
  "permission": "edit"
}
```

#### 获取被共享的清单
```
GET /api/lists/shared
Authorization: Bearer <token>
```

#### 取消共享
```
DELETE /api/lists/shared/:shareId
Authorization: Bearer <token>
```

#### 复用历史清单
```
POST /api/lists/:id/reuse
Authorization: Bearer <token>
Content-Type: application/json

{
  "days": 10,
  "season": "summer"
}
```

## 参数说明

### 季节 (season)
- `spring` - 春季
- `summer` - 夏季
- `autumn` - 秋季
- `winter` - 冬季

### 交通方式 (transport)
- `plane` - 飞机
- `train` - 火车
- `car` - 汽车
- `ship` - 轮船

### 住宿类型 (accommodation)
- `hotel` - 酒店
- `hostel` - 青年旅社
- `camping` - 露营
- `homestay` - 民宿

### 同行人类型 (companions.type)
- `adult` - 成人
- `child` - 儿童
- `infant` - 婴幼儿

### 优先级 (priority)
- `required` - 必带
- `recommended` - 推荐
- `optional` - 可选

### 权限 (permission)
- `view` - 仅查看
- `edit` - 可编辑

## 演示账号

```
邮箱: demo@luggage.com
密码: demo123
```

## 健康检查

```
GET /health
```

返回服务器状态和启动时间。

## License

ISC
