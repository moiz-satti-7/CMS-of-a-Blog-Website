import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../GlobalState';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'; 
import { TextField, Button, Paper, Typography, Box, Grid } from '@mui/material';

const Tags = () => {
  const { tags, setTags } = useGlobalState();
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [selectedTag, setSelectedTag] = useState(null);

  const fetchTags = async () => {
    const tagSnapshot = await getDocs(collection(db, 'tag'));
    const tagsList = tagSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTags(tagsList);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createTag = async () => {
    await addDoc(collection(db, 'tag'), formData);
    setFormData({ name: '', slug: '' });
    fetchTags();
  };

  const updateTag = async (id) => {
    const tagRef = doc(db, 'tag', id);
    await updateDoc(tagRef, formData);
    setSelectedTag(null);
    setFormData({ name: '', slug: '' });
    fetchTags();
  };

  const deleteTag = async (id) => {
    const tagRef = doc(db, 'tag', id);
    await deleteDoc(tagRef);
    fetchTags();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Tags</Typography>
      <Grid container spacing={2}>
        {tags.map(tag => (
          <Grid item xs={12} md={6} key={tag.id}>
            <Paper elevation={3} sx={{ padding: 2, position: 'relative' }}>
              <Typography variant="h6">{tag.name}</Typography>
              <Typography variant="body2">{tag.slug}</Typography>
              <Button variant="outlined" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setSelectedTag(tag)}>Edit/Delete</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6">{selectedTag ? 'Update Tag' : 'Create Tag'}</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Name" variant="outlined" name="name" value={formData.name} onChange={handleInputChange} />
          <TextField label="Slug" variant="outlined" name="slug" value={formData.slug} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={selectedTag ? () => updateTag(selectedTag.id) : createTag}>{selectedTag ? 'Update Tag' : 'Create Tag'}</Button>
          {selectedTag && <Button variant="contained" color="secondary" onClick={() => deleteTag(selectedTag.id)}>Delete Tag</Button>}
        </Box>
      </Paper>
    </Box>
  );
};

export default Tags;
