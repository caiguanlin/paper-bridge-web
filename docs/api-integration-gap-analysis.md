# API 接入差异与改进清单

本文基于 `docs/api.md` 与当前前端代码整理，覆盖接口接入状态、未接入接口、调用风险与后续建议改动点。检查范围包括 `src/api/*Api.ts`、`src/types/*` 与 `src/pages/*`。

## 总体结论

- 已接入且主流程基本一致：登录、注册、教材目录增删改查、教材树、题型模板增删改查、试卷预览组卷、生成试卷、试卷详情、试卷列表、打印 HTML、导出 Word、保存试卷题目到题库、Excel 导入题目。
- 已有 API 封装但页面未完整使用：新增题目、更新试卷题目快照。
- 文档有接口但前端完全缺 API 封装或入口：保存试卷、复制试卷、重新组卷、删除试卷。
- 主要调用风险：`multipart/form-data` 手动设置 `Content-Type`、文件下载错误响应不可读、试卷保存按钮无实际调用、组卷表单允许不完整教材路径、部分请求类型把必填字段定义成可选。

## 接口覆盖明细

| 模块 | 文档接口 | 当前前端状态 | 差异与问题 | 建议 |
| --- | --- | --- | --- | --- |
| 认证 | `POST /api/auth/login` | 已接入：`authApi.login`，登录页已调用 | `LoginRequest.username/password` 在类型中是可选字段，但文档要求必填 | 将 `LoginRequest` 字段改为必填，保持类型与契约一致 |
| 认证 | `POST /api/auth/register` | 已接入：`authApi.register`，注册页已调用 | `RegisterRequest` 字段在类型中是可选字段，但文档要求必填 | 将 `RegisterRequest` 字段改为必填 |
| 教材目录 | `GET /api/curriculum` | 已接入：列表页查询 | 前端科目下拉包含 `ENGLISH`，但全局 `Subject` 类型只定义 `CHINESE/MATH`，文档也未明确英语枚举 | 确认后端是否支持 `ENGLISH`；若不支持，从 UI 移除；若支持，补齐共享类型 |
| 教材目录 | `POST /api/curriculum` | 已接入：新增弹窗 | 基本一致 | 暂无 |
| 教材目录 | `PUT /api/curriculum/{id}` | 已接入：编辑弹窗 | 基本一致 | 暂无 |
| 教材目录 | `DELETE /api/curriculum/{id}` | 已接入：删除按钮 | 基本一致 | 暂无 |
| 教材目录 | `GET /api/curriculum/tree` | 已接入：组卷页教材级联 | 组卷页 `Cascader` 开启 `changeOnSelect`，用户可以只选到出版社/科目等中间层，但生成接口要求 `publisher/subject/grade/volume/unit/chapter` 全部必填 | 组卷前校验必须选到章节节点，或按后端能力调整请求必填项 |
| 题库 | `GET /api/questions` | 已接入：题库页查询 | API 类型支持全部查询参数，但 UI 只暴露年级、科目、题型、难度，缺出版社、册别、单元、章节筛选 | 补齐筛选项，最好复用教材树选择器 |
| 题库 | `POST /api/questions` | API 已封装：`questionApi.createQuestion`；页面未实现 | 题库页“新增题目”抽屉只有占位文案，没有表单和提交调用 | 实现按题型录入表单，生成符合文档要求的 `contentJson/answerJson` 字符串 |
| 题库 | `POST /api/questions/import/excel` | 已接入：Excel 导入抽屉 | 前端手动设置 `Content-Type: multipart/form-data`，浏览器上传 `FormData` 时更稳妥的做法是交给 Axios/浏览器自动带 boundary | 移除手动 `Content-Type`，保留 `FormData` 即可 |
| 试卷 | `POST /api/papers/preview-plan` | 已接入：组卷页预览 | 文档支持可选 `difficulty`，前端类型有字段但 UI 未提供难度偏好；教材路径也可能不完整 | 增加难度选择；提交前校验章节路径完整 |
| 试卷 | `POST /api/papers/generate` | 已接入：组卷页生成 | 同预览接口；另外 `GenerationStrategy` 文档列出 `BANK_FIRST`，前端枚举未定义 | 如果前端需要提供“题库优先”兼容策略，补齐 `BANK_FIRST`；若只用于重组接口，保持内部使用即可 |
| 试卷 | `GET /api/papers` | 已接入：历史页列表 | 文档响应是 `PaperSummaryResponse[]`，前端复用 `PaperResponse[]`，靠 `sections?:` 规避类型差异 | 新增 `PaperSummaryResponse` 类型，让列表响应更准确 |
| 试卷 | `GET /api/papers/{paperId}` | 已接入：编辑页详情 | 基本一致 | 暂无 |
| 试卷 | `PATCH /api/papers/{paperId}/questions/{paperQuestionId}` | API 已封装：`paperApi.updateQuestion`；页面未使用 | 当前编辑页只能预览、打印、导出、存入题库，不能编辑题干、答案、解析或分值 | 增加题目编辑入口，调用 `updateQuestion` 并刷新详情 |
| 试卷 | `POST /api/papers/{paperId}/questions/{paperQuestionId}/save-to-bank` | 已接入：教师版题目旁的存入题库按钮 | 基本一致 | 可考虑增加成功后按钮状态，避免重复点击 |
| 试卷 | `GET /api/papers/{paperId}/print` | 已接入：编辑页打印 | 文档要求 `Accept: text/html`，当前只设置 `responseType: 'text'`，通常能工作但契约不够明确 | 在请求 headers 中补 `Accept: text/html` |
| 试卷 | `POST /api/papers/{paperId}/export/word` | 已接入：编辑页和历史页导出 | 文件下载成功路径可用；如果后端返回 JSON 错误，当前拦截器会把 blob 错误吞成通用错误，不利于提示 | 在错误处理里识别 blob/json 错误响应并解析 message |
| 试卷 | `POST /api/papers/{paperId}/copy` | 未接入 | 无 API 封装，无历史页/详情页操作入口 | 在 `paperApi` 增加 `copyPaper`，历史页增加“复制”操作并刷新列表或跳转到副本 |
| 试卷 | `POST /api/papers/{paperId}/regenerate` | 未接入 | 无 API 封装，无操作入口 | 在 `paperApi` 增加 `regeneratePaper`，详情页或历史页增加“重新组卷”操作，并明确会生成新试卷 |
| 试卷 | `POST /api/papers/{paperId}/save` | 未接入 | 无 API 封装；编辑页存在“保存”按钮但没有 `onClick`，点击不会调用后端 | 在 `paperApi` 增加 `savePaper`，绑定编辑页保存按钮，成功后刷新试卷状态 |
| 试卷 | `DELETE /api/papers/{paperId}` | 未接入 | 无 API 封装，无历史页删除入口 | 在 `paperApi` 增加 `deletePaper`，历史页增加二次确认删除 |
| 题型模板 | `GET /api/question-type-templates` | 已接入：模板页、组卷页 | 基本一致 | 暂无 |
| 题型模板 | `GET /api/question-type-templates/{id}` | API 已封装；页面当前未单独调用 | 列表响应已包含 `items`，当前页面无需详情接口 | 可保留封装，若后续列表瘦身再改为编辑前拉详情 |
| 题型模板 | `POST /api/question-type-templates` | 已接入：模板页、组卷页保存模板 | 基本一致 | 暂无 |
| 题型模板 | `PUT /api/question-type-templates/{id}` | 已接入：模板页编辑 | 基本一致 | 暂无 |
| 题型模板 | `DELETE /api/question-type-templates/{id}` | 已接入：模板页删除 | 缺少错误捕获，删除失败时会直接抛出到控制台 | 给 `handleDelete` 增加 try/catch 和错误提示 |

## 优先改动点

### P0：明显可见但无效的操作

1. 接入 `POST /api/papers/{paperId}/save`。
   - 当前 `PaperEditorPage` 有“保存”按钮，但没有绑定任何逻辑。
   - 需要在 `src/api/paperApi.ts` 增加 `savePaper(paperId)`。
   - 保存成功后刷新试卷详情，使 `status` 从 `DRAFT` 更新为 `SAVED`。

2. 处理文件下载错误响应。
   - `exportWord` 使用 `responseType: 'blob'` 时，后端业务错误可能以 JSON blob 返回。
   - 当前 `src/api/http.ts` 的错误处理只读 `error.response.data.message`，遇到 blob 时拿不到后端 message。
   - 建议解析 `Blob` 文本中的 `{ success:false, message }`，让导出失败提示可读。

### P1：文档有接口但前端缺入口

1. 试卷历史补齐操作：
   - `copyPaper(paperId)` 对应 `POST /api/papers/{paperId}/copy`
   - `regeneratePaper(paperId)` 对应 `POST /api/papers/{paperId}/regenerate`
   - `deletePaper(paperId)` 对应 `DELETE /api/papers/{paperId}`

2. 试卷编辑补齐题目编辑：
   - 当前已有 `paperApi.updateQuestion`。
   - 需要 UI 支持编辑 `stemSnapshot/contentSnapshotJson/answerSnapshotJson/analysisSnapshot/score`。
   - 提交后调用 PATCH 接口并刷新详情。

3. 题库新增题目：
   - 当前已有 `questionApi.createQuestion`。
   - 题库页“新增题目”抽屉仍是占位，需要实现表单。
   - 题型相关 JSON 建议用结构化表单生成字符串，避免让老师直接写 JSON。

### P2：契约一致性和体验完善

1. 组卷页补充难度偏好。
   - 文档支持 `difficulty?: EASY | MEDIUM | HARD`。
   - 前端类型已有字段，但页面未暴露。

2. 组卷页校验教材范围必须选到章节。
   - 文档中生成/预览接口要求 `publisher/subject/grade/volume/unit/chapter` 必填。
   - 当前级联允许选择中间节点，可能发送不完整字段。

3. 补齐题库筛选字段。
   - 文档支持 `publisher/volume/unit/chapter`，UI 未暴露。

4. 调整上传请求。
   - `questionApi.importExcel` 不应手动写死 `multipart/form-data`。

5. 类型收紧：
   - `LoginRequest`、`RegisterRequest` 字段改为必填。
   - 新增 `PaperSummaryResponse`。
   - 视后端支持情况确认 `Subject` 是否加入 `ENGLISH`。

## 建议实施顺序

1. 先处理 P0：保存按钮真实生效、下载错误可读。
2. 再补试卷历史动作：复制、重新组卷、删除。
3. 然后做题目编辑和题库新增，这两项涉及题型 JSON 表单，改动面更大。
4. 最后统一收紧类型、补齐筛选条件和组卷校验。

