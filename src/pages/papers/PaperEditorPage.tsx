import React, { useState } from 'react';
import { Layout, Radio, Button, Space, Affix, message, Spin, Tooltip, Modal, Form, Input, InputNumber } from 'antd';
import { SaveOutlined, CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paperApi } from '../../api/paperApi';
import { QuestionType } from '../../types/shared';
import type { PaperQuestionResponse, QuestionSnapshotUpdate } from '../../types/paper';
import { getErrorMessage } from '../../utils/errors';

const renderContent = (jsonStr: string, questionType: QuestionType) => {
  if (!jsonStr) return null;
  try {
    const data = JSON.parse(jsonStr);
    if (questionType === QuestionType.SINGLE_CHOICE && Array.isArray(data.options)) {
      return (
        <div style={{ marginTop: 8, paddingLeft: 16, display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
          {data.options.map((opt: string, i: number) => (
            <span key={i}>{opt}</span>
          ))}
        </div>
      );
    }
    return null;
  } catch {
    return null;
  }
};

const renderAnswer = (jsonStr: string) => {
  if (!jsonStr) return '-';
  try {
    const data = JSON.parse(jsonStr);
    
    const val = data.isCorrect ?? data.correctAnswer ?? data.correctOption ?? Object.values(data)[0];
    const valStr = String(val).toLowerCase();
    if (val === true || valStr === 'true' || valStr === 't') return '正确';
    if (val === false || valStr === 'false' || valStr === 'f') return '错误';

    if (data.correctOption) return data.correctOption;
    if (data.correctAnswer) return data.correctAnswer;
    if (data.answers && Array.isArray(data.answers)) return data.answers.join('；');
    return Object.values(data).join('，');
  } catch {
    return jsonStr;
  }
};

const renderStem = (stem: string, questionType: QuestionType, version: 'student' | 'teacher', answerJson: string, qIndex: number) => {
  const finalStem = stem.replace(/判断下面的说法是否正确：/g, '').replace(/判断下面的说法是否正确:/g, '').trim();

  if (questionType !== QuestionType.TRUE_FALSE) {
    return <div style={{ margin: 0 }}>{qIndex + 1}. {finalStem}</div>;
  }

  if (version === 'student') {
    return (
      <div style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
        <span>{qIndex + 1}. {finalStem}</span>
        <span style={{ flexShrink: 0, marginLeft: 16 }}>(&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)</span>
      </div>
    );
  }

  let isCorrect = null;
  try {
    const data = JSON.parse(answerJson);
    const val = data.isCorrect ?? data.correctAnswer ?? data.correctOption ?? Object.values(data)[0];
    const valStr = String(val).toLowerCase();
    if (val === true || valStr === 'true' || valStr === '正确' || valStr === 't') isCorrect = true;
    if (val === false || valStr === 'false' || valStr === '错误' || valStr === 'f') isCorrect = false;
  } catch {
    isCorrect = null;
  }

  const icon = isCorrect === true ? <CheckOutlined /> : isCorrect === false ? <CloseOutlined /> : renderAnswer(answerJson);
  const iconColor = isCorrect === false ? '#ff3b30' : '#34c759';

  return (
    <div style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
      <span>{qIndex + 1}. {finalStem}</span>
      <span style={{ flexShrink: 0, marginLeft: 16 }}>( <strong style={{ color: iconColor }}>{icon}</strong> )</span>
    </div>
  );
};

const { Sider, Content } = Layout;

const isFormValidationError = (error: unknown) => {
  return typeof error === 'object' && error !== null && 'errorFields' in error;
};

export function PaperEditorPage() {
  const { paperId } = useParams();
  const [version, setVersion] = useState<'student' | 'teacher'>('teacher');
  const [editForm] = Form.useForm<QuestionSnapshotUpdate>();
  const [editingQuestion, setEditingQuestion] = useState<PaperQuestionResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: paper, isLoading, refetch } = useQuery({
    queryKey: ['paper', paperId],
    queryFn: () => paperApi.getPaperDetail(paperId as string),
    enabled: !!paperId
  });

  const handleSaveToBank = async (questionId: number) => {
    try {
      await paperApi.saveToBank(paperId as string, questionId);
      message.success('已存入题库');
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '存入失败'));
    }
  };

  const handleSavePaper = async () => {
    try {
      await paperApi.savePaper(paperId as string);
      message.success('试卷已保存');
      await refetch();
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '保存失败'));
    }
  };

  const openQuestionEditor = (question: PaperQuestionResponse) => {
    setEditingQuestion(question);
    editForm.setFieldsValue({
      stemSnapshot: question.stemSnapshot,
      contentSnapshotJson: question.contentSnapshotJson,
      answerSnapshotJson: question.answerSnapshotJson,
      analysisSnapshot: question.analysisSnapshot,
      score: question.score
    });
  };

  const validateJsonObject = (_: unknown, value?: string) => {
    try {
      const parsed = JSON.parse(value || '');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('请输入 JSON 对象字符串'));
    } catch {
      return Promise.reject(new Error('请输入合法 JSON'));
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) {
      return;
    }
    setSaving(true);
    try {
      const values = await editForm.validateFields();
      await paperApi.updateQuestion(paperId as string, editingQuestion.id, values);
      message.success('题目已更新');
      setEditingQuestion(null);
      await refetch();
    } catch (e: unknown) {
      if (!isFormValidationError(e)) {
        message.error(getErrorMessage(e, '更新失败'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = async () => {
    try {
      const html = await paperApi.printHtml(paperId as string, version);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '打印失败'));
    }
  };

  const handleExport = async () => {
    try {
      const blob = await paperApi.exportWord(paperId as string, version);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paper-${paperId}-${version}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e: unknown) {
      message.error(getErrorMessage(e, '导出失败'));
    }
  };

  if (isLoading) {
    return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  if (!paper) {
    return <div style={{ padding: 48, textAlign: 'center', color: '#7a7a7a' }}>试卷不存在或加载失败</div>;
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)', background: '#f5f5f7' }}>
      {/* ── Sidebar: outline & scores ── */}
      <Sider
        width={240}
        style={{
          background: '#ffffff',
          padding: 20,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#1d1d1f',
            letterSpacing: '-0.224px',
            marginBottom: 16,
          }}
        >
          大纲与分值
        </h3>
        {paper.sections?.map(sec => (
          <div
            key={sec.id}
            style={{
              padding: '8px 12px',
              marginBottom: 6,
              background: '#fafafc',
              borderRadius: 8,
              fontSize: 13,
              color: '#333333',
            }}
          >
            {sec.title}
            <span style={{ float: 'right', color: '#7a7a7a' }}>{sec.subtotalScore}分</span>
          </div>
        ))}
        <div
          style={{
            marginTop: 16,
            borderTop: '1px solid #f0f0f0',
            paddingTop: 16,
            fontSize: 17,
            fontWeight: 600,
            color: '#1d1d1f',
            letterSpacing: '-0.374px',
          }}
        >
          总分: {paper.totalScore}分
        </div>
      </Sider>

      {/* ── Main content ── */}
      <Content
        style={{
          padding: 24,
          background: '#f5f5f7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* ── Toolbar ── */}
        <Affix offsetTop={64}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              padding: '10px 24px',
              borderRadius: 12,
              border: '1px solid #f0f0f0',
              marginBottom: 24,
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}
          >
            <Radio.Group value={version} onChange={(e) => setVersion(e.target.value)}>
              <Radio.Button value="student">学生版</Radio.Button>
              <Radio.Button value="teacher">教师版</Radio.Button>
            </Radio.Group>
            <Space>
              <Button onClick={handlePrint}>打印</Button>
              <Button onClick={handleExport}>导出 Word</Button>
              <Button
                type="primary"
                onClick={handleSavePaper}
                style={{ borderRadius: 9999 }}
              >
                保存
              </Button>
            </Space>
          </div>
        </Affix>

        {/* ── Paper preview ── */}
        <div
          className="paper-preview"
          style={{
            width: '794px',
            minHeight: '1123px',
            background: '#ffffff',
            padding: '48px',
            borderRadius: 4,
            border: '1px solid #f0f0f0',
          }}
        >
          <h1
            style={{
              textAlign: 'center',
              fontSize: 28,
              fontWeight: 600,
              color: '#1d1d1f',
              letterSpacing: '-0.28px',
            }}
          >
            {paper.title}
          </h1>
          <div
            style={{
              textAlign: 'center',
              marginBottom: 24,
              color: '#7a7a7a',
              fontSize: 14,
            }}
          >
            {paper.grade} {paper.publisher} {paper.subject === 'MATH' ? '数学' : '语文'} {paper.volume}
          </div>
          
          {paper.sections?.map((sec, secIndex) => (
            <div key={sec.id} className="paper-section" style={{ marginBottom: 32 }}>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: '#1d1d1f',
                  letterSpacing: '-0.374px',
                  marginBottom: 12,
                }}
              >
                {['一', '二', '三', '四', '五', '六'][secIndex]}、{sec.title}（每题 {sec.scorePerQuestion} 分，共 {sec.subtotalScore} 分）
              </h3>
              
              {sec.questions.map((q, qIndex) => (
                <div key={q.id} className="paper-question" style={{ marginBottom: 16 }}>
                  <div style={{ position: 'relative', paddingRight: 40 }}>
                    {renderStem(q.stemSnapshot, sec.questionType, version, q.answerSnapshotJson, qIndex)}
                    {renderContent(q.contentSnapshotJson, sec.questionType)}
                    
                    {version === 'teacher' && (
                      <>
                        <div
                          style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            background: 'rgba(52, 199, 89, 0.06)',
                            border: '1px solid rgba(52, 199, 89, 0.2)',
                            borderRadius: 8,
                            color: '#34c759',
                            fontSize: 13,
                          }}
                        >
                          <span>
                            <strong style={{ color: '#248a3d' }}>【答案】</strong> 
                            {renderAnswer(q.answerSnapshotJson)}
                            {q.analysisSnapshot ? `。${q.analysisSnapshot}` : ''}
                          </span>
                        </div>
                        <Tooltip title="存入题库">
                          <Button 
                            type="text" 
                            icon={<SaveOutlined style={{ color: '#0066cc', fontSize: 16 }} />} 
                            onClick={() => handleSaveToBank(q.id)}
                            style={{ position: 'absolute', right: 0, top: -4 }}
                          />
                        </Tooltip>
                        <Tooltip title="编辑题目">
                          <Button
                            type="text"
                            icon={<EditOutlined style={{ color: '#7a7a7a', fontSize: 16 }} />}
                            onClick={() => openQuestionEditor(q)}
                            style={{ position: 'absolute', right: 32, top: -4 }}
                          />
                        </Tooltip>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Content>
      <Modal
        title="编辑试卷题目"
        open={!!editingQuestion}
        onCancel={() => setEditingQuestion(null)}
        onOk={handleUpdateQuestion}
        confirmLoading={saving}
        width={720}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="stemSnapshot" label="题干" rules={[{ required: true, message: '请输入题干' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="contentSnapshotJson"
            label="题目内容 JSON"
            rules={[{ required: true, message: '请输入题目内容 JSON' }, { validator: validateJsonObject }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="answerSnapshotJson"
            label="答案 JSON"
            rules={[{ required: true, message: '请输入答案 JSON' }, { validator: validateJsonObject }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="analysisSnapshot" label="解析">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="score" label="分值" rules={[{ required: true, message: '请输入分值' }]}>
            <InputNumber min={0.5} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
