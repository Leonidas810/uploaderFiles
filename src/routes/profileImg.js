const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs-extra');
const sharp = require('sharp');

const router = express.Router();

//<--Middleware-->
const findById = require('../middleware/findById')

//<--Models-->
const File = require('../models/File');
const User = require('../models/User');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads/users');

const upload = multer({
    storage: multer.memoryStorage(), // handle in memory then write after validation
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max, tune as needed
});

//Post user's profile img
router.post('/profile', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file' });

        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(req.file.mimetype)) {
            return res.status(415).json({ error: 'Unsupported file type' });
        }

        const requestedUser = req.requestedUser;
        const userId = requestedUser.id;

        // Hash the file buffer to create a checksum and unique name
        const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
        const ext = {
            'image/png': 'png',
            'image/webp': 'webp',
            'image/jpeg': 'jpg'
        }[req.file.mimetype] || 'jpg';

        const userDir = path.join(UPLOAD_ROOT, String(userId), 'profile');
        await fs.ensureDir(userDir);

        const filename = `${hash}.${ext}`;
        const filepath = path.join(userDir, filename);

        // Save original (or processed)
        await sharp(req.file.buffer)
            .resize({ width: 1024, withoutEnlargement: true })
            .toFile(filepath);

        // create thumbnail
        const thumbName = `thumbnail_${hash}.jpg`;
        const thumbPath = path.join(userDir, thumbName);

        await sharp(req.file.buffer)
            .resize(256)
            .jpeg({ quality: 80 })
            .toFile(thumbPath);

        let file;
        if (requestedUser?.profileUrl) {
            //recover metada in case that exist
            file = await File.findById(requestedUser?.profileUrl);
            file.key = `users/${userId}/profile/${filename}`;
            file.key_thumb = `users/${userId}/profile/${thumbName}`;
            file.originalName = req.file.originalname;
            file.mimeType = req.file.mimetype;
            file.size = req.file.size;
            file.versions = [...file.versions,
            {
                key: `users/${userId}/profile/${filename}`,
                key_thumb: `users/${userId}/profile/${thumbName}`,
                versionNumber: file.versions.length + 1,
                size: (await fs.stat(thumbPath)).size,
                mimeType: 'image/jpeg',
                checksum: hash,
                createdAt: new Date()
            }];
            file.createdBy = requestedUser._id;
            file.checksum = hash;
            await file.save();
        } else {
            // store metadata in case that not exist
            file = await File.create({
                key: `users/${userId}/profile/${filename}`,
                key_thumb: `users/${userId}/profile/${thumbName}`,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                type: 'profile_photo',
                versions: [
                    {
                        key: `users/${userId}/profile/${filename}`,
                        key_thumb: `users/${userId}/profile/${thumbName}`,
                        versionNumber: 1,
                        size: (await fs.stat(thumbPath)).size,
                        mimeType: 'image/jpeg',
                        checksum: hash,
                        createdAt: new Date()
                    }
                ],
                createdBy: requestedUser._id,
                checksum: hash
            });
            // Update user's profile image URL
            await User.findByIdAndUpdate(requestedUser._id, {
                profileUrl: file._id
            });
        }
        res.json({
            success: true,
            message: 'Imagen de perfil actualizada con exito!',
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ success: false, error: 'Error uploading file' });
    }
});

// Get user's profile image min
router.get('/profile/thumb', async (req, res) => {
    try {
        let requestedUser = req.requestedUser;

        if (!requestedUser.profileUrl) {
            return res.status(404).json({ success: false, error: 'No profile image found' });
        }

        requestedUser = await requestedUser.populate({
            path: 'profileUrl'
        })

        const { id, profileUrl } = requestedUser;

        // Build the path to the file on disk
        let filepath = path.join(UPLOAD_ROOT, `/${id}/profile`, path.basename(profileUrl.key_thumb));

        // Make sure the file exists before streaming
        if (!await fs.pathExists(filepath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.setHeader('Content-Type', profileUrl.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${profileUrl.originalName}"`);

        const stream = fs.createReadStream(filepath);
        stream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).end();
        });
        stream.pipe(res);

    } catch (error) {
        console.error('Profile image fetch error:', error);
        res.status(500).json({ error: 'Error retrieving profile image' });
    }
});

// Get user's profile image full
router.get('/profile/full', async (req, res) => {
    try {
        let requestedUser = req.requestedUser;

        if (!requestedUser.profileUrl) {
            return res.status(404).json({ success: false, error: 'No profile image found' });
        }

        requestedUser = await requestedUser.populate({
            path: 'profileUrl'
        })

        const { id, profileUrl } = requestedUser;

        // Build the path to the file on disk
        let filepath = path.join(UPLOAD_ROOT, `/${id}/profile`, path.basename(profileUrl.key));

        // Make sure the file exists before streaming
        if (!await fs.pathExists(filepath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.setHeader('Content-Type', profileUrl.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${profileUrl.originalName}"`);

        const stream = fs.createReadStream(filepath);
        stream.on('error', (err) => {
            console.error('Stream error:', err);
            res.status(500).end();
        });
        stream.pipe(res);

    } catch (error) {
        console.error('Profile image fetch error:', error);
        res.status(500).json({ error: 'Error retrieving profile image' });
    }
});


module.exports = router;
