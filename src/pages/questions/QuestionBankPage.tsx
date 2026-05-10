import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Drawer, Upload, message, Form } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { questionApi } from '../../api/questionApi';
import type { QuestionCreateRequest, QuestionQuery, QuestionResponse } from '../../types/question';
import { QUESTION_TYPES } from '../../types/shared';
import { getErrorMessage } from '../../utils/errors';

const { Option } = Select;
type UploadOptions = Parameters<NonNullable<React.ComponentProps<typeof Upload>['customRequest']>>[0];

const isFormValidationError = (error: unknown) => {
  return typeof error === 'object' && error !== null && 'errorFields' in error;
};

export function QuestionBankPage() {
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [isImportVisible, setImportVisible] = useState(false);
  const [query, setQuery] = useState<QuestionQuery>({});
  const [createForm] = Form.useForm<QuestionCreateRequest>();
  const [creating, setCreating] = useState(false);

  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: ['questions', query],
    queryFn: () => questionApi.getQuestions(query)
  });

  const columns = [
    { title: '题型', dataIndex: 'questionType', key: 'questionType' },
    { title: '题干摘要', dataIndex: 'stem', key: 'stem' },
    { 
      title: '教材范围', 
      key: 'scope',
      render: (_: unknown, record: QuestionResponse) => `${record.grade} ${record.publisher} ${record.subject} ${record.volume} ${record.unit} ${record.chapter}`
    },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty' },
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '使用次数', dataIndex: 'usageCount', key: 'usageCount' },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
  ];

  const handleImport = async (options: UploadOptions) => {
    const { file, onSuccess, onError } = options;
    if (!(file instanceof File)) {
      message.error('请选择有效的 Excel 文件');
      onError?.(new Error('请选择有效的 Excel 文件'));
      return;
    }
    try {
      const res = await questionApi.importExcel(file);
      message.success(`导入成功: ${res.successCount}条, 失败: ${res.failureCount}条`);
      onSuccess?.('ok');
      refetch();
      setImportVisible(false);
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '导入失败'));
      onError?.(e instanceof Error ? e : new Error('导入失败'));
    }
  };

  const updateQuery = (patch: Partial<QuestionQuery>) => {
    setQuery(prev => ({ ...prev, ...patch }));
  };

  const validateJsonObject = (_: unknown, value?: string) => {
    try {
      const parsed = JSON.parse(value || '');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('请输入 JSON 对象字符串'));
    } catch {
      return Promise.reject(new Error('请输入合法 JSON'));
    }
  };

  const handleCreateQuestion = async () => {
    setCreating(true);
    try {
      const values = await createForm.validateFields();
      await questionApi.createQuestion(values);
      message.success('题目已新增');
      setDrawerVisible(false);
      createForm.resetFields();
      await refetch();
    } catch (e: unknown) {
      if (!isFormValidationError(e)) {
        message.error(getErrorMessage(e, '新增失败'));
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space wrap>
          <Select 
            placeholder="年级" 
            style={{ width: 120 }} 
            allowClear
            onChange={(val) => updateQuery({ grade: val })}
          >
            <Option value="一年级">一年级</Option>
            <Option value="二年级">二年级</Option>
            <Option value="三年级">三年级</Option>
          </Select>
          <Select 
            placeholder="科目" 
            style={{ width: 120 }} 
            allowClear
            onChange={(val) => updateQuery({ subject: val })}
          >
            <Option value="CHINESE">语文</Option>
            <Option value="MATH">数学</Option>
          </Select>
          <Select 
            placeholder="题型" 
            style={{ width: 120 }} 
            allowClear
            onChange={(val) => updateQuery({ questionType: val })}
          >
            {QUESTION_TYPES.map(type => (
              <Option key={type.value} value={type.value}>{type.label}</Option>
            ))}
          </Select>
          <Select 
            placeholder="难度" 
            style={{ width: 120 }} 
            allowClear
            onChange={(val) => updateQuery({ difficulty: val })}
          >
            <Option value="EASY">易</Option>
            <Option value="MEDIUM">中</Option>
            <Option value="HARD">难</Option>
          </Select>
          <Input placeholder="出版社" allowClear style={{ width: 140 }} onChange={event => updateQuery({ publisher: event.target.value || undefined })} />
          <Input placeholder="册别" allowClear style={{ width: 120 }} onChange={event => updateQuery({ volume: event.target.value || undefined })} />
          <Input placeholder="单元" allowClear style={{ width: 140 }} onChange={event => updateQuery({ unit: event.target.value || undefined })} />
          <Input placeholder="章节" allowClear style={{ width: 140 }} onChange={event => updateQuery({ chapter: event.target.value || undefined })} />
        </Space>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setImportVisible(true)}>Excel 导入</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>新增题目</Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={questions || []} 
        rowKey="id"
        loading={isLoading}
      />

      <Drawer
        title="新增题目"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={isDrawerVisible}
        size="large"
        extra={<Button type="primary" loading={creating} onClick={handleCreateQuestion}>保存</Button>}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            subject: 'MATH',
            difficulty: 'MEDIUM',
            questionType: 'SINGLE_CHOICE'
          }}
        >
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="grade" label="年级" rules={[{ required: true, message: '请输入年级' }]}>
              <Input placeholder="例如：三年级" />
            </Form.Item>
            <Form.Item name="publisher" label="出版社" rules={[{ required: true, message: '请输入出版社' }]}>
              <Input placeholder="例如：人教版" />
            </Form.Item>
            <Form.Item name="subject" label="科目" rules={[{ required: true, message: '请选择科目' }]}>
              <Select style={{ width: 120 }}>
                <Option value="CHINESE">语文</Option>
                <Option value="MATH">数学</Option>
              </Select>
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="volume" label="册别" rules={[{ required: true, message: '请输入册别' }]}>
              <Input placeholder="例如：上册" />
            </Form.Item>
            <Form.Item name="unit" label="单元" rules={[{ required: true, message: '请输入单元' }]}>
              <Input placeholder="例如：第三单元" />
            </Form.Item>
            <Form.Item name="chapter" label="章节" rules={[{ required: true, message: '请输入章节' }]}>
              <Input placeholder="例如：测量" />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="baseline">
            <Form.Item name="questionType" label="题型" rules={[{ required: true, message: '请选择题型' }]}>
              <Select style={{ width: 150 }}>
                {QUESTION_TYPES.map(type => (
                  <Option key={type.value} value={type.value}>{type.label}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="difficulty" label="难度" rules={[{ required: true, message: '请选择难度' }]}>
              <Select style={{ width: 120 }}>
                <Option value="EASY">易</Option>
                <Option value="MEDIUM">中</Option>
                <Option value="HARD">难</Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item name="stem" label="题干" rules={[{ required: true, message: '请输入题干' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="contentJson"
            label="题目内容 JSON"
            rules={[{ required: true, message: '请输入题目内容 JSON' }, { validator: validateJsonObject }]}
          >
            <Input.TextArea rows={4} placeholder='例如：{"options":["A. 3","B. 4","C. 5"]}' />
          </Form.Item>
          <Form.Item
            name="answerJson"
            label="答案 JSON"
            rules={[{ required: true, message: '请输入答案 JSON' }, { validator: validateJsonObject }]}
          >
            <Input.TextArea rows={4} placeholder='例如：{"correctOption":"B"}' />
          </Form.Item>
          <Form.Item name="analysis" label="解析">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer title="Excel 导入" placement="right" onClose={() => setImportVisible(false)} open={isImportVisible} size="default">
        <Upload customRequest={handleImport} showUploadList={false}>
          <Button icon={<UploadOutlined />}>选择 Excel 文件</Button>
        </Upload>
        <p style={{ marginTop: 16, color: 'gray' }}>请上传符合模板格式的 Excel 文件</p>
      </Drawer>
    </div>
  );
}
