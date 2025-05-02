import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button, Card, CardContent, CardMedia, CardActions, Chip, Stack } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Feed = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      if (page === 1) {
        setUsers(data);
      } else {
        setUsers(prev => [...prev, ...data]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`/api/users/${userId}/${isFollowing ? 'unfollow' : 'follow'}`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);

      setUsers(prev => prev.map(user => {
        if (user.id === userId) {
          return { ...user, isFollowing: !isFollowing };
        }
        return user;
      }));
    } catch (err) {
      console.error('Error updating follow status:', err);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Discover Users
      </Typography>
      
      <Grid container spacing={3}>
        {users.map((profile) => (
          <Grid item xs={12} sm={6} md={4} key={profile.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={profile.avatar}
                alt={profile.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {profile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profile.bio}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {profile.interests.map((interest, index) => (
                    <Chip key={index} label={interest} size="small" />
                  ))}
                </Stack>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant={profile.isFollowing ? "outlined" : "contained"}
                  onClick={() => handleFollow(profile.id, profile.isFollowing)}
                  disabled={user?.id === profile.id || followLoading[profile.id]}
                  sx={{
                    opacity: followLoading[profile.id] ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {profile.isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {users.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Feed;