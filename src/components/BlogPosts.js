// import React, { useState, useEffect, useRef } from 'react';
// import { useGlobalState } from '../GlobalState';
// import { db } from '../firebase';
// import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
// import { Link } from 'react-router-dom';
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import { debounce } from 'lodash';

// const BlogPosts = () => {
//   const { posts, setPosts } = useGlobalState();
//   const [archivedPosts, setArchivedPosts] = useState([]);
//   const [formData, setFormData] = useState({
//     title: '',
//     slug: '',
//     content: '',
//     content_one: '',
//     content_two: '',
//     content_three: '',
//     social_embed: '',
//     image_one: '',
//     image_two: '',
//     author_id: '',
//     category_id: '',
//     tags: [],
//     status: 'Active',
//     featured_image: '',
//     excerpt: '',
//     seo_title: '',
//     seo_description: '',
//     views_count: 0,
//   });
//   const [selectedPost, setSelectedPost] = useState(null);
//   const [authors, setAuthors] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [tags, setTags] = useState([]);
//   const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
//   const tagDropdownRef = useRef(null);

//   useEffect(() => {
//     const fetchAuthors = () => {
//       onSnapshot(collection(db, 'author'), (snapshot) => {
//         const authorsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setAuthors(authorsList);
//       });
//     };

//     const fetchCategories = () => {
//       onSnapshot(collection(db, 'category'), (snapshot) => {
//         const categoriesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setCategories(categoriesList);
//       });
//     };

//     const fetchTags = () => {
//       onSnapshot(collection(db, 'tag'), (snapshot) => {
//         const tagsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setTags(tagsList);
//       });
//     };

//     const fetchPosts = () => {
//       onSnapshot(collection(db, 'blogpost'), (snapshot) => {
//         const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setPosts(postsList);
//       });
//     };

//     const fetchArchivedPosts = () => {
//       onSnapshot(collection(db, 'archieveblogs'), (snapshot) => {
//         const archivedList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//         setArchivedPosts(archivedList);
//       });
//     };

//     fetchAuthors();
//     fetchCategories();
//     fetchTags();
//     fetchPosts();
//     fetchArchivedPosts();
//   }, [setPosts]);

//   useEffect(() => {
//     if (selectedPost) {
//       setFormData({
//         title: selectedPost.title || '',
//         slug: selectedPost.slug || '',
//         content: selectedPost.content || '',
//         content_one: selectedPost.content_one || '',
//         content_two: selectedPost.content_two || '',
//         content_three: selectedPost.content_three || '',
//         social_embed: selectedPost.social_embed || '',
//         image_one: selectedPost.image_one || '',
//         image_two: selectedPost.image_two || '',
//         author_id: selectedPost.author_id || '',
//         category_id: selectedPost.category_id || '',
//         tags: selectedPost.tags || [],
//         status: selectedPost.status || 'Active',
//         featured_image: selectedPost.featured_image || '',
//         excerpt: selectedPost.excerpt || '',
//         seo_title: selectedPost.seo_title || '',
//         seo_description: selectedPost.seo_description || '',
//         views_count: selectedPost.views_count || 0,
//       });
//     } else {
//       clearForm();
//     }
//   }, [selectedPost]);

//   useEffect(() => {
//     if (formData.social_embed.includes('instagram.com')) {
//       loadInstagramScript();
//     }
//   }, [formData.social_embed]);

//   const getAuthorName = (author_id) => {
//     const author = authors.find(author => author.id === author_id);
//     return author ? author.name : 'Unknown';
//   };

//   const getCategoryName = (category_id) => {
//     const category = categories.find(category => category.id === category_id);
//     return category ? category.name : 'Unknown';
//   };

//   const getTagNames = (tagIds) => {
//     return tagIds.map(tagId => {
//       const tag = tags.find(tag => tag.id === tagId);
//       return tag ? tag.name : 'Unknown';
//     }).join(', ');
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });

//     if (name === 'title') {
//       generateSlug(value);
//     }
//   };

//   const handleFileChange = (e) => {
//     const { name } = e.target;
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFormData({ ...formData, [name]: reader.result });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleContentChange = (event, editor) => {
//     const data = editor.getData();
//     setFormData({ ...formData, content: data });
//   };

//   const handleContentOneChange = (event, editor) => {
//     const data = editor.getData();
//     setFormData({ ...formData, content_one: data });
//   };

//   const handleContentTwoChange = (event, editor) => {
//     const data = editor.getData();
//     setFormData({ ...formData, content_two: data });
//   };

//   const handleContentThreeChange = (event, editor) => {
//     const data = editor.getData();
//     setFormData({ ...formData, content_three: data });
//   };

//   const handleAuthorChange = (e) => {
//     setFormData({ ...formData, author_id: e.target.value });
//   };

//   const handleCategoryChange = (e) => {
//     setFormData({ ...formData, category_id: e.target.value });
//   };

//   const handleTagsChange = (e) => {
//     const value = e.target.value;
//     setFormData({ ...formData, tags: typeof value === 'string' ? value.split(',') : value });
//   };

//   const handleTagCheckboxChange = (tagId) => {
//     const updatedTags = formData.tags.includes(tagId)
//       ? formData.tags.filter(id => id !== tagId)
//       : [...formData.tags, tagId];

//     setFormData({ ...formData, tags: updatedTags });
//   };

//   const handleStatusChange = (e) => {
//     setFormData({ ...formData, status: e.target.value });
//   };

//   const createPost = async () => {
//     const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
//     await addDoc(collection(db, collectionName), { ...formData, published_date: new Date() });
//     clearForm();
//   };

//   const updatePost = async (id) => {
//     const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
//     const postRef = doc(db, collectionName, id);
//     await updateDoc(postRef, { ...formData, updated_date: new Date() });
//     setSelectedPost(null);
//     clearForm();
//   };

//   const deletePost = async (id) => {
//     const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
//     const postRef = doc(db, collectionName, id);
//     await deleteDoc(postRef);
//   };

//   const movePost = async (post, newStatus) => {
//     const oldCollection = newStatus === 'Active' ? 'archieveblogs' : 'blogpost';
//     const newCollection = newStatus === 'Active' ? 'blogpost' : 'archieveblogs';

//     const postRef = doc(db, oldCollection, post.id);
//     await deleteDoc(postRef);

//     await addDoc(collection(db, newCollection), { ...post, status: newStatus });

//     clearForm();
//   };

//   const clearForm = () => {
//     setFormData({
//       title: '',
//       slug: '',
//       content: '',
//       content_one: '',
//       content_two: '',
//       content_three: '',
//       social_embed: '',
//       image_one: '',
//       image_two: '',
//       author_id: '',
//       category_id: '',
//       tags: [],
//       status: 'Active',
//       featured_image: '',
//       excerpt: '',
//       seo_title: '',
//       seo_description: '',
//       views_count: 0,
//     });
//   };

//   const toggleTagDropdown = () => {
//     setTagDropdownOpen(!tagDropdownOpen);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
//         setTagDropdownOpen(false);
//       }
//     };
//     if (tagDropdownOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     } else {
//       document.removeEventListener('mousedown', handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [tagDropdownOpen]);

//   const loadInstagramScript = () => {
//     if (!document.querySelector('script[src="//www.instagram.com/embed.js"]')) {
//       const script = document.createElement('script');
//       script.src = '//www.instagram.com/embed.js';
//       script.async = true;
//       script.defer = true;
//       document.body.appendChild(script);
//     } else {
//       window.instgrm.Embeds.process();
//     }
//   };

//   const generateSlug = debounce(async (title) => {
//     let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
//     let uniqueSlug = slug;
//     let count = 1;

//     const q = query(collection(db, 'blogpost'), where('slug', '==', uniqueSlug));
//     let snapshot = await getDocs(q);

//     while (!snapshot.empty) {
//       uniqueSlug = `${slug}-${count}`;
//       count++;
//       const newQuery = query(collection(db, 'blogpost'), where('slug', '==', uniqueSlug));
//       snapshot = await getDocs(newQuery);
//     }

//     setFormData((prevFormData) => ({ ...prevFormData, slug: uniqueSlug }));
//   }, 300);

//   return (
//     <div className="container mx-auto p-4">
//       <h4 className="text-3xl font-bold mb-6">Blog Posts</h4>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {posts.map(post => (
//           <Link to={`/blog/${post.slug}`} key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
//             {post.featured_image && <img className="h-48 w-full object-cover" src={post.featured_image} alt="Featured" />}
//             <div className="p-6">
//               <h6 className="text-xl font-semibold">{post.title}</h6>
//             </div>
//           </Link>
//         ))}
//       </div>

//       <div className="flex">
//         <div className="bg-white shadow-lg rounded-lg p-6 mt-10 relative w-1/2">
//           <h6 className="text-2xl font-bold mb-6">{selectedPost ? 'Update Blog Post' : 'Create Blog Post'}</h6>
//           <div className="grid grid-cols-1 gap-6">
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="category">Category</label>
//               <select className="border rounded px-4 py-2" id="category" value={formData.category_id} onChange={handleCategoryChange}>
//                 <option value="">Select Category</option>
//                 {categories.map(category => (
//                   <option key={category.id} value={category.id}>{category.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="title">Title</label>
//               <input className="border rounded px-4 py-2" id="title" placeholder="Enter the title" name="title" value={formData.title} onChange={handleInputChange} />
//             </div>
//             {/* <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="slug">Slug</label>
//               <input className="border rounded px-4 py-2" id="slug" placeholder="Enter the slug" name="slug" value={formData.slug} onChange={handleInputChange} />
//             </div> */}
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="featured_image">Featured Image</label>
//               <input type="file" className="border rounded px-4 py-2" id="featured_image" name="featured_image" onChange={handleFileChange} />

//               {formData.featured_image && (
//                 <img src={formData.featured_image} alt="Featured" className="mt-4 max-h-64 object-contain" />
//               )}
//             </div>
//             <h6 className="text-lg font-semibold mt-4">Main Content</h6>
//             <CKEditor editor={ClassicEditor} data={formData.content} onChange={handleContentChange} />
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="image_one">Image One</label>
//               <input type="file" className="border rounded px-4 py-2" id="image_one" name="image_one" onChange={handleFileChange} />

//               {formData.image_one && (
//                 <img src={formData.image_one} alt="Image One" className="mt-4 max-h-64 object-contain" />
//               )}
//             </div>
//             <h6 className="text-lg font-semibold mt-4">Content One</h6>
//             <CKEditor editor={ClassicEditor} data={formData.content_one} onChange={handleContentOneChange} />
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="social_embed">Social Embeded Url</label>
//               <input className="border rounded px-4 py-2" id="social_embed" placeholder="Enter the social embed URL" name="social_embed" value={formData.social_embed} onChange={handleInputChange} />
//             </div>
//             <h6 className="text-lg font-semibold mt-4">Content Two</h6>
//             <CKEditor editor={ClassicEditor} data={formData.content_two} onChange={handleContentTwoChange} />
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="image_two">Image Two</label>
//               <input type="file" className="border rounded px-4 py-2" id="image_two" name="image_two" onChange={handleFileChange} />

//               {formData.image_two && (
//                 <img src={formData.image_two} alt="Image Two" className="mt-4 max-h-64 object-contain" />
//               )}
//             </div>
//             <h6 className="text-lg font-semibold mt-4">Content Three</h6>
//             <CKEditor editor={ClassicEditor} data={formData.content_three} onChange={handleContentThreeChange} />
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="excerpt">Excerpt (Short Description)</label>
//               <input className="border rounded px-4 py-2" id="excerpt" placeholder="Enter the excerpt" name="excerpt" value={formData.excerpt} onChange={handleInputChange} />
//             </div>
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="author">Author</label>
//               <select className="border rounded px-4 py-2" id="author" value={formData.author_id} onChange={handleAuthorChange}>
//                 <option value="">Select Author</option>
//                 {authors.map(author => (
//                   <option key={author.id} value={author.id}>{author.name}</option>
//                 ))}
//               </select>
//             </div>
//             <div className="relative flex flex-col" ref={tagDropdownRef}>
//               <label className="text-gray-700 mb-2" htmlFor="tags">Tags</label>
//               <button
//                 className="border rounded px-4 py-5 text-left bg-white"
//                 id="tags"
//                 onClick={toggleTagDropdown}
//               >
//                 {getTagNames(formData.tags)}
//               </button>
//               {tagDropdownOpen && (
//                 <div className="absolute bg-white border rounded mt-1 shadow-lg z-20 max-h-60 overflow-y-auto w-full">
//                   {tags.map(tag => (
//                     <label key={tag.id} className="flex items-center p-2">
//                       <input
//                         type="checkbox"
//                         checked={formData.tags.includes(tag.id)}
//                         onChange={() => handleTagCheckboxChange(tag.id)}
//                         className="mr-2"
//                       />
//                       {tag.name}
//                     </label>
//                   ))}
//                 </div>
//               )}
//             </div>
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="status">Status</label>
//               <select className="border rounded px-4 py-2" id="status" value={formData.status} onChange={handleStatusChange}>
//                 <option value="Active">Active</option>
//                 <option value="Archived">Archived</option>
//               </select>
//             </div>
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="seo_title">SEO Title</label>
//               <input className="border rounded px-4 py-2" id="seo_title" placeholder="Enter the SEO title" name="seo_title" value={formData.seo_title} onChange={handleInputChange} />
//             </div>
//             <div className="flex flex-col">
//               <label className="text-gray-700 mb-2" htmlFor="seo_description">SEO Description</label>
//               <input className="border rounded px-4 py-2" id="seo_description" placeholder="Enter the SEO description" name="seo_description" value={formData.seo_description} onChange={handleInputChange} />
//             </div>
//             <button className="bg-blue-600 text-white rounded px-6 py-2 mt-4 hover:bg-blue-700 transition-colors" onClick={selectedPost ? () => updatePost(selectedPost.id) : createPost}>{selectedPost ? 'Update Post' : 'Create Post'}</button>
//             {selectedPost && <button className="bg-red-600 text-white rounded px-6 py-2 mt-2 hover:bg-red-700 transition-colors" onClick={() => deletePost(selectedPost.id)}>Delete Post</button>}
//           </div>
//         </div>
//         <div className="w-1/2 mt-20">
//           <img src="/images/template.jpg" alt="Template Format" />
//         </div>
//       </div>
//       <div>
//       <h4 className="text-3xl font-bold mt-12 mb-6">Archived Blogs</h4>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {archivedPosts.map(post => (
//           <Link to={`/blog/${post.slug}`} key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
//             {post.featured_image && <img className="h-48 w-full object-cover" src={post.featured_image} alt="Featured" />}
//             <div className="p-6">
//               <h6 className="text-xl font-semibold">{post.title}</h6>
//             </div>
//           </Link>
//         ))}
//       </div>
//       </div>
//     </div>
//   );
// };

// export default BlogPosts;























import React, { useState, useEffect, useRef } from 'react';
import { useGlobalState } from '../GlobalState';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { debounce } from 'lodash';
import axios from 'axios';

const BlogPosts = () => {
  const { posts, setPosts } = useGlobalState();
  const [archivedPosts, setArchivedPosts] = useState([]);
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
    const fetchAuthors = () => {
      onSnapshot(collection(db, 'author'), (snapshot) => {
        const authorsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAuthors(authorsList);
      });
    };

    const fetchCategories = () => {
      onSnapshot(collection(db, 'category'), (snapshot) => {
        const categoriesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesList);
      });
    };

    const fetchTags = () => {
      onSnapshot(collection(db, 'tag'), (snapshot) => {
        const tagsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTags(tagsList);
      });
    };

    const fetchPosts = () => {
      onSnapshot(collection(db, 'blogpost'), (snapshot) => {
        const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsList);
      });
    };

    const fetchArchivedPosts = () => {
      onSnapshot(collection(db, 'archieveblogs'), (snapshot) => {
        const archivedList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setArchivedPosts(archivedList);
      });
    };

    fetchAuthors();
    fetchCategories();
    fetchTags();
    fetchPosts();
    fetchArchivedPosts();
  }, [setPosts]);

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

  const handleFileChange = async (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      const uploadUrl = await uploadFileToCloudflare(file, file.name);
      if (uploadUrl) {
        setFormData({ ...formData, [name]: uploadUrl });
      }
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
    await handleFileUploads();
    const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
    await addDoc(collection(db, collectionName), { ...formData, published_date: new Date() });
    clearForm();
  };

  const updatePost = async (id) => {
    await handleFileUploads();
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

  const handleFileUploads = async () => {
    const fileFields = ['featured_image', 'image_one', 'image_two'];
    const uploadPromises = fileFields.map(async (field) => {
      const fileInput = document.getElementById(field);
      if (fileInput && fileInput.files[0]) {
        const uploadUrl = await uploadFileToCloudflare(fileInput.files[0], fileInput.files[0].name);
        return { [field]: uploadUrl };
      }
      return null;
    });

    const results = await Promise.all(uploadPromises);
    const updatedData = results.reduce((acc, curr) => (curr ? { ...acc, ...curr } : acc), {});
    setFormData((prevData) => ({ ...prevData, ...updatedData }));
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
    let snapshot = await getDocs(q);

    while (!snapshot.empty) {
      uniqueSlug = `${slug}-${count}`;
      count++;
      const newQuery = query(collection(db, 'blogpost'), where('slug', '==', uniqueSlug));
      snapshot = await getDocs(newQuery);
    }

    setFormData((prevFormData) => ({ ...prevFormData, slug: uniqueSlug }));
  }, 300);

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
  };

  return (
    <div className="container mx-auto p-4">
      <h4 className="text-3xl font-bold mb-6">Blog Posts</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <Link to={`/blog/${post.slug}`} key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
            {post.featured_image && <img className="h-48 w-full object-cover" src={formatImageUrl(post.featured_image)} alt="Featured" />}
            <div className="p-6">
              <h6 className="text-xl font-semibold">{post.title}</h6>
            </div>
          </Link>
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
      <div>
      <h4 className="text-3xl font-bold mt-12 mb-6">Archived Blogs</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archivedPosts.map(post => (
          <Link to={`/blog/${post.slug}`} key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
            {post.featured_image && <img className="h-48 w-full object-cover" src={post.featured_image} alt="Featured" />}
            <div className="p-6">
              <h6 className="text-xl font-semibold">{post.title}</h6>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
};

export default BlogPosts;
