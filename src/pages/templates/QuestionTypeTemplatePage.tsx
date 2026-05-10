import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, message, Modal, Popconfirm, Select, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { questionTypeTemplateApi } from '../../api/questionTypeTemplateApi';
import type { QuestionTypeTemplate, QuestionTypeTemplateCreate, QuestionTypeTemplateItem } from '../../types/questionTypeTemplate';
import { QUESTION_TYPES, QuestionType } from '../../types/shared';
import { getErrorMessage } from '../../utils/errors';

const emptyItem = (): QuestionTypeTemplateItem => ({
  title: '选择题',
  questionType: QuestionType.SINGLE_CHOICE,
  questionCount: 10,
  scorePerQuestion: 5
});

export function QuestionTypeTemplatePage() {
  const [templates, setTemplates] = useState<QuestionTypeTemplate[]>([]);
  const [editing, setEditing] = useState<QuestionTypeTemplate | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [totalScore, setTotalScore] = useState(100);
  const [items, setItems] = useState<QuestionTypeTemplateItem[]>([emptyItem()]);
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.questionCount * item.scorePerQuestion, 0),
    [items]
  );
  const isValidScore = subtotal === totalScore;

  const columns: ColumnsType<QuestionTypeTemplate> = [
    { title: '模板名称', dataIndex: 'name' },
    { title: '总分', dataIndex: 'totalScore', width: 100 },
    {
      title: '题型配置',
      render: (_, record) => record.items
        .map(item => `${item.title} ${item.questionCount}题 x ${item.scorePerQuestion}分`)
        .join(' / ')
    },
    {
      title: '操作',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除这个模板？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  async function loadTemplates() {
    const data = await questionTypeTemplateApi.list();
    setTemplates(data);
  }

  React.useEffect(() => {
    queueMicrotask(() => {
      void loadTemplates();
    });
  }, []);

  const openCreate = () => {
    setEditing(null);
    setTemplateName('');
    setTotalScore(100);
    setItems([emptyItem()]);
    setModalOpen(true);
  };

  const openEdit = (template: QuestionTypeTemplate) => {
    setEditing(template);
    setTemplateName(template.name);
    setTotalScore(Number(template.totalScore));
    setItems(template.items.map(item => ({ ...item, scorePerQuestion: Number(item.scorePerQuestion) })));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      message.error('请输入模板名称');
      return;
    }
    if (!isValidScore) {
      message.error('题型配置小计必须等于总分');
      return;
    }

    setLoading(true);
    try {
      const payload: QuestionTypeTemplateCreate = { name: templateName.trim(), totalScore, items };
      if (editing) {
        await questionTypeTemplateApi.update(editing.id, payload);
      } else {
        await questionTypeTemplateApi.create(payload);
      }
      message.success('保存成功');
      setModalOpen(false);
      await loadTemplates();
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '保存失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await questionTypeTemplateApi.delete(id);
      message.success('删除成功');
      await loadTemplates();
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '删除失败'));
    }
  };

  const updateItem = (index: number, patch: Partial<QuestionTypeTemplateItem>) => {
    setItems(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  };

  const addItem = () => {
    const availableType = QUESTION_TYPES.find(type => !items.some(item => item.questionType === type.value));
    if (!availableType) {
      return;
    }
    setItems([...items, {
      title: availableType.label,
      questionType: availableType.value,
      questionCount: 1,
      scorePerQuestion: 1
    }]);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>题型配置模板</h2>
        <Button type="primary" onClick={openCreate}>新增模板</Button>
      </div>

      <Table rowKey="id" columns={columns} dataSource={templates} pagination={false} />

      <Modal
        title={editing ? '编辑模板' : '新增模板'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={loading}
        width={760}
      >
        <Form layout="vertical">
          <Form.Item label="模板名称" required>
            <Input value={templateName} onChange={event => setTemplateName(event.target.value)} />
          </Form.Item>
          <Form.Item label="总分" required>
            <InputNumber min={1} value={totalScore} onChange={value => setTotalScore(value || 100)} />
          </Form.Item>
          <Card title="题型配置" size="small">
            {items.map((item, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Select
                  value={item.questionType}
                  style={{ width: 130 }}
                  onChange={value => {
                    const selectedType = QUESTION_TYPES.find(type => type.value === value);
                    updateItem(index, { questionType: value, title: selectedType?.label || item.title });
                  }}
                >
                  {QUESTION_TYPES.map(type => (
                    <Select.Option
                      key={type.value}
                      value={type.value}
                      disabled={items.some((current, itemIndex) => itemIndex !== index && current.questionType === type.value)}
                    >
                      {type.label}
                    </Select.Option>
                  ))}
                </Select>
                <InputNumber min={1} value={item.questionCount} onChange={value => updateItem(index, { questionCount: value || 1 })} />
                <span>题</span>
                <InputNumber min={0.5} value={item.scorePerQuestion} onChange={value => updateItem(index, { scorePerQuestion: value || 1 })} />
                <span>分</span>
                <Button danger type="link" onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}>
                  删除
                </Button>
              </Space>
            ))}
            <Button block type="dashed" onClick={addItem} disabled={items.length >= QUESTION_TYPES.length}>
              + 新增题型
            </Button>
          </Card>
          {!isValidScore && (
            <Alert
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
              message={`当前题型小计为 ${subtotal} 分，距离总分 ${totalScore} 分还差 ${Math.abs(totalScore - subtotal)} 分。`}
            />
          )}
        </Form>
      </Modal>
    </div>
  );
}
