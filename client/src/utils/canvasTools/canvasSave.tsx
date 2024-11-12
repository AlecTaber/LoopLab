import { useMutation } from '@apollo/client';
import {SAVE_FLIPBOOK} from '../mutations.ts'

// Define a type for frame data
interface FrameData {
    id: string;
    canvasImg?: string;
    data: ImageData | null;
  }

// The function to save the flipbook animation
export default async function saveFlipBook(frames: FrameData[], title: string) {
  const [saveFlipbook] = useMutation(SAVE_FLIPBOOK)
    try {
      // Format the frames data to only include the essential fields
      const formattedFrames = frames.map(frame => ({
        id: frame.id,
        canvasImg: frame.canvasImg,
        data: frame.data ? frame.data.data : null, // Convert ImageData if needed
      }));
  
    // save the flipbook
      await saveFlipbook({
        variables: {frames: {...formattedFrames}, title}
      })
  
    } catch (err: any) {
      console.error("Error saving flipbook:", err);
      throw err;
    }
  };

