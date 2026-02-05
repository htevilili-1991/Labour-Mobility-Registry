import React from 'react';

interface SimpleChartProps {
    data: Array<{ period: string; value: number; label?: string }>;
    title: string;
    color?: string;
    height?: number;
}

export function SimpleChart({ data, title, color = '#3b82f6', height = 200 }: SimpleChartProps) {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="relative" style={{ height: `${height}px` }}>
                <div className="absolute inset-0 flex items-end justify-between">
                    {data.map((item, index) => {
                        const heightPercent = (item.value / maxValue) * 100;
                        return (
                            <div
                                key={index}
                                className="relative flex-1 mx-0.5 flex flex-col items-center justify-end"
                                style={{ height: '100%' }}
                            >
                                <div
                                    className="w-full bg-blue-500 rounded-t"
                                    style={{
                                        height: `${heightPercent}%`,
                                        backgroundColor: color,
                                    }}
                                />
                                <span className="text-xs text-gray-500 mt-1">
                                    {item.label || item.period}
                                </span>
                                <span className="text-xs font-semibold">
                                    {item.value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
