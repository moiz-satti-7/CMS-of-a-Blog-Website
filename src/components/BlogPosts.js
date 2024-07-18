import React, { useState, useEffect, useRef } from 'react';
import { useGlobalState } from '../GlobalState';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { debounce } from 'lodash';

const BlogPosts = () => {
  const { posts } = useGlobalState();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    content_one: '',
    content_two: '',
    content_three: '',
    social_embed: '',
    image_one: '',
    image_two: '',
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
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef(null);

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
        content_one: selectedPost.content_one || '',
        content_two: selectedPost.content_two || '',
        content_three: selectedPost.content_three || '',
        social_embed: selectedPost.social_embed || '',
        image_one: selectedPost.image_one || '',
        image_two: selectedPost.image_two || '',
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
      clearForm();
    }
  }, [selectedPost]);

  useEffect(() => {
    if (formData.social_embed.includes('instagram.com')) {
      loadInstagramScript();
    }
  }, [formData.social_embed]);

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

    if (name === 'title') {
      generateSlug(value);
    }
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [name]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentChange = (event, editor) => {
    const data = editor.getData();
    setFormData({ ...formData, content: data });
  };

  const handleContentOneChange = (event, editor) => {
    const data = editor.getData();
    setFormData({ ...formData, content_one: data });
  };

  const handleContentTwoChange = (event, editor) => {
    const data = editor.getData();
    setFormData({ ...formData, content_two: data });
  };

  const handleContentThreeChange = (event, editor) => {
    const data = editor.getData();
    setFormData({ ...formData, content_three: data });
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

  const handleTagCheckboxChange = (tagId) => {
    const updatedTags = formData.tags.includes(tagId)
      ? formData.tags.filter(id => id !== tagId)
      : [...formData.tags, tagId];

    setFormData({ ...formData, tags: updatedTags });
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
      content_one: '',
      content_two: '',
      content_three: '',
      social_embed: '',
      image_one: '',
      image_two: '',
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

  const toggleTagDropdown = () => {
    setTagDropdownOpen(!tagDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setTagDropdownOpen(false);
      }
    };
    if (tagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tagDropdownOpen]);

  const loadInstagramScript = () => {
    if (!document.querySelector('script[src="//www.instagram.com/embed.js"]')) {
      const script = document.createElement('script');
      script.src = '//www.instagram.com/embed.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else {
      window.instgrm.Embeds.process();
    }
  };

  const generateSlug = debounce(async (title) => {
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let uniqueSlug = slug;
    let count = 1;

    const q = query(collection(db, 'blogpost'), where('slug', '==', uniqueSlug));
    const snapshot = await getDocs(q);

    while (!snapshot.empty) {
      uniqueSlug = `${slug}-${count}`;
      count++;
      const newQuery = query(collection(db, 'blogpost'), where('slug', '==', uniqueSlug));
      const newSnapshot = await getDocs(newQuery);
      snapshot = newSnapshot;
    }

    setFormData((prevFormData) => ({ ...prevFormData, slug: uniqueSlug }));
  }, 300);

  return (
    <div className="container mx-auto p-4">
      <h4 className="text-3xl font-bold mb-6">Blog Posts</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            {post.featured_image && <img className="h-48 w-full object-cover" src={post.featured_image} alt="Featured" />}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h6 className="text-xl font-semibold mb-3">{post.title}</h6>
                <p className="text-gray-600 mb-3" dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) + '...' }} />
                <p className="text-gray-500 mb-2">Author: {getAuthorName(post.author_id)}</p>
                <p className="text-gray-500 mb-2">Category: {getCategoryName(post.category_id)}</p>
                <p className="text-gray-500 mb-2">Tags: {getTagNames(post.tags)}</p>
                <p className="text-gray-500 mb-2">Excerpt: {post.excerpt}</p>
                <p className="text-gray-500 mb-2">SEO Title: {post.seo_title}</p>
                <p className="text-gray-500 mb-2">SEO Description: {post.seo_description}</p>
                <p className="text-gray-500 mb-2">Status: {post.status}</p>
                <p className="text-gray-500 mb-2">Content One: {post.content_one}</p>
                {post.image_one && <img className="h-36 w-full object-cover mb-2" src={post.image_one} alt="Image One" />}
                <p className="text-gray-500 mb-2">Social Embed: <span dangerouslySetInnerHTML={{ __html: post.social_embed }} /></p>
                <p className="text-gray-500 mb-2">Content Two: {post.content_two}</p>
                {post.image_two && <img className="h-36 w-full object-cover mb-2" src={post.image_two} alt="Image Two" />}
                <p className="text-gray-500 mb-2">Content Three: {post.content_three}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button className="text-blue-500 hover:text-blue-700 mr-2" onClick={() => setSelectedPost(post)}>Edit</button>
                <button className="text-red-500 hover:text-red-700" onClick={() => deletePost(post.id)}>Delete</button>
                {post.status === 'Archived' && (
                  <button className="text-green-500 hover:text-green-700 ml-2" onClick={() => movePost(post, 'Active')}>Move to Active</button>
                )}
                {post.status === 'Active' && (
                  <button className="text-yellow-500 hover:text-yellow-700 ml-2" onClick={() => movePost(post, 'Archived')}>Move to Archived</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex">
        <div className="bg-white shadow-lg rounded-lg p-6 mt-10 relative w-1/2">
          <h6 className="text-2xl font-bold mb-6">{selectedPost ? 'Update Blog Post' : 'Create Blog Post'}</h6>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="category">Category</label>
              <select className="border rounded px-4 py-2" id="category" value={formData.category_id} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="title">Title</label>
              <input className="border rounded px-4 py-2" id="title" placeholder="Enter the title" name="title" value={formData.title} onChange={handleInputChange} />
            </div>
            {/* <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="slug">Slug</label>
              <input className="border rounded px-4 py-2" id="slug" placeholder="Enter the slug" name="slug" value={formData.slug} onChange={handleInputChange} />
            </div> */}
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="featured_image">Featured Image</label>
              <input type="file" className="border rounded px-4 py-2" id="featured_image" name="featured_image" onChange={handleFileChange} />
              {formData.featured_image && (
                <img src={formData.featured_image} alt="Featured" className="mt-4 max-h-64 object-contain" />
              )}
            </div>
            <h6 className="text-lg font-semibold mt-4">Main Content</h6>
            <CKEditor editor={ClassicEditor} data={formData.content} onChange={handleContentChange} />
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="image_one">Image One</label>
              <input type="file" className="border rounded px-4 py-2" id="image_one" name="image_one" onChange={handleFileChange} />
              {formData.image_one && (
                <img src={formData.image_one} alt="Image One" className="mt-4 max-h-64 object-contain" />
              )}
            </div>
            <h6 className="text-lg font-semibold mt-4">Content One</h6>
            <CKEditor editor={ClassicEditor} data={formData.content_one} onChange={handleContentOneChange} />
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="social_embed">Social Embeded Url</label>
              <input className="border rounded px-4 py-2" id="social_embed" placeholder="Enter the social embed URL" name="social_embed" value={formData.social_embed} onChange={handleInputChange} />
            </div>
            <h6 className="text-lg font-semibold mt-4">Content Two</h6>
            <CKEditor editor={ClassicEditor} data={formData.content_two} onChange={handleContentTwoChange} />
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="image_two">Image Two</label>
              <input type="file" className="border rounded px-4 py-2" id="image_two" name="image_two" onChange={handleFileChange} />
              {formData.image_two && (
                <img src={formData.image_two} alt="Image Two" className="mt-4 max-h-64 object-contain" />
              )}
            </div>
            <h6 className="text-lg font-semibold mt-4">Content Three</h6>
            <CKEditor editor={ClassicEditor} data={formData.content_three} onChange={handleContentThreeChange} />
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="excerpt">Excerpt (Short Description)</label>
              <input className="border rounded px-4 py-2" id="excerpt" placeholder="Enter the excerpt" name="excerpt" value={formData.excerpt} onChange={handleInputChange} />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="author">Author</label>
              <select className="border rounded px-4 py-2" id="author" value={formData.author_id} onChange={handleAuthorChange}>
                <option value="">Select Author</option>
                {authors.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
            </div>
            <div className="relative flex flex-col" ref={tagDropdownRef}>
              <label className="text-gray-700 mb-2" htmlFor="tags">Tags</label>
              <button
                className="border rounded px-4 py-5 text-left bg-white"
                id="tags"
                onClick={toggleTagDropdown}
              >
                {getTagNames(formData.tags)}
              </button>
              {tagDropdownOpen && (
                <div className="absolute bg-white border rounded mt-1 shadow-lg z-20 max-h-60 overflow-y-auto w-full">
                  {tags.map(tag => (
                    <label key={tag.id} className="flex items-center p-2">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag.id)}
                        onChange={() => handleTagCheckboxChange(tag.id)}
                        className="mr-2"
                      />
                      {tag.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="status">Status</label>
              <select className="border rounded px-4 py-2" id="status" value={formData.status} onChange={handleStatusChange}>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="seo_title">SEO Title</label>
              <input className="border rounded px-4 py-2" id="seo_title" placeholder="Enter the SEO title" name="seo_title" value={formData.seo_title} onChange={handleInputChange} />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-2" htmlFor="seo_description">SEO Description</label>
              <input className="border rounded px-4 py-2" id="seo_description" placeholder="Enter the SEO description" name="seo_description" value={formData.seo_description} onChange={handleInputChange} />
            </div>
            <button className="bg-blue-600 text-white rounded px-6 py-2 mt-4 hover:bg-blue-700 transition-colors" onClick={selectedPost ? () => updatePost(selectedPost.id) : createPost}>{selectedPost ? 'Update Post' : 'Create Post'}</button>
            {selectedPost && <button className="bg-red-600 text-white rounded px-6 py-2 mt-2 hover:bg-red-700 transition-colors" onClick={() => deletePost(selectedPost.id)}>Delete Post</button>}
          </div>
        </div>
        <div className="w-1/2 mt-20">
          <img src="/images/template.jpg" alt="Template Format" />
        </div>
      </div>
    </div>
  );
};

export default BlogPosts;
