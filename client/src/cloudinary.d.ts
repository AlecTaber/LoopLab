declare module '@cloudinary/react' {
    import { CloudinaryImage } from '@cloudinary/url-gen/assets/CloudinaryImage';
    import React from 'react';

    export interface AdvancedImageProps {
        cldImg: CloudinaryImage;
        [key: string]: any;
    }

    export class AdvancedImage extends React.Component<AdvancedImageProps> {}
}
