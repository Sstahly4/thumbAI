"use client";

import { useEffect, useRef, useState } from 'react';

interface DrawingCanvasProps {
  onSketchCreated: (dataUrl: string) => void;
}

export default function DrawingCanvas({ onSketchCreated }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Scale the canvas for high resolution
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Set the canvas dimensions with higher resolution for better quality
    canvas.width = width * 2;
    canvas.height = height * 2;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Scale all drawing by 2 to match the resolution
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    
    // Fill with white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    
    contextRef.current = context;
  }, []);
  
  // Update brush when settings change
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get mouse position relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };
  
  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    if (!canvas || !context) return;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width / 2, canvas.height / 2);
  };
  
  const saveSketch = () => {
    if (!canvasRef.current) return;
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSketchCreated(dataUrl);
  };
  
  return (
    <div className="flex flex-col">
      <div className="w-full mb-4 overflow-hidden rounded-lg" style={{ aspectRatio: '16/9' }}>
        <canvas 
          ref={canvasRef}
          className="border border-gray-600 rounded-lg w-full h-full"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <label htmlFor="brush-size" className="block mb-1 text-sm">Brush Size</label>
          <input
            id="brush-size"
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-32"
          />
        </div>
        
        <div>
          <label htmlFor="brush-color" className="block mb-1 text-sm">Color</label>
          <input
            id="brush-color"
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-10 h-10 p-1 border border-gray-600 rounded"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
            type="button"
          >
            Clear
          </button>
          <button
            onClick={saveSketch}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            type="button"
          >
            Use This Sketch
          </button>
        </div>
      </div>
    </div>
  );
} 