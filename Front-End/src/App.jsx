import React, { useState, useEffect, useRef } from 'react'
import { Input, Radio, Button, Typography, message, Card, Space, Row, Col, Modal, Spin } from 'antd'
import { DownloadOutlined, ReloadOutlined, BarChartOutlined } from '@ant-design/icons'
import mermaid from 'mermaid'
import 'antd/dist/reset.css'
import './App.css'

const { Title } = Typography

export default function App() {
  const [topic, setTopic] = useState('')
  const [chartType, setChartType] = useState('gantt')
  const [mermaidCode, setMermaidCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const chartContainerRef = useRef(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    })
  }, [])

  const extractAndCompleteMermaidCode = (jsonResponse) => {
    try {
      const parsedResponse = JSON.parse(jsonResponse)
      if (parsedResponse.success && parsedResponse.mermaidCode) {
        let code = parsedResponse.mermaidCode
          .replace(/^```mermaid\n/, '')
          .replace(/```$/, '')
          .trim()

        code = code.replace(/"remove this"/g, '')

        if (chartType === 'pert') {
          const lines = code.split('\n')
          let newCode = 'graph LR\n'
          const nodes = new Map()
          const edges = []

          lines.forEach(line => {
            if (line.includes(':')) {
              const [task, duration] = line.split(':').map(s => s.trim())
              const nodeId = task.replace(/\s+/g, '')
              nodes.set(nodeId, { task, duration })
            } else if (line.includes('-->')) {
              edges.push(line.trim())
            }
          })

          nodes.forEach(({ task, duration }, nodeId) => {
            newCode += `    ${nodeId}[${task}]\n`
          })

          edges.forEach(edge => {
            const [from, to] = edge.split('-->').map(s => s.trim().replace(/\s+/g, ''))
            newCode += `    ${from} --> ${to}\n`
          })

          edges.forEach(edge => {
            const [from, to] = edge.split('-->').map(s => s.trim().replace(/\s+/g, ''))
            const duration = nodes.get(to).duration
            newCode += `    ${from} -- ${duration}d --> ${to}\n`
          })

          code = newCode
        }

        if (!code.startsWith(chartType)) {
          code = `${chartType}\n${code}`
        }

        return code
      }
    } catch (error) {
      console.error('Error parsing JSON:', error)
    }
    return null
  }

  useEffect(() => {
    if (mermaidCode && chartContainerRef.current) {
      setError('')
      mermaid.render('mermaid-chart', mermaidCode).then((result) => {
        chartContainerRef.current.innerHTML = result.svg
      }).catch((error) => {
        console.error('Mermaid rendering error:', error)
        setError('Error rendering the chart. Please check the Mermaid syntax.')
      })
    }
  }, [mermaidCode])

  const handleGenerateChart = async () => {
    if (!topic.trim()) {
      message.warning('Please enter a valid topic.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:4700/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic, chartType }),
      })

      const data = await response.text()
      const extractedCode = extractAndCompleteMermaidCode(data)

      if (extractedCode) {
        setMermaidCode(extractedCode)
        message.success('Mermaid chart generated successfully!')
      } else {
        setError('Error processing the generated chart code.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while generating the chart.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (chartContainerRef.current) {
      const svgElement = chartContainerRef.current.querySelector('svg')
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          const pngFile = canvas.toDataURL('image/png')
          const downloadLink = document.createElement('a')
          downloadLink.download = 'mermaid_chart.png'
          downloadLink.href = pngFile
          downloadLink.click()
        }
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
      }
    }
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card title={<Title level={2} style={{textAlign:'center',margin:'20px'}}>Mermaid Chart</Title>} style={{ width:"80%", margin: '0 auto',alignSelf:'center' }}>
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
      <footer style={{ marginTop: 'auto', textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5' }}>
        <Typography.Text type="secondary">
         Created by  © Dariyan Naagar Industries
        </Typography.Text>
      </footer>
    </div>
  )
}