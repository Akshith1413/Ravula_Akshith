import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, MeshDistortMaterial, Stars } from '@react-three/drei';
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
    skills: [
      { name: 'React/Next.js', level: 95, icon: '⚛️' },
      { name: 'Node.js/Express', level: 90, icon: '🟢' },
      { name: 'GraphQL/Apollo', level: 85, icon: '📊' },
      { name: 'MongoDB/PostgreSQL', level: 88, icon: '🗄️' },
      { name: 'AWS/Docker', level: 80, icon: '☁️' },
    ],
    relatedTech: ['TypeScript', 'Webpack', 'Jest', 'Redux', 'TailwindCSS', 'SASS', 'REST'],
  },
  uiux: {
    title: 'UI/UX Design',
    icon: '🎨',
    description: 'Creating intuitive and beautiful user experiences',
    color: '#a855f7',
    colorB: '#ec4899',
    skills: [
      { name: 'Figma/Adobe XD', level: 92, icon: '✏️' },
      { name: 'User Research', level: 85, icon: '🔍' },
      { name: 'Prototyping', level: 87, icon: '🧪' },
      { name: 'UI Components', level: 90, icon: '🧩' },
      { name: 'Design Systems', level: 88, icon: '📐' },
    ],
    relatedTech: ['Storybook', 'Styled Components', 'CSS Modules', 'PostCSS', 'Sketch', 'InVision'],
  },
  iot: {
    title: 'IoT Engineering',
    icon: '🌐',
    description: 'Building connected devices and smart systems',
    color: '#10b981',
    colorB: '#14b8a6',
    skills: [
      { name: 'Raspberry Pi/Arduino', level: 85, icon: '🖥️' },
      { name: 'Sensor Networks', level: 80, icon: '📶' },
      { name: 'MQTT/WebSockets', level: 82, icon: '📡' },
      { name: 'Edge Computing', level: 78, icon: '⏱️' },
      { name: 'LoRaWAN', level: 75, icon: '📶' },
    ],
    relatedTech: ['BLE', 'Zigbee', 'Z-Wave', 'PCB Design', 'ESP32', 'MicroPython'],
  },
  embedded: {
    title: 'Embedded Systems',
    icon: '🔌',
    description: 'Low-level programming for hardware devices',
    color: '#f59e0b',
    colorB: '#ef4444',
    skills: [
      { name: 'C/C++', level: 88, icon: '🖥️' },
      { name: 'RTOS', level: 80, icon: '⏱️' },
      { name: 'ARM Cortex', level: 82, icon: '⚙️' },
      { name: 'FPGA/VHDL', level: 75, icon: '🧮' },
      { name: 'Device Drivers', level: 78, icon: '💾' },
    ],
    relatedTech: ['FreeRTOS', 'Zephyr', 'I2C', 'SPI', 'UART', 'CAN', 'PWM'],
  },
  mobile: {
    title: 'Mobile Development',
    icon: '📱',
    description: 'Building cross-platform mobile applications',
    color: '#6366f1',
    colorB: '#8b5cf6',
    skills: [
      { name: 'Flutter', level: 90, icon: '🦋' },
      { name: 'Android (Kotlin)', level: 85, icon: '🤖' },
      { name: 'React Native', level: 82, icon: '⚛️' },
      { name: 'Firebase', level: 85, icon: '🔥' },
      { name: 'SwiftUI', level: 70, icon: '🍏' },
    ],
    relatedTech: ['Dart', 'Jetpack Compose', 'KMM', 'Firebase', 'Fastlane', 'AppCenter'],
  },
};

const categoryKeys = Object.keys(skillCategories);

/* ═══════════════════════════════════════════
   DIMENSIONAL RIFT SHADER (Background)
   ═══════════════════════════════════════════ */
const riftVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const riftFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec2 uMouse;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Simplex-like noise
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
    
    // Layered dimensional noise
    float n1 = snoise(vec3(uv * 3.0 + t, t * 0.5));
    float n2 = snoise(vec3(uv * 5.0 - t * 0.7, t * 0.3 + 100.0));
    float n3 = snoise(vec3(uv * 8.0 + t * 0.3, t * 0.8 + 200.0));
    
    // Dimensional rift — a flowing tear in space
    float rift = smoothstep(0.0, 0.15, abs(n1 * 0.5 + n2 * 0.3 + n3 * 0.2));
    float riftGlow = exp(-abs(n1 * 3.0 + n2 * 2.0) * 2.5) * 1.5;
    
    // Mouse-reactive distortion
    vec2 mouseOffset = uv - uMouse;
    float mouseDist = length(mouseOffset);
    float mouseInfluence = exp(-mouseDist * 4.0) * 0.3;
    
    // Color mixing with iridescence
    vec3 riftColor = mix(uColorA, uColorB, n2 * 0.5 + 0.5);
    vec3 iridescence = vec3(
      sin(n1 * 6.28 + t * 2.0) * 0.5 + 0.5,
      sin(n2 * 6.28 + t * 2.0 + 2.094) * 0.5 + 0.5,
      sin(n3 * 6.28 + t * 2.0 + 4.189) * 0.5 + 0.5
    );
    
    // Deep space base
    vec3 spaceColor = vec3(0.02, 0.02, 0.06);
    
    // Nebula clouds
    float nebula = smoothstep(0.2, 0.8, n1 * 0.5 + 0.5) * 0.15;
    vec3 nebulaColor = mix(uColorA * 0.3, uColorB * 0.3, n2 * 0.5 + 0.5);
    
    // Combine everything
    vec3 finalColor = spaceColor;
    finalColor += nebulaColor * nebula;
    finalColor += riftColor * riftGlow * 0.4;
    finalColor += iridescence * riftGlow * 0.15;
    finalColor += riftColor * mouseInfluence;
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.8;
    finalColor *= vignette;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function DimensionalRift({ colorA, colorB }) {
  const meshRef = useRef();
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  useEffect(() => {
    uniforms.uColorA.value.set(colorA);
    uniforms.uColorB.value.set(colorB);
  }, [colorA, colorB]);

  useFrame(({ clock, pointer }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    mouseRef.current.x += (pointer.x * 0.5 + 0.5 - mouseRef.current.x) * 0.02;
    mouseRef.current.y += (pointer.y * 0.5 + 0.5 - mouseRef.current.y) * 0.02;
    uniforms.uMouse.value.copy(mouseRef.current);
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
   SKILL ORB — A single floating sphere
   ═══════════════════════════════════════════ */
function SkillOrb({ skill, index, total, categoryColor, isHovered, onHover, onUnhover, onClick }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const targetPos = useRef(new THREE.Vector3());
  const currentPos = useRef(new THREE.Vector3());

  // DNA Helix position
  const helixAngle = (index / total) * Math.PI * 2;
  const helixY = (index / total) * 4 - 2;
  const strand = index % 2;
  const helixRadius = 1.8;
  const xPos = Math.cos(helixAngle + strand * Math.PI) * helixRadius;
  const zPos = Math.sin(helixAngle + strand * Math.PI) * helixRadius * 0.5;

  targetPos.current.set(xPos, helixY, zPos);
  if (currentPos.current.lengthSq() === 0) currentPos.current.copy(targetPos.current);

  const orbSize = 0.15 + (skill.level / 100) * 0.35;
  const color = new THREE.Color(categoryColor);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Smooth movement
    currentPos.current.lerp(targetPos.current, 0.03);

    // Floating oscillation
    const floatOffset = Math.sin(t * 0.8 + index * 1.2) * 0.12;
    meshRef.current.position.set(
      currentPos.current.x + Math.sin(t * 0.3 + index) * 0.08,
      currentPos.current.y + floatOffset,
      currentPos.current.z + Math.cos(t * 0.4 + index) * 0.06
    );

    // Rotation
    meshRef.current.rotation.x = t * 0.2 + index;
    meshRef.current.rotation.y = t * 0.3 + index * 0.5;

    // Hover scale
    const targetScale = isHovered ? 1.6 : 1;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );

    // Glow
    if (glowRef.current) {
      glowRef.current.scale.setScalar(orbSize * (isHovered ? 4 : 2.5));
      glowRef.current.material.opacity = isHovered ? 0.35 : 0.15;
      glowRef.current.position.copy(meshRef.current.position);
    }
  });

  return (
    <group>
      {/* Glow sprite */}
      <sprite ref={glowRef}>
        <spriteMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Main orb */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); onHover(index); }}
        onPointerOut={(e) => { e.stopPropagation(); onUnhover(); }}
        onClick={(e) => { e.stopPropagation(); onClick(index); }}
      >
        <icosahedronGeometry args={[orbSize, 1]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered ? 1.5 : 0.6}
          roughness={0.1}
          metalness={0.8}
          distort={isHovered ? 0.4 : 0.2}
          speed={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Skill label */}
      {isHovered && (
        <Html
          position={[
            meshRef.current?.position.x || xPos,
            (meshRef.current?.position.y || helixY) + orbSize + 0.5,
            meshRef.current?.position.z || zPos,
          ]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="skills-3d-tooltip">
            <span className="skills-3d-tooltip-icon">{skill.icon}</span>
            <span className="skills-3d-tooltip-name">{skill.name}</span>
            <span className="skills-3d-tooltip-level">{skill.level}%</span>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════
   SYNAPTIC CONNECTIONS — Energy beams
   ═══════════════════════════════════════════ */
function SynapticConnections({ skills, categoryColor }) {
  const linesRef = useRef();
  const count = skills.length;

  useFrame(({ clock }) => {
    if (!linesRef.current) return;
    const t = clock.getElapsedTime();
    linesRef.current.material.opacity = 0.08 + Math.sin(t * 2) * 0.04;
  });

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < count; i++) {
      const helixAngle = (i / count) * Math.PI * 2;
      const helixY = (i / count) * 4 - 2;
      const strand = i % 2;
      const x = Math.cos(helixAngle + strand * Math.PI) * 1.8;
      const z = Math.sin(helixAngle + strand * Math.PI) * 0.9;
      pts.push(new THREE.Vector3(x, helixY, z));
    }
    return pts;
  }, [count]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        vertices.push(points[i].x, points[i].y, points[i].z);
        vertices.push(points[j].x, points[j].y, points[j].z);
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geo;
  }, [points]);

  return (
    <lineSegments ref={linesRef} geometry={lineGeometry}>
      <lineBasicMaterial
        color={categoryColor}
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/* ═══════════════════════════════════════════
   AMBIENT PARTICLES — Cursor-reactive dust
   ═══════════════════════════════════════════ */
function AmbientParticles({ count = 600, categoryColor }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
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
      basePos: new THREE.Vector3(),
    }));
  }, [count]);

  // Store base positions
  useEffect(() => {
    particles.forEach((p) => p.basePos.copy(p.pos));
  }, [particles]);

  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const mouseX = pointer.x * 5;
    const mouseY = pointer.y * 3.5;

    particles.forEach((p, i) => {
      // Drift
      p.pos.x += p.vel.x + Math.sin(t * 0.5 + i * 0.1) * 0.003;
      p.pos.y += p.vel.y + Math.cos(t * 0.3 + i * 0.15) * 0.003;
      p.pos.z += p.vel.z;

      // Mouse repulsion
      const dx = p.pos.x - mouseX;
      const dy = p.pos.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2.5) {
        const force = (2.5 - dist) * 0.008;
        p.pos.x += (dx / dist) * force;
        p.pos.y += (dy / dist) * force;
      }

      // Boundary wrapping
      if (p.pos.x > 8) p.pos.x = -8;
      if (p.pos.x < -8) p.pos.x = 8;
      if (p.pos.y > 6) p.pos.y = -6;
      if (p.pos.y < -6) p.pos.y = 6;

      dummy.position.copy(p.pos);
      dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 2 + i) * 0.3));
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color={categoryColor}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY CRYSTAL — Floating polyhedron
   ═══════════════════════════════════════════ */
function CategoryCrystal({ category, data, index, isActive, onClick, total }) {
  const meshRef = useRef();
  const angle = ((index - (total - 1) / 2) / total) * Math.PI * 0.6;
  const radius = 4.5;
  const xPos = Math.sin(angle) * radius;
  const yPos = -3.2;
  const zPos = Math.cos(angle) * radius - 3;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.5 + index;
    meshRef.current.rotation.y = t * 0.7 + index * 0.3;
    meshRef.current.position.y = yPos + Math.sin(t + index * 1.5) * 0.15;

    const targetScale = isActive ? 1.4 : 0.9;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.08
    );
  });

  const color = new THREE.Color(data.color);

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[xPos, yPos, zPos]}
        onClick={(e) => { e.stopPropagation(); onClick(category); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'default'; }}
      >
        <octahedronGeometry args={[0.35, 0]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActive ? 2.0 : 0.5}
          roughness={0.05}
          metalness={0.95}
          distort={isActive ? 0.3 : 0.1}
          speed={3}
          transparent
          opacity={isActive ? 1 : 0.7}
          wireframe={!isActive}
        />
      </mesh>

      {/* Crystal label */}
      <Html
        position={[xPos, yPos - 0.65, zPos]}
        center
        style={{ pointerEvents: 'none' }}
      >
        <div className={`skills-3d-crystal-label ${isActive ? 'active' : ''}`}>
          <span>{data.icon}</span>
        </div>
      </Html>
    </group>
  );
}

/* ═══════════════════════════════════════════
   HELIX ROTATION GROUP
   ═══════════════════════════════════════════ */
function HelixGroup({ children }) {
  const groupRef = useRef();
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const rotationVel = useRef(0);
  const currentRotation = useRef(0);

  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;
    const onDown = (e) => {
      isDragging.current = true;
      dragStart.current = e.clientX || e.touches?.[0]?.clientX || 0;
    };
    const onMove = (e) => {
      if (!isDragging.current) return;
      const x = e.clientX || e.touches?.[0]?.clientX || 0;
      const delta = (x - dragStart.current) * 0.005;
      rotationVel.current = delta;
      dragStart.current = x;
    };
    const onUp = () => { isDragging.current = false; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
    };
  }, [gl]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (!isDragging.current) {
      rotationVel.current *= 0.95;
      rotationVel.current += 0.002; // Auto-rotate
    }
    currentRotation.current += rotationVel.current;
    groupRef.current.rotation.y = currentRotation.current;
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ═══════════════════════════════════════════
   MAIN 3D SCENE
   ═══════════════════════════════════════════ */
function SkillsScene({ activeCategory, setActiveCategory, hoveredSkill, setHoveredSkill, setSelectedSkill }) {
  const data = skillCategories[activeCategory];

  return (
    <>
      {/* Background rift */}
      <DimensionalRift colorA={data.color} colorB={data.colorB} />

      {/* Background stars */}
      <Stars radius={50} depth={30} count={1500} factor={3} saturation={0.2} fade speed={0.5} />

      {/* Ambient particles */}
      <AmbientParticles count={500} categoryColor={data.color} />

      {/* Ambient light */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color={data.color} />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color={data.colorB} />

      {/* Skill DNA Helix */}
      <HelixGroup>
        {data.skills.map((skill, i) => (
          <SkillOrb
            key={`${activeCategory}-${i}`}
            skill={skill}
            index={i}
            total={data.skills.length}
            categoryColor={data.color}
            isHovered={hoveredSkill === i}
            onHover={setHoveredSkill}
            onUnhover={() => setHoveredSkill(null)}
            onClick={setSelectedSkill}
          />
        ))}
        <SynapticConnections skills={data.skills} categoryColor={data.color} />
      </HelixGroup>

      {/* Category Crystals */}
      {categoryKeys.map((catKey, i) => (
        <CategoryCrystal
          key={catKey}
          category={catKey}
          data={skillCategories[catKey]}
          index={i}
          total={categoryKeys.length}
          isActive={activeCategory === catKey}
          onClick={setActiveCategory}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════
   CIRCULAR PROFICIENCY METER (SVG)
   ═══════════════════════════════════════════ */
function CircularMeter({ level, color, size = 48 }) {
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
        stroke="rgba(255,255,255,0.08)"
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
   SKILLS COMPONENT (MAIN)
   ═══════════════════════════════════════════ */
const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('fullstack');
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const data = skillCategories[activeCategory];

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    setHoveredSkill(null);
    setSelectedSkill(null);
  }, []);

  return (
    <section ref={sectionRef} className="skills-section-3d">
      {/* 3D Canvas — full background */}
      <div className="skills-canvas-container">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 55 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#030712' }}
        >
          <SkillsScene
            activeCategory={activeCategory}
            setActiveCategory={handleCategoryChange}
            hoveredSkill={hoveredSkill}
            setHoveredSkill={setHoveredSkill}
            setSelectedSkill={setSelectedSkill}
          />
        </Canvas>
      </div>

      {/* HTML Overlay */}
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
            Drag the constellation to explore • Click crystals to switch domains
          </p>
        </motion.div>

        {/* Category tabs (mobile-friendly fallback) */}
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

        {/* Skill details panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="skills-detail-panel"
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -40, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="skills-panel-header">
              <span className="skills-panel-icon">{data.icon}</span>
              <div>
                <h3 className="skills-panel-title">{data.title}</h3>
                <p className="skills-panel-desc">{data.description}</p>
              </div>
            </div>

            <div className="skills-panel-grid">
              {data.skills.map((skill, i) => (
                <motion.div
                  key={i}
                  className={`skills-panel-item ${hoveredSkill === i ? 'highlighted' : ''}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  onMouseEnter={() => setHoveredSkill(i)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  style={{ '--item-color': data.color }}
                >
                  <CircularMeter level={skill.level} color={data.color} />
                  <div className="skills-panel-item-info">
                    <span className="skills-panel-item-icon">{skill.icon}</span>
                    <span className="skills-panel-item-name">{skill.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Related tech tags */}
            <div className="skills-related">
              <span className="skills-related-label">Related</span>
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