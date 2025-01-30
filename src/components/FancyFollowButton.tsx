import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FancyFollowButtonProps {
  isFollowing: boolean;
  onToggleFollow: () => Promise<void>;
  disabled?: boolean;
}

export default function FancyFollowButton({ isFollowing, onToggleFollow, disabled = false }: FancyFollowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [buttonText, setButtonText] = useState(isFollowing ? 'Following' : 'Follow');

  useEffect(() => {
    setButtonText(isFollowing ? 'Following' : 'Follow');
  }, [isFollowing]);

  return (
    <motion.button
      onHoverStart={() => {
        setIsHovered(true);
        if (isFollowing) {
          setButtonText('Unfollow');
        }
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        if (isFollowing) {
          setButtonText('Following');
        }
      }}
      onClick={onToggleFollow}
      disabled={disabled}
      className={`
        relative px-6 py-2 rounded-full font-medium transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isFollowing 
          ? isHovered
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          : 'bg-blue-500 text-white hover:bg-blue-600'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{buttonText}</span>
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
        initial={false}
        animate={{
          opacity: isFollowing ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}