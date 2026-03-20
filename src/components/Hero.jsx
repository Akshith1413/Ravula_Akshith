import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Torus, Sphere, RoundedBox, Cone, Ring, TorusKnot } from '@react-three/drei';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const FloatingShapes = () => {
  const torusRef = useRef();
  const sphereRef = useRef();
  const boxRef = useRef();
  const coneRef = useRef();
  const ringRef = useRef();
  const knotRef = useRef();
  const [hoveredShape, setHoveredShape] = useState(null);
  const [initialPositions] = useState({
    torus: { x: -10, y: 2, z: -5 },
    sphere: { x: 10, y: -1, z: -7 },
    box: { x: -8, y: 3, z: -10 },
    cone: { x: 12, y: 0, z: -8 },
    ring: { x: -12, y: -2, z: -6 },
    knot: { x: 8, y: -3, z: -12 }
  });

  useEffect(() => {
    gsap.to(torusRef.current.position, {
      x: -4,
      duration: 2,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.to(sphereRef.current.position, {
      x: 3,
      duration: 2,
      delay: 0.2,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.to(boxRef.current.position, {
      x: 0,
      duration: 2,
      delay: 0.4,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.to(coneRef.current.position, {
      x: 5,
      duration: 2,
      delay: 0.6,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.to(ringRef.current.position, {
      x: -5,
      duration: 2,
      delay: 0.8,
      ease: "elastic.out(1, 0.5)"
    });
    gsap.to(knotRef.current.position, {
      x: 0,
      duration: 2,
      delay: 1,
      ease: "elastic.out(1, 0.5)"
    });
  }, []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.2;
      torusRef.current.rotation.y = time * 0.3;
    }
    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(time * 0.5) * 0.5;
    }
    if (boxRef.current) {
      boxRef.current.rotation.z = time * 0.4;
    }
    if (coneRef.current) {
      coneRef.current.rotation.x = time * 0.3;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y = time * 0.2;
    }
    if (knotRef.current) {
      knotRef.current.rotation.x = time * 0.1;
      knotRef.current.rotation.y = time * 0.15;
    }
  });

  const handleShapeHover = (shape) => {
    setHoveredShape(shape);
    const shapeRef = {
      torus: torusRef,
      sphere: sphereRef,
      box: boxRef,
      cone: coneRef,
      ring: ringRef,
      knot: knotRef
    }[shape];
    
    if (shapeRef.current) {
      gsap.to(shapeRef.current.scale, {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: 0.3,
      });
    }
  };

  const handleShapeLeave = () => {
    if (hoveredShape) {
      const shapeRef = {
        torus: torusRef,
        sphere: sphereRef,
        box: boxRef,
        cone: coneRef,
        ring: ringRef,
        knot: knotRef
      }[hoveredShape];
      
      if (shapeRef.current) {
        gsap.to(shapeRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
        });
      }
    }
    setHoveredShape(null);
  };

  return (
    <>
      <Torus
        ref={torusRef}
        args={[1.2, 0.4, 16, 32]}
        position={[initialPositions.torus.x, initialPositions.torus.y, initialPositions.torus.z]}
        rotation={[Math.PI / 3, Math.PI / 3, 0]}
        onPointerOver={() => handleShapeHover('torus')}
        onPointerOut={handleShapeLeave}
      >
        <meshPhongMaterial 
          color={hoveredShape === 'torus' ? "#ff00ff" : "#06b6d4"} 
          emissive={hoveredShape === 'torus' ? "#ff00ff" : "#06b6d4"} 
          emissiveIntensity={0.8} 
          wireframe 
        />
      </Torus>

      <Sphere
        ref={sphereRef}
        args={[1.5, 32, 32]}
        position={[initialPositions.sphere.x, initialPositions.sphere.y, initialPositions.sphere.z]}
        onPointerOver={() => handleShapeHover('sphere')}
        onPointerOut={handleShapeLeave}
      >
        <meshStandardMaterial 
          color={hoveredShape === 'sphere' ? "#00ffcc" : "#3b82f6"} 
          transparent 
          opacity={0.8} 
          roughness={0.2} 
          metalness={hoveredShape === 'sphere' ? 1 : 0.7} 
        />
      </Sphere>

      <RoundedBox
        ref={boxRef}
        args={[2, 2, 2]}
        radius={0.2}
        smoothness={10}
        position={[initialPositions.box.x, initialPositions.box.y, initialPositions.box.z]}
        onPointerOver={() => handleShapeHover('box')}
        onPointerOut={handleShapeLeave}
      >
        <meshPhongMaterial 
          color={hoveredShape === 'box' ? "#ffcc00" : "#8b5cf6"} 
          emissive={hoveredShape === 'box' ? "#ffcc00" : "#8b5cf6"} 
          emissiveIntensity={0.5} 
          wireframe={hoveredShape !== 'box'}
        />
      </RoundedBox>

      <Cone
        ref={coneRef}
        args={[1, 2, 32]}
        position={[initialPositions.cone.x, initialPositions.cone.y, initialPositions.cone.z]}
        rotation={[Math.PI / 4, 0, Math.PI / 4]}
        onPointerOver={() => handleShapeHover('cone')}
        onPointerOut={handleShapeLeave}
      >
        <meshStandardMaterial 
          color={hoveredShape === 'cone' ? "#ff6600" : "#10b981"} 
          metalness={0.9}
          roughness={0.1}
        />
      </Cone>

      <Ring
        ref={ringRef}
        args={[1, 1.5, 32]}
        position={[initialPositions.ring.x, initialPositions.ring.y, initialPositions.ring.z]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={() => handleShapeHover('ring')}
        onPointerOut={handleShapeLeave}
      >
        <meshPhongMaterial 
          color={hoveredShape === 'ring' ? "#ff0066" : "#ec4899"} 
          emissive={hoveredShape === 'ring' ? "#ff0066" : "#ec4899"} 
          emissiveIntensity={0.6}
        />
      </Ring>

      <TorusKnot
        ref={knotRef}
        args={[1, 0.4, 128, 32]}
        position={[initialPositions.knot.x, initialPositions.knot.y, initialPositions.knot.z]}
        onPointerOver={() => handleShapeHover('knot')}
        onPointerOut={handleShapeLeave}
      >
        <meshStandardMaterial 
          color={hoveredShape === 'knot' ? "#00ff88" : "#6366f1"} 
          metalness={0.8}
          roughness={0.2}
        />
      </TorusKnot>
    </>
  );
};

const AnimatedText = ({ text, delay = 0 }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.04 * i + delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      style={{ display: "flex", overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index}>
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

const SkillTag = ({ children }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="px-4 py-2 rounded-full text-sm font-medium cursor-default"
      style={{
        background: isHovered 
          ? "linear-gradient(90deg, #3b82f6, #8b5cf6)" 
          : "rgba(255, 255, 255, 0.1)",
        color: isHovered ? "white" : "#e2e8f0",
        border: isHovered ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
      }}
      whileHover={{ 
        scale: 1.1,
        y: -3,
        transition: { duration: 0.2 }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </motion.div>
  );
};

const Hero = () => {
  const heroRef = useRef();
  const titleRef = useRef();
  const subtitleRef = useRef();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentWord, setCurrentWord] = useState(0);
  
  const words = ["Developer", "Designer", "Engineer", "Creator"];
  const skills = [
    "Full Stack", "React", "Node.js", "MongoDB", 
    "Flutter", "Android", "IoT", "Embedded",
    "UI/UX", "C/C++", "Java", "Python"
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.from(titleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: "power3.out",
    });

    gsap.from(subtitleRef.current, {
      opacity: 0,
      y: 30,
      duration: 1.5,
      delay: 0.3,
      ease: "elastic.out(1, 0.5)",
    });

    gsap.to(heroRef.current, {
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
      opacity: 0.5,
      y: 100,
    });
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800"
      id="home"
    >
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
          <FloatingShapes />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center pb-12 pt-16">
        
        <motion.div 
          className="text-xl md:text-3xl font-light text-cyan-100/80 mb-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <AnimatedText text="Hello, I'm" delay={0.2} />
        </motion.div>

        <h1 
          ref={titleRef}
          className="text-6xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-blue-500 mb-4 pt-2 pb-4 pr-2"
          style={{
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 10}px)`,
          }}
        >
          Ravula Akshith
        </h1>

        <div className="h-24 md:h-32 overflow-hidden relative mb-6 flex items-center justify-center w-full z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWord}
              className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-pink-500 py-2 leading-normal selection:bg-purple-500/30 relative z-20"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {words[currentWord]}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-purple-100/90 max-w-2xl mx-auto mb-8 font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Crafting digital experiences that blend innovation with functionality
        </motion.p>

        <motion.div 
          className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          {skills.map((skill, index) => (
            <SkillTag key={index}>{skill}</SkillTag>
          ))}
        </motion.div>

        <motion.a
          href="#contact"
          className="relative inline-flex items-center justify-center px-12 py-5 rounded-full font-bold text-xl overflow-hidden group mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full"></span>
          <span className="absolute inset-0.5 bg-gray-900 rounded-full"></span>
          <span className="relative z-10 text-white group-hover:text-white transition-colors duration-300">
            Hire Me
          </span>
        </motion.a>

        <motion.div 
          className="absolute bottom-5 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-2 bg-white rounded-full mt-1"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;