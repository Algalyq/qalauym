import { useState } from 'react';
import ImageCollage from './ImageCollage';

/**
 * Demo component to showcase the ImageCollage component
 * Demonstrates different configuration options
 */
const ImageCollageDemo = () => {
  // Sample images - replace with your actual S3 URLs in production
  const [images] = useState([
    'https://source.unsplash.com/random/800x600?nature',
    'https://source.unsplash.com/random/600x800?portrait',
    'https://source.unsplash.com/random/900x600?architecture',
    'https://source.unsplash.com/random/800x800?people',
    'https://source.unsplash.com/random/600x500?technology',
    'https://source.unsplash.com/random/1200x800?travel',
    'https://source.unsplash.com/random/800x1200?art',
    'https://source.unsplash.com/random/700x700?food',
    'https://source.unsplash.com/random/900x700?animals',
    'https://source.unsplash.com/random/650x800?fashion',
    'https://source.unsplash.com/random/800x500?sports',
    'https://source.unsplash.com/random/700x900?business'
  ]);
  
  const [selectedImage, setSelectedImage] = useState(null);

  // Demo configuration options
  const [config, setConfig] = useState({
    targetRowHeight: 200,
    containerPadding: 16,
    imagePadding: 4,
    maxRows: Infinity,
    enableLazyLoading: true
  });

  // Handle image click
  const handleImageClick = (imageUrl, index) => {
    console.log(`Image clicked: ${imageUrl} at index ${index}`);
    setSelectedImage({
      url: imageUrl,
      index
    });
  };
  
  // Handle config change
  const handleConfigChange = (e) => {
    const { name, value, type } = e.target;
    setConfig({
      ...config,
      [name]: type === 'number' ? Number(value) : 
              type === 'checkbox' ? e.target.checked : 
              value
    });
  };

  return (
    <div className="image-collage-demo">
      <h2 className="text-2xl font-medium mb-4">Image Collage Demo</h2>
      
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-3">Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Row Height
            </label>
            <input
              type="number"
              name="targetRowHeight"
              value={config.targetRowHeight}
              onChange={handleConfigChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Container Padding
            </label>
            <input
              type="number"
              name="containerPadding"
              value={config.containerPadding}
              onChange={handleConfigChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Padding
            </label>
            <input
              type="number"
              name="imagePadding"
              value={config.imagePadding}
              onChange={handleConfigChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Rows
            </label>
            <input
              type="number"
              name="maxRows"
              value={config.maxRows === Infinity ? '' : config.maxRows}
              placeholder="Infinity"
              onChange={(e) => {
                const value = e.target.value === '' ? Infinity : Number(e.target.value);
                setConfig({
                  ...config,
                  maxRows: value
                });
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="enableLazyLoading"
              checked={config.enableLazyLoading}
              onChange={handleConfigChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Enable Lazy Loading
            </label>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <ImageCollage
          images={images}
          targetRowHeight={config.targetRowHeight}
          containerPadding={config.containerPadding}
          imagePadding={config.imagePadding}
          maxRows={config.maxRows}
          enableLazyLoading={config.enableLazyLoading}
          onImageClick={handleImageClick}
        />
      </div>
      
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={`Selected image ${selectedImage.index + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-black hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-3">How to Use</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto max-h-80">
{`// Import the component
import ImageCollage from '../components/common/ImageCollage/ImageCollage';

// Define your image array
const images = [
  'https://your-s3-bucket.amazonaws.com/image1.jpg',
  'https://your-s3-bucket.amazonaws.com/image2.jpg',
  // ...more image URLs
];

// Use the component in your JSX
<ImageCollage
  images={images}
  targetRowHeight={200}
  containerPadding={16}
  imagePadding={4}
  onImageClick={(url, index) => console.log(\`Clicked image \${index}: \${url}\`)}
/>
`}
        </pre>
      </div>
    </div>
  );
};

export default ImageCollageDemo;
