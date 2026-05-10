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
        minHeight: '100vh',
        background: '#ffffff',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── Left Side (60%): Branding & Background ── */}
      <div
        style={{
          flex: '0 0 60%',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '80px',
          background: '#000',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: "url('/assets/images/login-bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* ── Gradient Overlay for Readability ── */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            color: '#ffffff',
            maxWidth: '600px',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#0066cc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            试
          </div>
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: '0 0 16px 0',
              color: '#ffffff',
            }}
          >
            开启智能教学新时代
          </h1>
          <p
            style={{
              fontSize: '21px',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            为小学教师量身打造的试卷生成系统，让出卷变得更简单、更高效。
          </p>
        </div>
      </div>

      {/* ── Right Side (40%): Form ── */}
      <div
        style={{
          flex: '0 0 40%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 10%',
          background: '#ffffff',
        }}
      >
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: '34px',
                fontWeight: 600,
                color: '#1d1d1f',
                letterSpacing: '-0.374px',
                margin: '0 0 8px 0',
              }}
            >
              {activeTab === 'login' ? '欢迎回来' : '开启试卷之旅'}
            </h2>
            <p style={{ color: '#7a7a7a', fontSize: '17px', margin: 0 }}>
              请使用您的账号访问系统
            </p>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="large"
            items={[
              {
                key: 'login',
                label: '登录',
                children: (
                  <Form onFinish={handleFinish} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input
                        prefix={<UserOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="用户名"
                        size="large"
                        style={{ borderRadius: 12, height: 48 }}
                      />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="密码"
                        size="large"
                        style={{ borderRadius: 12, height: 48 }}
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
                        height: 48,
                        fontWeight: 500,
                        fontSize: 17,
                        background: '#0066cc',
                        marginTop: 12,
                        border: 'none',
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
                  <Form onFinish={handleFinish} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input
                        prefix={<UserOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="用户名"
                        size="large"
                        style={{ borderRadius: 12, height: 48 }}
                      />
                    </Form.Item>
                    <Form.Item name="displayName" rules={[{ required: true, message: '请输入显示名称' }]}>
                      <Input
                        prefix={<SmileOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="显示名称 (例如：张老师)"
                        size="large"
                        style={{ borderRadius: 12, height: 48 }}
                      />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#7a7a7a' }} />}
                        placeholder="密码"
                        size="large"
                        style={{ borderRadius: 12, height: 48 }}
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
                        height: 48,
                        fontWeight: 500,
                        fontSize: 17,
                        background: '#0066cc',
                        marginTop: 12,
                        border: 'none',
                      }}
                    >
                      注册
                    </Button>
                  </Form>
                ),
              },
            ]}
          />

          <p
            style={{
              textAlign: 'center',
              marginTop: 64,
              fontSize: '12px',
              color: '#7a7a7a',
            }}
          >
            © 2026 小学试卷生成系统 · 豫ICP备12345678号
          </p>
        </div>
      </div>
    </div>
  );
}
