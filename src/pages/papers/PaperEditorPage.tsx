import React, { useState } from 'react';
import { Layout, Radio, Button, Space, Affix, message, Spin, Tooltip } from 'antd';
import { SaveOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paperApi } from '../../api/paperApi';
import { QuestionType } from '../../types/shared';

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
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {}

  const icon = isCorrect === true ? <CheckOutlined /> : isCorrect === false ? <CloseOutlined /> : renderAnswer(answerJson);
  const iconColor = isCorrect === false ? '#ff4d4f' : '#52c41a';

  return (
    <div style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
      <span>{qIndex + 1}. {finalStem}</span>
      <span style={{ flexShrink: 0, marginLeft: 16 }}>( <strong style={{ color: iconColor }}>{icon}</strong> )</span>
    </div>
  );
};

const { Sider, Content } = Layout;

export function PaperEditorPage() {
  const { paperId } = useParams();
  const [version, setVersion] = useState<'student' | 'teacher'>('teacher');

  const { data: paper, isLoading, refetch } = useQuery({
    queryKey: ['paper', paperId],
    queryFn: () => paperApi.getPaperDetail(paperId as string),
    enabled: !!paperId
  });

  const handleSaveToBank = async (questionId: number) => {
    try {
      await paperApi.saveToBank(paperId as string, questionId);
      message.success('已存入题库');
    } catch (e: any) {
      message.error(e.message || '存入失败');
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
    } catch (e: any) {
      message.error(e.message || '打印失败');
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
    } catch (e: any) {
      message.error(e.message || '导出失败');
    }
  };

  if (isLoading) {
    return <div style={{ padding: 48, textAlign: 'center' }}><Spin size="large" /></div>;
  }

  if (!paper) {
    return <div style={{ padding: 48, textAlign: 'center' }}>试卷不存在或加载失败</div>;
  }

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider width={250} theme="light" style={{ padding: 16, borderRight: '1px solid #f0f0f0' }}>
        <h3>大纲与分值</h3>
        {paper.sections?.map(sec => (
          <p key={sec.id}>{sec.title} ({sec.subtotalScore}分)</p>
        ))}
        <div style={{ marginTop: 24, borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <strong>总分: {paper.totalScore}分</strong>
        </div>
      </Sider>
      <Content style={{ padding: 24, background: '#f0f2f5', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Affix offsetTop={64}>
          <div style={{ background: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
            <Radio.Group value={version} onChange={(e) => setVersion(e.target.value)}>
              <Radio.Button value="student">学生版</Radio.Button>
              <Radio.Button value="teacher">教师版</Radio.Button>
            </Radio.Group>
            <Space>
              <Button onClick={handlePrint}>打印</Button>
              <Button onClick={handleExport}>导出 Word</Button>
              <Button type="primary">保存</Button>
            </Space>
          </div>
        </Affix>

        <div className="paper-preview" style={{
          width: '794px',
          minHeight: '1123px',
          background: '#fff',
          padding: '48px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ textAlign: 'center' }}>{paper.title}</h1>
          <div style={{ textAlign: 'center', marginBottom: 24, color: 'gray' }}>
            {paper.grade} {paper.publisher} {paper.subject === 'MATH' ? '数学' : '语文'} {paper.volume}
          </div>
          
          {paper.sections?.map((sec, secIndex) => (
            <div key={sec.id} className="paper-section" style={{ marginBottom: 32 }}>
              <h3>{['一', '二', '三', '四', '五', '六'][secIndex]}、{sec.title}（每题 {sec.scorePerQuestion} 分，共 {sec.subtotalScore} 分）</h3>
              
              {sec.questions.map((q, qIndex) => (
                <div key={q.id} className="paper-question" style={{ marginBottom: 16 }}>
                  <div style={{ position: 'relative', paddingRight: 40 }}>
                    {renderStem(q.stemSnapshot, sec.questionType, version, q.answerSnapshotJson, qIndex)}
                    {renderContent(q.contentSnapshotJson, sec.questionType)}
                    
                    {version === 'teacher' && (
                      <>
                        <div style={{ marginTop: 12, padding: '8px 12px', background: '#f6ffed', border: '1px solid #b7eb8f', color: '#52c41a' }}>
                          <span>
                            <strong style={{ color: '#389e0d' }}>【答案】</strong> 
                            {renderAnswer(q.answerSnapshotJson)}
                            {q.analysisSnapshot ? `。${q.analysisSnapshot}` : ''}
                          </span>
                        </div>
                        <Tooltip title="存入题库">
                          <Button 
                            type="text" 
                            icon={<SaveOutlined style={{ color: '#1890ff', fontSize: 16 }} />} 
                            onClick={() => handleSaveToBank(q.id)}
                            style={{ position: 'absolute', right: 0, top: -4 }}
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
    </Layout>
  );
}
