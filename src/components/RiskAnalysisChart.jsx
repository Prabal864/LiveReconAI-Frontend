import React, { useEffect, useRef } from 'react';

const RiskAnalysisChart = ({ metrics }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Prepare data
        const dataPoints = [
            { label: 'Spending', value: metrics.spending.value, angle: 0 },
            { label: 'Identity', value: metrics.identity.value, angle: Math.PI / 3 },
            { label: 'Cards', value: metrics.cards.value, angle: (2 * Math.PI) / 3 },
            { label: 'Location', value: metrics.location.value, angle: Math.PI },
            { label: 'Behavior', value: metrics.behavior.value, angle: (4 * Math.PI) / 3 },
            { label: 'Merchant', value: metrics.merchant.value, angle: (5 * Math.PI) / 3 }
        ];

        // Draw grid circles (background)
        const gridLevels = 5;
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        for (let i = 1; i <= gridLevels; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / gridLevels) * i, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw grid lines (radial)
        ctx.strokeStyle = '#e5e7eb';
        dataPoints.forEach(point => {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            const x = centerX + radius * Math.cos(point.angle - Math.PI / 2);
            const y = centerY + radius * Math.sin(point.angle - Math.PI / 2);
            ctx.lineTo(x, y);
            ctx.stroke();
        });

        // Draw data polygon
        ctx.beginPath();
        dataPoints.forEach((point, index) => {
            const value = point.value / 100; // Normalize to 0-1
            const x = centerX + radius * value * Math.cos(point.angle - Math.PI / 2);
            const y = centerY + radius * value * Math.sin(point.angle - Math.PI / 2);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();

        // Fill with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Stroke the polygon
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw data points
        dataPoints.forEach(point => {
            const value = point.value / 100;
            const x = centerX + radius * value * Math.cos(point.angle - Math.PI / 2);
            const y = centerY + radius * value * Math.sin(point.angle - Math.PI / 2);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#3b82f6';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Draw labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        dataPoints.forEach(point => {
            const labelRadius = radius + 25;
            const x = centerX + labelRadius * Math.cos(point.angle - Math.PI / 2);
            const y = centerY + labelRadius * Math.sin(point.angle - Math.PI / 2);
            
            // Adjust text alignment based on position
            if (x < centerX - 5) {
                ctx.textAlign = 'right';
            } else if (x > centerX + 5) {
                ctx.textAlign = 'left';
            } else {
                ctx.textAlign = 'center';
            }
            
            ctx.fillText(point.label, x, y);
        });

    }, [metrics]);

    return (
        <div className="risk-chart-container">
            <canvas 
                ref={canvasRef} 
                width={400} 
                height={400}
                style={{ maxWidth: '100%', height: 'auto' }}
            />
        </div>
    );
};

export default RiskAnalysisChart;
