import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card as AntCard, Statistic as AntStatistic, Row as AntRow, Col as AntCol, Button as AntButton } from 'antd';
import { FileTextOutlined, DatabaseOutlined, HistoryOutlined } from '@ant-design/icons';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <h2 style={{ marginBottom: 24 }}>工作台</h2>
      <AntRow gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <AntCol span={8}>
          <AntCard hoverable onClick={() => navigate('/papers/new')} style={{ textAlign: 'center' }}>
            <FileTextOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 12 }} />
            <h3>生成试卷</h3>
          </AntCard>
        </AntCol>
        <AntCol span={8}>
          <AntCard hoverable onClick={() => navigate('/questions')} style={{ textAlign: 'center' }}>
            <DatabaseOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 12 }} />
            <h3>题库管理</h3>
          </AntCard>
        </AntCol>
        <AntCol span={8}>
          <AntCard hoverable onClick={() => navigate('/papers')} style={{ textAlign: 'center' }}>
            <HistoryOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 12 }} />
            <h3>试卷历史</h3>
          </AntCard>
        </AntCol>
      </AntRow>

      <AntRow gutter={[16, 16]}>
        <AntCol span={12}>
          <AntCard title="系统概览">
            <AntRow gutter={16}>
              <AntCol span={12}>
                <AntStatistic title="当前题库题目数量" value={1254} />
              </AntCol>
              <AntCol span={12}>
                <AntStatistic title="已生成试卷" value={42} />
              </AntCol>
            </AntRow>
          </AntCard>
        </AntCol>
      </AntRow>
    </div>
  );
}
