import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { GlobalStateProvider } from './GlobalState';
import BlogPosts from './components/BlogPosts';
import BlogDetail from './components/BlogDetail';
import Authors from './components/Authors';
import Categories from './components/Categories';
import Tags from './components/Tags';
import Users from './components/Users';
import Comments from './components/Comments';
import Likes from './components/Likes';
import InstagramPosts from './components/InstagramPosts'; // Import InstagramPosts
import 'react-quill/dist/quill.snow.css';


const App = () => {
  return (
    <GlobalStateProvider>
      <Router>
        <div>
          <nav>
          <ul className="flex justify-center space-x-4 my-4">
  <li>
    <Link 
      to="/" 
      className="inline-block bg-blue-500 text-white font-semibold text-xl py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
    >
      Blog Posts
    </Link>
  </li>
  <li>
    <Link 
      to="/categories" 
      className="inline-block bg-blue-500 text-white font-semibold text-xl py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
    >
      Categories
    </Link>
  </li>
  <li>
    <Link 
      to="/authors" 
      className="inline-block bg-blue-500 text-white font-semibold text-xl py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
    >
      Authors
    </Link>
  </li>
  <li>
    <Link 
      to="/InstagramPosts" 
      className="inline-block bg-blue-500 text-white font-semibold text-xl py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
    >
      Instagram Posts
    </Link>
  </li>
  <li>
    <Link 
      to="/tags" 
      className="inline-block bg-blue-500 text-white font-semibold text-xl py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
    >
      Tags
    </Link>
  </li>
  <li>
    <Link 
      to="/users" 
      className="inline-block bg-blue-500 text-white font-semibold text-xl py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
    >
      Users
    </Link>
  </li>
  <li>
    <Link 
      to="/comments" 
      className="inline-block bg-blue-500 text-white font-semibold text-xl py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
    >
      Comments
    </Link>
  </li>
  <li>
    <Link 
      to="/likes" 
      className="inline-block bg-blue-500 text-white font-semibold text-xl py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
    >
      Likes
    </Link>
  </li>

</ul>

          </nav>
          <Routes>
            <Route path="/" element={<BlogPosts />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/users" element={<Users />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/likes" element={<Likes />} />
            <Route path="/InstagramPosts" element={<InstagramPosts />} /> {/* Add route for Instagram Posts */}
          </Routes>
        </div>
      </Router>
    </GlobalStateProvider>
  );
};

export default App;
