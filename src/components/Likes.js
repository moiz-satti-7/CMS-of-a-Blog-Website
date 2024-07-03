import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../GlobalState';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'; // Add collection import here
import { TextField, Button, Paper, Typography, Box, Grid } from '@mui/material';

const Likes = () => {
  const [likes, setLikes] = useState([]);
  const [formData, setFormData] = useState({
    post_id: '',
    user_id: '',
    liked_date: new Date()
  });
  const [selectedLike, setSelectedLike] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'like'), (snapshot) => {
      setLikes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createLike = async () => {
    await addDoc(collection(db, 'like'), { ...formData });
    setFormData({
      post_id: '',
      user_id: '',
      liked_date: new Date()
    });
  };

  const deleteLike = async (id) => {
    const likeRef = doc(db, 'like', id);
    await deleteDoc(likeRef);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Likes</Typography>
      <Grid container spacing={2}>
        {likes.map(like => (
          <Grid item xs={12} md={6} key={like.id}>
            <Paper elevation={3} sx={{ padding: 2, position: 'relative' }}>
              <Typography variant="body2">Post ID: {like.post_id}</Typography>
              <Typography variant="body2">User ID: {like.user_id}</Typography>
              <Button variant="outlined" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setSelectedLike(like)}>Unlike</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6">{selectedLike ? 'Delete Like' : 'Create Like'}</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Post ID" variant="outlined" name="post_id" value={formData.post_id} onChange={handleInputChange} />
          <TextField label="User ID" variant="outlined" name="user_id" value={formData.user_id} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={createLike}>Like</Button>
          {selectedLike && <Button variant="contained" color="secondary" onClick={() => deleteLike(selectedLike.id)}>Unlike</Button>}
        </Box>
      </Paper>
    </Box>
  );
};

export default Likes;
