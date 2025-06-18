import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Info, AlertTriangle, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-amoled" style={{ scrollSnapType: 'none', scrollSnapAlign: 'none' }}>
      {/* Hero Section */}
      <div className="relative h-[220px] md:h-[260px] bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
            About Us
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Learn more about the MUJ Connect platform, our mission, and the team behind it.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* About Section */}
        <section className="space-y-6" style={{ scrollSnapAlign: 'none' }}>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300">
              MUJ Connect is an independent social platform created by students, for students. While we serve the Manipal University Jaipur community, we want to clarify that we are not officially affiliated with, endorsed by, or connected to Manipal University Jaipur in any official capacity.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              This platform was developed as a Third Year Minor Project at Manipal University Jaipur, with the goal of creating a dedicated space for MUJ students to connect, share, and engage with their peers.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mt-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                All rights reserved. The MUJ Connect name, logo, and content are protected under applicable intellectual property laws. Any unauthorized use, reproduction, or distribution is prohibited.
              </p>
            </div>
          </div>
        </section>

        {/* Rules Section */}
        <section className="space-y-6" style={{ scrollSnapAlign: 'none' }}>
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Guidelines</h2>
          </div>
          <div className="grid gap-6">
            <div className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Content Moderation Rules
              </h3>
              <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>No profanity or inappropriate language that could offend or harm others.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 font-bold">•</span>
                  <span>Commercial promotions and self-advertisements are prohibited. However, academic collaborations and genuine questions are welcome.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Zero tolerance for hate speech, discriminatory content, or any form of harassment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>Respect privacy and confidentiality. Do not share personal information without consent.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span>Keep discussions constructive and relevant to the MUJ community.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Developers Section */}
        <section className="space-y-6" style={{ scrollSnapAlign: 'none' }}>
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-8 h-8 text-green-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meet the Team</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Vishesh Card */}
            <motion.div 
              className="bg-white dark:bg-amoled-light rounded-xl p-6 shadow-sm"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-amoled mb-4 overflow-hidden">
                  <img
                    src="https://res.cloudinary.com/dcvmvxbyf/image/upload/0492719d-0340-4fdf-96f4-9e0d73fe03bb.png"
                    alt="Vishesh Varshney"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vishesh Varshney</h3>
                <p className="text-blue-500 font-medium mb-2">Head Developer & Product Design</p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  A passionate developer and machine learning, deep learning, web development, and AI enthusiast pursuing B.Tech in Computer Science at Manipal University Jaipur. Leading the development and design of MUJ Connect with a focus on creating seamless user experiences. Heading the programming team of MUJ Connect.
                </p>
                <div className="flex space-x-4">
                  <a href="https://github.com/visheshvarshney" target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-amoled hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </a>
                  <a href="https://linkedin.com/in/visheshvarshney" target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-amoled hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <Linkedin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Harshit Card */}
            <motion.div 
              className="bg-white dark:bg-amoled-light rounded-xl p-6 shadow-sm"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-amoled mb-4 overflow-hidden">
                  {/* Add image here */}
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-500"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Harshit Raj</h3>
                <p className="text-green-500 font-medium mb-2">Assistant Developer</p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  An innovative developer pursuing B.Tech in Computer Science at Manipal University Jaipur. Contributing to MUJ Connect's on field data collection with a keen eye for performance optimization.
                </p>
                <div className="flex space-x-4">
                  <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-amoled hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </a>
                  <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-amoled hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <Linkedin className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
} 