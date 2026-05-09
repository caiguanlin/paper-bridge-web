# Curriculum 教材目录 API 接口文档

**Base URL:** `/api/curriculum`

---

## 通用响应结构

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

| 字段      | 类型    | 说明                |
| --------- | ------- | ------------------- |
| success   | boolean | 请求是否成功        |
| data      | T       | 响应数据            |
| message   | String  | 错误信息（成功时为null） |

---

## 1. 查询教材目录列表

**GET** `/api/curriculum`

### 请求参数（Query String）

| 参数       | 类型   | 必填 | 说明   |
| ---------- | ------ | ---- | ------ |
| publisher  | String | 否   | 出版社 |
| subject    | String | 否   | 科目   |
| grade      | String | 否   | 年级   |
| volume     | String | 否   | 册别   |

### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "publisher": "人教版",
      "subject": "CHINESE",
      "grade": "一年级",
      "volume": "上册",
      "unit": "第一单元",
      "chapter": "秋天",
      "sortOrder": 1,
      "editionYear": 2024,
      "sourceUrl": null
    }
  ],
  "message": null
}
```

---

## 2. 创建教材目录

**POST** `/api/curriculum`

### 请求体（JSON）

| 字段        | 类型    | 必填 | 说明         |
| ----------- | ------- | ---- | ------------ |
| publisher   | String  | 是   | 出版社       |
| subject     | String  | 是   | 科目         |
| grade       | String  | 是   | 年级         |
| volume      | String  | 是   | 册别         |
| unit        | String  | 是   | 单元         |
| chapter     | String  | 是   | 章节标题     |
| sortOrder   | Integer | 否   | 排序（默认0）|
| editionYear | Integer | 否   | 版本年份     |
| sourceUrl   | String  | 否   | 来源URL      |

### 请求示例

```json
{
  "publisher": "人教版",
  "subject": "CHINESE",
  "grade": "一年级",
  "volume": "上册",
  "unit": "第一单元",
  "chapter": "秋天",
  "sortOrder": 1,
  "editionYear": 2024,
  "sourceUrl": null
}
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": 1,
    "publisher": "人教版",
    "subject": "CHINESE",
    "grade": "一年级",
    "volume": "上册",
    "unit": "第一单元",
    "chapter": "秋天",
    "sortOrder": 1,
    "editionYear": 2024,
    "sourceUrl": null
  },
  "message": null
}
```

---

## 3. 更新教材目录

**PUT** `/api/curriculum/{id}`

### 路径参数

| 参数 | 类型 | 说明       |
| ---- | ---- | ---------- |
| id   | Long | 目录记录ID |

### 请求体（JSON）

与创建接口相同。

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": 1,
    "publisher": "人教版",
    "subject": "CHINESE",
    "grade": "一年级",
    "volume": "上册",
    "unit": "第一单元",
    "chapter": "春天",
    "sortOrder": 2,
    "editionYear": 2024,
    "sourceUrl": null
  },
  "message": null
}
```

---

## 4. 删除教材目录

**DELETE** `/api/curriculum/{id}`

### 路径参数

| 参数 | 类型 | 说明       |
| ---- | ---- | ---------- |
| id   | Long | 目录记录ID |

### 响应示例

```json
{
  "success": true,
  "data": null,
  "message": null
}
```

---

## 5. 获取教材目录树

**GET** `/api/curriculum/tree`

### 请求参数

无

### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "label": "人教版",
      "value": "人教版",
      "type": "publisher",
      "id": null,
      "children": [
        {
          "label": "语文",
          "value": "CHINESE",
          "type": "subject",
          "id": null,
          "children": [
            {
              "label": "一年级",
              "value": "一年级",
              "type": "grade",
              "id": null,
              "children": [
                {
                  "label": "上册",
                  "value": "上册",
                  "type": "volume",
                  "id": null,
                  "children": [
                    {
                      "label": "第一单元",
                      "value": "第一单元",
                      "type": "unit",
                      "id": null,
                      "children": [
                        {
                          "label": "秋天",
                          "value": "秋天",
                          "type": "chapter",
                          "id": 1,
                          "children": []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "message": null
}
```

### CurriculumTreeNode 结构

| 字段     | 类型                    | 说明         |
| -------- | ----------------------- | ------------ |
| label    | String                  | 显示名称     |
| value    | String                  | 值           |
| type     | String                  | 节点类型：publisher / subject / grade / volume / unit / chapter |
| id       | Long                    | 记录ID（仅chapter层级有值） |
| children | List\<CurriculumTreeNode\> | 子节点列表   |
