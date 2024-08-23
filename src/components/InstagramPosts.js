import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, deleteDoc, doc } from '../firebase';
import { useGlobalState } from '../GlobalState';

const InstagramPosts = () => {
  const { instagramPosts, setInstagramPosts } = useGlobalState();
  const [formData, setFormData] = useState({ url: '' });

  useEffect(() => {
    // Load Instagram Embed Script
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = "//www.instagram.com/embed.js";
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Instagram embeds after script is loaded
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [instagramPosts]); // Reinitialize on post changes

  useEffect(() => {
    // Ensure embeds are processed after each render
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [instagramPosts]);

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
      <h2 className="text-3xl font-bold mb-10 mt-5 text-center">Manage Instagram Posts</h2>

      {/* Add New Instagram Post */}
      <div className="bg-white shadow-md p-6 rounded mb-20">
        <h3 className="text-2xl font-semibold mb-4 ">Add New Instagram Post <span className='text-xl ms-4'>(not embeded link, simple insta post link)</span></h3>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-20">
        {instagramPosts.map(post => (
          <div key={post.id} className="instagram-bg text-center shadow-md p-4 rounded">
              <button
              className=" text-white text-xl p-2 rounded-md mb-4 hover:bg-red-600 transition duration-300 bg-red-500"
              onClick={() => deletePost(post.id)}
            >
              Remove Post
            </button>
            {/* Instagram Embed */}
            <blockquote className="instagram-media" data-instgrm-permalink={post.url} data-instgrm-version="12" style={{ width: '100%' }}></blockquote>

          
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstagramPosts;
