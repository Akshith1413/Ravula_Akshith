import { useRef, useEffect, useState } from 'react';

const FloatingOrb = ({ position, index }) => {
  const orbRef = useRef();

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    const animate = () => {
      const time = Date.now() * 0.001;
      const rotation = time * 0.15 + index * 1.2;
      const floatY = Math.sin(time * 0.5 + index) * 15;
      orb.style.transform = `translate(${Math.sin(rotation) * 10}px, ${floatY}px)`;
      orb.style.opacity = 0.3 + Math.sin(time * 0.3 + index) * 0.2;
      requestAnimationFrame(animate);
    };
    animate();
  }, [index]);

  return (
    <div
      ref={orbRef}
      className="absolute w-12 h-12 rounded-full pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        background: `radial-gradient(circle at center, 
          rgba(59, 130, 246, 0.6) 0%, 
          rgba(16, 185, 129, 0.4) 50%, 
          transparent 70%)`,
        filter: 'blur(12px)',
        transition: 'opacity 0.5s ease-out'
      }}
    />
  );
};

const BackgroundOrbs = () => {
  const positions = [
    { x: 20, y: 30 },
    { x: 80, y: 20 },
    { x: 30, y: 70 },
    { x: 70, y: 80 },
    { x: 15, y: 50 },
    { x: 85, y: 60 }
  ];

  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
      {positions.map((pos, i) => (
        <FloatingOrb key={i} position={pos} index={i} />
      ))}
    </div>
  );
};

const CertificationCard = ({ cert, isActive, onClick }) => {
  const cardRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, width: 300, height: 300 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y, width: rect.width, height: rect.height });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition((prev) => ({ ...prev, x: prev.width / 2, y: prev.height / 2 }));
  };

  const xTilt = (mousePosition.x - (mousePosition.width / 2)) / 20;
  const yTilt = -(mousePosition.y - (mousePosition.height / 2)) / 20;

  return (
    <div
      ref={cardRef}
      className={`relative h-full cursor-pointer rounded-2xl overflow-hidden ${isActive ? 'ring-4 ring-cyan-400 z-10' : 'ring-1 ring-gray-700'
        }`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${yTilt}deg) rotateY(${xTilt}deg) scale(1.05)`
          : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(${isActive ? 1.05 : 1})`,
        transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.3s ease-out' : 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
        boxShadow: isHovered
          ? '0 25px 50px -12px rgba(34, 211, 238, 0.25)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}
    >

      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(34, 211, 238, 0.15), transparent 70%)`,
          opacity: isHovered ? 1 : 0
        }}
      />


      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-pulse-slow" />

      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 overflow-hidden transition-transform duration-300 ${isHovered ? 'rotate-12 scale-110' : ''
                }`}
              style={{
                background: `linear-gradient(135deg, ${cert.gradientFrom}, ${cert.gradientTo})`
              }}
            >
              <span className="text-white font-bold text-lg">
                {cert.initials}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white transition-colors duration-300">
                {cert.title}
              </h3>
              <p className="text-gray-400 text-sm">{cert.organization}</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4 line-clamp-3 transition-all duration-300">
            {cert.description}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {cert.skills.map((skill, i) => (
              <span
                key={i}
                className={`px-3 py-1 bg-gray-800 rounded-full text-xs text-cyan-400 transition-all duration-300 ${isHovered ? 'bg-gray-700 scale-105' : ''
                  }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">{cert.date}</span>
          <div
            className={`text-cyan-400 hover:text-cyan-300 text-sm flex items-center transition-all duration-300 ${isHovered ? 'translate-x-2' : ''
              }`}
          >
            View Details
            <svg
              className={`w-4 h-4 ml-1 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const CertificationDetail = ({ cert, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleViewCertificate = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowCertificate(true);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToDetails = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowCertificate(false);
      setIsTransitioning(false);
    }, 300);
  };

  const getCertificateImage = (certTitle) => {
    const titleMap = {
      "App Developer Certification": "app.jpeg",
      "Web Developer Certification": "web.jpeg",
      "Web Development Internship": "learnflu.png"
    };
    return `/certs/${titleMap[certTitle] || 'cert.jpg'}`;
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      onClick={handleClose}
    >
      <div
        className={`relative ${showCertificate ? 'max-w-5xl' : 'max-w-4xl'} w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl transition-all duration-500 ${isVisible ? 'scale-100 rotate-0' : 'scale-90 rotate-3'
          }`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-spin-slow opacity-20 blur-xl" />


        {!showCertificate && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="relative z-10 bg-gray-900/80 backdrop-blur-sm">
          {!showCertificate ? (

            <div
              className={`p-8 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-[-100px]' : 'opacity-100 translate-x-0'
                }`}
            >
              <div className="flex items-center mb-6">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mr-6 animate-bounce-slow"
                  style={{
                    background: `linear-gradient(135deg, ${cert.gradientFrom}, ${cert.gradientTo})`
                  }}
                >
                  <span className="text-white font-bold text-2xl">
                    {cert.initials}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {cert.title}
                  </h2>
                  <p className="text-gray-400 text-lg">{cert.organization} • {cert.date}</p>
                </div>
              </div>

              <p className="text-gray-300 mb-8 text-lg leading-relaxed">{cert.longDescription}</p>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <span className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 mr-3 rounded-full"></span>
                  Skills Gained
                </h3>
                <div className="flex flex-wrap gap-3">
                  {cert.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full text-sm text-cyan-400 border border-gray-600 hover:border-cyan-400 transition-all duration-300 hover:scale-105"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleViewCertificate}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:-translate-y-1 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Certificate
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-700 rounded-lg font-medium text-gray-300 hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (

            <div
              className={`p-8 transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-x-[100px]' : 'opacity-100 translate-x-0'
                }`}
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handleBackToDetails}
                  className="flex items-center text-cyan-400 hover:text-cyan-300 transition-all duration-300 hover:scale-105 hover:-translate-x-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Details
                </button>
                {/* <h3 className="text-xl font-semibold text-white">Certificate</h3> */}
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative group max-h-[70vh] overflow-hidden">
                <img
                  src={cert.imageUrl || getCertificateImage(cert.title)}
                  alt={`${cert.title} Certificate`}
                  className="w-full h-auto max-h-[65vh] object-contain rounded-lg shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-cyan-500/20"
                  onError={(e) => {
                    e.target.src = '/certs/cert.jpg'; // Fallback image
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />

                {/* Download button overlay
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg text-white hover:bg-black/70 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Certifications = () => {
  const sectionRef = useRef();
  const [selectedCert, setSelectedCert] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const certificationsData = [
    {
      id: 4,
      title: "Full Stack Web Development Intern",
      organization: "CodTech IT Solutions",
      initials: "CT",
      date: "Jan 2026 - Present",
      description: "Developing and deploying scalable full-stack applications using modern web technologies.",
      longDescription: "During this ongoing internship, I am responsible for developing and deploying scalable full-stack applications. I collaborate with cross-functional teams to build new features, optimize performance, and enhance user experience. I extensively use modern web technologies to deliver robust solutions.",
      skills: ["Full-Stack", "Web Development", "Optimization"],
      gradientFrom: "#10b981",
      gradientTo: "#059669",
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 5,
      title: "Web Development Intern",
      organization: "Technex IIT (BHU) Varanasi",
      initials: "TX",
      date: "Dec 2025 - Present",
      description: "Contributing to the development of the web portal for Asia's oldest techno-management fest.",
      longDescription: "Working with a dynamic team to develop the web portal for Technex, Asia's oldest techno-management fest at IIT BHU. I focus on building interactive frontend components and reliable backend APIs capable of supporting thousands of concurrent users during the fest.",
      skills: ["Frontend", "Backend APIs", "Team Collaboration"],
      gradientFrom: "#f59e0b",
      gradientTo: "#d97706",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 6,
      title: "Full Stack Web Development Intern",
      organization: "Innovate",
      initials: "IN",
      date: "Jun 2025 - Dec 2025",
      description: "Built responsive client-side applications and robust server-side APIs.",
      longDescription: "In this role, I built responsive client-side applications and robust server-side APIs. A major focus of my work was integrating complex database solutions and improving overall application load times by optimizing API queries and asset delivery mechanisms.",
      skills: ["Database", "APIs", "Responsive Design"],
      gradientFrom: "#ec4899",
      gradientTo: "#be185d",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 7,
      title: "Full Stack Development with AI Intern",
      organization: "Intern Certify",
      initials: "IC",
      date: "Jan 2025 - Jun 2025",
      description: "Integrated AI capabilities into full-stack web applications and data pipelines.",
      longDescription: "This internship provided me the opportunity to integrate artificial intelligence capabilities into full-stack web applications. I developed intelligent, automated features and data processing pipelines using machine learning models to provide actionable insights for end-users.",
      skills: ["AI Integration", "Machine Learning", "Data Pipelines"],
      gradientFrom: "#8b5cf6",
      gradientTo: "#6d28d9",
      imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 1,
      title: "App Developer Certification",
      organization: "Intel IoT Club",
      initials: "IC",
      date: "2023",
      description: "Certified for developing innovative IoT applications with Intel technologies.",
      longDescription: "This certification recognizes my skills in developing applications using Intel IoT technologies. The program covered IoT architecture, sensor integration, and data processing techniques. I successfully built a smart home automation prototype as part of the certification requirements.",
      skills: ["IoT", "App Development", "Sensor Integration", "Prototyping"],
      gradientFrom: "#0071c5",
      gradientTo: "#00a9e0"
    },
    {
      id: 2,
      title: "Web Developer Certification",
      organization: "Intel IoT Club",
      initials: "IC",
      date: "2023",
      description: "Certified for building responsive and interactive web applications.",
      longDescription: "Earned this certification after demonstrating proficiency in modern web development technologies. The curriculum included HTML5, CSS3, JavaScript, and responsive design principles. My certification project was a dashboard for IoT device management.",
      skills: ["HTML5", "CSS3", "JavaScript", "Responsive Design"],
      gradientFrom: "#0071c5",
      gradientTo: "#00a9e0"
    },
    {
      id: 3,
      title: "Web Development Internship",
      organization: "Learnflu",
      initials: "LF",
      date: "2022",
      description: "Completed intensive web development internship with real-world projects.",
      longDescription: "This internship provided hands-on experience with full-stack web development. I worked on building and deploying web applications using technologies like React, Node.js, and MongoDB. During the internship, I contributed to three client projects and improved my collaboration skills.",
      skills: ["React", "Node.js", "MongoDB", "Full-stack"],
      gradientFrom: "#4f46e5",
      gradientTo: "#a855f7"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="certifications"
      className="relative pt-18 pb-10 px-4 overflow-hidden bg-gray-950"
    >

      <BackgroundOrbs />


      <div className="absolute top-1/4 -left-1/4 w-96 h-96 rounded-full bg-cyan-500 opacity-10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 rounded-full bg-blue-500 opacity-10 blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-500 opacity-5 blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2
            className={`text-5xl md:text-5xl font-bold mb-9 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-1000 leading-normal ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
          >
            My Certifications
          </h2>
          <p className={`text-xl text-gray-400 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
            Recognized achievements and validated skills
          </p>
          <div className={`w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mt-8 rounded-full transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`} />
        </div>


        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          {certificationsData.map((cert, index) => (
            <div
              key={cert.id}
              style={{ animationDelay: `${index * 0.2}s` }}
              className="animate-fade-in-up"
            >
              <CertificationCard
                cert={cert}
                isActive={selectedCert?.id === cert.id}
                onClick={() => setSelectedCert(cert)}
              />
            </div>
          ))}
        </div>
      </div>


      {selectedCert && (
        <CertificationDetail
          cert={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default Certifications;