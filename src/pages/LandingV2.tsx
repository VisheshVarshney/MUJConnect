import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Shield, MessageCircle, Users, ChevronRight, ArrowRight, Sparkles, Code, Zap } from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

// Wrap text in spans for letter animation
const AnimatedText = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
  };

  return (
    <motion.h1
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block">
          {Array.from(word).map((letter, letterIndex) => (
            <motion.span key={letterIndex} variants={child}>
              {letter}
            </motion.span>
          ))}
          &nbsp;
        </span>
      ))}
    </motion.h1>
  );
};

// Parallax text component
const ParallaxText = ({ children, baseVelocity = 100 }: { children: React.ReactNode; baseVelocity?: number }) => {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="parallax">
      <motion.div className="scroller" style={{ x }}>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
      </motion.div>
    </div>
  );
};

// Utility function for parallax text
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export default function LandingV2() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -200]);
  const y3 = useTransform(scrollY, [0, 3000], [0, 300]);

  // Intersection observer hooks for each section
  const [heroRef, heroInView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const [featuresRef, featuresInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [statsRef, statsInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const [ctaRef, ctaInView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });

  // Particle initialization
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0B1120] via-[#0F172A] to-[#0B1120] text-white overflow-hidden">
      {/* Background Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 100, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            opacity: {
              value: 0.5,
              random: true,
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.1,
                sync: false
              }
            },
            size: {
              value: 3,
              random: true,
              animation: {
                enable: true,
                speed: 2,
                minimumValue: 0.1,
                sync: false
              }
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: true,
              straight: false,
              outModes: { default: "out" },
            }
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" }
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
              push: { particles_nb: 4 }
            }
          }
        }}
        className="fixed inset-0 pointer-events-none"
      />

      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-900/30 via-blue-900/10 to-black pointer-events-none no-scrollbar overflow-hidden" />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center relative snap-start no-scrollbar overflow-hidden"
      >
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center"
          >
            <AnimatedText
              text="MUJ's Own Social Place"
              className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 whitespace-normal text-center"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 1.5 }}
              className="text-xl md:text-2xl text-blue-200 mb-8"
            >
              Experience social networking like never before
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 2 }}
              className="flex justify-center"
            >
              <Link
                to="/register"
                className="group relative text-lg font-medium text-white/80 hover:text-white transition-colors"
              >
                <span className="relative z-10">Get Started</span>
                <motion.div
                  className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  layoutId="glow"
                />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="min-h-screen py-32 relative snap-start"
      >
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Salient Features
            </h2>
            <p className="text-xl text-blue-200">
              Discover what makes us different
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Supports anonymous posting! Confess or report ;)"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized performance for instant interactions"
              },
              {
                icon: Sparkles,
                title: "AI-Powered",
                description: "A advanced chatbot for all your foodie-needs"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group relative p-8 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 mb-6 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 shadow-lg"
                >
                  <feature.icon className="w-full h-full" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl -z-10"
                  initial={false}
                  whileHover={{ scale: 1.05 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Parallax */}
      <section ref={statsRef} className="min-h-screen py-32 relative snap-start">
        <div className="relative">
          <ParallaxText baseVelocity={-5}>
            INNOVATIVE • SECURE • CONNECTED • POWERFUL •
          </ParallaxText>
          <ParallaxText baseVelocity={5}>
            FAST • RELIABLE • MODERN • SCALABLE •
          </ParallaxText>
        </div>

        <div className="container mx-auto px-4 mt-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={statsInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
            { value: "100%", label: "Anonymous" },
            { value: "AI", label: "Enabled" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  {stat.value}
                </div>
                <div className="text-blue-200 mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="min-h-screen flex items-center justify-center relative py-32 snap-start"
      >
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
              Join the MUJ users who are already experiencing the future of social networking.
            </p>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={ctaInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6"
            >
              <Link
                to="/register"
                className="group relative text-lg font-medium text-white/80 hover:text-white transition-colors"
              >
                <span className="relative z-10">Create Account</span>
                <motion.div
                  className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  layoutId="glow"
                />
              </Link>
              <Link
                to="/login"
                className="text-lg font-medium text-white/60 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 MUJ Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}