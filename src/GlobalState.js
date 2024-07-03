import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const authorsData = await getDocs(collection(db, 'author'));
      setAuthors(authorsData.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const categoriesData = await getDocs(collection(db, 'category'));
      setCategories(categoriesData.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const tagsData = await getDocs(collection(db, 'tag'));
      setTags(tagsData.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const usersData = await getDocs(collection(db, 'user-of-blog'));
      setUsers(usersData.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const postsData = await getDocs(collection(db, 'blogpost'));
      setPosts(postsData.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const commentsData = await getDocs(collection(db, 'comment'));
      setComments(commentsData.docs.map(doc => ({ ...doc.data(), id: doc.id })));

      const likesData = await getDocs(collection(db, 'like'));
      setLikes(likesData.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    fetchData();
  }, []);

  return (
    <GlobalStateContext.Provider value={{ authors, categories, tags, setTags, users, posts, setPosts, comments, likes }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
