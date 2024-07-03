import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore'; 
import { TextField, Button, Paper, Typography, Box, Grid } from '@mui/material';

const Authors = () => {
  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      const authorSnapshot = await getDocs(collection(db, 'author'));
      const authorsList = authorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuthors(authorsList);
    };

    fetchAuthors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createAuthor = async () => {
    await addDoc(collection(db, 'author'), formData);
    setFormData({ name: '', email: '', bio: '' });
    // Fetch authors again to update the list
    const authorSnapshot = await getDocs(collection(db, 'author'));
    const authorsList = authorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAuthors(authorsList);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Authors</Typography>
      <Grid container spacing={2}>
        {authors.map(author => (
          <Grid item xs={12} md={6} key={author.id}>
            <Paper elevation={3} sx={{ padding: 2, position: 'relative' }}>
              <Typography variant="h6">{author.name}</Typography>
              <Typography variant="body2">{author.bio}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6">Create Author</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Name" variant="outlined" name="name" value={formData.name} onChange={handleInputChange} />
          <TextField label="Email" variant="outlined" name="email" value={formData.email} onChange={handleInputChange} />
          <TextField label="Bio" variant="outlined" multiline rows={4} name="bio" value={formData.bio} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={createAuthor}>Create Author</Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Authors;
