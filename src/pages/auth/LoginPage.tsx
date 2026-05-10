import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, message } from 'antd';
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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#1890ff' }}>小学试卷生成系统</h2>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          centered
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form onFinish={handleFinish} layout="vertical">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="用户名" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password placeholder="密码" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>登录</Button>
                </Form>
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form onFinish={handleFinish} layout="vertical">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input placeholder="用户名" />
                  </Form.Item>
                  <Form.Item name="displayName" rules={[{ required: true, message: '请输入显示名称' }]}>
                    <Input placeholder="显示名称 (例如：张老师)" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password placeholder="密码" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>注册</Button>
                </Form>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
