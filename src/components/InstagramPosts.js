import React, { useState } from 'react';
import { db, collection, addDoc, deleteDoc, doc } from '../firebase';
import { useGlobalState } from '../GlobalState';

const InstagramPosts = () => {
  const { instagramPosts, setInstagramPosts } = useGlobalState();
  const [formData, setFormData] = useState({ url: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createPost = async () => {
    if (formData.url) {
      const newPost = await addDoc(collection(db, 'instagramPosts'), formData);
      setInstagramPosts([...instagramPosts, { ...formData, id: newPost.id }]);
      setFormData({ url: '' });
    }
  };

  const deletePost = async (id) => {
    await deleteDoc(doc(db, 'instagramPosts', id));
    setInstagramPosts(instagramPosts.filter(post => post.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Manage Instagram Posts</h2>

      {/* Add New Instagram Post */}
      <div className="bg-white shadow-md p-6 rounded mb-10">
        <h3 className="text-xl font-semibold mb-4">Add New Instagram Post</h3>
        <input
          type="text"
          name="url"
          value={formData.url}
          onChange={handleInputChange}
          className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Instagram post URL"
        />
        <button
          onClick={createPost}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Add Post
        </button>
      </div>

      {/* List of Instagram Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instagramPosts.map(post => (
          <div key={post.id} className="bg-white shadow-md p-4 rounded relative">
            <p className="text-gray-700 mb-4 truncate">Instagram URL: {post.url}</p>
            <button
              className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition duration-300"
              onClick={() => deletePost(post.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstagramPosts;
