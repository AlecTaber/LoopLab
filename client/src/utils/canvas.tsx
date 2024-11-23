import React, { useRef, useState, useEffect, ChangeEvent } from "react"
import { FaRegPlusSquare, FaRegMinusSquare } from "react-icons/fa";
import { useMutation } from '@apollo/client';
import { HexColorPicker } from "react-colorful";
import { SAVE_LOOP } from "./mutations";
import Auth from "./auth.js";
import "../pages/canvasPage.css";
import socket from "./socket";

import { v4 as uuidv4 } from "uuid";
import uploadToCloudinary from "./uploadToCloudinary";

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
    const [frames, setFrames] = useState<{ id: string, canvasImg: string | Blob | null }[]>([
        { id: uuidv4(), canvasImg: null }
    ]);


    //handles all selected colors on the page
    const [colorCode, setColorCode] = useState('#000000')
    //handles all pixel sizes
    const [brushSize, setBrushSize] = useState(1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [animationSpeed, _setAnimationSpeed] = useState(200); // Animation speed in ms
    const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [saveLoop] = useMutation(SAVE_LOOP)


    const handleLoopSave = async () => {
        try {
            await saveCurrentFrameData();
            const updatedFrames = await Promise.all(
                frames.map(async (frame) => {
                    if (!frame.canvasImg || !(frame.canvasImg instanceof Blob)) {
                        console.log('Skipping upload for frame:', frame);
                        return {
                            frameId: frame.id,
                            canvasImg: frame.canvasImg, // Save Cloudinary URL
                        }
                    };

                    // Upload Blob to Cloudinary
                    const cloudinaryUrl = await uploadToCloudinary(frame.canvasImg);
                    console.log('Cloudinary URL for frame:', frame.id, cloudinaryUrl);

                    return {
                        frameId: frame.id,
                        canvasImg: cloudinaryUrl, // Replace Blob with Cloudinary URL
                    };
                })
            );
            console.log('Formatted frames with cloudinary URLs:', updatedFrames);
            const validFrames = updatedFrames.filter((frame) => frame.canvasImg !== null);
            console.log('Filtered valid frames:', validFrames);

            if (validFrames.length === 0) {
                throw new Error('No frames to save');
            }

            // Save frame URLs to the database via GraphQL
            const formattedFrames = updatedFrames.map((frame) => ({
                frameId: frame.frameId,
                canvasImg: frame.canvasImg,
            }));

            const title = `My Loop - ${new Date().toLocaleString()}`;
            console.log('Payload for save loop mutation:', { title, frames: validFrames });
            const { data } = await saveLoop({
                variables: { input: { title, frames: formattedFrames } },
            });

            console.log('Loop saved successfully:', data.saveLoop);

            // Emit the new loop event via Socket.io
            socket.emit("newLoop", data.saveLoop);

        } catch (err) {
            console.error('Failed to save loop:', err);
            alert('Failed to save loop. Please try again.');
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
    const saveCurrentFrameData = async(): Promise<void> => {
        const canvas = canvasRef.current;
        if (!canvas){
            console.log("No Canvas Error!")
            return;
        };

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    setFrames((prevFrames) => {
                        const updatedFrames = [...prevFrames];
                        updatedFrames[activeFrameIndex].canvasImg = blob;
                        return updatedFrames;
                    });
                }
                resolve();
            }, 'image/png');
        });
    };


    const handleNewFrame = async () => {
        // Save the current frame first
        saveCurrentFrameData();

        if(frames.length < 22){
            // Clear the canvas to make the new frame blank
            clearCanvas(); // Ensures the canvas is blank for the new frame

            const newFrameId = uuidv4();
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.toBlob(async (blob) => {
                    let canvasImg: string | null = null;
                    if (blob) {
                        try {
                            // Upload blank canvas to Cloudinary
                            canvasImg = await uploadToCloudinary(blob);
                            console.log(`Uploaded blank canvas for frame ${newFrameId}:`, canvasImg);
                        } catch (error) {
                            console.error('Failed to upload blank canvas:', error);
                        }
                    }
                    // Add new blank frame to frames state
                    setFrames((prevFrames) => [
                        ...prevFrames,
                        { id: newFrameId, canvasImg },
                    ]);
                    // Set the new frame as active
                    setActiveFrameIndex(frames.length); // Correctly set index
                }, 'image/png');

                console.log(frames);
            }
        } else {
            alert("Cannot have more than 22 frames!")
        }
    };

    // const handleRemoveFrame = async () => {
    //     console.log("ActiveFrameIndex Before: ", activeFrameIndex)

    //     if(frames.length > 1){
    //         // Save the current frame data before removing
    //         await saveCurrentFrameData();

    //         // Remove the frame at the current activeFrameIndex
    //         setFrames((prevFrames) => {
    //             const updatedFrames = prevFrames.filter((_, index) => index !== activeFrameIndex - 1 );

    //             // Ensure the activeFrameIndex is valid after the frame is removed
    //             const newIndex = Math.max((activeFrameIndex - 1), 0); // Adjust to the previous frame or 0
    //             setActiveFrameIndex(newIndex);

    //             // Switch to the new active frame
    //             switchFrame(newIndex);

    //             return updatedFrames;
    //         });
    //     } else {
    //         alert("Cannot have less than 1 frames!")
    //     }
    // };


    const switchFrame = async (index: number) => {
        await saveCurrentFrameData();
        if (index === activeFrameIndex) return;
        setActiveFrameIndex(index);

        const frame = frames[index];
        const canvas = canvasRef.current;
        if (!canvas || !frame || !frame.canvasImg) {
            clearCanvas();
            return;
        }

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


        //draw the grid
        drawGrid(ctx);
        saveCurrentFrameData();
    }, []);

    //set the eraser to off if the color code changes
    useEffect(() => {
        if(isClear){
            setClear(false)
        }
    }, [colorCode])

    return (
        <div>
            {Auth.loggedIn() ? (
                <div className="canvasComponentContainer">
                    <div className="framesContainer fixed top-20 p-4 py-2">
                        {frames.map((frame, index) => (
                            <button key={`${frame.id}-${index}`} className="frames" onClick={async () => await switchFrame(index)} disabled={isPlaying}>
                                {frame.canvasImg && (
                                    <img
                                        src={frame.canvasImg instanceof Blob ? URL.createObjectURL(frame.canvasImg) : frame.canvasImg}
                                        width="60"
                                        height="60"
                                        alt={`Frame ${index + 1} Thumbnail`}
                                    />
                                )}
                            </button>
                        ))}
                        <button onClick={handleNewFrame}><div className="newframe text-6xl text-red-500"><FaRegPlusSquare /></div></button>
                        {/* <button onClick={handleRemoveFrame}><div className="newframe text-6xl text-red-500"><FaRegMinusSquare /></div></button> */}
                    </div>

                    {/* Add a wrapper div to make the canvas responsive */}
                    <div className="responsive-canvas">
                        <canvas
                            id="paintMain"
                            ref={canvasRef}
                            width={canvasWidth}
                            height={canvasHeight}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUpLeave}
                            onMouseLeave={handleMouseUpLeave}
                            style={{ border: "1px solid blue" }}
                        ></canvas>
                    </div>

                    <div className="componentsContainer fixed left-3 top-20 p-4 px-4 py-2 bg-blue-400 text-white rounded shadow">
                        <div className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
                            <label>
                                Brush Size:{" "}
                                <input
                                    type="text"
                                    name="brushSize"
                                    value={brushSize || ""}
                                    onChange={(e: any) => {
                                        handleBrushSizeChange(e);
                                    }}
                                    className="brushSize"
                                ></input>
                            </label>
                        </div>

                        <div className="hexColorPicker p-3">
                            <HexColorPicker color={colorCode} onChange={changeColor} />
                        </div>

                        <div className="colorCodeContainer py-2">
                            <label className="hex px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
                                Hex Code:{" "}
                                <input type="text" name="colorCode" value={colorCode || ""} onChange={changeColorCode}></input>
                            </label>
                        </div>

                        <div className="clear-erase flex flex-col items-start">
                            <button className="clear px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600" onClick={clearCanvas}>
                                Clear
                            </button>
                            <button className="erase px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600" 
                                onClick={() => {
                                    if(!isClear){
                                        setClear(true);
                                    } else {
                                        setClear(false);
                                    }
                                }}>
                                Eraser
                            </button>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600" onClick={playAnimation}>{isPlaying ? "Stop" : "Play"} Animation</button>
                        </div>

                        <div>
                            <button className="saveLoop px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600" onClick={handleLoopSave}>
                            Save Loop
                                </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h3>User Not Signed in!</h3>
                </div>
            )}
        </div>


    );

}

export default CanvasComponent