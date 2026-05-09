import React from 'react';
import { Table, Space, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paperApi } from '../../api/paperApi';

export function PaperHistoryPage() {
  const navigate = useNavigate();

  const { data: papers, isLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: () => paperApi.getPapers()
  });

  const handleExport = async (paperId: string | number, version: 'student' | 'teacher') => {
    try {
      const blob = await paperApi.exportWord(paperId, version);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paper-${paperId}-${version}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      message.error(e.message || '导出失败');
    }
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
      title: '年级/出版社/科目', 
      key: 'scope',
      render: (_: any, record: any) => `${record.grade} ${record.publisher} ${record.subject === 'MATH' ? '数学' : '语文'}`
    },
    { 
      title: '单元/章节', 
      key: 'chapter',
      render: (_: any, record: any) => `${record.unit} ${record.chapter}`
    },
    { title: '总分', dataIndex: 'totalScore', key: 'totalScore' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'DRAFT' ? 'blue' : 'green'}>{status}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <a onClick={() => navigate(`/papers/${record.id}`)}>编辑</a>
          <a onClick={() => handleExport(record.id, 'student')}>导出学生版</a>
          <a onClick={() => handleExport(record.id, 'teacher')}>导出教师版</a>
        </Space>
      ),
    },
  ];

  return (
    <div className="page">
      <h2 style={{ marginBottom: 16 }}>试卷历史</h2>
      <Table columns={columns} dataSource={papers || []} rowKey="id" loading={isLoading} />
    </div>
  );
}
