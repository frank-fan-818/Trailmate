# Trailmate 伴旅系统地基设计文档

---

## 一、系统架构概览

### 1.1 架构图



### 1.2 数据流向图



---

## 二、核心 Schema 设计

### 2.1 数据表总览（基于现有Supabase数据库）

项目使用 **Supabase (PostgreSQL)** 作为数据库，目前已部署以下数据表：

| 序号 | 表名 | 中文名 | 核心职责 | 数据来源 |
|------|------|--------|----------|----------|
| 1 | `attractions` | 景点表 | 存储旅游景点信息 | 基础数据表 |
| 2 | `hotels` | 酒店表 | 存储酒店住宿信息 | 基础数据表 |
| 3 | `flights` | 航班表 | 存储航班机票信息 | 基础数据表 |
| 4 | `weathers` | 天气表 | 存储城市天气预报 | 基础数据表 |
| 5 | `itinerary_requests` | 行程请求表 | 记录用户的行程规划请求 | 业务数据表 |
| 6 | `itinerary_plans` | 行程方案表 | 存储AI生成的行程方案 | 业务数据表 |
| 7 | `itinerary_items` | 行程项目表 | 存储每日具体的行程项目 | 业务数据表 |

### 2.2 现有基础数据表结构

#### 表 1: attractions（景点表）


| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | NO | gen_random_uuid() | 主键 |
| name | VARCHAR(100) | NO | - | 景点名称 |
| address | VARCHAR(255) | NO | - | 详细地址 |
| city | VARCHAR(50) | NO | - | 所属城市 |
| ticket_price | DECIMAL(10,2) | NO | 0 | 门票价格 |
| open_time | VARCHAR(10) | NO | - | 开放时间 |
| close_time | VARCHAR(10) | NO | - | 关闭时间 |
| rating | DECIMAL(2,1) | NO | 0 | 评分(0-5) |
| review_count | INTEGER | NO | 0 | 评论数量 |
| visit_time | DECIMAL(3,1) | NO | 1.0 | 建议游玩时长(小时) |
| tags | TEXT[] | YES | {} | 标签数组 |
| created_at | TIMESTAMPTZ | NO | NOW() | 创建时间 |



---

#### 表 2: hotels（酒店表）



| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | NO | gen_random_uuid() | 主键 |
| name | VARCHAR(100) | NO | - | 酒店名称 |
| city | VARCHAR(50) | NO | - | 所属城市 |
| address | VARCHAR(255) | NO | - | 详细地址 |
| star_level | INTEGER | YES | NULL | 星级(1-5) |
| price | DECIMAL(10,2) | NO | 0 | 每晚价格(元) |
| rating | DECIMAL(2,1) | NO | 0 | 评分(0-5) |
| review_count | INTEGER | NO | 0 | 评论数量 |
| distance_from_center | DECIMAL(5,2) | NO | 0 | 距市中心距离(km) |
| remaining_rooms | INTEGER | NO | 0 | 剩余房间数 |
| created_at | TIMESTAMPTZ | NO | NOW() | 创建时间 |



---

#### 表 3: flights（航班表）


| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | NO | gen_random_uuid() | 主键 |
| flight_no | VARCHAR(10) | NO | - | 航班号 |
| dep_city | VARCHAR(50) | NO | - | 出发城市 |
| arr_city | VARCHAR(50) | NO | - | 到达城市 |
| dep_date | DATE | NO | - | 出发日期 |
| dep_time | VARCHAR(10) | NO | - | 起飞时间(HH:MM) |
| arr_time | VARCHAR(10) | NO | - | 到达时间(HH:MM) |
| airline | VARCHAR(50) | NO | - | 航空公司 |
| price | DECIMAL(10,2) | NO | 0 | 票价(元) |
| discount | DECIMAL(3,2) | NO | 1.0 | 折扣率(0-1) |
| remaining_seats | INTEGER | NO | 0 | 剩余座位数 |
| created_at | TIMESTAMPTZ | NO | NOW() | 创建时间 |


---

#### 表 4: weathers（天气表）


| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | NO | gen_random_uuid() | 主键 |
| city | VARCHAR(50) | NO | - | 城市名称 |
| date | DATE | NO | - | 日期 |
| condition | VARCHAR(20) | NO | - | 天气状况 |
| temp_min | INTEGER | NO | - | 最低温度(℃) |
| temp_max | INTEGER | NO | - | 最高温度(℃) |
| wind_level | INTEGER | NO | 1 | 风力等级(1-12) |
| air_quality | VARCHAR(20) | NO | '良' | 空气质量 |
| created_at | TIMESTAMPTZ | NO | NOW() | 创建时间 |

---

### 2.3 业务数据表结构（新增）

基于现有基础数据表，新增以下业务数据表支持核心功能：

#### 表 5: itinerary_requests（行程请求表）


| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | NO | gen_random_uuid() | 主键 |
| content | TEXT | NO | - | 用户原始输入内容 |
| image_url | VARCHAR(500) | YES | NULL | 用户上传的图片URL |
| parsed_requirements | JSONB | YES | {} | AI解析后的结构化需求 |
| status | VARCHAR(20) | NO | 'pending' | 处理状态 |
| created_at | TIMESTAMPTZ | NO | NOW() | 创建时间 |
| completed_at | TIMESTAMPTZ | YES | NULL | 完成时间 |

---

#### 表 6: itinerary_plans（行程方案表）


| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | NO | gen_random_uuid() | 主键 |
| request_id | UUID | NO | - | 外键 → itinerary_requests.id |
| name | VARCHAR(100) | NO | - | 方案名称（如"亲子休闲版"） |
| description | TEXT | YES | NULL | 方案描述 |
| tags | TEXT[] | YES | {} | 标签数组 |
| total_days | INTEGER | NO | - | 总天数 |
| total_cost | DECIMAL(10,2) | NO | 0 | 预估总费用 |
| highlights | JSONB | YES | [] | 方案亮点 |
| is_selected | BOOLEAN | NO | FALSE | 是否被用户选中 |
| is_active | BOOLEAN | NO | TRUE | 是否有效 |
| created_at | TIMESTAMPTZ | NO | NOW() | 创建时间 |
| updated_at | TIMESTAMPTZ | NO | NOW() | 更新时间 |

---

#### 表 7: itinerary_items（行程项目表）


| 字段名 | 类型 | 可空 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | UUID | NO | gen_random_uuid() | 主键 |
| plan_id | UUID | NO | - | 外键 → itinerary_plans.id |
| attraction_id | UUID | YES | NULL | 外键 → attractions.id |
| hotel_id | UUID | YES | NULL | 外键 → hotels.id |
| flight_id | UUID | YES | NULL | 外键 → flights.id |
| type | VARCHAR(20) | NO | - | 项目类型 |
| custom_name | VARCHAR(100) | YES | NULL | 自定义名称 |
| custom_address | VARCHAR(255) | YES | NULL | 自定义地址 |
| day_index | INTEGER | NO | - | 第几天 |
| start_time | TIME | NO | - | 开始时间 |
| end_time | TIME | NO | - | 结束时间 |
| cost | DECIMAL(10,2) | NO | 0 | 费用 |
| sort_order | INTEGER | NO | 0 | 排序顺序 |
| created_at | TIMESTAMPTZ | NO | NOW() | 创建时间 |

---

### 2.4 表关系图



### 2.5 拆表理由说明

| 拆分点 | 理由 |
|--------|------|
| **基础数据表独立** | attractions/hotels/flights/weathers 是系统基础数据，与业务数据生命周期不同；支持多行程复用同一基础数据 |
| **requests vs plans 分离** | 一个请求可生成多套方案，分离后支持方案对比和历史回溯；requests表记录原始需求，plans表记录AI生成结果 |
| **plans vs items 分离** | 符合1:N关系，items数据量大且频繁查询；分离后支持按天、按类型灵活筛选 |
| **items关联基础表** | itinerary_items通过外键关联基础数据表，避免数据冗余；同时支持自定义项目（custom_name/address） |

---

### 2.6 AI初稿 → 我的审改要点

| 序号 | AI初稿问题 | 我的修改 | 修改理由 |
|------|-----------|----------|----------|
| 1 | 未体现现有基础数据表 | 补充 attractions/hotels/flights/weathers 四张现有表 | 基于项目实际Supabase数据库现状 |
| 2 | items表缺少外键关联 | 添加 attraction_id/hotel_id/flight_id 外键 | 行程项目可直接引用基础数据，避免冗余 |
| 3 | 缺少自定义项目支持 | 添加 custom_name/custom_address | 支持非标准项目（如自定义餐厅、活动） |
| 4 | 未体现现有数据示例 | 添加各表示例数据 | 更直观展示数据结构 |
| 5 | 索引设计不完善 | 为基础表添加业务查询索引 | 如城市索引、价格索引、标签GIN索引 |

---

## 三、接口契约文档

### 3.1 接口总览

| 序号 | 接口 | 方法 | 功能描述 |
|------|------|------|----------|
| 1 | `/api/v1/itinerary/generate` | POST | 生成多套行程方案 |
| 2 | `/api/v1/timeline/sync` | POST | 同步时间线状态 |

### 3.2 接口 1: 生成行程方案

#### 3.2.1 接口描述

- **接口路径**: `/api/v1/itinerary/generate`
- **请求方法**: POST
- **功能描述**: 接收用户自然语言输入，调用AI生成多套行程方案
- **认证要求**: 需要登录（Bearer Token）

#### 3.2.2 请求体字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| content | string | 是 | 用户自然语言输入，描述行程需求 |
| image_url | string | 否 | 用户上传的参考图片URL |
| preferences | object | 否 | 结构化偏好，辅助AI理解 |
| preferences.travel_style | array[string] | 否 | 旅行风格偏好，如["美食", "风景"] |
| preferences.budget_level | string | 否 | 预算级别：low/medium/high |
| preferences.travelers | object | 否 | 出行人数信息 |
| preferences.travelers.adults | integer | 否 | 成人数量 |
| preferences.travelers.children | integer | 否 | 儿童数量 |

#### 3.2.3 响应体字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | integer | HTTP状态码，200表示成功 |
| message | string | 响应消息，success表示成功 |
| data | object | 响应数据对象 |
| data.request_id | string(UUID) | 请求ID |
| data.status | string | 处理状态：completed |
| data.plans | array | 行程方案列表 |
| data.plans[].id | string(UUID) | 方案ID |
| data.plans[].name | string | 方案名称，如"亲子休闲版" |
| data.plans[].description | string | 方案描述 |
| data.plans[].tags | array[string] | 标签列表 |
| data.plans[].total_days | integer | 总天数 |
| data.plans[].total_cost | number | 预估总费用 |
| data.plans[].highlights | array[string] | 方案亮点 |
| data.plans[].days | array | 每日行程列表 |
| data.plans[].days[].day | integer | 第几天 |
| data.plans[].days[].date | string | 日期 |
| data.plans[].days[].items | array | 当日行程项目 |
| data.plans[].days[].items[].id | string(UUID) | 项目ID |
| data.plans[].days[].items[].type | string | 项目类型：flight/hotel/attraction/meal/transport |
| data.plans[].days[].items[].name | string | 项目名称 |
| data.plans[].days[].items[].start_time | string | 开始时间 |
| data.plans[].days[].items[].end_time | string | 结束时间 |
| data.plans[].days[].items[].cost | number | 费用 |
| data.plans[].days[].items[].description | string | 项目描述 |

#### 3.2.4 错误响应说明

| 状态码 | 错误场景 | 错误信息 | 附加字段 |
|--------|----------|----------|----------|
| 400 | 请求参数错误 | 请求参数错误 | errors: [{field, message}] |
| 401 | 未授权 | 未登录或Token已过期 | - |
| 429 | 请求过于频繁 | 请求过于频繁，请稍后再试 | retry_after: 60 |
| 500 | 服务器错误 | 行程生成失败，请稍后重试 | request_id |

**错误响应示例：**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | integer | 是 | HTTP状态码 |
| message | string | 是 | 错误描述 |
| errors | array | 否 | 详细错误列表（400时返回） |
| errors[].field | string | 是 | 错误字段名 |
| errors[].message | string | 是 | 字段错误描述 |
| retry_after | integer | 否 | 重试等待秒数（429时返回） |
| request_id | string | 否 | 请求追踪ID（500时返回） |

#### 3.2.5 接口规范汇总

| 属性 | 值 |
|------|-----|
| 接口路径 | `/api/v1/itinerary/generate` |
| 请求方法 | POST |
| 认证方式 | Bearer Token |
| 功能标签 | 行程规划 |

**请求体字段：**

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| content | string | 是 | maxLength: 2000 | 用户行程需求描述 |
| image_url | string | 否 | format: uri | 参考图片URL |
| preferences | object | 否 | - | 结构化偏好参数 |

**响应状态码：**

| 状态码 | 描述 | 响应内容 |
|--------|------|----------|
| 200 | 生成成功 | GenerateResponse 对象 |
| 400 | 参数错误 | 错误响应对象 |
| 401 | 未授权 | 错误响应对象 |
| 429 | 请求过于频繁 | 错误响应对象（含retry_after） |
| 500 | 服务器错误 | 错误响应对象（含request_id） |

---

### 3.3 接口 2: 同步时间线状态

#### 3.3.1 接口描述

- **接口路径**: `/api/v1/timeline/sync`
- **请求方法**: POST
- **功能描述**: 同步用户当前位置和行程进度，获取实时提醒
- **认证要求**: 需要登录（Bearer Token）

#### 3.3.2 请求体字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| plan_id | string(UUID) | 是 | 当前执行的行程方案ID |
| location | object | 否 | 当前位置信息 |
| location.latitude | number | 是 | 纬度 |
| location.longitude | number | 是 | 经度 |
| location.accuracy | number | 是 | 精度（米） |
| current_time | string(ISO8601) | 是 | 当前时间 |
| travel_mode | string | 否 | 出行方式：walking/driving/public_transport |
| node_updates | array | 否 | 节点状态更新列表 |
| node_updates[].node_id | string(UUID) | 是 | 节点ID |
| node_updates[].status | string | 是 | 节点状态：not_started/in_progress/completed/delayed/cancelled |
| node_updates[].actual_time | string(ISO8601) | 是 | 实际发生时间 |

#### 3.3.3 响应体字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | integer | HTTP状态码，200表示成功 |
| message | string | 响应消息，success表示成功 |
| data | object | 响应数据对象 |
| data.sync_id | string | 同步ID，用于请求追踪 |
| data.current_context | object | 当前行程上下文 |
| data.current_context.plan_id | string(UUID) | 行程方案ID |
| data.current_context.current_day | integer | 当前第几天 |
| data.current_context.progress | integer | 整体进度百分比(0-100) |
| data.current_context.next_node | object | 下一个节点信息 |
| data.current_context.next_node.id | string(UUID) | 节点ID |
| data.current_context.next_node.title | string | 节点标题 |
| data.current_context.next_node.type | string | 节点类型 |
| data.current_context.next_node.scheduled_time | string(ISO8601) | 计划时间 |
| data.current_context.next_node.time_remaining | integer | 剩余时间(秒) |
| data.current_context.next_node.distance | integer | 距离(米) |
| data.notifications | array | 通知列表 |
| data.notifications[].id | string | 通知ID |
| data.notifications[].level | string | 通知级别：info/warning/error/urgent |
| data.notifications[].content | string | 通知内容 |
| data.notifications[].action_url | string | 操作链接 |
| data.suggestions | array | 智能建议列表 |
| data.suggestions[].type | string | 建议类型 |
| data.suggestions[].content | string | 建议内容 |
| data.suggestions[].priority | string | 优先级：low/medium/high |

#### 3.3.4 错误响应说明

| 状态码 | 错误场景 | 错误信息 | 附加字段 |
|--------|----------|----------|----------|
| 400 | 请求参数错误 | 请求参数错误 | errors: [{field, message}] |
| 403 | 权限不足 | 无权访问该行程方案 | - |
| 404 | 资源不存在 | 行程方案不存在或已删除 | - |
| 409 | 状态冲突 | 节点状态冲突 | errors: [{field, message}] |

**错误响应字段说明：**

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | integer | 是 | HTTP状态码 |
| message | string | 是 | 错误描述 |
| errors | array | 否 | 详细错误列表（400/409时返回） |
| errors[].field | string | 是 | 错误字段名 |
| errors[].message | string | 是 | 字段错误描述 |

#### 3.3.5 接口规范汇总

| 属性 | 值 |
|------|-----|
| 接口路径 | `/api/v1/timeline/sync` |
| 请求方法 | POST |
| 认证方式 | Bearer Token |
| 功能标签 | 情境感知 |

**请求体字段：**

| 字段名 | 类型 | 必填 | 约束 | 说明 |
|--------|------|------|------|------|
| plan_id | string(UUID) | 是 | format: uuid | 行程方案ID |
| location | object | 否 | - | 当前位置信息 |
| location.latitude | number | 是 | - | 纬度 |
| location.longitude | number | 是 | - | 经度 |
| location.accuracy | number | 是 | - | 精度（米） |
| current_time | string(ISO8601) | 是 | format: date-time | 当前时间 |
| travel_mode | string | 否 | enum: [walking, driving, public_transport] | 出行方式 |
| node_updates | array | 否 | items: object | 节点状态更新列表 |

**响应状态码：**

| 状态码 | 描述 | 响应内容 |
|--------|------|----------|
| 200 | 同步成功 | SyncResponse 对象 |
| 400 | 参数错误 | 错误响应对象 |
| 403 | 权限不足 | 错误响应对象 |
| 404 | 资源不存在 | 错误响应对象 |
| 409 | 状态冲突 | 错误响应对象 |

---

### 3.5 AI初稿 → 我的审改要点

| 序号 | AI初稿问题 | 我的修改 | 修改理由 |
|------|-----------|----------|----------|
| 1 | 缺少 `preferences` 字段 | 添加结构化偏好参数 | 支持用户预设偏好与本次需求结合 |
| 2 | 响应缺少 `highlights` | 添加方案亮点字段 | 前端需要展示差异化卖点 |
| 3 | timeline接口缺少 `suggestions` | 添加智能建议字段 | 情境感知需要提供主动建议 |
| 4 | 错误码设计不一致 | 统一错误格式 | 400参数/401认证/403权限/404资源/409冲突/429限流/500服务器 |
| 5 | 缺少 `sync_id` | 添加同步ID | 支持请求追踪和幂等性控制 |

---

## 四、附录

### 附录 A: Schema生成提示词（供参考）

```
你是一名资深数据库架构师，请为「伴旅」智能旅行应用设计PostgreSQL数据库Schema。

业务场景：
1. 用户输入自然语言需求，AI生成多套行程方案
2. 每套方案包含多日行程，每日有多个项目（景点/酒店/交通等）
3. 情境感知模块跟踪行程执行，推送实时提醒

请设计3-5张核心表，要求：
- 使用UUID主键
- 合理使用JSONB存储灵活字段
- 添加必要的索引和约束
- 写清字段类型、是否可空、默认值
- 为每张表添加中文注释

输出格式：SQL建表语句 + 字段说明表格
```

### 附录 B: 接口契约生成提示词（供参考）

```
你是一名API架构师，请为「伴旅」应用设计RESTful接口契约。

接口功能：[描述具体功能，如"生成行程方案"/"同步时间线状态"]

要求：
- 使用OpenAPI 3.0规范
- 写清请求体、响应体、错误格式
- 包含字段类型、必填性、取值范围说明
- 提供完整的请求/响应示例
- 错误码覆盖：400/401/403/404/429/500

输出格式：OpenAPI YAML片段 + Markdown表格说明
```

---


*文档结束*
