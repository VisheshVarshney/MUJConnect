import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import MUJMenus from './pages/MUJMenus';
import RestaurantMenu from './pages/RestaurantMenu';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route element={<Layout />}>
            <Route path="/feed" element={<Feed />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            <Route path="/muj-menus" element={<MUJMenus />} />
            <Route path="/menu/:id" element={<RestaurantMenu />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;