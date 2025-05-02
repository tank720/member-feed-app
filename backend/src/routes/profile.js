import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';

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
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
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