import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { GlobalStateProvider } from './GlobalState';
import BlogPosts from './components/BlogPosts';
import BlogDetail from './components/BlogDetail'; // Import BlogDetail
import Authors from './components/Authors';
import Categories from './components/Categories';
import Tags from './components/Tags';
import Users from './components/Users';
import Comments from './components/Comments';
import Likes from './components/Likes';

const App = () => {
  return (
    <GlobalStateProvider>
      <Router>
        <div>
          <nav>
            <ul>
              <li><Link to="/">Blog Posts</Link></li>
              <li><Link to="/authors">Authors</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/tags">Tags</Link></li>
              <li><Link to="/users">Users</Link></li>
              <li><Link to="/comments">Comments</Link></li>
              <li><Link to="/likes">Likes</Link></li>
            </ul>
          </nav>
          <Routes>
            <Route path="/" element={<BlogPosts />} />
            <Route path="/blog/:slug" element={<BlogDetail />} /> {/* Add the new route */}
            <Route path="/authors" element={<Authors />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/users" element={<Users />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/likes" element={<Likes />} />
          </Routes>
        </div>
      </Router>
    </GlobalStateProvider>
  );
};

export default App;
