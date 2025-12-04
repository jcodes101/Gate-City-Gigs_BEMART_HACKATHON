//===============================================
// HANDLES ALL FILE UPLOAD/STORAGE ENDPOINTS
//===============================================

const express = require("express");
const multer = require('multer');
const router = express.Router();
const { RC_RESPONSE } = require('../utils/endpoint_helpers.js');
const { RC_CODES } = require('../utils/error.js');
const { query } = require('../wrappers/database.js');
const { uploadFile, getFileUrl, getFile, deleteFile } = require('../wrappers/s3.js');
const { randomUUID } = require('crypto');

// Configure multer for memory storage (files will be in memory as Buffer)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow all file types for now (you can add restrictions here)
        cb(null, true);
    }
});

//===============================================
// HTTP ENDPOINTS
//===============================================

// Upload a file
router.post("/upload", upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.json(RC_RESPONSE(RC_CODES.BAD_REQUEST, {
                details: "No file provided. Please include a file in the request."
            }));
        }

        const { folder, userId } = req.body;
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;
        const fileSize = req.file.size;
        const mimeType = req.file.mimetype;

        console.log(`[Files] Upload request - File: ${fileName}, Size: ${fileSize} bytes, Folder: ${folder || 'uploads'}`);

        // Upload to S3
        const uploadResult = await uploadFile(fileBuffer, fileName, folder || 'uploads', userId || null);

        // Generate unique file ID
        const fileId = randomUUID();

        // Store file metadata in database
        await query(
            `INSERT INTO \`file_uploads\` (file_id, s3_key, s3_url, file_name, file_size, content_type, folder, uploaded_by, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                fileId,
                uploadResult.s3Key,
                uploadResult.s3Url,
                uploadResult.fileName,
                uploadResult.fileSize,
                uploadResult.contentType,
                uploadResult.folder,
                userId || null
            ]
        );

        console.log(`[Files] File uploaded successfully - ID: ${fileId}, S3 Key: ${uploadResult.s3Key}`);

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            fileId: fileId,
            s3Key: uploadResult.s3Key,
            s3Url: uploadResult.s3Url,
            fileName: uploadResult.fileName,
            fileSize: uploadResult.fileSize,
            contentType: uploadResult.contentType,
            folder: uploadResult.folder
        }));
    } catch (error) {
        console.error("Error uploading file:", error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: "Error uploading file",
            error: error.message
        }));
    }
});

// Get file metadata by ID
router.get("/:fileId", async (req, res) => {
    try {
        const { fileId } = req.params;

        // Get file metadata from database
        const files = await query(
            'SELECT * FROM `file_uploads` WHERE file_id = ?',
            [fileId]
        );

        if (!files || files.length === 0) {
            return res.json(RC_RESPONSE(RC_CODES.NOT_FOUND, {
                details: "File not found"
            }));
        }

        const fileData = files[0];

        // Generate signed URL for accessing the file (expires in 1 hour)
        const signedUrl = await getFileUrl(fileData.s3_key, 3600);

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            fileId: fileData.file_id,
            fileName: fileData.file_name,
            fileSize: fileData.file_size,
            contentType: fileData.content_type,
            folder: fileData.folder,
            s3Key: fileData.s3_key,
            s3Url: fileData.s3_url,
            downloadUrl: signedUrl, // Signed URL for downloading
            uploadedBy: fileData.uploaded_by,
            createdAt: fileData.created_at
        }));
    } catch (error) {
        console.error("Error retrieving file:", error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: "Error retrieving file",
            error: error.message
        }));
    }
});

// Get file download URL (signed URL)
router.get("/:fileId/download", async (req, res) => {
    try {
        const { fileId } = req.params;
        const expiresIn = parseInt(req.query.expires || '3600'); // Default 1 hour

        // Get file metadata from database
        const files = await query(
            'SELECT s3_key FROM `file_uploads` WHERE file_id = ?',
            [fileId]
        );

        if (!files || files.length === 0) {
            return res.json(RC_RESPONSE(RC_CODES.NOT_FOUND, {
                details: "File not found"
            }));
        }

        const s3Key = files[0].s3_key;

        // Generate signed URL
        const signedUrl = await getFileUrl(s3Key, expiresIn);

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            downloadUrl: signedUrl,
            expiresIn: expiresIn
        }));
    } catch (error) {
        console.error("Error generating download URL:", error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: "Error generating download URL",
            error: error.message
        }));
    }
});

// List files (with optional filters)
router.get("/", async (req, res) => {
    try {
        const { userId, folder, limit = 50, offset = 0 } = req.query;

        let queryStr = 'SELECT * FROM `file_uploads` WHERE 1=1';
        const params = [];

        if (userId) {
            queryStr += ' AND uploaded_by = ?';
            params.push(userId);
        }

        if (folder) {
            queryStr += ' AND folder = ?';
            params.push(folder);
        }

        queryStr += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const files = await query(queryStr, params);

        // Generate signed URLs for each file
        const filesWithUrls = await Promise.all(
            files.map(async (file) => {
                try {
                    const signedUrl = await getFileUrl(file.s3_key, 3600);
                    return {
                        fileId: file.file_id,
                        fileName: file.file_name,
                        fileSize: file.file_size,
                        contentType: file.content_type,
                        folder: file.folder,
                        s3Key: file.s3_key,
                        s3Url: file.s3_url,
                        downloadUrl: signedUrl,
                        uploadedBy: file.uploaded_by,
                        createdAt: file.created_at
                    };
                } catch (error) {
                    console.error(`[Files] Error generating URL for ${file.file_id}:`, error);
                    return {
                        fileId: file.file_id,
                        fileName: file.file_name,
                        fileSize: file.file_size,
                        contentType: file.content_type,
                        folder: file.folder,
                        s3Key: file.s3_key,
                        s3Url: file.s3_url,
                        downloadUrl: null,
                        uploadedBy: file.uploaded_by,
                        createdAt: file.created_at,
                        error: 'Failed to generate download URL'
                    };
                }
            })
        );

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            files: filesWithUrls,
            count: filesWithUrls.length
        }));
    } catch (error) {
        console.error("Error listing files:", error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: "Error listing files",
            error: error.message
        }));
    }
});

// Delete a file
router.delete("/:fileId", async (req, res) => {
    try {
        const { fileId } = req.params;

        // Get file metadata from database
        const files = await query(
            'SELECT s3_key FROM `file_uploads` WHERE file_id = ?',
            [fileId]
        );

        if (!files || files.length === 0) {
            return res.json(RC_RESPONSE(RC_CODES.NOT_FOUND, {
                details: "File not found"
            }));
        }

        const s3Key = files[0].s3_key;

        // Delete from S3
        await deleteFile(s3Key);

        // Delete from database
        await query(
            'DELETE FROM `file_uploads` WHERE file_id = ?',
            [fileId]
        );

        console.log(`[Files] File deleted - ID: ${fileId}, S3 Key: ${s3Key}`);

        return res.json(RC_RESPONSE(RC_CODES.SUCCESS, {
            message: "File deleted successfully",
            fileId: fileId
        }));
    } catch (error) {
        console.error("Error deleting file:", error);
        return res.json(RC_RESPONSE(RC_CODES.SERVER_ERROR, {
            details: "Error deleting file",
            error: error.message
        }));
    }
});

module.exports = router;

