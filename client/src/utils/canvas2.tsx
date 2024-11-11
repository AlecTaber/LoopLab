import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import { HexColorPicker } from "react-colorful";
import { v4 as uuidv4 } from "uuid";

// eslint-disable-next-line
var canvasWidth = 600 | 0; 
// eslint-disable-next-line
var canvasHeight = 600 | 0;

const CanvasComponent: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pixelSize = 10;

    const [isPainting, setPainting] = useState(false);
    const [isClear, setClear] = useState(false);
    const [colorCode, setColorCode] = useState('#000000');
    const [activeFrameIndex, setActiveFrameIndex] = useState(0);
    const [frames, setFrames] = useState<{ id: string, data: ImageData | null, canvasImg?: string }[]>([
        { id: uuidv4(), data: null, canvasImg: "" }
    ]);
    const [onionSkin, setOnionSkin] = useState(false); // New state for onion skin effect toggle

    const storeCanvasData = (x: number, y: number, pixelSize1: number, pixelSize2: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const currentPixel = ctx.getImageData(x, y, pixelSize1, pixelSize2);
        console.log('Current Pixel:', currentPixel);
    };

    const changeColor = (color: string) => {
        setColorCode(color);
        return colorCode;
    };

    const changeColorCode = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value } = e.target;
        setColorCode(value);
    };

    const saveCurrentFrameData = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dataUrl = canvas.toDataURL('image/png');
        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        const updatedFrames = [...frames];
        updatedFrames[activeFrameIndex].data = imageData;
        updatedFrames[activeFrameIndex].canvasImg = dataUrl;
        setFrames(updatedFrames);
    };

    const handleNewFrame = () => {
        saveCurrentFrameData();
        const newFrame = { id: uuidv4(), data: null };
        setFrames([...frames, newFrame]);
        setActiveFrameIndex(frames.length);
        clearCanvas();
    };

    const switchFrame = (index: number) => {
        saveCurrentFrameData();
        setActiveFrameIndex(index);
        loadFrameData(frames[index].data);
        
        // Draw onion skin if toggled on
        if (onionSkin && index > 0) {
            drawOnionSkin(frames[index - 1].data);
        }
    };

    const loadFrameData = (imageData: ImageData | null) => {
        const canvas = canvasRef.current;
        if (!canvas || !imageData) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.putImageData(imageData, 0, 0);
    };

    // New function to draw onion skin effect from the previous frame
    const drawOnionSkin = (imageData: ImageData | null) => {
        const canvas = canvasRef.current;
        if (!canvas || !imageData) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.globalAlpha = 0.3; // Set opacity to 30%
        ctx.putImageData(imageData, 0, 0);
        ctx.globalAlpha = 1.0; // Reset opacity
    };

    const drawGrid = (ctx: CanvasRenderingContext2D) => {
        for (let x = 0; x < canvasWidth; x += pixelSize) {
            for (let y = 0; y < canvasHeight; y += pixelSize) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(x, y, pixelSize, pixelSize);
                ctx.strokeStyle = '#cccccc';
                ctx.strokeRect(x, y, pixelSize, pixelSize);
            }
        }
    };

    const drawPixel = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        const pixelX = Math.floor(x / pixelSize) * pixelSize;
        const pixelY = Math.floor(y / pixelSize) * pixelSize;

        console.log("Coordinates:", pixelX, pixelY);

        ctx.fillStyle = colorCode;
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        storeCanvasData(pixelX, pixelY, canvasWidth, canvasHeight);
    };

    const erasePixel = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        const pixelX = Math.floor(x / pixelSize) * pixelSize;
        const pixelY = Math.floor(y / pixelSize) * pixelSize;

        ctx.clearRect(pixelX, pixelY, pixelSize, pixelSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(pixelX, pixelY, pixelSize, pixelSize);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (isClear) {
            erasePixel(ctx, x, y);
            setPainting(true);
        } else {
            drawPixel(ctx, x, y);
            setPainting(true);
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isPainting) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (isClear) {
            erasePixel(ctx, x, y);
        } else {
            drawPixel(ctx, x, y);
        }
    };

    const handleMouseUpLeave = () => {
        setPainting(false);
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasHeight, canvasWidth);
        drawGrid(ctx);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawGrid(ctx);
    }, []);

    return (
        <div className="canvasComponentContainer">
            <div className="framesContainer">
                {frames.map((frame, index) => (
                    <button key={frame.id} onClick={() => switchFrame(index)}>
                        <img src={frame.canvasImg} width="60" height="60" />
                    </button>
                ))}
                <button onClick={handleNewFrame}>New Frame</button>
            </div>

            <div className="canvasHolder">
                <canvas
                    id="paintMain"
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpLeave}
                    onMouseLeave={handleMouseUpLeave}
                    style={{ border: '1px solid red' }}
                ></canvas>
            </div>

            <div className="componentsContainer">
                <div className="dimensionsContainer">
                    <label className="width">Width:</label>
                    <div className="dimensionsContainer">
                        <label className="height">Height:</label>
                    </div>
                </div>

                <div className="hexColorPicker">
                    <HexColorPicker color={colorCode} onChange={changeColor} />
                </div>

                <div className="colorCodeContainer">
                    <label className="hex">
                        Hex Code: <input type="text" name="colorCode" value={colorCode || ''} onChange={changeColorCode} />
                    </label>
                </div>

                <div className="clear-erase">
                    <button className="clear" onClick={clearCanvas}>Clear</button>
                    <button className="erase" onClick={() => setClear(true)}>Eraser</button>
                    <button onClick={() => setOnionSkin(!onionSkin)}>Toggle Onion Skin</button>
                </div>
            </div>
        </div>
    );
};

export default CanvasComponent;
