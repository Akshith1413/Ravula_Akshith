import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const OrbitingNode = ({ index }) => {
  const meshRef = useRef();
  const speed = 0.1 + Math.random() * 0.15; // Decreased speed significantly
  const radius = 6 + Math.random() * 5;
  const angleOffset = Math.random() * Math.PI * 2;
  const axis = useMemo(() => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    const x = Math.cos(t + angleOffset) * radius;
    const y = Math.sin(t + angleOffset) * radius;
    
    // Spin around an arbitrary axis smoothly
    const pos = new THREE.Vector3(x, y, 0);
    pos.applyAxisAngle(axis, t * 0.2);
    
    if (meshRef.current) {
        meshRef.current.position.copy(pos);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#fff" emissive={index % 2 === 0 ? "#06b6d4" : "#d946ef"} emissiveIntensity={5} toneMapped={false} />
      <pointLight color={index % 2 === 0 ? "#06b6d4" : "#d946ef"} intensity={2} distance={8} />
    </mesh>
  );
};

const QuantumCore = ({ mousePos }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Convert screen pixel pos to normalized -1 to 1 safely
    const normalizedMouseX = mousePos?.x ? (mousePos.x / window.innerWidth) * 2 - 1 : 0;
    const normalizedMouseY = mousePos?.y ? -(mousePos.y / window.innerHeight) * 2 + 1 : 0;

    if (groupRef.current) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, normalizedMouseY * 0.5, 0.05);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, normalizedMouseX * 0.5 + t * 0.1, 0.05);
        
        const scale = 1 + Math.sin(t * 1.5) * 0.05;
        groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer shell */}
      <mesh>
        <icosahedronGeometry args={[4.5, 2]} />
        <meshBasicMaterial color="#d946ef" wireframe transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* Middle complex shell */}
      <mesh>
        <octahedronGeometry args={[3.5, 3]} />
        <meshStandardMaterial color="#8b5cf6" wireframe transparent opacity={0.25} emissive="#8b5cf6" emissiveIntensity={1} />
      </mesh>

      {/* Orbiting particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <OrbitingNode key={i} index={i} />
      ))}
    </group>
  );
};

const BackgroundScene = ({ mousePos }) => {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ antialias: false, alpha: true }}>
      <ambientLight intensity={0.2} />
      
      {/* Dynamic Starfield / Sparkles */}
      <Sparkles count={1500} scale={25} size={1.5} speed={0.4} opacity={0.3} color="#d946ef" />
      <Sparkles count={1000} scale={30} size={2} speed={0.5} opacity={0.2} color="#06b6d4" />
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <QuantumCore mousePos={mousePos} />
      </Float>
      
      {/* Distant nebular glowing spheres */}
      <Float speed={0.8} floatIntensity={2}>
        <mesh position={[-12, 6, -20]}>
          <sphereGeometry args={[6, 32, 32]} />
          <meshBasicMaterial color="#4c1d95" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
      </Float>
      <Float speed={1.2} floatIntensity={2}>
        <mesh position={[14, -8, -25]}>
          <sphereGeometry args={[8, 32, 32]} />
          <meshBasicMaterial color="#a21caf" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
        </mesh>
      </Float>
    </Canvas>
  );
};

const NeuralNetwork = () => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    
    const handleResize = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        resizeCanvas();
      });
    };
    
    window.addEventListener('resize', handleResize);

    // Initialize nodes
    const nodeCount = 30; // Reduced for better performance
    const initialNodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2, // Reduced speed
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 1.5 + 0.5, // Smaller nodes
      color: `hsla(${180 + Math.random() * 40}, 70%, 60%, 0.7)`
    }));
    setNodes(initialNodes);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      setNodes(prevNodes => {
        const updatedNodes = prevNodes.map(node => {
          let { x, y, vx, vy } = node;
          
          // Mouse attraction with reduced effect
          const dx = mousePos.current.x - x;
          const dy = mousePos.current.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) { // Reduced attraction radius
            vx += dx * 0.00003; // Reduced attraction force
            vy += dy * 0.00003;
          }
          
          // Apply velocity with damping
          x += vx;
          y += vy;
          vx *= 0.99;
          vy *= 0.99;
          
          // Bounce off edges
          if (x < 0 || x > canvas.width) vx *= -0.9;
          if (y < 0 || y > canvas.height) vy *= -0.9;
          
          // Bounds check
          x = Math.max(0, Math.min(canvas.width, x));
          y = Math.max(0, Math.min(canvas.height, y));
          
          return { ...node, x, y, vx, vy };
        });

        // Draw connections
        ctx.beginPath();
        for (let i = 0; i < updatedNodes.length; i++) {
          const node = updatedNodes[i];
          for (let j = i + 1; j < updatedNodes.length; j++) {
            const otherNode = updatedNodes[j];
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) { // Reduced connection distance
              const opacity = (1 - distance / 100) * 0.25; // Reduced opacity
              ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;
              ctx.lineWidth = 0.3; // Thinner lines
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              ctx.stroke();
            }
          }
        }

        // Draw nodes
        updatedNodes.forEach(node => {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.fill();
          
          // Reduced glow effect
          ctx.shadowBlur = 4;
          ctx.shadowColor = node.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        return updatedNodes;
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Start with a delay to reduce initial load
    setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.3 }} />;
};

const SkillOrbit = () => {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef(null);
  
  const skills = [
    { name: 'React', color: '#61DAFB', angle: 0 },
    { name: 'Node', color: '#8CC84B', angle: 60 },
    { name: 'Python', color: '#3776AB', angle: 120 },
    { name: 'IoT', color: '#FF6B6B', angle: 180 },
    { name: 'Flutter', color: '#02569B', angle: 240 },
    { name: 'Docker', color: '#2496ED', angle: 300 }
  ];

  useEffect(() => {
    let lastTime = 0;
    const animate = (currentTime) => {
      if (!lastTime) lastTime = currentTime;
      const delta = currentTime - lastTime;
      
      // Slower animation
      setRotation(prev => prev + delta * 0.02);
      lastTime = currentTime;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.5 }}>
      <div className="relative w-full h-full flex items-center justify-center">
        {skills.map((skill, i) => {
          const angle = (skill.angle + rotation) * (Math.PI / 180);
          const radius = 160 + Math.sin(rotation * 0.01 + i) * 20; // Reduced movement
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius * 0.6; // Reduced vertical stretch
          const scale = 0.7 + Math.sin(rotation * 0.02 + i) * 0.15; // Reduced scaling
          
          return (
            <div
              key={skill.name}
              className="absolute"
              style={{
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                willChange: 'transform'
              }}
            >
              <div className="relative">
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${skill.color}dd, ${skill.color}99)`,
                    boxShadow: `0 0 15px ${skill.color}80, inset 0 2px 8px rgba(255,255,255,0.2)`
                  }}
                >
                  {skill.name}
                </div>
                <div 
                  className="absolute inset-0 rounded-full opacity-30 blur-lg"
                  style={{ background: skill.color }}
                />
              </div>
            </div>
          );
        })}
        
        {/* Central pulse */}
        <div className="absolute w-3 h-3 rounded-full bg-cyan-400" style={{
          boxShadow: '0 0 15px #06b6d4, 0 0 30px #06b6d4',
          animation: 'pulse 3s ease-in-out infinite' // Slower pulse
        }} />
      </div>
    </div>
  );
};

const RippleEffect = ({ mouseX, mouseY }) => {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (mouseX === 0 && mouseY === 0) return;
    
    const newRipple = {
      id: Date.now(),
      x: mouseX,
      y: mouseY
    };
    
    setRipples(prev => [...prev.slice(-3), newRipple]); // Limit to 3 ripples
    
    const timer = setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1200); // Reduced duration
    
    return () => clearTimeout(timer);
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            animation: 'ripple 1.2s ease-out forwards'
          }}
        />
      ))}
    </div>
  );
};

const ProjectCard = ({ project, index }) => {
  const cardRef = useRef();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [isVisible, setIsVisible] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current || isFlipped) return;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    });
  }, [isFlipped]);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 50);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsHovered(false);
    setMousePosition({ x: 0.5, y: 0.5 });
  }, []);

  const tiltX = isFlipped ? 0 : (mousePosition.y - 0.5) * 9;
  const tiltY = isFlipped ? 0 : -(mousePosition.x - 0.5) * 9;

  // Health monitoring app specific data
  const isHealthApp = project.id === 4;
  const healthAppData = isHealthApp ? {
    vitalSigns: [
      { label: "Heart rate", value: "72 bpm", icon: "❤️", color: "text-red-400" },
      { label: "Blood Pressure", value: "120/80", unit: "mmHg", icon: "🩸", color: "text-green-400" },
      { label: "SpO₂", value: "98%", icon: "🌡️", color: "text-blue-400" }
    ],
    medications: [
      { name: "Aspirin", time: "9:00 AM", dose: "81mg" },
      { name: "Metformin", time: "8:00 AM & 8:00 PM", dose: "500mg" },
      { name: "Lisinopril", time: "7:00 AM", dose: "10mg" }
    ],
    bluetoothStatus: "Connected to device",
    lastSync: "2 min ago",
    dailyStats: {
      steps: { current: 8543, target: 10000 },
      calories: 420,
      activeMinutes: 45
    }
  } : null;

  return (
    <div
      ref={cardRef}
      className={`relative h-[380px] w-full transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ 
        perspective: '1000px',
        transitionDelay: `${index * 80}ms`
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        setIsFlipped(!isFlipped);
      }}
    >
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-400 ease-out cursor-pointer will-change-transform"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY + (isFlipped ? 180 : 0)}deg) translateY(${isHovered ? '-2px' : '0'})`
        }}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 w-full h-full bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 flex flex-col group"
          style={{
            backfaceVisibility: 'hidden',
            boxShadow: isHovered 
              ? '0 20px 40px -8px rgba(217, 70, 239, 0.15), 0 0 20px rgba(217, 70, 239, 0.1)' 
              : '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Health app specific front content */}
          {isHealthApp ? (
            <>
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-4">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-white mb-1">Health Monitor</h3>
                    <p className="text-xs text-gray-300">Real-time vital tracking</p>
                  </div>
                  
                  {/* Vital Signs */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {healthAppData.vitalSigns.map((vital, idx) => (
                      <div key={idx} className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-2 border border-gray-700/40">
                        <div className="text-xs text-gray-400 mb-1">{vital.label}</div>
                        <div className={`text-lg font-bold ${vital.color}`}>{vital.value}</div>
                        {vital.unit && <div className="text-xs text-gray-500">{vital.unit}</div>}
                      </div>
                    ))}
                  </div>
                  
                  {/* Medication & Status */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-900/50 backdrop-blur-sm rounded-lg p-2 border border-gray-700/40">
                      <div className="text-xs text-gray-400 mb-1">Next Medication</div>
                      <div className="text-white font-medium text-sm">Aspirin</div>
                      <div className="text-xs text-cyan-400">9:00 AM • 81mg</div>
                    </div>
                    <div className="flex-1 bg-gray-900/50 backdrop-blur-sm rounded-lg p-2 border border-gray-700/40">
                      <div className="text-xs text-gray-400 mb-1">Sync Status</div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                        <div className="text-white text-sm">Connected</div>
                      </div>
                      <div className="text-xs text-gray-500">2 min ago</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col group">
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-fuchsia-300 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed line-clamp-2">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-1.5 mb-2 mt-auto">
                  {project.tags.slice(0, 4).map((tag, i) => (
                    <span 
                      key={i}
                      className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-medium text-fuchsia-200 border border-fuchsia-500/30 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="mt-3 inline-flex items-center text-purple-400 font-medium text-sm group-hover:text-fuchsia-300 transition-colors">
                  <span>Click for details</span>
                  <svg className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            // Default front content for other projects
            <>
              <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                {project.image ? (
                  <>
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-400"
                      style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                        <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <p className="text-xs opacity-60">Project Preview</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap max-w-[85%]">
                  {project.tags.slice(0, 3).map((tag, i) => (
                    <span 
                      key={i}
                      className="px-2.5 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-medium text-fuchsia-200 border border-fuchsia-500/30 shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col group">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-400 mb-4 text-sm leading-relaxed line-clamp-2">
                  {project.description}
                </p>
                
                <div className="mt-auto inline-flex items-center text-purple-400 font-medium text-sm group-hover:text-fuchsia-300 transition-colors">
                  <span>Click to explore</span>
                  <svg className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Back of card */}
        <div 
          className="absolute inset-0 w-full h-full bg-[#0a0516]/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-fuchsia-500/30 p-5 flex flex-col"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: '0 15px 30px -8px rgba(217, 70, 239, 0.2)'
          }}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white pr-8">
              {project.title}
            </h3>
            <button
              className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">{project.details}</p>
          
          {/* Health app specific back content */}
          {isHealthApp ? (
            <>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <div className="w-1.5 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 mr-2 rounded-full" />
                  <h4 className="text-sm font-bold text-white">Today's Progress</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/40">
                    <div className="text-xs text-gray-400 mb-1">Steps</div>
                    <div className="text-white font-bold">{healthAppData.dailyStats.steps.current.toLocaleString()}</div>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full mt-1">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full"
                        style={{ width: `${(healthAppData.dailyStats.steps.current / healthAppData.dailyStats.steps.target) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {Math.round((healthAppData.dailyStats.steps.current / healthAppData.dailyStats.steps.target) * 100)}% of goal
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/40">
                    <div className="text-xs text-gray-400 mb-1">Calories</div>
                    <div className="text-white font-bold">{healthAppData.dailyStats.calories}</div>
                    <div className="text-xs text-cyan-400 mt-1">kcal burned</div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
          
          <div className="mb-4 flex-1 overflow-auto custom-scrollbar">
            <div className="flex items-center mb-2">
              <div className="w-1.5 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 mr-2 rounded-full" />
              <h4 className="text-sm font-bold text-white">Key Features</h4>
            </div>
            <ul className="space-y-2">
              {project.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-gray-300 text-sm">
                  <span className="text-cyan-400 mr-2 mt-0.5 flex-shrink-0">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <a 
              href={project.liveUrl} 
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2.5 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300 rounded-lg font-medium hover:bg-fuchsia-500/20 transition-all duration-200 text-center hover:scale-102 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(217,70,239,0.1)] hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Live Demo
            </a>
            <a 
              href={project.codeUrl} 
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg font-medium hover:bg-white/10 hover:text-white transition-all duration-200 text-center hover:scale-102 flex items-center justify-center text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Code
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryFilter = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'all', name: 'All Projects', icon: '' },
    { id: 'iot', name: 'IoT', icon: '' },
    { id: 'fullstack', name: 'Full Stack', icon: '' },
    { id: 'embedded', name: 'Embedded', icon: '' },
    { id: 'mobile', name: 'Mobile', icon: '' },
    { id: 'uiux', name: 'UI / UX', icon: '' }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-12">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md backdrop-blur-sm ${
            activeCategory === category.id
              ? 'bg-fuchsia-500/15 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.3)] border border-fuchsia-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10 hover:border-fuchsia-400/30'
          }`}
          onClick={() => setActiveCategory(category.id)}
        >
          <span className="mr-1.5">{category.icon}</span>
          {category.name}
        </button>
      ))}
    </div>
  );
};

const Projects = () => {
  const containerRef = useRef();
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewAll, setViewAll] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const mouseMoveTimeoutRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }
    
    mouseMoveTimeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }, 16); // ~60fps
  }, []);

  const projectsData = [
    {
      id: 1,
      title: "Smart Home IoT System",
      description: "Home automation with ESP32 and React dashboard for seamless control",
      details: "Complete IoT solution with sensor network and mobile app control. Features real-time monitoring, automated lighting, temperature control, and security alerts with machine learning predictions.",
      tags: ["IoT", "ESP32", "React", "Node.js", "MongoDB"],
      category: 'iot',
      features: [
        "Real-time sensor monitoring",
        "Mobile app control",
        "Automated lighting",
        "Energy usage tracking",
        "Voice command integration"
      ],
      image: "/icons/smarthome.png",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      id: 2,
      title: "E-commerce Platform",
      description: "Full-stack online store with payment processing and inventory management",
      details: "Built with MERN stack featuring advanced product management, shopping cart system, Stripe payment integration, order tracking, and admin dashboard with analytics.",
      tags: ["React", "Node.js", "MongoDB", "Stripe", "Express"],
      category: 'fullstack',
      features: [
        "Product catalog with search",
        "Shopping cart system",
        "Stripe payment gateway",
        "Order tracking system",
        "Admin dashboard with analytics"
      ],
      image: "/icons/eccommerce.png",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      id: 3,
      title: "Embedded Vehicle Tracker",
      description: "GPS tracking device with cellular connectivity and real-time monitoring",
      details: "Low-power STM32-based tracker with Flutter companion app for fleet management. Features geofencing, route optimization, and predictive maintenance alerts.",
      tags: ["STM32", "Embedded", "Flutter", "GPS", "C++"],
      category: 'embedded',
      features: [
        "Real-time GPS tracking",
        "Low power design",
        "Fleet management dashboard",
        "Geofencing alerts",
        "Predictive maintenance"
      ],
      image: "/icons/embeddedvehcile.png",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      id: 4,
      title: "Health Monitoring App",
      description: "Cross-platform mobile app for comprehensive health tracking",
      details: "Flutter application with Bluetooth device integration, Firebase backend, and AI-powered health insights. Tracks vitals, medications, and provides personalized recommendations.",
      tags: ["Flutter", "Mobile", "Firebase", "Bluetooth", "AI"],
      category: 'mobile',
      features: [
        "Vital signs tracking",
        "Medication reminders",
        "Bluetooth device sync",
        "AI health insights",
        "Cross-platform support"
      ],
      image: "/icons/health.png",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      id: 5,
      title: "UI Component Library",
      description: "Modern design system for enterprise applications",
      details: "React component library with Storybook documentation, accessibility features, and automated testing. Includes 50+ components with dark mode support and responsive design.",
      tags: ["React", "Design System", "Storybook", "Figma", "TypeScript"],
      category: 'uiux',
      features: [
        "50+ reusable components",
        "Dark mode support",
        "WCAG accessibility",
        "Storybook documentation",
        "Fully responsive design"
      ],
      image: "/icons/ui component.png",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      id: 6,
      title: "Industrial IoT Monitor",
      description: "Factory equipment monitoring system with predictive analytics",
      details: "Python-based data processing with React visualization dashboard for predictive maintenance. Features machine learning algorithms for anomaly detection and downtime prevention.",
      tags: ["Python", "React", "IoT", "ML", "TensorFlow"],
      category: 'iot',
      features: [
        "Equipment monitoring",
        "Predictive analytics",
        "Anomaly detection",
        "Dashboard visualization",
        "ML-powered insights"
      ],
      image: "/icons/industrial.png",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      id: 7,
      title: "Blockchain Voting System",
      description: "Secure voting platform using blockchain technology",
      details: "Ethereum-based voting system with smart contracts, ensuring transparency and immutability. Features voter authentication, real-time results, and audit trails.",
      tags: ["Blockchain", "Ethereum", "Solidity", "Web3", "React"],
      category: 'fullstack',
      features: [
        "Smart contract integration",
        "Secure voter authentication",
        "Real-time result tracking",
        "Complete audit trails",
        "Immutable vote records"
      ],
      image: "/icons/blockchain.png",
      liveUrl: "#",
      codeUrl: "#"
    },
    {
      id: 8,
      title: "AR Shopping Experience",
      description: "Augmented reality app for virtual product try-ons",
      details: "React Native application with AR capabilities for furniture and fashion retailers. Includes 3D product visualization, virtual fitting rooms, and social sharing features.",
      tags: ["React Native", "AR", "3D", "Mobile", "ARCore"],
      category: 'mobile',
      features: [
        "3D product visualization",
        "Virtual try-on feature",
        "ARCore integration",
        "Social sharing",
        "Cross-platform support"
      ],
      image: "/icons/ar.png",
      liveUrl: "#",
      codeUrl: "#"
    }
  ];

  const filteredProjects = activeCategory === 'all' 
    ? projectsData 
    : projectsData.filter(project => project.category === activeCategory);

  const displayedProjects = viewAll ? filteredProjects : filteredProjects.slice(0, 6);

  return (
    <div 
      ref={containerRef}
      className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#0f172a] via-[#11052c] to-[#050014]"
      onMouseMove={handleMouseMove}
    >
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(217, 70, 239, 0.4);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(217, 70, 239, 0.6);
        }

        .hover-scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
      
      {/* Dynamic 3D Environment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <BackgroundScene mousePos={mousePos} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen opacity-40"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center mb-5 px-4 py-2 bg-white/5 border border-fuchsia-500/20 rounded-full text-fuchsia-300 text-sm font-medium backdrop-blur-sm shadow-[0_0_15px_rgba(217,70,239,0.15)] cursor-pointer hover:bg-white/10 transition-colors" onClick={() => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }}>
            <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full mr-2 animate-pulse shadow-[0_0_8px_#d946ef]" />
            Collaborate 
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-5 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-fuchsia-200 to-purple-500 drop-shadow-sm">
              My Projects
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover innovative solutions across IoT, full stack, embedded systems, and mobile development
          </p>
        </div>

        <CategoryFilter 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedProjects.map((project, index) => (
            <ProjectCard 
              key={project.id}
              project={project}
              index={index}
            />
          ))}
        </div>

        {filteredProjects.length > 6 && !viewAll && (
          <div className="text-center mt-16">
            <button
              onClick={() => setViewAll(true)}
              className="group inline-flex items-center px-8 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 text-white rounded-xl font-medium hover:from-cyan-500/15 hover:to-blue-500/15 hover:border-cyan-400/50 transition-all duration-200 hover:scale-105 shadow-lg backdrop-blur-sm"
            >
              <span className="mr-2">View All {filteredProjects.length} Projects</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;