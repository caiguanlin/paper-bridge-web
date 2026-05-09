import React, { useState } from 'react';
import { Table, Button, Space, Input, Select, Drawer, Upload, message } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { questionApi } from '../../api/questionApi';
import type { QuestionQuery } from '../../types/question';

const { Option } = Select;

export function QuestionBankPage() {
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [isImportVisible, setImportVisible] = useState(false);
  const [query, setQuery] = useState<QuestionQuery>({});

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
      render: (_: any, record: any) => `${record.grade} ${record.publisher} ${record.subject} ${record.volume} ${record.unit} ${record.chapter}`
    },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty' },
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '使用次数', dataIndex: 'usageCount', key: 'usageCount' },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
  ];

  const handleImport = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const res = await questionApi.importExcel(file);
      message.success(`导入成功: ${res.successCount}条, 失败: ${res.failureCount}条`);
      onSuccess('ok');
      refetch();
      setImportVisible(false);
    } catch (e: any) {
      message.error(e.message || '导入失败');
      onError(e);
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
            onChange={(val) => setQuery(prev => ({...prev, grade: val}))}
          >
            <Option value="一年级">一年级</Option>
            <Option value="二年级">二年级</Option>
            <Option value="三年级">三年级</Option>
          </Select>
          <Select 
            placeholder="科目" 
            style={{ width: 120 }} 
            allowClear
            onChange={(val) => setQuery(prev => ({...prev, subject: val}))}
          >
            <Option value="CHINESE">语文</Option>
            <Option value="MATH">数学</Option>
          </Select>
          <Select 
            placeholder="题型" 
            style={{ width: 120 }} 
            allowClear
            onChange={(val) => setQuery(prev => ({...prev, questionType: val}))}
          >
            <Option value="SINGLE_CHOICE">选择题</Option>
            <Option value="FILL_BLANK">填空题</Option>
            <Option value="TRUE_FALSE">判断题</Option>
          </Select>
          <Select 
            placeholder="难度" 
            style={{ width: 120 }} 
            allowClear
            onChange={(val) => setQuery(prev => ({...prev, difficulty: val}))}
          >
            <Option value="EASY">易</Option>
            <Option value="MEDIUM">中</Option>
            <Option value="HARD">难</Option>
          </Select>
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

      <Drawer title="新增题目" placement="right" onClose={() => setDrawerVisible(false)} open={isDrawerVisible} size="large">
        <p>题型专属表单（待实现）</p>
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
