import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { debounce } from 'lodash';
import axios from 'axios';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const modalRef = useRef();
  const tagDropdownRef = useRef();
  const [post, setPost] = useState(null);
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
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [tagNames, setTagNames] = useState([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const q = query(collection(db, 'blogpost'), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const postDoc = querySnapshot.docs[0];
        const postData = { id: postDoc.id, ...postDoc.data() };
        setPost(postData);
        setFormData(postData);
      } else {
        const qArchived = query(collection(db, 'archieveblogs'), where('slug', '==', slug));
        const querySnapshotArchived = await getDocs(qArchived);
        if (!querySnapshotArchived.empty) {
          const postDoc = querySnapshotArchived.docs[0];
          const postData = { id: postDoc.id, ...postDoc.data() };
          setPost(postData);
          setFormData(postData);
        }
      }
    };

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

    fetchPost();
    fetchAuthors();
    fetchCategories();
    fetchTags();
  }, [slug]);

  useEffect(() => {
    if (post) {
      fetchAuthor(post.author_id);
      fetchCategory(post.category_id);
      fetchTags(post.tags);
    }
  }, [post]);

  useEffect(() => {
    const handleClickOutsideModal = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };
    const handleClickOutsideTagDropdown = (event) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
        setTagDropdownOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutsideModal);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideModal);
    }
    if (tagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutsideTagDropdown);
    } else {
      document.removeEventListener('mousedown', handleClickOutsideTagDropdown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideModal);
      document.removeEventListener('mousedown', handleClickOutsideTagDropdown);
    };
  }, [isModalOpen, tagDropdownOpen]);

  const fetchAuthor = async (authorId) => {
    if (authorId) {
      const authorQuery = doc(db, 'author', authorId);
      const authorDoc = await getDoc(authorQuery);
      if (authorDoc.exists()) {
        setAuthorName(authorDoc.data().name);
      }
    }
  };

  const fetchCategory = async (categoryId) => {
    if (categoryId) {
      const categoryQuery = doc(db, 'category', categoryId);
      const categoryDoc = await getDoc(categoryQuery);
      if (categoryDoc.exists()) {
        setCategoryName(categoryDoc.data().name);
      }
    }
  };

  const fetchTags = async (tagIds) => {
    if (tagIds && tagIds.length > 0) {
      const tagPromises = tagIds.map(async (tagId) => {
        const tagQuery = doc(db, 'tag', tagId);
        const tagDoc = await getDoc(tagQuery);
        return tagDoc.exists() ? tagDoc.data().name : 'Unknown';
      });
      const tagNames = await Promise.all(tagPromises);
      setTagNames(tagNames);
    }
  };

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

  const handleImageRemove = (name) => {
    setFormData({ ...formData, [name]: '' });
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

  const toggleTagDropdown = () => {
    setTagDropdownOpen(!tagDropdownOpen);
  };

  const generateSlug = debounce(async (title) => {
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let uniqueSlug = slug;
    let count = 1;

    let snapshot = await getDocs(query(collection(db, 'blogpost'), where('slug', '==', uniqueSlug)));

    while (!snapshot.empty) {
      uniqueSlug = `${slug}-${count}`;
      count++;
      snapshot = await getDocs(query(collection(db, 'blogpost'), where('slug', '==', uniqueSlug)));
    }

    setFormData((prevFormData) => ({ ...prevFormData, slug: uniqueSlug }));
  }, 300);

  const updatePost = async () => {
    const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
    const postRef = doc(db, collectionName, post.id);
    await updateDoc(postRef, { ...formData, updated_date: new Date() });
    setIsModalOpen(false);
    navigate('/');
  };

  const deletePost = async () => {
    const collectionName = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
    const postRef = doc(db, collectionName, post.id);
    await deleteDoc(postRef);
    navigate('/');
  };

  const archivePost = async () => {
    const oldCollection = formData.status === 'Active' ? 'blogpost' : 'archieveblogs';
    const newCollection = formData.status === 'Active' ? 'archieveblogs' : 'blogpost';

    try {
      await setDoc(doc(db, newCollection, post.id), {
        ...formData,
        status: formData.status === 'Active' ? 'Archived' : 'Active'
      });

      await deleteDoc(doc(db, oldCollection, post.id));

      setPost({ ...post, status: formData.status === 'Active' ? 'Archived' : 'Active' });
      setFormData({ ...formData, status: formData.status === 'Active' ? 'Archived' : 'Active' });
      navigate('/');
    } catch (error) {
      console.error("Error archiving post: ", error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  if (!post) {
    return <p>Loading...</p>;
  }

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
    return url && url.startsWith("http")
      ? url
      : url
      ? `https://imagedelivery.net/P3Dzecn-jTdvXXgWWrFQig/${url}/large`
      : '';
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{post.title}</h2>
        <div>
          <button className="bg-blue-600 text-white rounded px-6 py-2 mr-2 hover:bg-blue-700 transition-colors" onClick={toggleModal}>Update</button>
          <button className="bg-red-600 text-white rounded px-6 py-2 mr-2 hover:bg-red-700 transition-colors" onClick={deletePost}>Delete</button>
          <button className={`bg-${formData.status === 'Active' ? 'black' : 'green'} text-white bg-brown hover:bg-gray-500 rounded px-6 py-2 hover:bg-${formData.status === 'Active' ? 'yellow' : 'green'}-700 transition-colors`} onClick={archivePost}>
            {formData.status === 'Active' ? 'Archive' : 'Unarchive'}
          </button>
        </div>
      </div>
      <div className="w-3/4 h-3/4">
  {post.featured_image && (
    <div className="mb-6 aspect-w-3 aspect-h-4">
      <img
        src={formatImageUrl(post.featured_image)}
        alt={post.title}
        className="w-full h-full object-cover"
      />
    </div>
  )}
</div>

      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <div className="mt-6">
        <p><strong>Author:</strong> {authorName}</p>
        <p><strong>Category:</strong> {categoryName}</p>
        <p><strong>Tags:</strong> {tagNames.join(', ')}</p>
        <p><strong>Excerpt:</strong> {post.excerpt}</p>
        <p><strong>SEO Title:</strong> {post.seo_title}</p>
        <p><strong>SEO Description:</strong> {post.seo_description}</p>
        <p><strong>Status:</strong> {post.status}</p>
        <p><strong>Views Count:</strong> {post.views_count}</p>
      </div>
      {post.content_one && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-4">Content One</h3>
          <div dangerouslySetInnerHTML={{ __html: post.content_one }} />
        </div>
      )}
      
      {post.image_one && (
  <div className="mt-6">
    <h3 className="text-2xl font-semibold mb-4">Image One</h3>
    <div className="mb-6 aspect-w-4 aspect-h-3">
      <img
        src={formatImageUrl(post.image_one)}
        alt="Image One"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
)}

      {post.social_embed && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-4">Social Embed</h3>
          <div dangerouslySetInnerHTML={{ __html: post.social_embed }} />
        </div>
      )}
      {post.content_two && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-4">Content Two</h3>
          <div dangerouslySetInnerHTML={{ __html: post.content_two }} />
        </div>
      )}
      {post.image_two && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-4">Image Two</h3>
          <img src={formatImageUrl(post.image_two)} alt="Image Two" className="mb-6 w-full object-cover" />
        </div>
      )}
      {post.content_three && (
        <div className="mt-6">
          <h3 className="text-2xl font-semibold mb-4">Content Three</h3>
          <div dangerouslySetInnerHTML={{ __html: post.content_three }} />
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl max-h-full overflow-auto" ref={modalRef}>
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-2xl font-bold">Edit Blog Post</h6>
              <button className="text-gray-500 hover:text-gray-700" onClick={toggleModal}>✖</button>
            </div>
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
              <div className="flex flex-col">
                <label className="text-gray-700 mb-2" htmlFor="featured_image">Featured Image</label>
                <input type="file" className="border rounded px-4 py-2" id="featured_image" name="featured_image" onChange={handleFileChange} />
                {formData.featured_image && (
                  <div>
                    <img src={formatImageUrl(formData.featured_image)} alt="Featured" className="mt-4 max-h-64 object-contain" />
                    <button className="bg-red-600 text-white rounded px-4 py-2 mt-2 hover:bg-red-700 transition-colors" onClick={() => handleImageRemove('featured_image')}>
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <h6 className="text-lg font-semibold mt-4">Main Content</h6>
              <CKEditor editor={ClassicEditor} data={formData.content} onChange={handleContentChange} />
              <div className="flex flex-col">
                <label className="text-gray-700 mb-2" htmlFor="image_one">Image One</label>
                <input type="file" className="border rounded px-4 py-2" id="image_one" name="image_one" onChange={handleFileChange} />
                {formData.image_one && (
                  <div>
                    <img src={formatImageUrl(formData.image_one)} alt="Image One" className="mt-4 max-h-64 object-contain" />
                    <button className="bg-red-600 text-white rounded px-4 py-2 mt-2 hover:bg-red-700 transition-colors" onClick={() => handleImageRemove('image_one')}>
                      Remove
                    </button>
                  </div>
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
                  <div>
                    <img src={formatImageUrl(formData.image_two)}  alt="Image Two" className="mt-4 max-h-64 object-contain" />
                    <button className="bg-red-600 text-white rounded px-2 py-1 mt-2 hover:bg-red-700 transition-colors" onClick={() => handleImageRemove('image_two')}>
                      Remove
                    </button>
                  </div>
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
              <div className="relative flex flex-col">
                <label className="text-gray-700 mb-2" htmlFor="tags">Tags</label>
                <button
                  className="border rounded px-4 py-2 text-left bg-white"
                  id="tags"
                  onClick={toggleTagDropdown}
                >
                  {getTagNames(formData.tags)}
                </button>
                {tagDropdownOpen && (
                  <div className="absolute bg-white border rounded mt-1 shadow-lg z-20 max-h-60 overflow-y-auto w-full" ref={tagDropdownRef}>
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
              {/* <div className="flex flex-col">
                <label className="text-gray-700 mb-2" htmlFor="status">Status</label>
                <select className="border rounded px-4 py-2" id="status" value={formData.status} onChange={handleStatusChange}>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div> */}
              <div className="flex flex-col">
                <label className="text-gray-700 mb-2" htmlFor="seo_title">SEO Title</label>
                <input className="border rounded px-4 py-2" id="seo_title" placeholder="Enter the SEO title" name="seo_title" value={formData.seo_title} onChange={handleInputChange} />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-700 mb-2" htmlFor="seo_description">SEO Description</label>
                <input className="border rounded px-4 py-2" id="seo_description" placeholder="Enter the SEO description" name="seo_description" value={formData.seo_description} onChange={handleInputChange} />
              </div>
              <div className="flex justify-between">
                <button className="bg-blue-600 text-white rounded px-6 py-2 mt-4 hover:bg-blue-700 transition-colors" onClick={updatePost}>Update Post</button>
                <button className="bg-gray-600 text-white rounded px-6 py-2 mt-4 hover:bg-gray-700 transition-colors" onClick={toggleModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;
