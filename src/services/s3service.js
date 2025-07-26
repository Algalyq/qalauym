import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';

// Configure AWS with environment variables
if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID || !process.env.REACT_APP_AWS_SECRET_ACCESS_KEY) {
  console.error('AWS credentials are not properly configured in environment variables');
}

const s3Client = new S3Client({
  region: process.env.REACT_APP_AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.REACT_APP_S3_BUCKET_NAME || 'qalauym';

/**
 * Uploads an image to S3
 * @param {Object} file - The file object (from input type="file")
 * @param {string} type - Type of upload ('avatar' or 'wish')
 * @returns {Promise<Object>} - The S3 upload response
 */
const uploadImage = async (fileObj, type = 'wish') => {
  try {
    // Extract the file from the object
    const file = fileObj.file || fileObj;
    
    // Determine the upload path based on type
    const folder = type === 'avatar' ? 'ava/' : 'wish_img/';
    const fileName = `${
      Date.now()
    }-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`; // Sanitize filename
    const key = `${folder}${fileName}`;

    // Prepare the upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: file.type
    };

    // Use the Upload utility for better browser compatibility
    const upload = new Upload({
      client: s3Client,
      params: params
    });

    // Upload the file to S3
    await upload.done();

    // Construct the URL - note that this URL will only be accessible if the object or bucket has appropriate permissions
    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

    return {
      url,
      key,
      fileName,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Deletes an image from S3
 * @param {string} key - The S3 object key
 * @returns {Promise<Object>} - The S3 delete response
 */
const deleteImage = async (key) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(params);
    const response = await s3Client.send(command);
    return response;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export { uploadImage, deleteImage };
