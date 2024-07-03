import React, { useState } from 'react';
import { useGlobalState } from '../GlobalState';
import { db, doc, addDoc, updateDoc, deleteDoc, collection } from '../firebase';
import { TextField, Button, Paper, Typography, Box, Grid } from '@mui/material';

const Categories = () => {
  const { categories } = useGlobalState();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createCategory = async () => {
    await addDoc(collection(db, 'category'), formData);
    setFormData({ name: '', description: '' });
  };

  const updateCategory = async (id) => {
    const categoryRef = doc(db, 'category', id);
    await updateDoc(categoryRef, formData);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
  };

  const deleteCategory = async (id) => {
    const categoryRef = doc(db, 'category', id);
    await deleteDoc(categoryRef);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Categories</Typography>
      <Grid container spacing={2}>
        {categories.map(category => (
          <Grid item xs={12} md={6} key={category.id}>
            <Paper elevation={3} sx={{ padding: 2, position: 'relative' }}>
              <Typography variant="h6">{category.name}</Typography>
              <Typography variant="body2">{category.description}</Typography>
              <Button variant="outlined" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setSelectedCategory(category)}>Edit/Delete</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6">{selectedCategory ? 'Update Category' : 'Create Category'}</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Name" variant="outlined" name="name" value={formData.name} onChange={handleInputChange} />
          <TextField label="Description" variant="outlined" multiline rows={4} name="description" value={formData.description} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={selectedCategory ? () => updateCategory(selectedCategory.id) : createCategory}>{selectedCategory ? 'Update Category' : 'Create Category'}</Button>
          {selectedCategory && <Button variant="contained" color="secondary" onClick={() => deleteCategory(selectedCategory.id)}>Delete Category</Button>}
        </Box>
      </Paper>
    </Box>
  );
};

export default Categories;
