import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { Shield, MessageCircle, Users, Code, ChevronRight } from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

export default function Landing() {
  // Particle initialization
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  // Intersection observer hooks for each section
  const [heroRef, heroInView] = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const [aboutRef, aboutInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const [devsRef, devsInView] = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.5, triggerOnce: true });

  // Spring animations for sections
  const heroSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: {
      opacity: heroInView ? 1 : 0,
      transform: heroInView ? 'translateY(0px)' : 'translateY(50px)',
    },
    config: { tension: 280, friction: 20 },
  });

  const aboutSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: {
      opacity: aboutInView ? 1 : 0,
      transform: aboutInView ? 'translateY(0px)' : 'translateY(50px)',
    },
    config: { tension: 280, friction: 20 },
  });

  const devsSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: {
      opacity: devsInView ? 1 : 0,
      transform: devsInView ? 'translateY(0px)' : 'translateY(50px)',
    },
    config: { tension: 280, friction: 20 },
  });

  const ctaSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(50px)' },
    to: {
      opacity: ctaInView ? 1 : 0,
      transform: ctaInView ? 'translateY(0px)' : 'translateY(50px)',
    },
    config: { tension: 280, friction: 20 },
  });

  // Card hover animation
  const [cardProps, setCardProps] = useSpring(() => ({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  const calc = (x: number, y: number, rect: DOMRect) => [
    -(y - rect.top - rect.height / 2) / 20,
    (x - rect.left - rect.width / 2) / 20,
    1.1,
  ];

  const trans = (x: number, y: number, s: number) =>
    `perspective(1000px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white overflow-hidden">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#ffffff' },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            move: {
              enable: true,
              speed: 3,
              direction: 'none',
              random: true,
              straight: false,
              outModes: { default: 'out' },
            },
            links: {
              enable: true,
              distance: 150,
              color: '#ffffff',
              opacity: 0.4,
              width: 1,
            },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'grab' },
              onClick: { enable: true, mode: 'push' },
            },
            modes: {
              grab: { distance: 140, links: { opacity: 1 } },
              push: { quantity: 4 },
            },
          },
        }}
        className="absolute inset-0"
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center snap-start"
      >
        <animated.div style={heroSpring} className="text-center z-10">
          <h1 className="text-7xl md:text-9xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            MUJ Connect
          </h1>
          <p className="text-xl md:text-2xl text-blue-200">
            Your Anonymous Social Space
          </p>
        </animated.div>
      </section>

      {/* About Section */}
      <section
        ref={aboutRef}
        className="min-h-screen flex items-center justify-center snap-start"
      >
        <animated.div style={aboutSpring} className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            What is MUJ Connect?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Anonymous Posting',
                desc: 'Share freely without revealing your identity',
              },
              {
                icon: MessageCircle,
                title: 'Interactive Comments',
                desc: 'Engage in meaningful discussions',
              },
              {
                icon: Users,
                title: 'Community Driven',
                desc: 'Built by students, for students',
              },
            ].map((feature, index) => (
              <animated.div
                key={index}
                className="group relative p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-colors duration-300"
                onMouseMove={({ clientX, clientY, currentTarget }) => {
                  const rect = currentTarget.getBoundingClientRect();
                  setCardProps.start({
                    transform: trans(...calc(clientX, clientY, rect)),
                  });
                }}
                onMouseLeave={() =>
                  setCardProps.start({ transform: trans(0, 0, 1) })
                }
                style={cardProps}
              >
                <feature.icon className="w-12 h-12 mb-4 text-blue-400" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-blue-200">{feature.desc}</p>
              </animated.div>
            ))}
          </div>
        </animated.div>
      </section>

      {/* Developers Section */}
      <section
        ref={devsRef}
        className="min-h-screen flex items-center justify-center snap-start"
      >
        <animated.div style={devsSpring} className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Meet the Developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                name: 'Vishesh Varshney',
                role: 'Main Developer',
                desc: 'Website Design and Implementation',
                image:'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1738144940/vishesh.png',
              },
              {
                name: 'Harshit Raj',
                role: 'Co-Developer',
                desc: 'Dataset Collection and AI Training',
                image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1738144940/harshit.png',
              },
            ].map((dev, index) => (
              <animated.div
                key={index}
                className="group relative p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-colors duration-300"
                onMouseMove={({ clientX, clientY, currentTarget }) => {
                  const rect = currentTarget.getBoundingClientRect();
                  setCardProps.start({
                    transform: trans(...calc(clientX, clientY, rect)),
                  });
                }}
                onMouseLeave={() =>
                  setCardProps.start({ transform: trans(0, 0, 1) })
                }
                style={cardProps}
              >
                <img
                  src={dev.image}
                  alt={dev.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-center">
                  {dev.name}
                </h3>
                <p className="text-blue-300 text-center">{dev.role}</p>
                <p className="mt-4 text-center text-blue-200">{dev.desc}</p>
              </animated.div>
            ))}
          </div>
        </animated.div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="min-h-screen flex items-center justify-center snap-start"
      >
        <animated.div style={ctaSpring} className="text-center z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Step into the world of MUJ Connect
          </h2>
          <div className="space-y-4">
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Get Started <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <p className="text-blue-200">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </animated.div>
      </section>
    </div>
  );
}
