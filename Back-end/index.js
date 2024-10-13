import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import axios from 'axios';

const app = express();

// Load environment variables from .env file
dotenv.config({
    path: './.env',
});

// Middleware setup
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Route to generate Mermaid code for Gantt or PERT chart
app.post('/generate-chart', async (req, res) => {
    const { topic, chartType } = req.body;

    // Validate input
    if (!topic || !chartType) {
        return res.status(400).json({
            success: false,
            message: 'Topic and chart type are required.',
        });
    }

    const validChartTypes = ['gantt', 'pert'];
    if (!validChartTypes.includes(chartType.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: "Invalid chart type. Please specify either 'gantt' or 'pert'.",
        });
    }

    // System prompt for the AI model, instructing it to return only the code
    const systemPrompt = `You are a code-generating assistant. Provide only the code, specifically in Mermaid syntax, for a ${chartType} chart. Do not include any explanations or comments.`;

    try {
        const response = await axios.post(
            'https://cloud.olakrutrim.com/v1/chat/completions',
            {
                model: 'DeepSeek-Coder-V2-Instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Generate Mermaid code for the ${chartType} chart on the topic: ${topic}. Return only the code.` },
                ],
                frequency_penalty: 0,
                logprobs: false,
                max_tokens: 1024,
                n: 1,
                presence_penalty: 0,
                response_format: { type: 'text' },
                stream: false,
                temperature: 0,
                top_p: 1,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.API_KEY}`, // Use the API key from environment variables
                },
            }
        );

        // Send only the generated Mermaid code back to the client
        res.json({
            success: true,
            mermaidCode: response.data.choices[0].message.content.trim(),
        });
    } catch (error) {
        console.error('Error generating chart:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating chart code.',
        });
    }
});

// Start the server
app.listen(4700, () => {
    console.log('Server is running on http://localhost:4700');
});
