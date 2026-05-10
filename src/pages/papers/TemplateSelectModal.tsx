import React, { useState, useEffect } from 'react';
import { Modal, message, List, Radio } from 'antd';
import { questionTypeTemplateApi } from '../../api/questionTypeTemplateApi';
import type { QuestionTypeTemplate } from '../../types/questionTypeTemplate';
import { getErrorMessage } from '../../utils/errors';

interface TemplateSelectModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (template: QuestionTypeTemplate) => void;
}

export function TemplateSelectModal({ open, onCancel, onConfirm }: TemplateSelectModalProps) {
  const [templates, setTemplates] = useState<QuestionTypeTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();

  useEffect(() => {
    if (open) {
      loadTemplates();
      setSelectedTemplateId(undefined);
    }
  }, [open]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await questionTypeTemplateApi.list();
      setTemplates(data);
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '获取题型模板失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    if (!selectedTemplateId) {
      message.warning('请先选择模板');
      return;
    }
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    Modal.confirm({
      title: '确认应用模板',
      content: '应用模板将覆盖当前的题型配置和总分，是否继续？',
      onOk: () => {
        onConfirm(template);
      }
    });
  };

  return (
    <Modal
      title="选择题型配置模板"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      width={600}
    >
      <List
        loading={loading}
        dataSource={templates}
        renderItem={template => (
          <List.Item
            onClick={() => setSelectedTemplateId(template.id)}
            style={{
              cursor: 'pointer',
              backgroundColor: selectedTemplateId === template.id ? '#e6f4ff' : 'transparent',
              transition: 'background-color 0.3s',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '8px',
              border: '1px solid #f0f0f0'
            }}
          >
            <List.Item.Meta
              avatar={<Radio checked={selectedTemplateId === template.id} onChange={() => setSelectedTemplateId(template.id)} />}
              title={`${template.name}（总分：${template.totalScore}分）`}
              description={template.items.map(item => `${item.title} ${item.questionCount}题 x ${item.scorePerQuestion}分`).join(' / ')}
            />
          </List.Item>
        )}
        style={{ maxHeight: 400, overflowY: 'auto', padding: '0 8px' }}
      />
    </Modal>
  );
}
