import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

/* ═══════════════════════════════════════════
   SKILL DATA
   ═══════════════════════════════════════════ */
const skillCategories = {
  fullstack: {
    title: 'Full Stack Wizardry',
    icon: '💻',
    description: 'Crafting seamless digital experiences from database to UI',
    color: '#06b6d4',
    colorB: '#3b82f6',
    stats: { projects: '50+', experience: '4+ yrs' },
    skills: [
      { name: 'React', level: 98, icon: '⚛️', desc: 'Component architecture & hooks mastery' },
      { name: 'Next.js', level: 95, icon: '▲', desc: 'SSR, ISR & full-stack framework' },
      { name: 'Node.js', level: 92, icon: '🟢', desc: 'REST/GraphQL APIs & microservices' },
      { name: 'TypeScript', level: 90, icon: '🔷', desc: 'Type-safe development at scale' },
      { name: 'GraphQL', level: 88, icon: '📊', desc: 'Schema design & resolvers' },
      { name: 'MongoDB', level: 90, icon: '🍃', desc: 'Document modeling & aggregation' },
      { name: 'PostgreSQL', level: 85, icon: '🐘', desc: 'Relational design & optimization' },
      { name: 'AWS', level: 82, icon: '☁️', desc: 'EC2, Lambda, S3 & cloud infra' },
      { name: 'Docker', level: 80, icon: '🐳', desc: 'Containerization & orchestration' },
      { name: 'Redis', level: 85, icon: '🔴', desc: 'Caching & real-time pub/sub' },
    ],
    relatedTech: ['Webpack', 'Jest', 'Redux', 'TailwindCSS', 'SASS', 'REST', 'CI/CD', 'Microservices'],
  },
  uiux: {
    title: 'UI/UX Design',
    icon: '🎨',
    description: 'Creating intuitive and beautiful user experiences',
    color: '#a855f7',
    colorB: '#ec4899',
    stats: { projects: '30+', experience: '3+ yrs' },
    skills: [
      { name: 'Figma', level: 95, icon: '✏️', desc: 'Prototyping & component libraries' },
      { name: 'Adobe XD', level: 90, icon: '💎', desc: 'Interactive prototypes & handoff' },
      { name: 'User Research', level: 88, icon: '🔍', desc: 'Interviews, surveys & analytics' },
      { name: 'Prototyping', level: 92, icon: '🧪', desc: 'High-fidelity interactive mockups' },
      { name: 'Wireframing', level: 90, icon: '📝', desc: 'Low-fi to hi-fi design flows' },
      { name: 'UI Components', level: 94, icon: '🧩', desc: 'Design system & component libs' },
      { name: 'Design Systems', level: 92, icon: '📐', desc: 'Scalable token-based systems' },
      { name: 'Accessibility', level: 85, icon: '♿', desc: 'WCAG compliance & a11y' },
      { name: 'Interaction Design', level: 88, icon: '✨', desc: 'Micro-interactions & motion' },
      { name: 'Typography', level: 90, icon: 'Aa', desc: 'Typographic hierarchy & pairing' },
    ],
    relatedTech: ['Storybook', 'Styled Components', 'CSS Modules', 'PostCSS', 'Sketch', 'InVision', 'Color Theory'],
  },
  iot: {
    title: 'IoT Engineering',
    icon: '🌐',
    description: 'Building connected devices and smart systems',
    color: '#10b981',
    colorB: '#14b8a6',
    stats: { projects: '15+', experience: '3+ yrs' },
    skills: [
      { name: 'Raspberry Pi', level: 90, icon: '🥧', desc: 'Linux-based IoT edge computing' },
      { name: 'Arduino', level: 85, icon: '♾️', desc: 'Sensor interfacing & automation' },
      { name: 'Sensor Networks', level: 82, icon: '📶', desc: 'Distributed sensing & fusion' },
      { name: 'MQTT', level: 88, icon: '📡', desc: 'Lightweight pub/sub messaging' },
      { name: 'WebSockets', level: 85, icon: '🔌', desc: 'Real-time bidirectional comms' },
      { name: 'Edge Computing', level: 80, icon: '⏱️', desc: 'Local processing & inference' },
      { name: 'LoRaWAN', level: 78, icon: '📶', desc: 'Long-range low-power networks' },
      { name: 'ESP32', level: 85, icon: '⚙️', desc: 'WiFi/BLE microcontroller dev' },
      { name: 'Home Assistant', level: 82, icon: '🏠', desc: 'Smart home automation' },
      { name: 'Firmware Dev', level: 80, icon: '⚙️', desc: 'Bare-metal & RTOS firmware' },
    ],
    relatedTech: ['BLE', 'Zigbee', 'Z-Wave', 'PCB Design', 'MicroPython', 'C++', 'IoT Security'],
  },
  embedded: {
    title: 'Embedded Systems',
    icon: '🔌',
    description: 'Low-level programming for hardware devices',
    color: '#f59e0b',
    colorB: '#ef4444',
    stats: { projects: '20+', experience: '3+ yrs' },
    skills: [
      { name: 'C', level: 92, icon: 'C', desc: 'Systems programming & memory mgmt' },
      { name: 'C++', level: 90, icon: '➕', desc: 'OOP for embedded & drivers' },
      { name: 'RTOS', level: 85, icon: '⏱️', desc: 'FreeRTOS & Zephyr scheduling' },
      { name: 'ARM Cortex', level: 88, icon: '⚙️', desc: 'Cortex-M/A architecture dev' },
      { name: 'FPGA/VHDL', level: 75, icon: '🧮', desc: 'Hardware description & synthesis' },
      { name: 'Device Drivers', level: 82, icon: '💾', desc: 'Kernel & user-space drivers' },
      { name: 'I2C/SPI/UART', level: 90, icon: '🔌', desc: 'Serial protocol interfacing' },
      { name: 'Microcontrollers', level: 88, icon: '🕹️', desc: 'STM32, PIC & AVR platforms' },
      { name: 'Digital Logic', level: 80, icon: '01', desc: 'Combinational & sequential design' },
      { name: 'Bare Metal', level: 85, icon: '🔩', desc: 'No-OS direct hardware control' },
    ],
    relatedTech: ['FreeRTOS', 'Zephyr', 'CAN Bus', 'PWM', 'ADC/DAC', 'Assembly', 'Debugging'],
  },
  mobile: {
    title: 'Mobile Development',
    icon: '📱',
    description: 'Building cross-platform mobile applications',
    color: '#6366f1',
    colorB: '#8b5cf6',
    stats: { projects: '12+', experience: '2+ yrs' },
    skills: [
      { name: 'Flutter', level: 92, icon: '🦋', desc: 'Cross-platform UI framework' },
      { name: 'React Native', level: 88, icon: '⚛️', desc: 'JS-based mobile development' },
      { name: 'Android (Kotlin)', level: 85, icon: '🤖', desc: 'Native Android development' },
      { name: 'iOS (Swift)', level: 80, icon: '🍏', desc: 'Native iOS development' },
      { name: 'Firebase', level: 88, icon: '🔥', desc: 'Auth, Firestore & cloud functions' },
      { name: 'SwiftUI', level: 75, icon: '🎨', desc: 'Declarative iOS UI framework' },
      { name: 'Dart', level: 90, icon: '🎯', desc: 'Flutter\'s programming language' },
      { name: 'State Mgmt', level: 88, icon: '🔄', desc: 'BLoC, Provider & Riverpod' },
      { name: 'App Deployment', level: 82, icon: '🚀', desc: 'App Store & Play Store CI/CD' },
      { name: 'Clean Arch', level: 85, icon: '🏗️', desc: 'SOLID principles & layered arch' },
    ],
    relatedTech: ['Jetpack Compose', 'KMM', 'Fastlane', 'AppCenter', 'Redux', 'MobX', 'SQLite'],
  },
};

const categoryKeys = Object.keys(skillCategories);

/* ═══════════════════════════════════════════
   DIMENSIONAL RIFT SHADER (Background)
   ═══════════════════════════════════════════ */
const riftVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const riftFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec2 uMouse;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.15;
    float n1 = snoise(vec3(uv * 3.0 + t, t * 0.5));
    float n2 = snoise(vec3(uv * 5.0 - t * 0.7, t * 0.3 + 100.0));
    float n3 = snoise(vec3(uv * 8.0 + t * 0.3, t * 0.8 + 200.0));
    float riftGlow = exp(-abs(n1 * 3.0 + n2 * 2.0) * 2.5) * 1.5;
    vec2 mouseOffset = uv - uMouse;
    float mouseDist = length(mouseOffset);
    float mouseInfluence = exp(-mouseDist * 4.0) * 0.3;
    vec3 riftColor = mix(uColorA, uColorB, n2 * 0.5 + 0.5);
    vec3 iridescence = vec3(
      sin(n1 * 6.28 + t * 2.0) * 0.5 + 0.5,
      sin(n2 * 6.28 + t * 2.0 + 2.094) * 0.5 + 0.5,
      sin(n3 * 6.28 + t * 2.0 + 4.189) * 0.5 + 0.5
    );
    vec3 spaceColor = vec3(0.02, 0.02, 0.06);
    float nebula = smoothstep(0.2, 0.8, n1 * 0.5 + 0.5) * 0.15;
    vec3 nebulaColor = mix(uColorA * 0.3, uColorB * 0.3, n2 * 0.5 + 0.5);
    vec3 finalColor = spaceColor;
    finalColor += nebulaColor * nebula;
    finalColor += riftColor * riftGlow * 0.4;
    finalColor += iridescence * riftGlow * 0.15;
    finalColor += riftColor * mouseInfluence;
    float vignette = 1.0 - length(uv - 0.5) * 0.8;
    finalColor *= vignette;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/* ═══════════════════════════════════════════
   DIMENSIONAL RIFT — Smooth color lerp (NO remount)
   ═══════════════════════════════════════════ */
function DimensionalRift({ colorA, colorB }) {
  const meshRef = useRef();
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const targetA = useRef(new THREE.Color(colorA));
  const targetB = useRef(new THREE.Color(colorB));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  // Update targets when props change (no remount needed)
  useEffect(() => {
    targetA.current.set(colorA);
    targetB.current.set(colorB);
  }, [colorA, colorB]);

  useFrame(({ clock, pointer }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    mouseRef.current.x += (pointer.x * 0.5 + 0.5 - mouseRef.current.x) * 0.02;
    mouseRef.current.y += (pointer.y * 0.5 + 0.5 - mouseRef.current.y) * 0.02;
    uniforms.uMouse.value.copy(mouseRef.current);
    // Smooth lerp colors instead of hard-switching
    uniforms.uColorA.value.lerp(targetA.current, 0.035);
    uniforms.uColorB.value.lerp(targetB.current, 0.035);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[20, 14]} />
      <shaderMaterial
        vertexShader={riftVertexShader}
        fragmentShader={riftFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   AMBIENT PARTICLES — Optimized (reduced count, simpler geo)
   ═══════════════════════════════════════════ */
function AmbientParticles({ count = 200, categoryColor }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorRef = useRef(new THREE.Color(categoryColor));
  const targetColor = useRef(new THREE.Color(categoryColor));
  const matRef = useRef();

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      pos: new THREE.Vector3(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8
      ),
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002
      ),
      scale: Math.random() * 0.03 + 0.01,
    }));
  }, [count]);

  useEffect(() => {
    targetColor.current.set(categoryColor);
  }, [categoryColor]);

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const mouseX = pointer.x * 5;
    const mouseY = pointer.y * 3.5;

    // Lerp particle color
    colorRef.current.lerp(targetColor.current, 0.04);
    if (matRef.current) matRef.current.color.copy(colorRef.current);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.pos.x += p.vel.x + Math.sin(t * 0.5 + i * 0.1) * 0.003;
      p.pos.y += p.vel.y + Math.cos(t * 0.3 + i * 0.15) * 0.003;
      p.pos.z += p.vel.z;

      const dx = p.pos.x - mouseX;
      const dy = p.pos.y - mouseY;
      const distSq = dx * dx + dy * dy;
      if (distSq < 6.25) {
        const dist = Math.sqrt(distSq);
        const force = (2.5 - dist) * 0.008;
        p.pos.x += (dx / dist) * force;
        p.pos.y += (dy / dist) * force;
      }

      if (p.pos.x > 8) p.pos.x = -8;
      if (p.pos.x < -8) p.pos.x = 8;
      if (p.pos.y > 6) p.pos.y = -6;
      if (p.pos.y < -6) p.pos.y = 6;

      dummy.position.copy(p.pos);
      dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 2 + i) * 0.3));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial
        ref={matRef}
        color={categoryColor}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════
   CAMERA RIG — No per-frame allocation
   ═══════════════════════════════════════════ */
function CameraRig() {
  const targetPos = useRef(new THREE.Vector3(0, 0, 6));

  useFrame((state) => {
    targetPos.current.set(state.pointer.x * 0.8, state.pointer.y * 0.4, 6);
    state.camera.position.lerp(targetPos.current, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/* ═══════════════════════════════════════════
   MAIN 3D SCENE — Optimized
   ═══════════════════════════════════════════ */
function SkillsScene({ activeCategory }) {
  const data = skillCategories[activeCategory];

  return (
    <>
      <CameraRig />
      {/* Background rift — NO key prop, colors lerp smoothly */}
      <DimensionalRift colorA={data.color} colorB={data.colorB} />
      <Stars radius={50} depth={30} count={800} factor={2.5} saturation={0.2} fade speed={0.4} />
      <AmbientParticles count={200} categoryColor={data.color} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color={data.color} />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color={data.colorB} />
    </>
  );
}

/* ═══════════════════════════════════════════
   CIRCULAR PROFICIENCY METER (SVG)
   ═══════════════════════════════════════════ */
function CircularMeter({ level, color, size = 56 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (level / 100) * circumference;

  return (
    <svg width={size} height={size} className="skills-circular-meter">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={3}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.24}
        fontWeight="700"
        fill="white"
      >
        {level}
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   SKILL BAR — Animated progress bar
   ═══════════════════════════════════════════ */
function SkillBar({ level, color }) {
  return (
    <div className="skills-bar-track">
      <motion.div
        className="skills-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${level}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   SKILLS COMPONENT (MAIN) — Full-width redesign
   ═══════════════════════════════════════════ */
const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('fullstack');
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const data = skillCategories[activeCategory];

  // Compute stats
  const avgLevel = useMemo(
    () => Math.round(data.skills.reduce((sum, s) => sum + s.level, 0) / data.skills.length),
    [activeCategory]
  );
  const topSkill = useMemo(
    () => data.skills.reduce((top, s) => (s.level > top.level ? s : top), data.skills[0]),
    [activeCategory]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    setHoveredSkill(null);
  }, []);

  return (
    <section ref={sectionRef} className="skills-section-3d">
      {/* 3D Canvas — full background, pushed far back */}
      <div className="skills-canvas-container">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 55 }}
          dpr={[1, 1.25]}
          gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
          style={{ background: '#030712' }}
        >
          <SkillsScene activeCategory={activeCategory} />
        </Canvas>
        {/* Seamless edge blending with next/previous sections */}
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-gray-950 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Dark gradient scrim — pushes 3D background behind content */}
      <div className="skills-scrim" />

      {/* HTML Overlay — Full-width layout */}
      <div className="skills-overlay">
        {/* Title */}
        <motion.div
          className="skills-header"
          initial={{ opacity: 0, y: -30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="skills-title">
            <span className="skills-title-accent">⚡</span> My Tech Arsenal
          </h2>
          <p className="skills-subtitle">
            Explore my expertise across domains • Click a category to switch vibes
          </p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          className="skills-category-tabs"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categoryKeys.map((catKey) => (
            <button
              key={catKey}
              className={`skills-tab ${activeCategory === catKey ? 'active' : ''}`}
              onClick={() => handleCategoryChange(catKey)}
              style={{
                '--tab-color': skillCategories[catKey].color,
                '--tab-color-b': skillCategories[catKey].colorB,
              }}
            >
              <span className="skills-tab-icon">{skillCategories[catKey].icon}</span>
              <span className="skills-tab-label">{skillCategories[catKey].title}</span>
            </button>
          ))}
        </motion.div>

        {/* Main content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="skills-content-area"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Category Header Card */}
            <div className="skills-hero-card" style={{ '--cat-color': data.color, '--cat-color-b': data.colorB }}>
              <div className="skills-hero-left">
                <span className="skills-hero-icon">{data.icon}</span>
                <div>
                  <h3 className="skills-hero-title">{data.title}</h3>
                  <p className="skills-hero-desc">{data.description}</p>
                </div>
              </div>
              <div className="skills-hero-stats">
                <div className="skills-stat-box">
                  <span className="skills-stat-value">{data.skills.length}</span>
                  <span className="skills-stat-label">Skills</span>
                </div>
                <div className="skills-stat-box">
                  <span className="skills-stat-value">{avgLevel}%</span>
                  <span className="skills-stat-label">Avg Level</span>
                </div>
                <div className="skills-stat-box">
                  <span className="skills-stat-value">{data.stats.projects}</span>
                  <span className="skills-stat-label">Projects</span>
                </div>
                <div className="skills-stat-box highlight" style={{ '--cat-color': data.color }}>
                  <span className="skills-stat-value">{topSkill.icon} {topSkill.level}%</span>
                  <span className="skills-stat-label">Top: {topSkill.name}</span>
                </div>
              </div>
            </div>

            {/* Skills Grid — full-width responsive */}
            <div className="skills-grid">
              {data.skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  className={`skills-card ${hoveredSkill === i ? 'hovered' : ''}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={(e) => {
                    setHoveredSkill(i);
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    e.currentTarget.style.setProperty('--glow-x', `${x}%`);
                    e.currentTarget.style.setProperty('--glow-y', `${y}%`);
                  }}
                  onMouseLeave={() => setHoveredSkill(null)}
                  style={{ '--card-color': data.color }}
                >
                  <div className="skills-card-glow" />
                  <div className="skills-card-top">
                    <CircularMeter level={skill.level} color={data.color} />
                    <div className="skills-card-info">
                      <div className="skills-card-name-row">
                        <span className="skills-card-icon">{skill.icon}</span>
                        <span className="skills-card-name">{skill.name}</span>
                      </div>
                      <SkillBar level={skill.level} color={data.color} />
                    </div>
                  </div>
                  <p className="skills-card-desc">{skill.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Related tech tags */}
            <div className="skills-related">
              <span className="skills-related-label">Also experienced with</span>
              <div className="skills-related-tags">
                {data.relatedTech.map((tech, i) => (
                  <motion.span
                    key={tech}
                    className="skills-related-tag"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    style={{ '--tag-color': data.color }}
                  >
                    {tech}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default Skills;