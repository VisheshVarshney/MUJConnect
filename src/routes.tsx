import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import LandingV2 from './pages/LandingV2';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import EmailChange from './pages/EmailChange';
import Feed from './pages/Feed';
import FeedV2 from './pages/FeedV2';
import Profile from './pages/Profile';
import Search from './pages/Search';
import AdminPanel from './pages/AdminPanel';
import PostDetails from './pages/PostDetails';
import MUJMenus from './pages/MUJMenus';
import RestaurantMenu from './pages/RestaurantMenu';
import CarRental from './pages/CarRental';
import SessionCheck from './components/SessionCheck';
import ProtectedRoute from './components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/v1" element={<><SessionCheck /><Landing /></>} />
          <Route path="/" element={<><SessionCheck /><LandingV2 /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-change" element={<EmailChange />} />
          <Route element={<Layout />}>
            <Route path="/feed" element={<><SessionCheck /><Feed /></>} />
            <Route path="/feed-v2" element={<><SessionCheck /><FeedV2 /></>} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/post/:id" element={<PostDetails />} />
            </Route>
            <Route path="/muj-menus" element={<MUJMenus />} />
            <Route path="/menu/:id" element={<RestaurantMenu />} />
            <Route path="/car-rental" element={<CarRental />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <Toaster position="bottom-right" />
    </>
  );
} 