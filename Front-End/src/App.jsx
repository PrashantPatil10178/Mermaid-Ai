import React, { useState, useEffect, useRef } from 'react';
import { Input, Radio, Button, Typography, message, Card, Space, Row, Col, Modal, Spin } from 'antd';
import { DownloadOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons';
import mermaid from 'mermaid';
import 'antd/dist/reset.css';
import './App.css';

const { Title } = Typography;

export default function App() {
  const [topic, setTopic] = useState('');
  const [chartType, setChartType] = useState('gantt');
  const [mermaidCode, setMermaidCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chartContainerRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  const extractAndCompleteMermaidCode = (jsonResponse) => {
    // (The same extractAndCompleteMermaidCode implementation)
  };

  useEffect(() => {
    if (mermaidCode && chartContainerRef.current) {
      setError('');
      mermaid
        .render('mermaid-chart', mermaidCode)
        .then((result) => {
          chartContainerRef.current.innerHTML = result.svg;
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          setError('Error rendering the chart. Please check the Mermaid syntax.');
        });
    }
  }, [mermaidCode]);

  const handleGenerateChart = async () => {
    // (The same handleGenerateChart implementation)
  };

  const handleDownload = () => {
    // (The same handleDownload implementation)
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Card title={<Title level={2} style={{ textAlign: 'center', margin: '20px' }}>Mermaid Chart</Title>} style={{ width:'80%', margin: '0 auto', alignSelf: 'center' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Input
                placeholder="Enter topic name"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                size="large"
              />

              <Radio.Group
                onChange={(e) => setChartType(e.target.value)}
                value={chartType}
                size="large"
                buttonStyle="solid"
              >
                <Radio.Button value="gantt">Gantt Chart</Radio.Button>
                <Radio.Button value="pert">PERT Chart</Radio.Button>
              </Radio.Group>

              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleGenerateChart}
                loading={loading}
                size="large"
                block
              >
                Generate Chart
              </Button>
            </Space>
          </Col>

          <Col xs={24}>
            {mermaidCode && !error && (
              <Card
                title={<Space><BarChartOutlined /> Generated Chart</Space>}
                extra={
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                    type="primary"
                  >
                    Download as PNG
                  </Button>
                }
              >
                <div
                  ref={chartContainerRef}
                  className="mermaid"
                  style={{
                    backgroundColor: 'white',
                    padding: '16px',
                    borderRadius: '4px',
                    overflowX: 'auto'
                  }}
                />
              </Card>
            )}
          </Col>
        </Row>
      </Card>

      <Modal
        visible={loading}
        footer={null}
        closable={false}
        centered
        bodyStyle={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}
      >
        <Spin size="large" />
        <span style={{ marginLeft: '16px' }}>Generating chart...</span>
      </Modal>

      {/* Footer Section */}
      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5' }}>
        <Typography.Text type="secondary">
           Site Created By © Dariyan Naggar Industries
        </Typography.Text>
      </footer>
    </div>
  );
}
