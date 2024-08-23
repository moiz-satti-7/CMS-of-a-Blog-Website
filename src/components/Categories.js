import React, { useState, useEffect } from 'react';
import { db, doc, addDoc, updateDoc, deleteDoc, collection, onSnapshot } from '../firebase';

const Categories = () => {
  const [categories, setCategories] = useState([]);  // Local state for categories
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'category'), (snapshot) => {
      const categoriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesList);
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description });
  };

  const createCategory = async () => {
    const newCategoryRef = await addDoc(collection(db, 'category'), formData);
    const newCategory = { id: newCategoryRef.id, ...formData };

    setCategories((prevCategories) => [...prevCategories, newCategory]);
    setFormData({ name: '', description: '' });
  };

  const updateCategory = async (id) => {
    const categoryRef = doc(db, 'category', id);
    await updateDoc(categoryRef, formData);

    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === id ? { ...category, ...formData } : category
      )
    );

    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
  };

  const deleteCategory = async (id) => {
    const categoryRef = doc(db, 'category', id);
    await deleteDoc(categoryRef);

    setCategories((prevCategories) =>
      prevCategories.filter((category) => category.id !== id)
    );

    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 ">Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white shadow-lg rounded-lg p-4 relative">
            <h4 className="text-xl font-semibold">{category.name}</h4>
            <p className="text-gray-600">{category.description}</p>
            <button 
              className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors" 
              onClick={() => handleEditClick(category)}
            >
              Edit/Delete
            </button>
          </div>
        ))}
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
        <h4 className="text-xl font-semibold mb-4">
          {selectedCategory ? 'Update Category' : 'Create Category'}
        </h4>
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            onClick={selectedCategory ? () => updateCategory(selectedCategory.id) : createCategory}
          >
            {selectedCategory ? 'Update Category' : 'Create Category'}
          </button>
          {selectedCategory && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              onClick={() => deleteCategory(selectedCategory.id)}
            >
              Delete Category
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
