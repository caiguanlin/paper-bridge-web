import { useEffect, useState } from 'react';
import { 
  Table, Button, Space, Modal, Form, Input, Select, 
  Popconfirm, message, Card, InputNumber, Row, Col 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { curriculumApi } from '../../api/curriculumApi';
import type { Curriculum, CurriculumCreate } from '../../types/curriculum';
import { getErrorMessage } from '../../utils/errors';

const { Option } = Select;

type CurriculumQuery = {
  publisher?: string;
  subject?: string;
  grade?: string;
  volume?: string;
};

export function CurriculumPage() {
  const [data, setData] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchList = async (values: CurriculumQuery = {}) => {
    setLoading(true);
    try {
      const res = await curriculumApi.getCurriculumList(values);
      setData(res);
    } catch (err: unknown) {
      message.error(getErrorMessage(err, '获取教材列表失败'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchList();
    });
  }, []);

  const handleSearch = () => {
    fetchList(searchForm.getFieldsValue());
  };

  const handleReset = () => {
    searchForm.resetFields();
    fetchList();
  };

  const handleAdd = () => {
    setEditingId(null);
    editForm.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Curriculum) => {
    setEditingId(record.id);
    editForm.setFieldsValue({
      publisher: record.publisher,
      subject: record.subject,
      grade: record.grade,
      volume: record.volume,
      unit: record.unit,
      chapter: record.chapter,
      sortOrder: record.sortOrder,
      editionYear: record.editionYear,
      sourceUrl: record.sourceUrl,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await curriculumApi.deleteCurriculum(id);
      message.success('删除成功');
      fetchList(searchForm.getFieldsValue());
    } catch (err: unknown) {
      message.error(getErrorMessage(err, '删除失败'));
    }
  };

  const handleModalOk = () => {
    editForm.validateFields().then(async (values: CurriculumCreate) => {
      try {
        if (editingId) {
          await curriculumApi.updateCurriculum(editingId, values);
          message.success('更新成功');
        } else {
          await curriculumApi.createCurriculum(values);
          message.success('创建成功');
        }
        setIsModalVisible(false);
        fetchList(searchForm.getFieldsValue());
      } catch (err: unknown) {
        message.error(getErrorMessage(err, '保存失败'));
      }
    });
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '出版社', dataIndex: 'publisher', key: 'publisher' },
    { title: '科目', dataIndex: 'subject', key: 'subject', 
      render: (text: string) => text === 'CHINESE' ? '语文' : text === 'MATH' ? '数学' : text 
    },
    { title: '年级', dataIndex: 'grade', key: 'grade' },
    { title: '册别', dataIndex: 'volume', key: 'volume' },
    { title: '单元', dataIndex: 'unit', key: 'unit' },
    { title: '章节标题', dataIndex: 'chapter', key: 'chapter' },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 80 },
    { title: '版本年份', dataIndex: 'editionYear', key: 'editionYear' },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Curriculum) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 0px' }}>
      <Card style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="publisher" label="出版社">
            <Input placeholder="请输入出版社" allowClear />
          </Form.Item>
          <Form.Item name="subject" label="科目">
            <Select placeholder="请选择科目" allowClear style={{ width: 120 }}>
              <Option value="CHINESE">语文</Option>
              <Option value="MATH">数学</Option>
            </Select>
          </Form.Item>
          <Form.Item name="grade" label="年级">
            <Input placeholder="请输入年级" allowClear />
          </Form.Item>
          <Form.Item name="volume" label="册别">
            <Input placeholder="请输入册别" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增教材章节
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ defaultPageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑教材章节' : '新增教材章节'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" initialValues={{ sortOrder: 0 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="publisher" label="出版社" rules={[{ required: true, message: '请输入出版社' }]}>
                <Input placeholder="例如：人教版" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subject" label="科目" rules={[{ required: true, message: '请选择科目' }]}>
                <Select placeholder="请选择科目">
                  <Option value="CHINESE">语文</Option>
                  <Option value="MATH">数学</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="grade" label="年级" rules={[{ required: true, message: '请输入年级' }]}>
                <Input placeholder="例如：一年级" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="volume" label="册别" rules={[{ required: true, message: '请输入册别' }]}>
                <Input placeholder="例如：上册" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="unit" label="单元" rules={[{ required: true, message: '请输入单元' }]}>
                <Input placeholder="例如：第一单元" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="chapter" label="章节标题" rules={[{ required: true, message: '请输入章节标题' }]}>
                <Input placeholder="例如：秋天" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sortOrder" label="排序">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="editionYear" label="版本年份">
                <InputNumber style={{ width: '100%' }} placeholder="例如：2024" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="sourceUrl" label="来源URL">
            <Input placeholder="可选填资源链接" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
