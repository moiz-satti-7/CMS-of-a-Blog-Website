import React, { useState } from 'react';
import { useGlobalState } from '../GlobalState';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import axios from 'axios';

const Authors = () => {
  const { authors, setAuthors } = useGlobalState();  // Use global state for authors
  const [formData, setFormData] = useState({ id: '', name: '', email: '', bio: '', author_image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const uploadImageToCloudflare = async (file) => {
    if (!file) return formData.author_image;

    const formData = new FormData();
    formData.append('image', file, file.name);

    try {
      const response = await axios.post(
        'https://cloudflare.cedrics.se/api/upload-anb-file-Images-to-cloudflare',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${process.env.REACT_APP_CLOUDFLARE_API_KEY}`,
          },
        }
      );

      if (response.status === 200) {
        const { image_id: downloadUrl } = response.data;
        return downloadUrl;
      } else {
        console.error(`Error uploading image: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const saveAuthor = async () => {
    setSaving(true);
    setError(null);
    try {
      const imageUrl = await uploadImageToCloudflare(imageFile);
      if (editing) {
        // Updating an existing author
        const authorRef = doc(db, 'author', formData.id);
        await setDoc(authorRef, { ...formData, author_image: imageUrl });
        setAuthors(authors.map(author => (author.id === formData.id ? { ...formData, author_image: imageUrl } : author)));
        setEditing(false);
      } else {
        // Creating a new author
        const docRef = doc(collection(db, 'author'));
        await setDoc(docRef, { ...formData, id: docRef.id, author_image: imageUrl });
        setAuthors([...authors, { id: docRef.id, ...formData, author_image: imageUrl }]);
      }
      setFormData({ id: '', name: '', email: '', bio: '', author_image: '' });
      setImageFile(null);
      setShowModal(false);
    } catch (err) {
      console.error("Error saving author: ", err);
      setError('Failed to save author.');
    } finally {
      setSaving(false);
    }
  };

  const editAuthor = (author) => {
    setFormData(author);
    setEditing(true);
    setShowModal(true);
  };

  const deleteAuthor = async (id) => {
    try {
      await deleteDoc(doc(db, 'author', id));
      setAuthors(authors.filter(author => author.id !== id));
    } catch (err) {
      console.error("Error deleting author: ", err);
      setError('Failed to delete author.');
    }
  };



// To Upload Image to Cloud Flare 



const uploadFileToCloudflare = async (file, fileName) => {
  try {
    const formData = new FormData();
    formData.append('image', file, fileName);

    const response = await axios.post(
      'https://cloudflare.cedrics.se/api/upload-anb-file-Images-to-cloudflare',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${process.env.REACT_APP_CLOUDFLARE_API_KEY}`,
        },
      }
    );

    if (response.status === 200) {
      const { image_id: downloadUrl } = response.data;
      return downloadUrl;
    } else {
      console.error(`Error in uploading file: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    return error;
  }
};


  const formatImageUrl = (url) => {
    return url.startsWith("http")
      ? url
      : `https://imagedelivery.net/P3Dzecn-jTdvXXgWWrFQig/${url}/large`;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Authors</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map(author => (
          <div key={author.id} className="bg-white shadow-md p-4 rounded">
            <h2 className="text-xl font-semibold">{author.name}</h2>
            <p>{author.bio}</p>
            {author.author_image && <img src={formatImageUrl(author.author_image)} alt={author.name} className="h-96 w-full object-cover mt-3" />}
            <button className="bg-yellow-500 text-white px-10 py-2 rounded mt-4" onClick={() => editAuthor(author)}>Edit</button>
            <button className="bg-red-500 text-white px-10 py-2 rounded mt-4 ml-4" onClick={() => deleteAuthor(author.id)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="bg-white shadow-md p-4 rounded mt-4">
        <h2 className="text-xl font-semibold mb-2">Create Author</h2>
        <div className="flex flex-col gap-2">
          <input 
            className="border p-2 rounded" 
            type="text" 
            placeholder="Name" 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange} 
          />
          <input 
            className="border p-2 rounded" 
            type="email" 
            placeholder="Email" 
            name="email" 
            value={formData.email} 
            onChange={handleInputChange} 
          />
          <textarea 
            className="border p-2 rounded" 
            placeholder="Bio" 
            name="bio" 
            value={formData.bio} 
            onChange={handleInputChange} 
            rows={4}
          />
          <input 
            className="border p-2 rounded" 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
          />
          <button 
            className="bg-blue-500 text-white p-2 rounded disabled:opacity-50" 
            onClick={saveAuthor} 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Create Author'}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-2">Edit Author</h2>
            <div className="flex flex-col gap-2">
              <input 
                className="border p-2 rounded" 
                type="text" 
                placeholder="Name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
              />
              <input 
                className="border p-2 rounded" 
                type="email" 
                placeholder="Email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
              <textarea 
                className="border p-2 rounded" 
                placeholder="Bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange} 
                rows={4}
              />
              <input 
                className="border p-2 rounded" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              <button 
                className="bg-blue-500 text-white p-2 rounded disabled:opacity-50" 
                onClick={saveAuthor} 
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Update Author'}
              </button>
              <button 
                className="bg-gray-500 text-white p-2 rounded mt-2" 
                onClick={() => { setShowModal(false); setEditing(false); }} 
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;
