//=================================================
// AWS S3 Client Wrapper
//=================================================
// Simple interface to upload and retrieve files from S3
//=================================================

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { fromNodeProviderChain } = require('@aws-sdk/credential-providers');
const { randomUUID } = require('crypto');

//=================================================
// Configuration from environment variables
//=================================================
const S3_CONFIG = {
    region: process.env.AWS_REGION || process.env.S3_REGION || 'us-east-2',
    bucket: process.env.S3_BUCKET_NAME || 'be-smart-s3',
    accessPointArn: process.env.S3_ACCESS_POINT_ARN || 'arn:aws:s3:us-east-2:265174140609:accesspoint/be-smart-access'
};

// Use access point ARN if provided, otherwise use bucket name
const S3_BUCKET_OR_ACCESS_POINT = S3_CONFIG.accessPointArn || S3_CONFIG.bucket;

//=================================================
// S3 Client (lazy initialization)
//=================================================
let s3Client = null;

//=================================================
// Initialize S3 Client
//=================================================
function getS3Client() {
    if (!s3Client) {
        s3Client = new S3Client({
            region: S3_CONFIG.region,
            credentials: fromNodeProviderChain() // Uses default credential chain: env vars, ~/.aws/credentials, instance profile, etc.
        });
    }
    return s3Client;
}

//=================================================
// Helper function to determine content type
//=================================================
function getContentType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const contentTypes = {
        'pdf': 'application/pdf',
        'txt': 'text/plain',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'json': 'application/json',
        'csv': 'text/csv',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'zip': 'application/zip',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls': 'application/vnd.ms-excel'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

//=================================================
// Upload File to S3
//=================================================
/**
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File content as Buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Optional folder/prefix in S3 (e.g., 'documents', 'images')
 * @param {string} userId - Optional user ID to associate with the file
 * @returns {Promise<Object>} Object with s3Key, s3Url, and file metadata
 */
async function uploadFile(fileBuffer, fileName, folder = 'uploads', userId = null) {
    try {
        const client = getS3Client();
        
        // Generate unique file key
        const fileExtension = fileName.split('.').pop();
        const uniqueId = randomUUID();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const s3Key = folder ? `${folder}/${uniqueId}-${sanitizedFileName}` : `${uniqueId}-${sanitizedFileName}`;
        
        // Determine content type
        const contentType = getContentType(fileName);
        
        // Upload to S3 (using access point ARN if available)
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_OR_ACCESS_POINT,
            Key: s3Key,
            Body: fileBuffer,
            ContentType: contentType,
            Metadata: {
                originalFileName: fileName,
                uploadedBy: userId || 'anonymous',
                uploadedAt: new Date().toISOString()
            }
        });
        
        await client.send(command);
        
        // Construct S3 URL (access points use different URL format)
        let s3Url;
        if (S3_CONFIG.accessPointArn) {
            // Extract access point name from ARN: arn:aws:s3:region:account:accesspoint/name
            const accessPointName = S3_CONFIG.accessPointArn.split(':').pop().split('/').pop();
            const accountId = S3_CONFIG.accessPointArn.split(':')[4];
            s3Url = `https://${accessPointName}-${accountId}.s3-accesspoint.${S3_CONFIG.region}.amazonaws.com/${s3Key}`;
        } else {
            s3Url = `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${s3Key}`;
        }
        
        return {
            s3Key: s3Key,
            s3Url: s3Url,
            fileName: fileName,
            contentType: contentType,
            fileSize: fileBuffer.length,
            folder: folder
        };
    } catch (error) {
        console.error('[S3] Error uploading file:', error);
        throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
}

//=================================================
// Get File from S3 (returns signed URL)
//=================================================
/**
 * Get a signed URL to download/access a file from S3
 * @param {string} s3Key - The S3 key (path) of the file
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} Signed URL for accessing the file
 */
async function getFileUrl(s3Key, expiresIn = 3600) {
    try {
        const client = getS3Client();
        
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_OR_ACCESS_POINT,
            Key: s3Key
        });
        
        const signedUrl = await getSignedUrl(client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        console.error('[S3] Error generating file URL:', error);
        throw new Error(`Failed to generate file URL: ${error.message}`);
    }
}

//=================================================
// Get File Object from S3
//=================================================
/**
 * Get file object directly from S3 (for server-side processing)
 * @param {string} s3Key - The S3 key (path) of the file
 * @returns {Promise<Object>} Object with Body (Buffer) and metadata
 */
async function getFile(s3Key) {
    try {
        const client = getS3Client();
        
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_OR_ACCESS_POINT,
            Key: s3Key
        });
        
        const response = await client.send(command);
        
        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of response.Body) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        
        return {
            body: buffer,
            contentType: response.ContentType,
            contentLength: response.ContentLength,
            metadata: response.Metadata,
            lastModified: response.LastModified
        };
    } catch (error) {
        console.error('[S3] Error retrieving file:', error);
        throw new Error(`Failed to retrieve file from S3: ${error.message}`);
    }
}

//=================================================
// Delete File from S3
//=================================================
/**
 * Delete a file from S3
 * @param {string} s3Key - The S3 key (path) of the file
 * @returns {Promise<void>}
 */
async function deleteFile(s3Key) {
    try {
        const client = getS3Client();
        
        const command = new DeleteObjectCommand({
            Bucket: S3_BUCKET_OR_ACCESS_POINT,
            Key: s3Key
        });
        
        await client.send(command);
        console.log(`[S3] File deleted: ${s3Key}`);
    } catch (error) {
        console.error('[S3] Error deleting file:', error);
        throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
}

//=================================================
// Module Exports
//=================================================
module.exports = {
    uploadFile,
    getFileUrl,
    getFile,
    deleteFile,
    getContentType,
    S3_CONFIG
};

