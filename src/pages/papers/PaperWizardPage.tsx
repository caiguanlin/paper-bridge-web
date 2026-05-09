import React, { useState, useMemo } from 'react';
import { Form, Input, Button, Select, Space, Card, InputNumber, Alert, message, Cascader, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { paperApi } from '../../api/paperApi';
import { curriculumApi } from '../../api/curriculumApi';
import { questionTypeTemplateApi } from '../../api/questionTypeTemplateApi';
import type { PaperGenerateRequest, PaperPlanPreview, PaperSectionConfig } from '../../types/paper';
import type { QuestionTypeTemplate } from '../../types/questionTypeTemplate';
import { QUESTION_TYPES, QuestionType, GENERATION_STRATEGIES, GenerationStrategy } from '../../types/shared';

export function PaperWizardPage() {
  const navigate = useNavigate();

  const [baseInfo, setBaseInfo] = useState<Partial<PaperGenerateRequest>>({
    title: '', grade: '三年级', publisher: '人教版', subject: 'MATH', volume: '上册', unit: '第一单元', chapter: '测试'
  });
  const [totalScore, setTotalScore] = useState(100);
  const [sections, setSections] = useState<PaperSectionConfig[]>([{ title: '选择题', questionType: QuestionType.SINGLE_CHOICE, questionCount: 10, scorePerQuestion: 5 }]);
  const [strategy, setStrategy] = useState<GenerationStrategy>(GenerationStrategy.BANK_WITH_AI);
  const [previewData, setPreviewData] = useState<PaperPlanPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [templates, setTemplates] = useState<QuestionTypeTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | undefined>();
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');

  React.useEffect(() => {
    curriculumApi.getCurriculumTree().then(res => {
      setTreeData(res);
    }).catch(err => {
      message.error('获取教材树失败: ' + err.message);
    });
    loadTemplates();
  }, []);

  const subtotal = useMemo(() => {
    return sections.reduce((acc, curr) => acc + (curr.questionCount * curr.scorePerQuestion), 0);
  }, [sections]);

  const isValidScore = subtotal === totalScore;

  const loadTemplates = async () => {
    try {
      const data = await questionTypeTemplateApi.list();
      setTemplates(data);
    } catch (error: any) {
      message.error(error.message || '获取题型模板失败');
    }
  };

  const applyTemplate = (templateId: number) => {
    const template = templates.find(item => item.id === templateId);
    if (!template) {
      return;
    }
    setSelectedTemplateId(templateId);
    setTotalScore(Number(template.totalScore));
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
    if (!isValidScore) {
      message.error('题型配置小计必须等于总分');
      return;
    }
    setLoading(true);
    try {
      const template = await questionTypeTemplateApi.create({
        name: templateName.trim(),
        totalScore,
        items: sections
      });
      message.success('模板已保存');
      setSaveTemplateOpen(false);
      setTemplateName('');
      await loadTemplates();
      setSelectedTemplateId(template.id);
    } catch (error: any) {
      message.error(error.message || '保存模板失败');
    } finally {
      setLoading(false);
    }
  };

  const handleNextToPreview = async () => {
    setLoading(true);
    try {
      const payload = {
        ...baseInfo,
        totalScore,
        strategy,
        sections
      } as PaperGenerateRequest;
      const data = await paperApi.previewPlan(payload);
      setPreviewData(data);
    } catch (e: any) {
      message.error(e.message || '预览失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload = {
        ...baseInfo,
        totalScore,
        strategy,
        sections
      } as PaperGenerateRequest;
      const data = await paperApi.generate(payload);
      message.success('生成成功');
      navigate(`/papers/${data.id}`);
    } catch (e: any) {
      message.error(e.message || '生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>生成试卷</h2>

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
                  subject: (path[1] as any) || undefined,
                  grade: (path[2] as string) || '',
                  volume: (path[3] as string) || '',
                  unit: (path[4] as string) || '',
                  chapter: (path[5] as string) || '',
                });
              }}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="总分" required>
            <InputNumber value={totalScore} onChange={(v) => setTotalScore(v || 100)} />
          </Form.Item>
          <Form.Item label="题型配置模板">
            <Space.Compact style={{ width: '100%' }}>
              <Select
                allowClear
                placeholder="选择模板后自动填充题型配置"
                value={selectedTemplateId}
                onChange={value => value ? applyTemplate(value) : setSelectedTemplateId(undefined)}
                style={{ flex: 1 }}
              >
                {templates.map(template => (
                  <Select.Option key={template.id} value={template.id}>
                    {template.name}（{template.totalScore}分）
                  </Select.Option>
                ))}
              </Select>
              <Button onClick={() => setSaveTemplateOpen(true)}>保存为模板</Button>
            </Space.Compact>
          </Form.Item>
          <Card title="题型配置" size="small" style={{ marginBottom: 16 }}>
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
                  setSelectedTemplateId(undefined);
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
                  setSelectedTemplateId(undefined);
                }} placeholder="题目数量" />
                <span>题</span>
                
                <InputNumber value={sec.scorePerQuestion} onChange={v => {
                  const newSecs = [...sections];
                  newSecs[index].scorePerQuestion = v || 0;
                  setSections(newSecs);
                  setSelectedTemplateId(undefined);
                }} placeholder="每题分值" />
                <span>分</span>

                <Button 
                  type="link" 
                  danger 
                  onClick={() => {
                    const newSecs = [...sections];
                    newSecs.splice(index, 1);
                    setSections(newSecs);
                    setSelectedTemplateId(undefined);
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
                  setSelectedTemplateId(undefined);
                }
              }}
              disabled={sections.length >= QUESTION_TYPES.length}
            >
              + 新增题型
            </Button>
          </Card>
          {!isValidScore && (
            <Alert 
              message={`当前题型小计为 ${subtotal} 分，距离总分 ${totalScore} 分还差 ${Math.abs(totalScore - subtotal)} 分。`} 
              type="warning" 
              showIcon 
              style={{ marginBottom: 16 }} 
            />
          )}

          <Form.Item label="生成策略" style={{ marginTop: 16 }}>
            <Select value={strategy} onChange={setStrategy} style={{ width: 300 }}>
              {GENERATION_STRATEGIES.map(strat => (
                <Select.Option key={strat.value} value={strat.value}>
                  {strat.label}
                </Select.Option>
              ))}
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
          <Button onClick={handleNextToPreview} loading={loading} disabled={!isValidScore}>预览方案</Button>
          <Button type="primary" onClick={handleGenerate} loading={loading} disabled={!isValidScore}>确认生成试卷</Button>
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
            type={isValidScore ? 'info' : 'warning'}
            showIcon
            message={`当前题型小计为 ${subtotal} 分，总分为 ${totalScore} 分。`}
          />
        </Form>
      </Modal>
    </div>
  );
}
