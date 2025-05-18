import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock, BarChart, Github, Linkedin, Mail, Globe, Code, Cpu, Database, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Shield,
    title: 'Secure System',
    description: 'Multi-level security system with role-based access control'
  },
  {
    icon: Clock,
    title: 'Real-time Processing',
    description: 'Instant toll transaction processing and receipt generation'
  },
  {
    icon: BarChart,
    title: 'Advanced Analytics',
    description: 'Comprehensive reporting and analytics dashboard'
  }
];

const technologies = [
  { icon: Code, name: 'React & TypeScript', color: 'text-blue-500' },
  { icon: Database, name: 'Supabase', color: 'text-green-500' },
  { icon: Server, name: 'Node.js', color: 'text-yellow-500' },
  { icon: Cpu, name: 'Modern Stack', color: 'text-purple-500' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-20 pb-16 text-center lg:pt-32 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,0.8),rgba(0,0,0,0.8))]"></div>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(45deg, #00f2fe 0%, #4facfe 100%)',
              filter: 'blur(100px)'
            }}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400"
            >
              Toll Tax <span className="text-white">Management System</span>
            </motion.h1>
            
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Streamline your toll operations with our advanced management system powered by cutting-edge technology
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/login"
                className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
              >
                Get Started 
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-16 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-colors duration-300"
              >
                <feature.icon className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Technologies Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-16 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold text-center mb-12 text-white"
          >
            Powered by Modern Technology
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700"
              >
                <tech.icon className={`h-10 w-10 ${tech.color} mb-4`} />
                <h3 className="text-lg font-semibold text-white">{tech.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Developer Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
        className="py-16 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-white">Meet the Developer</h2>
            <p className="text-gray-400">Crafted with passion and expertise</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-xl border border-gray-700 max-w-2xl mx-auto"
          >
            <div className="flex flex-col items-center">
              <img
                src="https://res.cloudinary.com/dcvmvxbyf/image/upload/v1738144941/vishesh.png"
                alt="Vishesh Varshney"
                className="w-32 h-32 rounded-full border-4 border-blue-500 mb-6"
              />
              <h3 className="text-2xl font-bold text-white mb-2">Vishesh Varshney</h3>
              <p className="text-blue-400 mb-4">Full Stack Developer</p>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                Passionate about creating efficient and scalable solutions using cutting-edge technologies.
                Specialized in building modern web applications with React, Node.js, and cloud technologies.
              </p>
              
              <div className="flex space-x-4">
                <motion.a
                  href="https://github.com/visheshvarshney"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                >
                  <Github className="h-6 w-6 text-white" />
                </motion.a>
                <motion.a
                  href="https://linkedin.com/in/visheshvarshney-muj"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                >
                  <Linkedin className="h-6 w-6 text-white" />
                </motion.a>
                <motion.a
                  href="mailto:varshneyvisheshin@gmail.com"
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                >
                  <Mail className="h-6 w-6 text-white" />
                </motion.a>
                <motion.a
                  href="https://vishesh.bio"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                >
                  <Globe className="h-6 w-6 text-white" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-400">
        <p>© 2025 TTMS. All rights reserved.</p>
      </footer>
    </div>
  );
};