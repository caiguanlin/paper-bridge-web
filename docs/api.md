# Paper Bridge API 接口文档

本文档依据当前后端代码整理，覆盖项目中所有已暴露 HTTP 接口。后端默认端口为 `8080`，接口基址为：

```text
http://localhost:8080
```

## 1. 通用约定

### 1.1 认证

除注册、登录接口外，其余接口均需要 JWT：

```http
Authorization: Bearer <token>
```

公开接口：

- `POST /api/auth/register`
- `POST /api/auth/login`

### 1.2 响应包装

业务 JSON 接口统一返回：

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

项目配置了 `spring.jackson.default-property-inclusion=non_null`，所以 `data` 或 `message` 为 `null` 时可能不会出现在响应 JSON 中。

失败响应示例：

```json
{
  "success": false,
  "message": "试卷不存在"
}
```

常见状态码：

| 状态码 | 说明 |
| --- | --- |
| `200` | 请求成功 |
| `400` | 参数校验失败或业务异常 |
| `401/403` | 未登录、Token 缺失或无效 |
| `500` | 服务端未知异常 |

### 1.3 枚举值

题型 `QuestionType`：

| 值 | 含义 |
| --- | --- |
| `SINGLE_CHOICE` | 单选题 |
| `TRUE_FALSE` | 判断题 |
| `FILL_BLANK` | 填空题 |
| `MATCHING` | 连线题 |
| `DICTATION` | 默写题 |

难度 `Difficulty`：

| 值 | 含义 |
| --- | --- |
| `EASY` | 简单 |
| `MEDIUM` | 中等 |
| `HARD` | 困难 |

题目来源 `QuestionSource`：

| 值 | 含义 |
| --- | --- |
| `MANUAL` | 手动录入 |
| `EXCEL_IMPORT` | Excel 导入 |
| `AI` | AI 生成 |

组卷策略 `GenerationStrategy`：

| 值 | 含义 |
| --- | --- |
| `BANK_ONLY` | 只使用题库，题库不足时报错 |
| `BANK_WITH_AI` | 题库优先，不足部分由 AI 补题 |
| `AI_ONLY` | 只使用 AI 生成题目 |
| `BANK_FIRST` | 题库优先，不足部分由 AI 补题 |

试卷状态 `PaperStatus`：

| 值 | 含义 |
| --- | --- |
| `DRAFT` | 草稿 |
| `SAVED` | 已保存 |

### 1.4 题目 JSON 结构

`contentJson`、`answerJson` 是字符串字段，内容必须是 JSON 对象字符串。

单选题：

```json
{
  "contentJson": "{\"options\":[\"A. 3\",\"B. 4\",\"C. 5\"]}",
  "answerJson": "{\"correctOption\":\"B\"}"
}
```

判断题：

```json
{
  "contentJson": "{\"statement\":\"1 米等于 100 厘米\"}",
  "answerJson": "{\"correctBoolean\":true}"
}
```

填空题：

```json
{
  "contentJson": "{\"blanks\":[\"第1空\",\"第2空\"]}",
  "answerJson": "{\"acceptedAnswers\":[[\"答案1\"],[\"答案2\"]]}"
}
```

连线题：

```json
{
  "contentJson": "{\"leftItems\":[\"1米\",\"1千克\"],\"rightItems\":[\"长度单位\",\"质量单位\"]}",
  "answerJson": "{\"pairs\":[{\"left\":\"1米\",\"right\":\"长度单位\"}]}"
}
```

默写题：

```json
{
  "contentJson": "{\"prompt\":\"默写《静夜思》前两句\"}",
  "answerJson": "{\"expectedText\":\"床前明月光，疑是地上霜。\"}"
}
```

## 2. 认证接口

### 2.1 注册

```http
POST /api/auth/register
Content-Type: application/json
```

请求体：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | string | 是 | 用户名，最长 64 字符 |
| `password` | string | 是 | 密码，6 到 72 字符 |
| `displayName` | string | 是 | 显示名称，最长 64 字符 |

请求示例：

```json
{
  "username": "teacher01",
  "password": "secret123",
  "displayName": "王老师"
}
```

响应 `data`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `token` | string | JWT |
| `teacherId` | number | 老师用户 ID |
| `username` | string | 用户名 |
| `displayName` | string | 显示名称 |

### 2.2 登录

```http
POST /api/auth/login
Content-Type: application/json
```

请求体：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `username` | string | 是 | 用户名 |
| `password` | string | 是 | 密码 |

请求示例：

```json
{
  "username": "teacher01",
  "password": "secret123"
}
```

响应 `data` 同注册接口。

## 3. 教材目录接口

### 3.1 查询教材目录

```http
GET /api/curriculum?publisher=人教版&subject=MATH&grade=三年级&volume=上册
Authorization: Bearer <token>
```

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `publisher` | string | 否 | 出版社 |
| `subject` | string | 否 | 科目 |
| `grade` | string | 否 | 年级 |
| `volume` | string | 否 | 册别 |

响应 `data`：`CurriculumResponse[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 教材目录 ID |
| `publisher` | string | 出版社 |
| `subject` | string | 科目 |
| `grade` | string | 年级 |
| `volume` | string | 册别 |
| `unit` | string | 单元 |
| `chapter` | string | 章节 |
| `sortOrder` | number | 排序值 |
| `editionYear` | number | 版本年份 |
| `sourceUrl` | string | 来源 URL |

### 3.2 新增教材目录

```http
POST /api/curriculum
Authorization: Bearer <token>
Content-Type: application/json
```

请求体：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `publisher` | string | 是 | 出版社 |
| `subject` | string | 是 | 科目 |
| `grade` | string | 是 | 年级 |
| `volume` | string | 是 | 册别 |
| `unit` | string | 是 | 单元 |
| `chapter` | string | 是 | 章节标题 |
| `sortOrder` | number | 否 | 排序值，空值按 `0` 处理 |
| `editionYear` | number | 否 | 版本年份 |
| `sourceUrl` | string | 否 | 来源 URL |

请求示例：

```json
{
  "publisher": "人教版",
  "subject": "MATH",
  "grade": "三年级",
  "volume": "上册",
  "unit": "第三单元",
  "chapter": "测量",
  "sortOrder": 1,
  "editionYear": 2026,
  "sourceUrl": "https://example.com"
}
```

响应 `data`：`CurriculumResponse`

### 3.3 更新教材目录

```http
PUT /api/curriculum/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 教材目录 ID |

请求体同新增教材目录。响应 `data`：`CurriculumResponse`

### 3.4 删除教材目录

```http
DELETE /api/curriculum/{id}
Authorization: Bearer <token>
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 教材目录 ID |

成功响应：

```json
{
  "success": true
}
```

### 3.5 获取教材目录树

```http
GET /api/curriculum/tree
Authorization: Bearer <token>
```

响应 `data`：`CurriculumTreeNode[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `label` | string | 展示名称 |
| `value` | string | 节点值 |
| `type` | string | 节点类型：`publisher`、`subject`、`grade`、`volume`、`unit`、`chapter` |
| `id` | number | 章节节点对应的教材目录 ID，其他层级通常为空 |
| `children` | array | 子节点 |

响应示例：

```json
{
  "success": true,
  "data": [
    {
      "label": "人教版",
      "value": "人教版",
      "type": "publisher",
      "children": [
        {
          "label": "数学",
          "value": "MATH",
          "type": "subject",
          "children": []
        }
      ]
    }
  ]
}
```

## 4. 题库接口

### 4.1 查询题库

```http
GET /api/questions?grade=三年级&publisher=人教版&subject=MATH&volume=上册&unit=第三单元&chapter=测量&questionType=TRUE_FALSE&difficulty=MEDIUM
Authorization: Bearer <token>
```

查询参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `grade` | string | 否 | 年级 |
| `publisher` | string | 否 | 出版社 |
| `subject` | string | 否 | 科目 |
| `volume` | string | 否 | 册别 |
| `unit` | string | 否 | 单元 |
| `chapter` | string | 否 | 章节 |
| `questionType` | enum | 否 | 题型 |
| `difficulty` | enum | 否 | 难度 |

响应 `data`：`QuestionResponse[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 题目 ID |
| `grade` | string | 年级 |
| `publisher` | string | 出版社 |
| `subject` | string | 科目 |
| `volume` | string | 册别 |
| `unit` | string | 单元 |
| `chapter` | string | 章节 |
| `questionType` | enum | 题型 |
| `difficulty` | enum | 难度 |
| `stem` | string | 题干 |
| `contentJson` | string | 题目结构 JSON 字符串 |
| `answerJson` | string | 答案 JSON 字符串 |
| `analysis` | string | 解析 |
| `source` | enum | 来源 |
| `usageCount` | number | 使用次数 |
| `updatedAt` | string | 更新时间 |

### 4.2 新增题目

```http
POST /api/questions
Authorization: Bearer <token>
Content-Type: application/json
```

请求体：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `grade` | string | 是 | 年级 |
| `publisher` | string | 是 | 出版社 |
| `subject` | string | 是 | 科目 |
| `volume` | string | 是 | 册别 |
| `unit` | string | 是 | 单元 |
| `chapter` | string | 是 | 章节 |
| `questionType` | enum | 是 | 题型 |
| `difficulty` | enum | 是 | 难度 |
| `stem` | string | 是 | 题干 |
| `contentJson` | string | 是 | 题目结构 JSON 字符串 |
| `answerJson` | string | 是 | 答案 JSON 字符串 |
| `analysis` | string | 否 | 解析 |

请求示例：

```json
{
  "grade": "三年级",
  "publisher": "人教版",
  "subject": "MATH",
  "volume": "上册",
  "unit": "第三单元",
  "chapter": "测量",
  "questionType": "TRUE_FALSE",
  "difficulty": "MEDIUM",
  "stem": "1 米等于 100 厘米。",
  "contentJson": "{\"statement\":\"1 米等于 100 厘米。\"}",
  "answerJson": "{\"correctBoolean\":true}",
  "analysis": "长度单位换算。"
}
```

响应 `data`：`QuestionResponse`

### 4.3 Excel 导入题目

```http
POST /api/questions/import/excel
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

表单参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | file | 是 | `.xlsx` 文件 |

导入规则：

- 读取第一个 Sheet。
- 第 1 行作为表头，从第 2 行开始导入。
- 空行会被跳过。
- 单行失败不影响其他行导入。

Excel 列顺序：

| 列序号 | 字段 |
| --- | --- |
| 0 | `grade` |
| 1 | `publisher` |
| 2 | `subject` |
| 3 | `volume` |
| 4 | `unit` |
| 5 | `chapter` |
| 6 | `questionType` |
| 7 | `difficulty` |
| 8 | `stem` |
| 9 | `contentJson` |
| 10 | `answerJson` |
| 11 | `analysis` |

响应 `data`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `successCount` | number | 成功导入数量 |
| `failureCount` | number | 失败数量 |
| `errors` | array | 错误列表 |
| `errors[].rowNumber` | number | 行号，文件级错误为 `0` |
| `errors[].fieldName` | string | 字段名 |
| `errors[].message` | string | 错误信息 |

## 5. 试卷接口

### 5.1 预览组卷计划

```http
POST /api/papers/preview-plan
Authorization: Bearer <token>
Content-Type: application/json
```

请求体 `PaperGenerateRequest`：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 是 | 试卷标题 |
| `grade` | string | 是 | 年级 |
| `publisher` | string | 是 | 出版社 |
| `subject` | string | 是 | 科目 |
| `volume` | string | 是 | 册别 |
| `unit` | string | 是 | 单元 |
| `chapter` | string | 是 | 章节 |
| `totalScore` | number | 是 | 总分，必须大于 0 |
| `strategy` | enum | 是 | 组卷策略 |
| `difficulty` | enum | 否 | 难度偏好，为空时组卷不按难度过滤，AI 默认中等难度 |
| `sections` | array | 是 | 题型区块，至少 1 个 |
| `sections[].title` | string | 是 | 区块标题 |
| `sections[].questionType` | enum | 是 | 题型 |
| `sections[].questionCount` | number | 是 | 题目数量，必须大于 0 |
| `sections[].scorePerQuestion` | number | 是 | 每题分数，必须大于 0 |

请求示例：

```json
{
  "title": "三年级数学第三单元测评",
  "grade": "三年级",
  "publisher": "人教版",
  "subject": "MATH",
  "volume": "上册",
  "unit": "第三单元",
  "chapter": "测量",
  "totalScore": 20,
  "strategy": "BANK_WITH_AI",
  "difficulty": "MEDIUM",
  "sections": [
    {
      "title": "判断题",
      "questionType": "TRUE_FALSE",
      "questionCount": 2,
      "scorePerQuestion": 10
    }
  ]
}
```

响应 `data`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `totalScore` | number | 请求总分 |
| `subtotalScore` | number | 各题型小计之和 |
| `sections` | array | 区块预览 |
| `sections[].title` | string | 区块标题 |
| `sections[].questionType` | enum | 题型 |
| `sections[].requiredCount` | number | 需要题数 |
| `sections[].availableBankCount` | number | 当前题库可用数量 |
| `sections[].aiSupplementCount` | number | 预计 AI 补题数量 |
| `sections[].subtotalScore` | number | 区块小计 |

业务规则：

- `totalScore` 必须等于所有 `questionCount * scorePerQuestion` 之和。
- `BANK_ONLY` 策略下 `aiSupplementCount` 为 `0`。
- `AI_ONLY` 策略下 `availableBankCount` 为 `0`。

### 5.2 生成试卷

```http
POST /api/papers/generate
Authorization: Bearer <token>
Content-Type: application/json
```

请求体同预览组卷计划。响应 `data`：`PaperResponse`

业务规则：

- 生成的试卷状态为 `DRAFT`。
- 题库题目会复制为 `PaperQuestion` 快照。
- AI 只补足题库缺口，不直接生成整张试卷，除非策略为 `AI_ONLY`。
- `BANK_ONLY` 策略下题库不足会返回业务错误。

### 5.3 查询试卷列表

```http
GET /api/papers
Authorization: Bearer <token>
```

响应 `data`：`PaperSummaryResponse[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 试卷 ID |
| `title` | string | 标题 |
| `grade` | string | 年级 |
| `publisher` | string | 出版社 |
| `subject` | string | 科目 |
| `volume` | string | 册别 |
| `unit` | string | 单元 |
| `chapter` | string | 章节 |
| `totalScore` | number | 总分 |
| `status` | enum | 试卷状态 |
| `updatedAt` | string | 更新时间 |

### 5.4 查询试卷详情

```http
GET /api/papers/{paperId}
Authorization: Bearer <token>
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `paperId` | number | 试卷 ID |

响应 `data`：`PaperResponse`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 试卷 ID |
| `title` | string | 标题 |
| `grade` | string | 年级 |
| `publisher` | string | 出版社 |
| `subject` | string | 科目 |
| `volume` | string | 册别 |
| `unit` | string | 单元 |
| `chapter` | string | 章节 |
| `totalScore` | number | 总分 |
| `status` | enum | 状态 |
| `updatedAt` | string | 更新时间 |
| `sections` | array | 题型区块 |
| `sections[].id` | number | 区块 ID |
| `sections[].title` | string | 区块标题 |
| `sections[].questionType` | enum | 题型 |
| `sections[].questionCount` | number | 题量 |
| `sections[].scorePerQuestion` | number | 每题分数 |
| `sections[].subtotalScore` | number | 区块小计 |
| `sections[].sortOrder` | number | 排序值 |
| `sections[].questions` | array | 试卷题目快照 |
| `sections[].questions[].id` | number | 试卷题目快照 ID |
| `sections[].questions[].sourceQuestionId` | number | 原题库题目 ID，AI 题通常为空 |
| `sections[].questions[].source` | enum | 来源 |
| `sections[].questions[].stemSnapshot` | string | 题干快照 |
| `sections[].questions[].contentSnapshotJson` | string | 内容快照 JSON 字符串 |
| `sections[].questions[].answerSnapshotJson` | string | 答案快照 JSON 字符串 |
| `sections[].questions[].analysisSnapshot` | string | 解析快照 |
| `sections[].questions[].score` | number | 分值 |
| `sections[].questions[].sortOrder` | number | 排序值 |

### 5.5 更新试卷题目快照

```http
PATCH /api/papers/{paperId}/questions/{paperQuestionId}
Authorization: Bearer <token>
Content-Type: application/json
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `paperId` | number | 试卷 ID |
| `paperQuestionId` | number | 试卷题目快照 ID |

请求体：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `stemSnapshot` | string | 是 | 题干快照 |
| `contentSnapshotJson` | string | 是 | 内容快照 JSON 字符串 |
| `answerSnapshotJson` | string | 是 | 答案快照 JSON 字符串 |
| `analysisSnapshot` | string | 否 | 解析快照 |
| `score` | number | 是 | 分值，必须大于 0 |

请求示例：

```json
{
  "stemSnapshot": "1 米等于 100 厘米。",
  "contentSnapshotJson": "{\"statement\":\"1 米等于 100 厘米。\"}",
  "answerSnapshotJson": "{\"correctBoolean\":true}",
  "analysisSnapshot": "长度单位换算。",
  "score": 10
}
```

响应 `data`：更新后的 `PaperResponse`

业务规则：

- 只修改试卷题目快照，不更新原题库题目。
- 更新后会重新计算区块小计和试卷总分。
- 会按所在区块题型校验 `contentSnapshotJson` 和 `answerSnapshotJson`。

### 5.6 保存试卷题目到题库

```http
POST /api/papers/{paperId}/questions/{paperQuestionId}/save-to-bank
Authorization: Bearer <token>
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `paperId` | number | 试卷 ID |
| `paperQuestionId` | number | 试卷题目快照 ID |

响应 `data`：`QuestionResponse`

业务规则：

- 将当前试卷题目快照保存为新的个人题库题目。
- 新题目的教材范围来自试卷。
- 新题目的难度默认为 `MEDIUM`。
- AI 快照保存入库后来源为 `AI`，其他快照保存入库后来源为 `MANUAL`。

### 5.7 获取打印 HTML

```http
GET /api/papers/{paperId}/print?version=student
Authorization: Bearer <token>
Accept: text/html
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `paperId` | number | 试卷 ID |

查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `version` | string | 否 | `student` | `student` 学生版隐藏答案解析；`teacher` 教师版显示答案解析 |

响应：

- `Content-Type: text/html`
- 响应体为可打印 HTML 字符串。

### 5.8 导出 Word

```http
POST /api/papers/{paperId}/export/word?version=teacher
Authorization: Bearer <token>
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `paperId` | number | 试卷 ID |

查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `version` | string | 否 | `student` | `student` 学生版；`teacher` 教师版 |

响应：

- `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `Content-Disposition: attachment; filename="paper-{paperId}-{version}.docx"`
- 响应体为 `.docx` 文件字节流。

### 5.9 复制试卷

```http
POST /api/papers/{paperId}/copy
Authorization: Bearer <token>
```

响应 `data`：复制后的 `PaperResponse`

业务规则：

- 复制试卷、题型区块和全部题目快照。
- 新试卷标题为原标题追加 ` (副本)`。
- 新试卷状态为 `DRAFT`。

### 5.10 重新组卷

```http
POST /api/papers/{paperId}/regenerate
Authorization: Bearer <token>
```

响应 `data`：重新生成后的 `PaperResponse`

业务规则：

- 使用原试卷的范围、总分、题型结构重新生成。
- 策略固定为 `BANK_FIRST`。
- 重新生成的新标题为原标题追加 ` (重新组卷)`。
- 当前实现会先删除原试卷下的区块和题目快照，再创建一份新的试卷。

### 5.11 保存试卷

```http
POST /api/papers/{paperId}/save
Authorization: Bearer <token>
```

响应：

```json
{
  "success": true
}
```

业务规则：

- 将试卷状态从 `DRAFT` 改为 `SAVED`。
- 已经是 `SAVED` 时重复调用不会报错。

### 5.12 删除试卷

```http
DELETE /api/papers/{paperId}
Authorization: Bearer <token>
```

响应：

```json
{
  "success": true
}
```

业务规则：

- 删除试卷、题型区块和题目快照。

## 6. 题型模板接口

### 6.1 查询模板列表

```http
GET /api/question-type-templates
Authorization: Bearer <token>
```

响应 `data`：`QuestionTypeTemplateResponse[]`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 模板 ID |
| `name` | string | 模板名称 |
| `totalScore` | number | 总分 |
| `sortOrder` | number | 排序值 |
| `updatedAt` | string | 更新时间 |
| `items` | array | 题型配置项 |
| `items[].id` | number | 配置项 ID |
| `items[].title` | string | 题型标题 |
| `items[].questionType` | enum | 题型 |
| `items[].questionCount` | number | 题目数量 |
| `items[].scorePerQuestion` | number | 每题分数 |
| `items[].sortOrder` | number | 排序值 |

### 6.2 查询模板详情

```http
GET /api/question-type-templates/{id}
Authorization: Bearer <token>
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 模板 ID |

响应 `data`：`QuestionTypeTemplateResponse`

### 6.3 新增模板

```http
POST /api/question-type-templates
Authorization: Bearer <token>
Content-Type: application/json
```

请求体：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `name` | string | 是 | 模板名称 |
| `totalScore` | number | 是 | 总分，必须大于 0 |
| `sortOrder` | number | 否 | 排序值，空值按 `0` 处理 |
| `items` | array | 是 | 题型配置项，至少 1 个 |
| `items[].title` | string | 是 | 题型标题 |
| `items[].questionType` | enum | 是 | 题型 |
| `items[].questionCount` | number | 是 | 题目数量，必须大于 0 |
| `items[].scorePerQuestion` | number | 是 | 每题分数，必须大于 0 |

请求示例：

```json
{
  "name": "20 分基础测评",
  "totalScore": 20,
  "sortOrder": 1,
  "items": [
    {
      "title": "判断题",
      "questionType": "TRUE_FALSE",
      "questionCount": 2,
      "scorePerQuestion": 10
    }
  ]
}
```

响应 `data`：`QuestionTypeTemplateResponse`

业务规则：

- 所有 `questionCount * scorePerQuestion` 小计之和必须等于 `totalScore`。
- 配置项保存时会按请求数组顺序生成 `sortOrder`。

### 6.4 更新模板

```http
PUT /api/question-type-templates/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 模板 ID |

请求体同新增模板。响应 `data`：`QuestionTypeTemplateResponse`

业务规则：

- 更新时会先删除模板下旧配置项，再按请求体重新写入配置项。

### 6.5 删除模板

```http
DELETE /api/question-type-templates/{id}
Authorization: Bearer <token>
```

响应：

```json
{
  "success": true
}
```

业务规则：

- 删除模板和模板下所有题型配置项。

## 7. 接口总览

| 模块 | 方法 | 路径 | 认证 | 说明 |
| --- | --- | --- | --- | --- |
| 认证 | `POST` | `/api/auth/register` | 否 | 注册 |
| 认证 | `POST` | `/api/auth/login` | 否 | 登录 |
| 教材目录 | `GET` | `/api/curriculum` | 是 | 查询教材目录 |
| 教材目录 | `POST` | `/api/curriculum` | 是 | 新增教材目录 |
| 教材目录 | `PUT` | `/api/curriculum/{id}` | 是 | 更新教材目录 |
| 教材目录 | `DELETE` | `/api/curriculum/{id}` | 是 | 删除教材目录 |
| 教材目录 | `GET` | `/api/curriculum/tree` | 是 | 获取教材目录树 |
| 题库 | `GET` | `/api/questions` | 是 | 查询题库 |
| 题库 | `POST` | `/api/questions` | 是 | 新增题目 |
| 题库 | `POST` | `/api/questions/import/excel` | 是 | Excel 导入 |
| 试卷 | `POST` | `/api/papers/preview-plan` | 是 | 预览组卷计划 |
| 试卷 | `POST` | `/api/papers/generate` | 是 | 生成试卷 |
| 试卷 | `GET` | `/api/papers` | 是 | 查询试卷列表 |
| 试卷 | `GET` | `/api/papers/{paperId}` | 是 | 查询试卷详情 |
| 试卷 | `PATCH` | `/api/papers/{paperId}/questions/{paperQuestionId}` | 是 | 更新试卷题目快照 |
| 试卷 | `POST` | `/api/papers/{paperId}/questions/{paperQuestionId}/save-to-bank` | 是 | 保存快照题目到题库 |
| 试卷 | `GET` | `/api/papers/{paperId}/print` | 是 | 获取打印 HTML |
| 试卷 | `POST` | `/api/papers/{paperId}/export/word` | 是 | 导出 Word |
| 试卷 | `POST` | `/api/papers/{paperId}/copy` | 是 | 复制试卷 |
| 试卷 | `POST` | `/api/papers/{paperId}/regenerate` | 是 | 重新组卷 |
| 试卷 | `POST` | `/api/papers/{paperId}/save` | 是 | 保存试卷 |
| 试卷 | `DELETE` | `/api/papers/{paperId}` | 是 | 删除试卷 |
| 题型模板 | `GET` | `/api/question-type-templates` | 是 | 查询模板列表 |
| 题型模板 | `GET` | `/api/question-type-templates/{id}` | 是 | 查询模板详情 |
| 题型模板 | `POST` | `/api/question-type-templates` | 是 | 新增模板 |
| 题型模板 | `PUT` | `/api/question-type-templates/{id}` | 是 | 更新模板 |
| 题型模板 | `DELETE` | `/api/question-type-templates/{id}` | 是 | 删除模板 |
