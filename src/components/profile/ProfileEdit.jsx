import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Box,
  Button,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    bio: '',
    photoUrl: '',
    interests: []
  });
  const [newInterest, setNewInterest] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      setFormData({
        name: data.name || '',
        headline: data.headline || '',
        bio: data.bio || '',
        photoUrl: data.photoUrl || '',
        interests: data.interests || []
      });
    } catch (err) {
      setError('Error loading profile');
      console.error('Error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError('Error updating profile');
      console.error('Error:', err);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Edit Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully! Redirecting...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              label="Headline"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              placeholder="Your professional headline"
            />

            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              multiline
              rows={4}
              placeholder="Tell us about yourself"
            />

            <TextField
              fullWidth
              label="Photo URL"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="Link to your profile photo"
            />

            <Box>
              <Typography variant="h6" gutterBottom>
                Interests
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleAddInterest}
                  disabled={!newInterest.trim()}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.interests.map((interest, index) => (
                  <Chip
                    key={index}
                    label={interest}
                    onDelete={() => handleRemoveInterest(interest)}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default ProfileEdit;