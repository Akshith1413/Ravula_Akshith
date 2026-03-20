import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { X } from 'lucide-react';

/* ================= THREE BACKGROUND ================= */

const Background = () => {
  const particles = useRef();
  const group = useRef();
  const geometricShapeRef = useRef();

  // Circular particles
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(800 * 3);
    for (let i = 0; i < p.length; i++) p[i] = (Math.random() - 0.5) * 18;
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);

  // Create circular particle texture
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 1)');
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  const material = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#3b82f6',
        size: 0.08,
        transparent: true,
        opacity: 0.7,
        map: particleTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [particleTexture]
  );

  // Create unique geometric shape - Icosahedron with wireframe and inner glow
  const uniqueShape = useMemo(() => {
    return (
      <group ref={geometricShapeRef}>
        {/* Outer wireframe */}
        <mesh position={[0, 0, -2]}>
          <icosahedronGeometry args={[1.2, 1]} />
          <meshBasicMaterial color="#6366f1" wireframe={true} transparent opacity={0.6} />
        </mesh>
        
        {/* Inner solid with emissive glow */}
        <mesh position={[0, 0, -2]} scale={0.7}>
          <icosahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial 
            color="#8b5cf6"
            emissive="#a78bfa" 
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Rotating ring around the shape */}
        <mesh position={[0, 0, -2]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.8, 0.05, 16, 100]} />
          <meshStandardMaterial 
            color="#60a5fa"
            emissive="#3b82f6" 
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>
    );
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 0.5;

    if (particles.current) {
      particles.current.rotation.y = t * 0.1;
      particles.current.rotation.x = t * 0.06;
    }
    
    if (geometricShapeRef.current) {
      // Complex rotation pattern
      geometricShapeRef.current.rotation.x = t * 0.15;
      geometricShapeRef.current.rotation.y = t * 0.2;
      geometricShapeRef.current.rotation.z = Math.sin(t * 0.3) * 0.2;
      
      // Gentle floating motion
      geometricShapeRef.current.position.y = Math.sin(t * 0.5) * 0.3;
    }
    
    if (group.current) {
      group.current.rotation.y = t * 0.04;
    }
  });

  return (
    <group ref={group}>
      <points ref={particles} geometry={geometry} material={material} />
      {uniqueShape}
    </group>
  );
};

/* ================= DETAIL MODAL ================= */

const DetailModal = ({ type, onClose }) => {
  const modalRef = useRef(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Handle redirect to timeline
  const handleRedirectToTimeline = () => {
    onClose();
    window.location.href = '/#timeline';
  };

  const content = {
    Education: {
      icon: '🎓',
      items: [
        {
          title: 'B.Tech in Computer Science Engineering',
          institution: 'Amrita Vishwa Vidyapeetham',
          year: '2023 - Present'
        },
        {
          title: 'Class 12 (MPC)',
          institution: 'Alphores Junior College',
          year: '2021 - 2023'
        }
      ]
    },
    Experience: {
      icon: '💼',
      items: [
        {
          title: 'Web Developer',
          institution: 'Intel IoT Club',
          year: '',
          description: 'Developed MERN-based web applications enabling real-time IoT device interaction and secure API communication. Built responsive UI components and optimized backend services for scalability and performance.'
        },
        {
          title: 'App Developer',
          institution: 'Intel IoT Club',
          year: '',
          description: 'Engineered cross-platform IoT monitoring applications with Firebase real-time sync and alert systems. Improved system reliability by debugging high-frequency data pipelines and refactoring backend logic.'
        },
        {
          title: 'Full Stack Development with AI Intern',
          institution: 'Intern Certify',
          year: '',
          description: 'Built full stack web applications integrating AI-driven features for data validation and workflow automation. Implemented secure authentication, REST APIs, and modular backend architecture following industry standards.'
        }
      ]
    },
    Hobbies: {
      icon: '🎨',
      items: [
        {
          title: 'Cricket',
          description: 'District-level cricketer with competitive experience',
          icon: '🏏'
        },
        {
          title: 'UI/UX Design',
          description: 'Creating intuitive user interfaces and experiences using Figma',
          icon: '🎨'
        },
        {
          title: '3D Animation',
          description: 'Working with After Effects for motion graphics and animations',
          icon: '🎬'
        },
        {
          title: 'Continuous Learning',
          description: 'Pursuing certifications in UI/UX and Cybersecurity',
          icon: '📚'
        }
      ]
    }
  };

  const data = content[type];

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div ref={modalRef} className="modal-content">
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">{data.icon}</span>
            <h3>{type}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          {data.items.map((item, idx) => (
            <div key={idx} className="modal-item">
              {item.icon && <span className="item-icon">{item.icon}</span>}
              <div className="item-content">
                <h4>{item.title}</h4>
                {item.institution && <p className="item-institution">{item.institution}</p>}
                {item.year && <p className="item-year">{item.year}</p>}
                {item.description && <p className="item-description">{item.description}</p>}
              </div>
            </div>
          ))}
          
          {/* "More" button for Experience section */}
          {type === 'Experience' && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '1.5rem'
            }}>
              <button 
                onClick={handleRedirectToTimeline}
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))',
                  color: '#e0f2fe',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(99, 102, 241, 0.3))';
                  e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))';
                  e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                }}
              >
                More Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
/* ================= ABOUT ================= */

const About = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  /* ---- Mobile detection ---- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ---- Intersection Observer ---- */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { 
        threshold: 0.05,
        rootMargin: '100px'
      }
    );
    
    if (sectionRef.current) {
      obs.observe(sectionRef.current);
    }
    
    return () => obs.disconnect();
  }, []);

  /* ---- Optimized mouse parallax ---- */
  useEffect(() => {
    if (isMobile || !imageRef.current) return;
    
    let rafId = null;
    let lastTime = 0;
    const throttleDelay = 16;

    const move = (e) => {
      const now = Date.now();
      if (now - lastTime < throttleDelay) return;
      
      lastTime = now;

      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const x = Math.max(-12, Math.min(12, (e.clientX / window.innerWidth - 0.5) * 20));
        const y = Math.max(-8, Math.min(8, (e.clientY / window.innerHeight - 0.5) * 10));
        
        if (imageRef.current) {
          imageRef.current.style.transform = `translate(${x}px, ${y}px)`;
        }
      });
    };

    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  const handleButtonClick = (type) => {
    setModalType(type);
  };

  const handleModalClose = () => {
    setModalType(null);
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #fff;
        }

        .about-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          position: relative;
          overflow: hidden;
        }

        .about-section::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at center,
            rgba(15, 23, 42, 0.3) 0%,
            rgba(15, 23, 42, 0.85) 70%
          );
          z-index: 0;
        }

        .about-canvas {
          position: absolute !important;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .about-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          max-width: 1200px;
          width: 100%;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about-content.show {
          opacity: 1;
          transform: translateY(0);
        }

        .about-image {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.1s ease-out;
        }

        .about-image img {
          width: 80%;
          height: 80%;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(59, 130, 246, 0.3);
          border: 2px solid rgba(99, 102, 241, 0.3);
        }

        .about-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1.5rem;
        }

        .about-text h2 {
          font-size: 3rem;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-text p {
          font-size: 1.25rem;
          line-height: 1.8;
          color: #cbd5e1;
          margin: 0;
        }

        .about-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .about-actions button {
          padding: 0.875rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2));
          color: #e0f2fe;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .about-actions button:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(99, 102, 241, 0.3));
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .about-actions button:active {
          transform: translateY(0);
        }

        /* ================= MODAL STYLES ================= */

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s ease;
          overflow-y: auto;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          border-radius: 20px;
          width: 100%;
          max-width: 700px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(99, 102, 241, 0.3);
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          margin: auto;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .modal-icon {
          font-size: 2rem;
        }

        .modal-title h3 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
        }

        .modal-close {
          background: rgba(239, 68, 68, 0.1);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #f87171;
        }

        .modal-close:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .modal-item {
          background: rgba(15, 23, 42, 0.6);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(99, 102, 241, 0.2);
          transition: all 0.3s ease;
          display: flex;
          gap: 1rem;
        }

        .modal-item:last-child {
          margin-bottom: 0;
        }

        .modal-item:hover {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(15, 23, 42, 0.8);
          transform: translateX(4px);
        }

        .item-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .item-content {
          flex: 1;
        }

        .item-content h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #60a5fa;
        }

        .item-institution {
          margin: 0.25rem 0;
          font-size: 1rem;
          color: #a78bfa;
          font-weight: 500;
        }

        .item-year {
          margin: 0.25rem 0;
          font-size: 0.875rem;
          color: #94a3b8;
          font-style: italic;
        }

        .item-description {
          margin: 0.75rem 0 0 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #cbd5e1;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 1024px) {
          .about-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .about-image {
            order: 1;
          }

          .about-text {
            order: 2;
            text-align: center;
            align-items: center;
          }

          .about-actions {
            justify-content: center;
          }

          .modal-content {
            max-height: 90vh;
          }
        }

        @media (max-width: 640px) {
          .about-section {
            padding: 2rem 1rem;
          }

          .about-text h2 {
            font-size: 2rem;
          }

          .about-text p {
            font-size: 1rem;
          }

          .about-actions button {
            padding: 0.75rem 1.5rem;
            font-size: 0.875rem;
          }

          .modal-header {
            padding: 1rem 1.5rem;
          }

          .modal-title h3 {
            font-size: 1.25rem;
          }

          .modal-icon {
            font-size: 1.5rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .modal-item {
            padding: 1rem;
            flex-direction: column;
            align-items: flex-start;
          }

          .item-icon {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <section ref={sectionRef} id="about" className="about-section">
        {/* THREE.JS Canvas */}
        {visible && !isMobile && (
          <Canvas
            className="about-canvas"
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 8], fov: 70 }}
            gl={{ 
              powerPreference: 'high-performance', 
              antialias: false,
              alpha: true
            }}
          >
            <ambientLight intensity={0.6} />
            <pointLight position={[8, 8, 8]} intensity={1.2} />
            <Background />
          </Canvas>
        )}

        {/* CONTENT */}
        <div className={`about-content ${visible ? 'show' : ''}`}>
          {/* IMAGE */}
          <div className="about-image" ref={imageRef}>
            <img src="/hi.png" alt="Profile" loading="lazy" />
          </div>

          {/* TEXT */}
          <div className="about-text">
            <h2>About Me</h2>
            <p>
              I'm a Full Stack Developer and UI/UX Engineer focused on creating
              smooth, immersive, and high-performance digital experiences.
            </p>

            <div className="about-actions">
              {['Education', 'Experience', 'Hobbies'].map((t) => (
                <button key={t} onClick={() => handleButtonClick(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {modalType && <DetailModal type={modalType} onClose={handleModalClose} />}
    </>
  );
};

export default About;