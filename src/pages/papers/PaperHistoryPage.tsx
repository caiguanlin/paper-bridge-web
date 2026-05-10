import React from 'react';
import { Button, Popconfirm, Space, Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paperApi } from '../../api/paperApi';
import type { PaperSummaryResponse } from '../../types/paper';
import { getErrorMessage } from '../../utils/errors';

export function PaperHistoryPage() {
  const navigate = useNavigate();

  const { data: papers, isLoading, refetch } = useQuery({
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
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '导出失败'));
    }
  };

  const handleCopy = async (paperId: string | number) => {
    try {
      const copied = await paperApi.copyPaper(paperId);
      message.success('复制成功');
      navigate(`/papers/${copied.id}`);
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '复制失败'));
    }
  };

  const handleRegenerate = async (paperId: string | number) => {
    try {
      const regenerated = await paperApi.regeneratePaper(paperId);
      message.success('重新组卷成功');
      navigate(`/papers/${regenerated.id}`);
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '重新组卷失败'));
    }
  };

  const handleDelete = async (paperId: string | number) => {
    try {
      await paperApi.deletePaper(paperId);
      message.success('删除成功');
      await refetch();
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '删除失败'));
    }
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { 
      title: '年级/出版社/科目', 
      key: 'scope',
      render: (_: unknown, record: PaperSummaryResponse) => `${record.grade} ${record.publisher} ${record.subject === 'MATH' ? '数学' : '语文'}`
    },
    { 
      title: '单元/章节', 
      key: 'chapter',
      render: (_: unknown, record: PaperSummaryResponse) => `${record.unit} ${record.chapter || ''}`
    },
    { title: '总分', dataIndex: 'totalScore', key: 'totalScore' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={status === 'DRAFT' ? 'processing' : 'success'}
          style={{ borderRadius: 9999 }}
        >
          {status}
        </Tag>
      ),
    },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: PaperSummaryResponse) => (
        <Space size="middle">
          <a onClick={() => navigate(`/papers/${record.id}`)}>编辑</a>
          <a onClick={() => handleExport(record.id, 'student')}>导出学生版</a>
          <a onClick={() => handleExport(record.id, 'teacher')}>导出教师版</a>
          <a onClick={() => handleCopy(record.id)}>复制</a>
          <Popconfirm title="重新组卷会创建一份新试卷，确认继续？" onConfirm={() => handleRegenerate(record.id)}>
            <Button type="link" style={{ padding: 0 }}>重新组卷</Button>
          </Popconfirm>
          <Popconfirm title="确认删除这份试卷？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger style={{ padding: 0 }}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2
        style={{
          fontSize: 21,
          fontWeight: 600,
          color: '#1d1d1f',
          letterSpacing: '0.231px',
          marginBottom: 20,
        }}
      >
        试卷历史
      </h2>
      <Table columns={columns} dataSource={papers || []} rowKey="id" loading={isLoading} />
    </div>
  );
}
