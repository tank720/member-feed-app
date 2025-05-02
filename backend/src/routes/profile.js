import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { upload, downloadImage } from '../middleware/uploadMiddleware.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: User, as: 'followers', attributes: ['id', 'name'] },
        { model: User, as: 'following', attributes: ['id', 'name'] }
      ]
    });

    // Check if user has a profile photo in the profile_photos directory
    if (user.photoUrl) {
      const photoFileName = path.basename(user.photoUrl);
      const photoPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../profile_photos', photoFileName);
      
      console.info('Photo path:', photoPath);
      console.info('photoFileName:', photoFileName);

      // If photo exists, set the full URL with server address
      if (fs.existsSync(photoPath)) {
        const serverAddress = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
        user.photoUrl = `${serverAddress}/profile_photos/${photoFileName}`;
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Handle file upload
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // Update user's photoUrl with the new filename including server address
    const serverAddress = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    const photoUrl = `${serverAddress}/profile_photos/${req.file.filename}`;
    req.user.photoUrl = photoUrl;
    await req.user.save();
    res.json({ photoUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Handle photo URL
router.post('/photo-from-url', auth, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    const filename = await downloadImage(url);
    const serverAddress = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    const photoUrl = `${serverAddress}/profile_photos/${filename}`;
    req.user.photoUrl = photoUrl;
    await req.user.save();
    res.json({ photoUrl });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error downloading image' });
  }
});

// Update profile
router.put('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'bio', 'headline', 'photoUrl', 'interests'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile' });
  }
});

// Delete profile
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.destroy();
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile' });
  }
});

// Follow a user
router.post('/follow/:id', auth, async (req, res) => {
  try {
    const userToFollow = await User.findByPk(req.params.id);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.id === userToFollow.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    await Follow.create({
      followerId: req.user.id,
      followingId: userToFollow.id
    });

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Already following this user' });
    }
    res.status(500).json({ message: 'Error following user' });
  }
});

// Unfollow a user
router.delete('/unfollow/:id', auth, async (req, res) => {
  try {
    const result = await Follow.destroy({
      where: {
        followerId: req.user.id,
        followingId: req.params.id
      }
    });

    if (result === 0) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});

export default router;