import React, { useState, useMemo } from 'react';
import { Form, Input, Button, Select, Space, Card, InputNumber, Alert, message, Cascader, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { paperApi } from '../../api/paperApi';
import { curriculumApi } from '../../api/curriculumApi';
import { questionTypeTemplateApi } from '../../api/questionTypeTemplateApi';
import type { PaperGenerateRequest, PaperPlanPreview, PaperSectionConfig } from '../../types/paper';
import type { CurriculumTreeNode } from '../../types/curriculum';
import type { QuestionTypeTemplate } from '../../types/questionTypeTemplate';
import { QUESTION_TYPES, QuestionType, GENERATION_STRATEGIES, GenerationStrategy } from '../../types/shared';
import type { Difficulty, Subject } from '../../types/shared';
import { getErrorMessage } from '../../utils/errors';
import { TemplateSelectModal } from './TemplateSelectModal';

export function PaperWizardPage() {
  const navigate = useNavigate();

  const [baseInfo, setBaseInfo] = useState<Partial<PaperGenerateRequest>>({
    title: '', grade: '三年级', publisher: '人教版', subject: 'MATH', volume: '上册', unit: '第一单元', chapter: '测试'
  });
  const [sections, setSections] = useState<PaperSectionConfig[]>([{ title: '选择题', questionType: QuestionType.SINGLE_CHOICE, questionCount: 10, scorePerQuestion: 5 }]);
  const [strategy, setStrategy] = useState<GenerationStrategy>(GenerationStrategy.BANK_WITH_AI);
  const [difficulty, setDifficulty] = useState<Difficulty | undefined>();
  const [previewData, setPreviewData] = useState<PaperPlanPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<CurriculumTreeNode[]>([]);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [selectTemplateOpen, setSelectTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  const subtotal = useMemo(() => {
    return sections.reduce((acc, curr) => acc + (curr.questionCount * curr.scorePerQuestion), 0);
  }, [sections]);


  React.useEffect(() => {
    curriculumApi.getCurriculumTree().then(res => {
      setTreeData(res);
    }).catch(error => {
      message.error(`获取教材树失败: ${getErrorMessage(error, '请求失败')}`);
    });
  }, []);

  const applyTemplate = (template: QuestionTypeTemplate) => {
    setSections(template.items.map(item => ({
      title: item.title,
      questionType: item.questionType,
      questionCount: item.questionCount,
      scorePerQuestion: Number(item.scorePerQuestion)
    })));
    setPreviewData(null);
  };

  const saveCurrentTemplate = async () => {
    if (!templateName.trim()) {
      message.error('请输入模板名称');
      return;
    }

    setLoading(true);
    try {
      await questionTypeTemplateApi.create({
        name: templateName.trim(),
        items: sections
      });
      message.success('模板已保存');
      setSaveTemplateOpen(false);
      setTemplateName('');
    } catch (error: unknown) {
      message.error(getErrorMessage(error, '保存模板失败'));
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = () => {
    const requiredFields = ['title', 'publisher', 'subject', 'grade', 'volume', 'unit', 'chapter'] as const;
    const hasMissingField = requiredFields.some(field => !baseInfo[field]);
    if (hasMissingField) {
      message.error('请完整填写试卷标题，并选择到具体教材章节');
      return null;
    }

    return {
      ...baseInfo,
      totalScore: subtotal,
      strategy,
      difficulty,
      sections
    } as PaperGenerateRequest;
  };

  const handleNextToPreview = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    setLoading(true);
    try {
      const data = await paperApi.previewPlan(payload);
      setPreviewData(data);
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '预览失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }
    setLoading(true);
    try {
      const data = await paperApi.generate(payload);
      message.success('生成成功');
      navigate(`/papers/${data.id}`);
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '生成失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>生成试卷</h2>
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>总分：{subtotal} 分</span>
      </div>

      <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <Form layout="vertical">
          <Form.Item label="试卷标题" required>
            <Input 
              value={baseInfo.title} 
              onChange={(e) => setBaseInfo({...baseInfo, title: e.target.value})} 
              placeholder="例如：2026年期中测试" 
            />
          </Form.Item>
          <Form.Item label="教材范围" required>
            <Cascader
              options={treeData}
              changeOnSelect
              placeholder="请选择教材范围（可细化到章节）"
              value={[
                baseInfo.publisher, baseInfo.subject, baseInfo.grade, 
                baseInfo.volume, baseInfo.unit, baseInfo.chapter
              ].filter(Boolean) as string[]}
              onChange={(path) => {
                setBaseInfo({
                  ...baseInfo,
                  publisher: (path[0] as string) || '',
                  subject: (path[1] as Subject) || undefined,
                  grade: (path[2] as string) || '',
                  volume: (path[3] as string) || '',
                  unit: (path[4] as string) || '',
                  chapter: (path[5] as string) || '',
                });
              }}
              style={{ width: '100%' }}
            />
          </Form.Item>


          <Card 
            title="题型配置" 
            size="small" 
            style={{ marginBottom: 16 }}
            extra={
              <Space>
                <Button onClick={() => setSaveTemplateOpen(true)}>保存为模板</Button>
                <Button type="primary" onClick={() => setSelectTemplateOpen(true)}>选择题型配置模板</Button>
              </Space>
            }
          >
            {sections.map((sec, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Select value={sec.questionType} onChange={v => {
                  const newSecs = [...sections];
                  newSecs[index].questionType = v;
                  const selectedType = QUESTION_TYPES.find(t => t.value === v);
                  if (selectedType) {
                    newSecs[index].title = selectedType.label;
                  }
                  setSections(newSecs);
                }} style={{ width: 120 }}>
                  {QUESTION_TYPES.map(type => {
                    const isSelected = sections.some((s, sIndex) => sIndex !== index && s.questionType === type.value);
                    return (
                      <Select.Option key={type.value} value={type.value} disabled={isSelected}>
                        {type.label}
                      </Select.Option>
                    );
                  })}
                </Select>
                
                <InputNumber value={sec.questionCount} onChange={v => {
                  const newSecs = [...sections];
                  newSecs[index].questionCount = v || 0;
                  setSections(newSecs);
                }} placeholder="题目数量" />
                <span>题</span>
                
                <InputNumber value={sec.scorePerQuestion} onChange={v => {
                  const newSecs = [...sections];
                  newSecs[index].scorePerQuestion = v || 0;
                  setSections(newSecs);
                }} placeholder="每题分值" />
                <span>分</span>

                <Button 
                  type="link" 
                  danger 
                  onClick={() => {
                    const newSecs = [...sections];
                    newSecs.splice(index, 1);
                    setSections(newSecs);
                  }}
                >
                  删除
                </Button>
              </Space>
            ))}
            <Button 
              type="dashed" 
              block 
              onClick={() => {
                const availableType = QUESTION_TYPES.find(t => !sections.some(s => s.questionType === t.value));
                if (availableType) {
                  setSections([...sections, { title: availableType.label, questionType: availableType.value, questionCount: 1, scorePerQuestion: 1 }]);
                }
              }}
              disabled={sections.length >= QUESTION_TYPES.length}
            >
              + 新增题型
            </Button>
          </Card>

          <Form.Item label="生成策略" style={{ marginTop: 16 }}>
            <Select value={strategy} onChange={setStrategy} style={{ width: 300 }}>
              {GENERATION_STRATEGIES.map(strat => (
                <Select.Option key={strat.value} value={strat.value}>
                  {strat.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="难度偏好">
            <Select
              allowClear
              placeholder="不限制难度"
              value={difficulty}
              onChange={setDifficulty}
              style={{ width: 300 }}
            >
              <Select.Option value="EASY">简单</Select.Option>
              <Select.Option value="MEDIUM">中等</Select.Option>
              <Select.Option value="HARD">困难</Select.Option>
            </Select>
          </Form.Item>

          {previewData && (
            <div style={{ marginTop: 16 }}>
              {previewData.sections.map((sec, i) => (
                <Alert 
                  key={i}
                  message={`大题 ${sec.title}: 需出 ${sec.requiredCount} 题。题库可出 ${sec.availableBankCount} 题，AI需补充 ${sec.aiSupplementCount} 题。`} 
                  type="info" 
                  showIcon 
                  style={{ marginBottom: 8 }} 
                />
              ))}
            </div>
          )}
        </Form>
      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <Space>
          <Button onClick={handleNextToPreview} loading={loading}>预览方案</Button>
          <Button type="primary" onClick={handleGenerate} loading={loading}>确认生成试卷</Button>
        </Space>
      </div>

      <Modal
        title="保存题型配置模板"
        open={saveTemplateOpen}
        onCancel={() => setSaveTemplateOpen(false)}
        onOk={saveCurrentTemplate}
        confirmLoading={loading}
      >
        <Form layout="vertical">
          <Form.Item label="模板名称" required>
            <Input value={templateName} onChange={event => setTemplateName(event.target.value)} placeholder="例如：100分基础模板" />
          </Form.Item>
          <Alert
            type="info"
            showIcon
            message={`当前题型小计总分为 ${subtotal} 分。`}
          />
        </Form>
      </Modal>

      <TemplateSelectModal
        open={selectTemplateOpen}
        onCancel={() => setSelectTemplateOpen(false)}
        onConfirm={(template) => {
          applyTemplate(template);
          setSelectTemplateOpen(false);
        }}
      />
    </div>
  );
}
