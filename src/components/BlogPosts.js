import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../GlobalState';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'; 
import { TextField, Button, Paper, Typography, Box, Grid, MenuItem, Select, InputLabel, FormControl, Checkbox, ListItemText } from '@mui/material';

const BlogPosts = () => {
  const { posts } = useGlobalState();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    author_id: '',
    category_id: '',
    tags: [],
    status: 'Active',
    featured_image: '',
    excerpt: '',
    seo_title: '',
    seo_description: '',
    views_count: 0,
  });
  const [selectedPost, setSelectedPost] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const fetchAuthors = async () => {
      const authorSnapshot = await getDocs(collection(db, 'author'));
      const authorsList = authorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuthors(authorsList);
    };

    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(collection(db, 'category'));
      const categoriesList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesList);
    };

    const fetchTags = async () => {
      const tagSnapshot = await getDocs(collection(db, 'tag'));
      const tagsList = tagSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTags(tagsList);
    };

    fetchAuthors();
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      setFormData({
        title: selectedPost.title || '',
        slug: selectedPost.slug || '',
        content: selectedPost.content || '',
        author_id: selectedPost.author_id || '',
        category_id: selectedPost.category_id || '',
        tags: selectedPost.tags || [],
        status: selectedPost.status || 'Active',
        featured_image: selectedPost.featured_image || '',
        excerpt: selectedPost.excerpt || '',
        seo_title: selectedPost.seo_title || '',
        seo_description: selectedPost.seo_description || '',
        views_count: selectedPost.views_count || 0,
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        author_id: '',
        category_id: '',
        tags: [],
        status: 'Active',
        featured_image: '',
        excerpt: '',
        seo_title: '',
        seo_description: '',
        views_count: 0,
      });
    }
  }, [selectedPost]);

  const getAuthorName = (author_id) => {
    const author = authors.find(author => author.id === author_id);
    return author ? author.name : 'Unknown';
  };

  const getCategoryName = (category_id) => {
    const category = categories.find(category => category.id === category_id);
    return category ? category.name : 'Unknown';
  };

  const getTagNames = (tagIds) => {
    return tagIds.map(tagId => {
      const tag = tags.find(tag => tag.id === tagId);
      return tag ? tag.name : 'Unknown';
    }).join(', ');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAuthorChange = (e) => {
    setFormData({ ...formData, author_id: e.target.value });
  };

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category_id: e.target.value });
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, tags: typeof value === 'string' ? value.split(',') : value });
  };

  const handleStatusChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  const createPost = async () => {
    const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
    await addDoc(collection(db, collectionName), { ...formData, published_date: new Date() });
    clearForm();
  };

  const updatePost = async (id) => {
    const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
    const postRef = doc(db, collectionName, id);
    await updateDoc(postRef, { ...formData, updated_date: new Date() });
    setSelectedPost(null);
    clearForm();
  };

  const deletePost = async (id) => {
    const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
    const postRef = doc(db, collectionName, id);
    await deleteDoc(postRef);
  };

  const movePost = async (post, newStatus) => {
    const oldCollection = newStatus === 'Active' ? 'archieveblogs' : 'blogpost';
    const newCollection = newStatus === 'Active' ? 'blogpost' : 'archieveblogs';
    
    const postRef = doc(db, oldCollection, post.id);
    await deleteDoc(postRef);

    await addDoc(collection(db, newCollection), { ...post, status: newStatus });

    clearForm();
  };

  const clearForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      author_id: '',
      category_id: '',
      tags: [],
      status: 'Active',
      featured_image: '',
      excerpt: '',
      seo_title: '',
      seo_description: '',
      views_count: 0,
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Blog Posts</Typography>
      <Grid container spacing={2}>
        {posts.map(post => (
          <Grid item xs={12} md={6} key={post.id}>
            <Paper elevation={3} sx={{ padding: 2, position: 'relative' }}>
              {post.featured_image && <img src={post.featured_image} alt="Featured" style={{ width: '100%', height: 'auto' }} />}
              <Typography variant="h6">{post.title}</Typography>
              <Typography variant="body2">{post.content}</Typography>
              <Typography variant="body2">Author: {getAuthorName(post.author_id)}</Typography>
              <Typography variant="body2">Category: {getCategoryName(post.category_id)}</Typography>
              <Typography variant="body2">Tags: {getTagNames(post.tags)}</Typography>
              <Typography variant="body2">Excerpt: {post.excerpt}</Typography>
              <Typography variant="body2">SEO Title: {post.seo_title}</Typography>
              <Typography variant="body2">SEO Description: {post.seo_description}</Typography>
              <Typography variant="body2">Status: {post.status}</Typography>
              <Button variant="outlined" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setSelectedPost(post)}>Edit/Delete</Button>
              {post.status === 'Archived' && (
                <Button variant="outlined" color="primary" onClick={() => movePost(post, 'Active')}>Move to Active</Button>
              )}
              {post.status === 'Active' && (
                <Button variant="outlined" color="secondary" onClick={() => movePost(post, 'Archived')}>Move to Archived</Button>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6">{selectedPost ? 'Update Blog Post' : 'Create Blog Post'}</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Title" variant="outlined" name="title" value={formData.title} onChange={handleInputChange} />
          <TextField label="Slug" variant="outlined" name="slug" value={formData.slug} onChange={handleInputChange} />
          <TextField label="Content" variant="outlined" multiline rows={4} name="content" value={formData.content} onChange={handleInputChange} />
          <FormControl variant="outlined">
            <InputLabel>Author</InputLabel>
            <Select
              value={formData.author_id}
              onChange={handleAuthorChange}
              label="Author"
            >
              {authors.map(author => (
                <MenuItem key={author.id} value={author.id}>
                  {author.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined">
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category_id}
              onChange={handleCategoryChange}
              label="Category"
            >
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined">
            <InputLabel>Tags</InputLabel>
            <Select
              multiple
              value={formData.tags}
              onChange={handleTagsChange}
              renderValue={(selected) => selected.map(tagId => getTagNames([tagId])).join(', ')}
            >
              {tags.map(tag => (
                <MenuItem key={tag.id} value={tag.id}>
                  <Checkbox checked={formData.tags.indexOf(tag.id) > -1} />
                  <ListItemText primary={tag.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Featured Image URL" variant="outlined" name="featured_image" value={formData.featured_image} onChange={handleInputChange} />
          <TextField label="Excerpt" variant="outlined" name="excerpt" value={formData.excerpt} onChange={handleInputChange} />
          <TextField label="SEO Title" variant="outlined" name="seo_title" value={formData.seo_title} onChange={handleInputChange} />
          <TextField label="SEO Description" variant="outlined" name="seo_description" value={formData.seo_description} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={selectedPost ? () => updatePost(selectedPost.id) : createPost}>{selectedPost ? 'Update Post' : 'Create Post'}</Button>
          {selectedPost && <Button variant="contained" color="secondary" onClick={() => deletePost(selectedPost.id)}>Delete Post</Button>}
        </Box>
      </Paper>
    </Box>
  );
};

export default BlogPosts;
