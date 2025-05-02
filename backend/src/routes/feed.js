import express from 'express';
import { Op } from 'sequelize';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get public feed of user profiles (with pagination and optional tag filtering)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const tag = req.query.tag;

    let whereClause = {
      id: { [Op.ne]: req.user.id } // Exclude current user
    };

    // Add tag filter if provided
    if (tag) {
      whereClause.interests = {
        [Op.contains]: [tag]
      };
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'followers',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });

    // Add isFollowing field to each user
    const users = rows.map(user => {
      const userData = user.toJSON();
      userData.isFollowing = userData.followers.some(follower => follower.id === req.user.id);
      delete userData.followers; // Remove followers array from response
      return userData;
    });

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ message: 'Error fetching feed' });
  }
});

// Get all unique tags from users
router.get('/tags', auth, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['interests'],
      where: {
        interests: {
          [Op.not]: null
        }
      }
    });

    // Collect all unique tags
    const tags = new Set();
    users.forEach(user => {
      if (Array.isArray(user.interests)) {
        user.interests.forEach(tag => tags.add(tag));
      }
    });

    res.json(Array.from(tags));
  } catch (error) {
    console.error('Tags error:', error);
    res.status(500).json({ message: 'Error fetching tags' });
  }
});

export default router;