# ImageCollage Component

A production-ready React component for generating responsive, scalable, and "justified" image collages.

## Features

- **Justified Layout**: Each row of images fills the container's full width while maintaining a consistent row height
- **Responsive Design**: Automatically adjusts to container width changes and scales perfectly for mobile devices
- **Lazy Loading**: Only loads images as they enter the viewport for better performance
- **Customizable**: Adjust row height, padding, and other parameters to fit your design
- **Performant**: Uses efficient algorithms to calculate layouts and minimize re-renders
- **TypeScript-friendly**: Well-documented props with PropTypes

## Installation

The component is already included in the project. Simply import it from:

```jsx
import ImageCollage from '../components/common/ImageCollage/ImageCollage';
```

## Basic Usage

```jsx
import ImageCollage from '../components/common/ImageCollage/ImageCollage';

const YourComponent = () => {
  // Array of image URLs (pointing to S3 bucket or other sources)
  const images = [
    'https://your-s3-bucket.amazonaws.com/image1.jpg',
    'https://your-s3-bucket.amazonaws.com/image2.jpg',
    'https://your-s3-bucket.amazonaws.com/image3.jpg',
    // ...more image URLs
  ];

  return (
    <ImageCollage
      images={images}
      targetRowHeight={200}
      onImageClick={(imageUrl, index) => console.log(`Clicked image ${index}: ${imageUrl}`)}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `string[]` | (Required) | Array of image URLs |
| `targetRowHeight` | `number` | `200` | Target height for rows in pixels |
| `containerPadding` | `number` | `0` | Padding around the container in pixels |
| `imagePadding` | `number` | `4` | Padding between images in pixels |
| `maxRows` | `number` | `Infinity` | Maximum number of rows to display |
| `enableLazyLoading` | `boolean` | `true` | Enable lazy loading of images |
| `onImageClick` | `function` | `undefined` | Callback when an image is clicked: `(imageUrl, index) => void` |

## Advanced Usage

### Custom Styling

The component includes basic styling in `ImageCollage.css`. You can further customize the appearance by targeting the following CSS classes:

- `.image-collage-container`: The main container
- `.collage-row`: Each row of images
- `.collage-image-wrapper`: Wrapper around each image
- `.collage-image`: The actual image element

### With Modal Viewer

```jsx
import { useState } from 'react';
import ImageCollage from '../components/common/ImageCollage/ImageCollage';

const GalleryWithModal = () => {
  const [images] = useState([
    // your image URLs here
  ]);
  
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageUrl, index) => {
    setSelectedImage({ url: imageUrl, index });
  };

  return (
    <div>
      <ImageCollage
        images={images}
        targetRowHeight={240}
        containerPadding={16}
        onImageClick={handleImageClick}
      />
      
      {selectedImage && (
        <div className="modal">
          <img src={selectedImage.url} alt={`Selected image ${selectedImage.index}`} />
          <button onClick={() => setSelectedImage(null)}>Close</button>
        </div>
      )}
    </div>
  );
};
```

### Optimizing for S3 Images

When working with S3 bucket images, ensure you:

1. Use the correct S3 bucket URL format
2. Consider adding image size parameters to the URL if your S3 setup supports it
3. Implement proper error handling for cases when images fail to load

Example with AWS S3:

```jsx
// Format your S3 URLs properly
const s3Images = userPhotos.map(photo => 
  `https://${s3BucketName}.s3.${region}.amazonaws.com/${photo.key}`
);

return <ImageCollage images={s3Images} />;
```

## Performance Tips

1. **Limit the number of images**: For best performance, limit the number of images to what's necessary for your UI
2. **Use appropriate image sizes**: Avoid loading excessively large images if they'll only be displayed small
3. **Keep lazy loading enabled**: This significantly improves initial load time and reduces bandwidth
4. **Consider progressive JPEGs**: These load more progressively and improve perceived performance

## Browser Support

The component works in all modern browsers including:
- Chrome, Firefox, Safari (latest 2 versions)
- Edge (latest version)
- iOS Safari, Android Chrome (latest versions)

IE11 is not supported due to the use of modern JavaScript features.

## Demo

Check out the `ImageCollageDemo.jsx` file for a complete working example with configuration options.
