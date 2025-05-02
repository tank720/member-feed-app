import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError('Error loading profile');
      console.error('Error:', err);
    }
  };

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/profile/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete profile');

      localStorage.removeItem('token');
      navigate('/register');
    } catch (err) {
      setError('Error deleting profile');
      console.error('Error:', err);
    }
  };

  if (!profile) {
    return (
      <Container maxWidth="md">
        <Typography>{error || 'Loading...'}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
            <IconButton onClick={handleEdit} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setDeleteDialogOpen(true)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={profile.photoUrl}
              alt={profile.name}
              sx={{ width: 100, height: 100, mr: 3 }}
            />
            <Box>
              <Typography variant="h4" gutterBottom>
                {profile.name}
              </Typography>
              {profile.headline && (
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  {profile.headline}
                </Typography>
              )}
            </Box>
          </Box>

          {profile.bio && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body1" paragraph>
                {profile.bio}
              </Typography>
            </Box>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Interests
              </Typography>
              <Grid container spacing={1}>
                {profile.interests.map((interest, index) => (
                  <Grid item key={index}>
                    <Chip label={interest} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Network
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Typography variant="body1">
                  <strong>{profile.followers?.length || 0}</strong> Followers
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body1">
                  <strong>{profile.following?.length || 0}</strong> Following
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Profile</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete your profile? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;