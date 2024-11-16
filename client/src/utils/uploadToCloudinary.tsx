const uploadToCloudinary = async (blob: Blob): Promise<string> => {
    // Retrieve the Cloudinary name from environment variables
    const cloudinaryName = import.meta.env.VITE_CLOUDINARY_NAME || 'default-cloud-name';
    const cloudinaryPreset = import.meta.env.VITE_CLOUDINARY_PRESET || 'default-cloud-preset';
  
    // Ensure the Blob is passed correctly
    if (!blob) {
      throw new Error('No Blob provided for upload');
    }
  
    // Create FormData to send the file to Cloudinary
    const formData = new FormData();
    formData.append('file', blob); // Add the Blob
    formData.append('upload_preset', cloudinaryPreset); // Replace with your Cloudinary unsigned upload preset
  
    // Send the request to Cloudinary's upload endpoint
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`, {
      method: 'POST',
      body: formData, // Attach the form data
    });
  
    // Parse the response JSON
    const data = await response.json();
  
    // Check for errors
    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${data.error?.message || 'Unknown error'}`);
    }
  
    // Return the secure URL of the uploaded image
    return data.secure_url;
  };
  
  export default uploadToCloudinary;
  