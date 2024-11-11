import { useState } from "react";

// Define a type for frame data
interface FrameData {
    id: string;
    canvasImg?: string;
    data: ImageData | null;
  }

// The function to save the flipbook animation
export default async function saveFlipBook(frames: FrameData[], title: string) {
    try {
      // Format the frames data to only include the essential fields
      const formattedFrames = frames.map(frame => ({
        id: frame.id,
        canvasImg: frame.canvasImg,
        data: frame.data ? frame.data.data : null, // Convert ImageData if needed
      }));
  
      // Run the mutation
      // const result = await client.mutate({
      //   mutation: SAVE_FLIPBOOK_MUTATION,
      //   variables: { frames: formattedFrames, title },
      // });
  
    //   return result.data.saveFlipbook;
    } catch (error) {
      console.error("Error saving flipbook:", error);
      throw error;
    }
  };

// import { gql } from '@apollo/client';
// import client from '../graphql/client'; // Import your GraphQL client

// Define the GraphQL mutation
// const SAVE_FLIPBOOK_MUTATION = gql`
//   mutation SaveFlipbook($frames: [FrameInput!]!, $title: String) {
//     saveFlipbook(frames: $frames, title: $title) {
//       id
//       title
//       frames {
//         id
//         canvasImg
//         data
//       }
//     }
//   }
// `;






// export default saveFlipBook;