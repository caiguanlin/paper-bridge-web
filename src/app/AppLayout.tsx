
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, FileTextOutlined, DatabaseOutlined, HistoryOutlined, BookOutlined, BarsOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/papers/new', icon: <FileTextOutlined />, label: '生成试卷' },
    { key: '/question-type-templates', icon: <BarsOutlined />, label: '题型模板' },
    { key: '/questions', icon: <DatabaseOutlined />, label: '题库管理' },
    { key: '/curriculum', icon: <BookOutlined />, label: '教材管理' },
    { key: '/papers', icon: <HistoryOutlined />, label: '试卷历史' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 20, color: '#1890ff' }}>小学试卷生成系统</h1>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
