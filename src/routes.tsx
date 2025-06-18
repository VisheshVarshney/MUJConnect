import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import LandingV2 from './pages/LandingV2';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import EmailChange from './pages/EmailChange';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Search from './pages/Search';
import AdminPanel from './pages/AdminPanel';
import PostDetails from './pages/PostDetails';
import MUJMenus from './pages/MUJMenus';
import RestaurantMenu from './pages/RestaurantMenu';
import CarRental from './pages/CarRental';
import SessionCheck from './components/SessionCheck';
import ProtectedRoute from './components/ProtectedRoute';
import PostFull from './pages/PostFull';
import AboutUs from './pages/AboutUs';

export default function AppRoutes() {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<SessionCheck><LandingV2 /></SessionCheck>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-change" element={<EmailChange />} />
          <Route element={<Layout />}>
            <Route path="/feed" element={<SessionCheck><Feed /></SessionCheck>} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/post/:id" element={<PostFull />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/search" element={<Search />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
            <Route path="/muj-menus" element={<MUJMenus />} />
            <Route path="/menu/:id" element={<RestaurantMenu />} />
            <Route path="/car-rental" element={<CarRental />} />
            <Route path="/about" element={<AboutUs />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
} 