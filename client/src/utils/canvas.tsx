import React, { useRef, useState, useEffect, ChangeEvent } from "react"
import { useMutation } from '@apollo/client';
import { HexColorPicker } from "react-colorful";
import { SAVE_FLIPBOOK } from "./mutations";

import { v4 as uuidv4 } from "uuid";
import uploadToCloudinary from "./uploadToCloudinary";
// import { colorSpace } from "@cloudinary/url-gen/actions/delivery";
// import saveFlipBook from "./canvasTools/canvasSave";

// eslint-disable-next-line
var canvasWidth = 500 | 0;
// eslint-disable-next-line
var canvasHeight = 500 | 0;

//should update the page depending on which pixel was clicked on.
const CanvasComponent: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pixelSize = 10;

    const [isPainting, setPainting] = useState(false);
    const [previousMousePosition, setPreviousMousePosition] = useState<{ x: number; y: number } | null>(null);
    const [isClear, setClear] = useState(false);

    const [activeFrameIndex, setActiveFrameIndex] = useState(0);
    const [frames, setFrames] = useState<{ id: string, canvasImg?: string | Blob }[]>([
        { id: uuidv4(), canvasImg: "" }
    ]);


    //handles all selected colors on the page
    const [colorCode, setColorCode] = useState('#000000')
    //handles all pixel sizes
    const [brushSize, setBrushSize] = useState(1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [animationSpeed, _setAnimationSpeed] = useState(200); // Animation speed in ms
    const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [saveFlipbook] = useMutation(SAVE_FLIPBOOK)


    const handleFlipbookSave = async () => {
        try {
            const updatedFrames = await Promise.all(
                frames.map(async (frame) => {
                    if (!frame.canvasImg || !(frame.canvasImg instanceof Blob)) return frame;

                    // Upload Blob to Cloudinary
                    const cloudinaryUrl = await uploadToCloudinary(frame.canvasImg);

                    return {
                        ...frame,
                        canvasImg: cloudinaryUrl, // Replace Blob with Cloudinary URL
                    };
                })
            );

            // Save frames to the database via GraphQL
            const formattedFrames = updatedFrames.map((frame) => ({
                frameId: frame.id,
                canvasImg: frame.canvasImg,
            }));

            const title = 'My Flipbook!';
            const flipBookData = await saveFlipbook({
                variables: { frames: formattedFrames, title },
            });

            console.log('Flipbook saved successfully:', flipBookData);
        } catch (err) {
            console.error('Failed to save flipbook:', err);
        }
    };



    const changeColor = (color: string) => {
        setColorCode(color)
        return colorCode
    };

    const changeColorCode = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value } = e.target;
        setColorCode(value)
    };

    const handleBrushSizeChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { value } = e.target;
        const valueInt = parseInt(value)
        setBrushSize(valueInt)
    };

    //add a new frame to the frames array
    const saveCurrentFrameData = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
      
        canvas.toBlob((blob) => {
          if (blob) {
            const updatedFrames = [...frames];
            updatedFrames[activeFrameIndex].canvasImg = blob; // Store Blob
            setFrames(updatedFrames);
          }
        }, 'image/png');
      };
      

    const handleNewFrame = () => {
        saveCurrentFrameData();
        const newFrame = { id: uuidv4(), data: null };
        setFrames([...frames, newFrame]);
        setActiveFrameIndex(frames.length); // Set the new frame as active
        clearCanvas();
    };

    const switchFrame = (index: number) => {
        saveCurrentFrameData();
        setActiveFrameIndex(index);
      
        const frame = frames[index];
        const canvas = canvasRef.current;
        if (!canvas || !frame || !frame.canvasImg) return;
      
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
      
        const img = new Image();
        if (frame.canvasImg instanceof Blob) {
          img.src = URL.createObjectURL(frame.canvasImg); // Use Blob URL
        } else {
          img.src = frame.canvasImg; // Use Cloudinary URL
        }
      
        img.onload = () => {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        };
      };
      

    // const loadFrameData = (imageData: ImageData | null) => {
    //     const canvas = canvasRef.current;
    //     if (!canvas || !imageData) return;
    //     const ctx = canvas.getContext('2d', { willReadFrequently: true });
    //     if (!ctx) return;

    //     ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    //     ctx.putImageData(imageData, 0, 0);
    // };

    //draws an initial grid onto the canvas.
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
        //grabs the mouse click coordinates
        const pixelX = Math.floor(x / pixelSize) * pixelSize
        const pixelY = Math.floor(y / pixelSize) * pixelSize;

        ctx.fillStyle = colorCode;
        const trueBrushSize = brushSize * pixelSize
        ctx.fillRect(pixelX, pixelY, trueBrushSize, trueBrushSize);
    }

    // Helper function to draw a line between two points
    const drawLine = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            drawPixel(ctx, x0, y0);

            if (x0 === x1 && y0 === y1) break;
            const e2 = err * 2;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    };

    const erasePixel = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
        //grab the mouse canvas coordinates
        const pixelX = Math.floor(x / pixelSize) * pixelSize;
        const pixelY = Math.floor(y / pixelSize) * pixelSize;

        //clear the selected pixel
        ctx.clearRect(pixelX, pixelY, pixelSize, pixelSize)

        //redraw the grid at the erased pixel
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize)

        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(pixelX, pixelY, pixelSize, pixelSize)
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Grabs the canvas's bounding retangle and the mouse click Coordinates
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        //if the eraser is activated then set pixels to clear
        if (isClear) {
            erasePixel(ctx, x, y)
        } else {
            drawPixel(ctx, x, y);
        }

        setPreviousMousePosition({ x, y });
        setPainting(true);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isPainting) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (isClear) {
            erasePixel(ctx, x, y)
        } else {
            drawLine(ctx, previousMousePosition!.x, previousMousePosition!.y, x, y)
        }

        setPreviousMousePosition({ x, y });
    };

    const handleMouseUpLeave = () => {
        setPainting(false);
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        //clear the grid completly
        ctx.clearRect(0, 0, canvasHeight, canvasWidth);
        //redraw the grid
        drawGrid(ctx)
    };

    const playAnimation = () => {
        if (isPlaying) {
          stopAnimation();
          return;
        }
      
        setIsPlaying(true);
        let frameIndex = 0;
      
        animationIntervalRef.current = setInterval(() => {
          if (frameIndex >= frames.length) frameIndex = 0;
      
          const frame = frames[frameIndex];
          const canvas = canvasRef.current;
          if (!canvas) return;
      
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
      
          if (frame.canvasImg instanceof Blob) {
            const img = new Image();
            img.src = URL.createObjectURL(frame.canvasImg); // Use Blob URL
            img.onload = () => {
              ctx.clearRect(0, 0, canvasWidth, canvasHeight);
              ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            };
          } else if (typeof frame.canvasImg === 'string') {
            const img = new Image();
            img.src = frame.canvasImg; // Use Cloudinary URL
            img.onload = () => {
              ctx.clearRect(0, 0, canvasWidth, canvasHeight);
              ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            };
          }
      
          frameIndex++;
        }, animationSpeed);
      };
      

      const stopAnimation = () => {
        setIsPlaying(false);
        if (animationIntervalRef.current) {
          clearInterval(animationIntervalRef.current);
          animationIntervalRef.current = null;
        }
      
        const frame = frames[activeFrameIndex];
        const canvas = canvasRef.current;
        if (!canvas || !frame || !frame.canvasImg) return;
      
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
      
        const img = new Image();
        if (frame.canvasImg instanceof Blob) {
          img.src = URL.createObjectURL(frame.canvasImg); // Use Blob URL
        } else {
          img.src = frame.canvasImg; // Use Cloudinary URL
        }
      
        img.onload = () => {
          ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        };
      };


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        drawGrid(ctx);
        saveCurrentFrameData();
    }, []);

    return (
        <div className="canvasComponentContainer">
            <div className="framesContainer">
                {frames.map((frame, index) => (
                    <button key={frame.id} onClick={() => switchFrame(index)} disabled={isPlaying}>
                        {frame.canvasImg instanceof Blob ? (
                            <img
                                src={URL.createObjectURL(frame.canvasImg)} // Create a temporary URL for the Blob
                                width="60"
                                height="60"
                                alt="Frame Thumbnail"
                            />
                        ) : (
                            <img src={frame.canvasImg} width="60" height="60" alt="Frame Thumbnail" />
                        )}
                    </button>
                ))}
                <button onClick={handleNewFrame}>New Frame</button>
            </div>

            <div className="canvasHolder">
                <canvas id='paintMain' ref={canvasRef} width={canvasWidth} height={canvasHeight} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUpLeave} onMouseLeave={handleMouseUpLeave} style={{ border: '1px solid red' }}></canvas>

            </div>
            <div className="componentsContainer">

                <div>
                    <label>Brush Size: <input type="text" name="brushSize" value={brushSize || ""} onChange={(e: any) => { handleBrushSizeChange(e) }} className="brushSize"></input></label>
                </div>

                <div className="hexColorPicker">
                    {/* this is the hex color picker box */}
                    <HexColorPicker color={colorCode} onChange={changeColor} />
                </div>

                <div className="colorCodeContainer">
                    <label className='hex'>Hex Code: <input type='text' name='colorCode' value={colorCode || ''} onChange={changeColorCode}></input></label>
                </div>

                <div className="clear-erase">
                    <button className='clear' onClick={clearCanvas}>Clear</button>
                    <button className='erase' onClick={() => setClear(true)}>Eraser</button>
                    <button onClick={playAnimation}>{isPlaying ? "Stop" : "Play"} Animation</button>
                </div>

                <div>
                    <button className="saveFlipbook" onClick={handleFlipbookSave}>Save Flipbook</button>
                </div>
            </div>


        </div>

    )
}

export default CanvasComponent