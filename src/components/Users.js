import React, { useState } from 'react';
import { useGlobalState } from '../GlobalState';
import { db, doc, addDoc, updateDoc, deleteDoc, collection } from '../firebase';
import { TextField, Button, Paper, Typography, Box, Grid } from '@mui/material';

const Users = () => {
  const { users } = useGlobalState();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', bio: '' });
  const [selectedUser, setSelectedUser] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createUser = async () => {
    const passwordHash = btoa(formData.password); // Placeholder for hashing
    await addDoc(collection(db, 'user-of-blog'), { ...formData, password_hash: passwordHash, registered_date: new Date() });
    setFormData({ username: '', email: '', password: '', bio: '' });
  };

  const updateUser = async (id) => {
    const userRef = doc(db, 'user-of-blog', id);
    await updateDoc(userRef, formData);
    setSelectedUser(null);
    setFormData({ username: '', email: '', password: '', bio: '' });
  };

  const deleteUser = async (id) => {
    const userRef = doc(db, 'user-of-blog', id);
    await deleteDoc(userRef);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Users</Typography>
      <Grid container spacing={2}>
        {users.map(user => (
          <Grid item xs={12} md={6} key={user.id}>
            <Paper elevation={3} sx={{ padding: 2, position: 'relative' }}>
              <Typography variant="h6">{user.username}</Typography>
              <Typography variant="body2">{user.bio}</Typography>
              <Button variant="outlined" sx={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setSelectedUser(user)}>Edit/Delete</Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
        <Typography variant="h6">{selectedUser ? 'Update User' : 'Create User'}</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Username" variant="outlined" name="username" value={formData.username} onChange={handleInputChange} />
          <TextField label="Email" variant="outlined" name="email" value={formData.email} onChange={handleInputChange} />
          <TextField label="Password" variant="outlined" name="password" value={formData.password} onChange={handleInputChange} type="password" />
          <TextField label="Bio" variant="outlined" multiline rows={4} name="bio" value={formData.bio} onChange={handleInputChange} />
          <Button variant="contained" color="primary" onClick={selectedUser ? () => updateUser(selectedUser.id) : createUser}>{selectedUser ? 'Update User' : 'Create User'}</Button>
          {selectedUser && <Button variant="contained" color="secondary" onClick={() => deleteUser(selectedUser.id)}>Delete User</Button>}
        </Box>
      </Paper>
    </Box>
  );
};

export default Users;
