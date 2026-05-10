import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Statistic, Row, Col } from 'antd';
import {
  DatabaseOutlined,
  HistoryOutlined,
  BookOutlined,
  BarsOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const quickActions = [
  {
    key: '/papers/new',
    icon: <PlusOutlined />,
    title: '生成试卷',
    desc: '智能组卷',
    color: '#0066cc',
  },
  {
    key: '/questions',
    icon: <DatabaseOutlined />,
    title: '题库管理',
    desc: '查看与录入',
    color: '#0066cc',
  },
  {
    key: '/papers',
    icon: <HistoryOutlined />,
    title: '试卷历史',
    desc: '查看与导出',
    color: '#0066cc',
  },
  {
    key: '/curriculum',
    icon: <BookOutlined />,
    title: '教材管理',
    desc: '目录维护',
    color: '#0066cc',
  },
  {
    key: '/question-type-templates',
    icon: <BarsOutlined />,
    title: '题型模板',
    desc: '配置管理',
    color: '#0066cc',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* ── Page heading ── */}
      <h2
        style={{
          fontSize: 21,
          fontWeight: 600,
          color: '#1d1d1f',
          letterSpacing: '0.231px',
          marginBottom: 24,
        }}
      >
        工作台
      </h2>

      {/* ── Quick Actions ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {quickActions.map((action) => (
          <Col xs={12} sm={8} md={6} lg={4} xl={4} key={action.key}>
            <Card
              hoverable
              onClick={() => navigate(action.key)}
              style={{
                textAlign: 'center',
                borderRadius: 12,
                border: '1px solid #f0f0f0',
                transition: 'all 0.25s ease',
              }}
              styles={{
                body: { padding: '24px 16px' },
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(0, 102, 204, 0.06)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  fontSize: 20,
                  color: action.color,
                }}
              >
                {action.icon}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1d1d1f',
                  letterSpacing: '-0.224px',
                  marginBottom: 4,
                }}
              >
                {action.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#7a7a7a',
                  letterSpacing: '-0.12px',
                }}
              >
                {action.desc}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Stats ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            style={{
              borderRadius: 12,
              border: '1px solid #f0f0f0',
            }}
            title={
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f' }}>
                系统概览
              </span>
            }
          >
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: '#7a7a7a', fontSize: 12 }}>当前题库题目数量</span>}
                  value={1254}
                  valueStyle={{ color: '#1d1d1f', fontWeight: 600, fontSize: 28 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={<span style={{ color: '#7a7a7a', fontSize: 12 }}>已生成试卷</span>}
                  value={42}
                  valueStyle={{ color: '#1d1d1f', fontWeight: 600, fontSize: 28 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
