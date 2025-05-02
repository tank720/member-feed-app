import express from 'express';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get paginated list of users
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // Number of users per page
    const offset = (page - 1) * limit;

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: req.user.id } // Exclude current user
      },
      attributes: ['id', 'name', 'bio', 'photoUrl', 'interests'],
      limit,
      offset,
      include: [{
        model: User,
        as: 'followers',
        attributes: ['id'],
        through: { attributes: [] }
      }]
    });

    // Transform the response to match frontend expectations
    const serverAddress = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    const transformedUsers = users.map(user => {
      const userData = user.toJSON();
      // Handle avatar URL - if photoUrl exists and is a full URL, use it directly
      // otherwise construct the URL using serverAddress
      let avatar = userData.photoUrl;
      if (!avatar) {
        avatar = `${serverAddress}/profile_photos/default.png`;
      } else if (!avatar.startsWith('http')) {
        avatar = `${serverAddress}${avatar}`;
      }
      return {
        id: userData.id,
        name: userData.name,
        bio: userData.bio,
        avatar,
        interests: userData.interests || [],
        isFollowing: userData.followers.some(follower => follower.id === req.user.id)
      };
    });

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Follow a user
router.post('/:userId/follow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const userToFollow = await User.findByPk(userId);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-following
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Create new follow relationship
    await Follow.create({
      followerId: req.user.id,
      followingId: userId
    });
    res.json({ message: 'Followed successfully' });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Already following this user' });
    }
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Error following user' });
  }
});

// Unfollow a user
router.delete('/:userId/unfollow', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const userToUnfollow = await User.findByPk(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent self-unfollowing
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot unfollow yourself' });
    }

    // Check if following and unfollow
    const result = await Follow.destroy({
      where: {
        followerId: req.user.id,
        followingId: userId
      }
    });

    if (result === 0) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Error unfollowing user' });
  }
});

export default router;