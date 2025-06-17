import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { UserPlus, Plus, User } from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);
  const [carousel, setCarousel] = useState<string[]>([]); // 5 avatars in carousel order
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [dragX, setDragX] = useState(0);
  const navigate = useNavigate();
  const glowTimeout = useRef<NodeJS.Timeout | null>(null);
  const controls = useAnimation();

  // Particle initialization
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  React.useEffect(() => {
    // Generate 5 random DiceBear avatars
    const styles = ['adventurer-neutral', 'micah', 'bottts', 'identicon', 'avataaars'];
    const avatars = Array.from({ length: 5 }).map((_, i) =>
      `https://api.dicebear.com/7.x/${styles[i % styles.length]}/svg?seed=${Math.random().toString(36).substring(2, 10)}`
    );
    setAvatarOptions(avatars);
    setCarousel(avatars);
  }, []);

  // Helper to rotate carousel left/right
  const rotate = (arr: string[], n: number) => arr.slice(n).concat(arr.slice(0, n));

  // Click handler for avatars
  const handleAvatarClick = (idx: number) => {
    if (idx === 2) return; // already center
    setIsSliding(true);
    // REVERSED: left click = rotate left, right click = rotate right
    let newCarousel;
    if (idx < 2) {
      // Clicked left, rotate left
      newCarousel = rotate(carousel, idx - 2);
    } else {
      // Clicked right, rotate right
      newCarousel = rotate(carousel, idx - 2);
    }
    setCarousel(newCarousel);
    if (glowTimeout.current) clearTimeout(glowTimeout.current);
    glowTimeout.current = setTimeout(() => setIsSliding(false), 400);
  };

  // Custom avatar upload always replaces center
  const handleCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCustomAvatar(reader.result as string);
      setIsSliding(true);
      setTimeout(() => setIsSliding(false), 400);
    };
    reader.readAsDataURL(file);
  };

  // Get avatar for a given position (0: far left, 1: left, 2: center, 3: right, 4: far right)
  const getAvatar = (pos: number) => {
    if (pos === 2 && customAvatar) return customAvatar;
    return carousel[pos] || '';
  };

  // Drag handlers
  const handleDrag = (event: any, info: { offset: { x: number } }) => {
    setDragX(info.offset.x);
  };
  const handleDragEnd = (event: any, info: { offset: { x: number } }) => {
    const threshold = 40; // px
    if (info.offset.x > threshold) {
      // Dragged right, rotate left
      setCarousel(rotate(carousel, -1));
      setIsSliding(true);
      setTimeout(() => setIsSliding(false), 400);
    } else if (info.offset.x < -threshold) {
      // Dragged left, rotate right
      setCarousel(rotate(carousel, 1));
      setIsSliding(true);
      setTimeout(() => setIsSliding(false), 400);
    }
    setDragX(0);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;
      if (!user) throw new Error('Registration failed');

      let avatarUrl = getAvatar(2);
      // If custom avatar, upload to storage
      if (customAvatar && 2 === 2) {
        setUploading(true);
        const fileName = `${user.id}/${Date.now()}.png`;
        const res = await fetch(customAvatar);
        const blob = await res.blob();
        const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = publicUrl;
        setUploading(false);
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
      });
      if (profileError) throw profileError;
      toast.success('Registration successful!');
      navigate('/feed');
    } catch (error: any) {
      toast.error(error.message);
      setUploading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const containerVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#0B1120] flex items-center justify-center p-4"
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "out" },
            },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
              push: { particles_nb: 4 },
            },
          },
        }}
        className="fixed inset-0 pointer-events-none"
      />

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/20"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-blue-200">Join MUJ Connect today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80">Full Name</label>
            <motion.input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80">Username</label>
            <motion.input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80">Email</label>
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80">Password</label>
            <motion.input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/50"
              required
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
          </div>

          <div className="flex flex-col items-center mb-6">
            <label className="block text-sm font-medium text-white/80 mb-2">Choose your avatar</label>
            <motion.div
              className="relative flex items-center justify-center gap-2"
              style={{ minHeight: 72, cursor: 'grab' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              animate={controls}
            >
              {[0, 1, 2, 3, 4].map((pos) => {
                // Sizes: 32, 48, 64, 48, 32
                let size = 32, opacity = 0.7, z = 1;
                if (pos === 1 || pos === 3) { size = 48; opacity = 0.85; z = 2; }
                if (pos === 2) { size = 64; opacity = 1; z = 3; }
                // Center avatar is upload/select
                if (pos === 2) {
                  return (
                    <motion.label
                      key={pos}
                      layout
                      initial={false}
                      animate={{ zIndex: z, opacity, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className={`relative rounded-full border-4 flex-shrink-0 cursor-pointer transition-all bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${isSliding ? 'ring-0' : 'ring-4 ring-green-400/80 animate-pulse'}`}
                      style={{ width: size, height: size, zIndex: z }}
                      tabIndex={0}
                      aria-label="Upload custom avatar"
                    >
                      {customAvatar ? (
                        <img src={customAvatar} alt="Custom avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <img src={getAvatar(2)} alt="avatar" className="w-full h-full rounded-full object-cover" />
                      )}
                      {/* Upload icon overlay if not custom */}
                      {!customAvatar && (
                        <span className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-1">
                          <Plus className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleCustomAvatar}
                      />
                    </motion.label>
                  );
                }
                // Side avatars
                return (
                  <motion.button
                    type="button"
                    key={pos}
                    layout
                    initial={false}
                    animate={{ zIndex: z, opacity, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`rounded-full border-2 border-transparent bg-white dark:bg-gray-800 flex-shrink-0 transition-all ${pos === 2 ? 'ring-4 ring-green-400/80' : ''}`}
                    style={{ width: size, height: size, zIndex: z }}
                    onClick={() => handleAvatarClick(pos)}
                    tabIndex={0}
                    aria-label={`Select avatar ${pos}`}
                  >
                    <img src={getAvatar(pos)} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  </motion.button>
                );
              })}
            </motion.div>
            <p className="text-xs text-white/60 mt-1">You can choose a default avatar or upload your own.</p>
          </div>

          <motion.button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Up
          </motion.button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}