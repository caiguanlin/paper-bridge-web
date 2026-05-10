
import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  BookOutlined,
  BarsOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const teacherInfo = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('teacher_info');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/papers/new', icon: <FileTextOutlined />, label: '生成试卷' },
    { key: '/question-type-templates', icon: <BarsOutlined />, label: '题型模板' },
    { key: '/questions', icon: <DatabaseOutlined />, label: '题库管理' },
    { key: '/curriculum', icon: <BookOutlined />, label: '教材管理' },
    { key: '/papers', icon: <HistoryOutlined />, label: '试卷历史' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('teacher_token');
    localStorage.removeItem('teacher_info');
    navigate('/login', { replace: true });
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Header: thin strip with frosted glass feel ── */}
      <Header
        style={{
          background: '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          borderBottom: '1px solid #f0f0f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/')}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#0066cc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            试
          </div>
          <span
            style={{
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              fontSize: 17,
              fontWeight: 600,
              color: '#1d1d1f',
              letterSpacing: '-0.374px',
            }}
          >
            小学试卷生成系统
          </span>
        </div>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size={30}
              icon={<UserOutlined />}
              style={{
                background: '#f5f5f7',
                color: '#7a7a7a',
              }}
            />
            <span
              style={{
                fontSize: 14,
                color: '#333333',
                fontWeight: 400,
              }}
            >
              {teacherInfo?.displayName || teacherInfo?.username || '教师'}
            </span>
          </Space>
        </Dropdown>
      </Header>

      <Layout>
        {/* ── Sidebar ── */}
        <Sider
          width={220}
          style={{
            background: '#ffffff',
            borderRight: '1px solid #f0f0f0',
            paddingTop: 8,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{
              border: 'none',
              background: 'transparent',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              fontSize: 14,
            }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>

        {/* ── Main Content ── */}
        <Layout
          style={{
            padding: 24,
            background: '#f5f5f7',
          }}
        >
          <Content
            style={{
              background: '#ffffff',
              padding: 24,
              borderRadius: 12,
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
