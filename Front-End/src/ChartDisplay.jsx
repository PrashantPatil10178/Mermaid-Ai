// src/ChartDisplay.jsx
import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Card } from 'shadcn/ui'; // Import the Card component from Shadcn

const ChartDisplay = ({ mermaidCode }) => {
    const chartContainerRef = useRef(null);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: true });
        mermaid.contentLoaded();
    }, [mermaidCode]);

    return (
        <Card className="mt-6">
            <Card.Header>
                <Card.Title>Generated Chart</Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="mermaid">
                    {mermaidCode}
                </div>
            </Card.Body>
        </Card>
    );
};

export default ChartDisplay;
