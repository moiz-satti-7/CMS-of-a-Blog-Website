import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../GlobalState';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'; // Add collection import here
import { TextField, Button, Paper, Typography, Box, Grid } from '@mui/material';

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [formData, setFormData] = useState({
    post_id: '',
    author_name: '',
    author_email: '',
    content: '',
    published_date: '',
    status: 'Pending'
  });
  const [selectedComment, setSelectedComment] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'comment'), (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createComment = async () => {
    await addDoc(collection(db, 'comment'), { ...formData, published_date: new Date() });
    setFormData({
      post_id: '',
      author_name: '',
      author_email: '',
      content: '',
      published_date: '',
      status: 'Pending'
    });
  };

  const updateComment = async (id) => {
    const commentRef = doc(db, 'comment', id);
    await updateDoc(commentRef, { ...formData, updated_date: new Date() });
    setSelectedComment(null);
    setFormData({
      post_id: '',
      author_name: '',
      author_email: '',
      content: '',
      published_date: '',
      status: 'Pending'
    });
  };

  const deleteComment = async (id) => {
    const commentRef = doc(db, 'comment', id);
    await deleteDoc(commentRef);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Comments</Typography>
      <Grid container spacing={2}>
        {comments.map(comment => (
          <Grid item xs={12} md={6} key={comment.id}>
            <Paper elevation={3} sx={{ padding: 2, position: 'relative' }}>
              <Typography variant="h6">{comment.author_name}</Typography>
              <Typography variant="body2">{comment.content}</Typography>
              <Button variant="outlined" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setSelectedComment(comment)}>Edit/Delete</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6">{selectedComment ? 'Update Comment' : 'Create Comment'}</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Post ID" variant="outlined" name="post_id" value={formData.post_id} onChange={handleInputChange} />
          <TextField label="Author Name" variant="outlined" name="author_name" value={formData.author_name} onChange={handleInputChange} />
          <TextField label="Author Email" variant="outlined" name="author_email" value={formData.author_email} onChange={handleInputChange} />
          <TextField label="Content" variant="outlined" multiline rows={4} name="content" value={formData.content} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={selectedComment ? () => updateComment(selectedComment.id) : createComment}>{selectedComment ? 'Update Comment' : 'Create Comment'}</Button>
          {selectedComment && <Button variant="contained" color="secondary" onClick={() => deleteComment(selectedComment.id)}>Delete Comment</Button>}
        </Box>
      </Paper>
    </Box>
  );
};

export default Comments;
