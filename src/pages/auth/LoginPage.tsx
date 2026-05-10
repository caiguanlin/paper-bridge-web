import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, message } from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../utils/errors';

type AuthFormValues = {
  username: string;
  password: string;
  displayName?: string;
};

export function LoginPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleFinish = async (values: AuthFormValues) => {
    setLoading(true);
    try {
      const response = await (activeTab === 'login'
        ? authApi.login({ username: values.username, password: values.password })
        : authApi.register({ username: values.username, password: values.password, displayName: values.displayName || '' }));
      localStorage.setItem('teacher_token', response.token);
      localStorage.setItem('teacher_info', JSON.stringify(response));
      message.success(activeTab === 'login' ? '登录成功' : '注册成功');
      
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '操作失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f7',
      }}
    >
      <div style={{ width: 400 }}>
        {/* ── Brand ── */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#0066cc',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            试
          </div>
          <h1
            style={{
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              fontSize: 28,
              fontWeight: 600,
              color: '#1d1d1f',
              letterSpacing: '-0.28px',
              lineHeight: 1.14,
              margin: 0,
            }}
          >
            小学试卷生成系统
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 14,
              color: '#7a7a7a',
              letterSpacing: '-0.224px',
            }}
          >
            教师智能组卷平台
          </p>
        </div>

        {/* ── Card ── */}
        <Card
          style={{
            borderRadius: 18,
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          }}
          styles={{ body: { padding: '32px 28px 24px' } }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: '登录',
                children: (
                  <Form onFinish={handleFinish} layout="vertical" style={{ marginTop: 8 }}>
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input
                        prefix={<UserOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="用户名"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="密码"
                        size="large"
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      size="large"
                      style={{
                        borderRadius: 9999,
                        height: 44,
                        fontWeight: 400,
                        fontSize: 17,
                        letterSpacing: '-0.374px',
                      }}
                    >
                      登录
                    </Button>
                  </Form>
                ),
              },
              {
                key: 'register',
                label: '注册',
                children: (
                  <Form onFinish={handleFinish} layout="vertical" style={{ marginTop: 8 }}>
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input
                        prefix={<UserOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="用户名"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item name="displayName" rules={[{ required: true, message: '请输入显示名称' }]}>
                      <Input
                        prefix={<SmileOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="显示名称 (例如：张老师)"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="密码"
                        size="large"
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      block
                      loading={loading}
                      size="large"
                      style={{
                        borderRadius: 9999,
                        height: 44,
                        fontWeight: 400,
                        fontSize: 17,
                        letterSpacing: '-0.374px',
                      }}
                    >
                      注册
                    </Button>
                  </Form>
                ),
              },
            ]}
          />
        </Card>

        {/* ── Footer ── */}
        <p
          style={{
            textAlign: 'center',
            marginTop: 32,
            fontSize: 12,
            color: '#7a7a7a',
            letterSpacing: '-0.12px',
          }}
        >
          © 2026 小学试卷生成系统
        </p>
      </div>
    </div>
  );
}
