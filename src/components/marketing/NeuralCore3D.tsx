"use client"

import React, { useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Float,
  MeshTransmissionMaterial,
  PointMaterial,
  Points,
} from "@react-three/drei"
import * as THREE from "three"

// Constants for theme colors
const EMERALD_GREEN = "#10B981"
const MINT_GREEN = "#34D399"
const PURE_WHITE = "#ffffff"

// Deterministic pseudo-random number generator
function randomFromSeed(seed: number): number {
  const x = Math.sin(seed + 0.5) * 10000;
  return x - Math.floor(x);
}

// Subatomic energy cloud orbiting inside the core
function SubatomicCloud() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 40
  
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Orbiting very close to the center
      const r = 0.2 + randomFromSeed(i * 3) * 0.25
      const theta = randomFromSeed(i * 3 + 1) * 2 * Math.PI
      const phi = Math.acos(2 * randomFromSeed(i * 3 + 2) - 1)
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return [pos]
  }, [])

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    if (pointsRef.current) {
      pointsRef.current.rotation.y = elapsed * 2.0
      pointsRef.current.rotation.z = elapsed * 1.0
    }
  })

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        color={PURE_WHITE}
        size={0.045}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  )
}

// Layer 4: Quantum Intelligence Core (Pulsing plasma reactor with nested geometry)
function QuantumCore() {
  const coreRef = useRef<THREE.Mesh>(null)
  const coreWire1Ref = useRef<THREE.Mesh>(null)
  const coreWire2Ref = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const glowInnerRef = useRef<THREE.Mesh>(null)
  const glowOuterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    
    // Rotate nested cores in opposite directions for mechanical complexity
    if (coreRef.current) {
      coreRef.current.rotation.y = elapsed * 0.25
      coreRef.current.rotation.x = elapsed * 0.15
      const scale = 1 + Math.sin(elapsed * 2) * 0.05
      coreRef.current.scale.set(scale, scale, scale)
    }
    
    if (coreWire1Ref.current) {
      coreWire1Ref.current.rotation.y = elapsed * -0.3
      coreWire1Ref.current.rotation.z = elapsed * 0.15
      const scale = 1.15 + Math.cos(elapsed * 2) * 0.04
      coreWire1Ref.current.scale.set(scale, scale, scale)
    }

    if (coreWire2Ref.current) {
      coreWire2Ref.current.rotation.x = elapsed * 0.4
      coreWire2Ref.current.rotation.y = elapsed * -0.2
      const scale = 1.3 + Math.sin(elapsed * 3) * 0.03
      coreWire2Ref.current.scale.set(scale, scale, scale)
    }

    // Dynamic emissive intensity pulsing
    if (matRef.current) {
      matRef.current.emissiveIntensity = 4.0 + Math.sin(elapsed * 5) * 2.0
    }

    if (glowInnerRef.current) {
      const scale = 1.35 + Math.sin(elapsed * 3.5) * 0.08
      glowInnerRef.current.scale.set(scale, scale, scale)
    }
    if (glowOuterRef.current) {
      const scale = 1.65 + Math.sin(elapsed * 3.5) * 0.12
      glowOuterRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group>
      {/* Central Solid Dodecahedron Core */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          ref={matRef}
          color={PURE_WHITE}
          emissive={EMERALD_GREEN}
          emissiveIntensity={4}
          roughness={0.05}
          metalness={0.95}
        />
      </mesh>

      {/* Inner Wireframe Octahedron Cage */}
      <mesh ref={coreWire1Ref}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial
          color={PURE_WHITE}
          transparent
          opacity={0.4}
          wireframe
        />
      </mesh>

      {/* Outer Wireframe Icosahedron Cage */}
      <mesh ref={coreWire2Ref}>
        <icosahedronGeometry args={[0.48, 0]} />
        <meshBasicMaterial
          color={MINT_GREEN}
          transparent
          opacity={0.25}
          wireframe
        />
      </mesh>

      {/* Subatomic Particle Cloud */}
      <SubatomicCloud />
      
      {/* Volumetric Glow 1 (Emerald Core) */}
      <mesh ref={glowInnerRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={MINT_GREEN}
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Volumetric Glow 2 (Wide Halo) */}
      <mesh ref={glowOuterRef}>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshBasicMaterial
          color={EMERALD_GREEN}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      <pointLight color={EMERALD_GREEN} intensity={6} distance={6} decay={1.5} />
    </group>
  )
}

// Layer 3: Intelligence Processing Layer (Holographic Rings, Satellites & Compass Marks)
function ProcessingRings() {
  const groupRef = useRef<THREE.Group>(null)
  const counterGroupRef = useRef<THREE.Group>(null)
  const sat1Ref = useRef<THREE.Mesh>(null)
  const sat2Ref = useRef<THREE.Mesh>(null)
  const sat3Ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.rotation.y = elapsed * 0.08
    }
    if (counterGroupRef.current) {
      counterGroupRef.current.rotation.y = elapsed * -0.12
    }
    
    // Satellites orbiting on the torus rings
    if (sat1Ref.current) {
      const angle = elapsed * 1.5
      sat1Ref.current.position.set(Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5)
    }
    if (sat2Ref.current) {
      const angle = elapsed * -1.2 + Math.PI / 3
      sat2Ref.current.position.set(0, Math.cos(angle) * 1.3, Math.sin(angle) * 1.3)
    }
    if (sat3Ref.current) {
      const angle = elapsed * 0.9 + Math.PI / 6
      sat3Ref.current.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0)
    }
  })

  // Pre-generate compass tick marks for telemetry ring
  const compassTicks = useMemo(() => {
    const count = 12
    const points = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI
      points.push(new THREE.Vector3(Math.cos(angle) * 1.55, 0, Math.sin(angle) * 1.55))
    }
    return points
  }, [])

  return (
    <group>
      {/* Clockwise rotating ring systems */}
      <group ref={groupRef}>
        {/* Horizontal Torus Ring */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[1.5, 0.012, 4, 50]} />
            <meshStandardMaterial
              color={MINT_GREEN}
              emissive={MINT_GREEN}
              emissiveIntensity={1}
              transparent
              opacity={0.4}
              wireframe
            />
          </mesh>
          <mesh ref={sat1Ref}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial
              color={PURE_WHITE}
              emissive={MINT_GREEN}
              emissiveIntensity={4}
            />
          </mesh>
        </group>

        {/* Angled Data Torus Ring */}
        <group rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <mesh>
            <torusGeometry args={[1.8, 0.008, 4, 50]} />
            <meshStandardMaterial
              color={PURE_WHITE}
              emissive={PURE_WHITE}
              emissiveIntensity={1.5}
              transparent
              opacity={0.3}
              wireframe
            />
          </mesh>
          <mesh ref={sat3Ref}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color={PURE_WHITE}
              emissive={PURE_WHITE}
              emissiveIntensity={3}
            />
          </mesh>
        </group>
      </group>

      {/* Counter-clockwise rotating ring systems (Concentric double-ring effect) */}
      <group ref={counterGroupRef}>
        {/* Concentric Horizontal Telemetry Ring with ticks */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[1.55, 0.005, 8, 64]} />
            <meshBasicMaterial color={MINT_GREEN} transparent opacity={0.2} />
          </mesh>
          {/* Compass Ticks */}
          {compassTicks.map((p, i) => (
            <mesh key={i} position={p}>
              <boxGeometry args={[0.015, 0.04, 0.015]} />
              <meshBasicMaterial color={MINT_GREEN} transparent opacity={0.6} />
            </mesh>
          ))}
        </group>

        {/* Vertical Torus Ring */}
        <group rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <torusGeometry args={[1.3, 0.012, 4, 50]} />
            <meshStandardMaterial
              color={EMERALD_GREEN}
              emissive={EMERALD_GREEN}
              emissiveIntensity={1.5}
              transparent
              opacity={0.5}
            />
          </mesh>
          <mesh ref={sat2Ref}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial
              color={PURE_WHITE}
              emissive={EMERALD_GREEN}
              emissiveIntensity={5}
            />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// Layer 2: Neural Network Layer (Hubs, Synapses & Flowing Data Comets)
function NeuralNetwork() {
  const pointsHubsRef = useRef<THREE.Points>(null)
  const pointsSynapsesRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const instRef = useRef<THREE.InstancedMesh>(null)
  
  const count = 80 // Node count
  const packetCount = 20 // Comets count
  const instancesPerPacket = 4 // Comet segments (Head + 3 tail segments)

  // Generate node coordinates (Hubs vs Synapses) and connection paths
  const [hubsPositions, synapsesPositions, linePositions, adjacencyList, pointsArray] = useMemo(() => {
    const points: THREE.Vector3[] = []
    const hubs: number[] = []
    const synapses: number[] = []
    
    for (let i = 0; i < count; i++) {
      const r = 0.9 + randomFromSeed(i * 3) * 0.8
      const theta = randomFromSeed(i * 3 + 1) * 2 * Math.PI
      const phi = Math.acos(2 * randomFromSeed(i * 3 + 2) - 1)
      
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      
      const node = new THREE.Vector3(x, y, z)
      points.push(node)
      
      // Categorize: 25% are Major Hubs, 75% are standard synapse nodes
      if (i % 4 === 0) {
        hubs.push(x, y, z)
      } else {
        synapses.push(x, y, z)
      }
    }

    const lines: number[] = []
    const adj: number[][] = Array.from({ length: count }, () => [])
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dist = points[i].distanceTo(points[j])
        // Establish network mesh connections
        if (dist < 0.85) {
          lines.push(points[i].x, points[i].y, points[i].z)
          lines.push(points[j].x, points[j].y, points[j].z)
          adj[i].push(j)
          adj[j].push(i)
        }
      }
    }

    return [
      new Float32Array(hubs),
      new Float32Array(synapses),
      new Float32Array(lines),
      adj,
      points
    ]
  }, [])

  // Instanced tracking array for comets
  const packets = useMemo(() => {
    const arr = []
    for (let i = 0; i < packetCount; i++) {
      let seedOffset = 0
      const getRand = () => randomFromSeed(i * 10 + (seedOffset++))
      
      let startIdx = Math.floor(getRand() * count)
      while (adjacencyList[startIdx].length === 0) {
        startIdx = Math.floor(getRand() * count)
      }
      
      const neighbors = adjacencyList[startIdx]
      const endIdx = neighbors[Math.floor(getRand() * neighbors.length)]
      
      arr.push({
        startIdx,
        endIdx,
        progress: getRand(),
        speed: 0.5 + getRand() * 0.7,
      })
    }
    return arr
  }, [adjacencyList])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Colors for comet fade trail
  const headColor = useMemo(() => new THREE.Color(PURE_WHITE), [])
  const tailColor1 = useMemo(() => new THREE.Color(MINT_GREEN).multiplyScalar(0.75), [])
  const tailColor2 = useMemo(() => new THREE.Color(EMERALD_GREEN).multiplyScalar(0.45), [])
  const tailColor3 = useMemo(() => new THREE.Color(EMERALD_GREEN).multiplyScalar(0.15), [])

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime
    
    // Rotate groups
    if (pointsHubsRef.current) {
      pointsHubsRef.current.rotation.y = elapsed * 0.05
      pointsHubsRef.current.rotation.z = elapsed * 0.02
    }
    if (pointsSynapsesRef.current) {
      pointsSynapsesRef.current.rotation.y = elapsed * 0.05
      pointsSynapsesRef.current.rotation.z = elapsed * 0.02
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = elapsed * 0.05
      linesRef.current.rotation.z = elapsed * 0.02
    }
    if (instRef.current) {
      instRef.current.rotation.y = elapsed * 0.05
      instRef.current.rotation.z = elapsed * 0.02
    }

    // Animate comet trails (Head + 3 tail segments)
    if (instRef.current) {
      packets.forEach((packet, i) => {
        packet.progress += delta * packet.speed
        if (packet.progress >= 1) {
          packet.progress = 0
          packet.startIdx = packet.endIdx
          const neighbors = adjacencyList[packet.startIdx]
          if (neighbors && neighbors.length > 0) {
            packet.endIdx = neighbors[Math.floor(Math.random() * neighbors.length)]
          } else {
            let nextIdx = Math.floor(Math.random() * count)
            while (adjacencyList[nextIdx].length === 0) {
              nextIdx = Math.floor(Math.random() * count)
            }
            packet.startIdx = nextIdx
            const newNeighbors = adjacencyList[nextIdx]
            packet.endIdx = newNeighbors[Math.floor(Math.random() * newNeighbors.length)]
          }
          packet.speed = 0.5 + Math.random() * 0.7
        }

        const startNode = pointsArray[packet.startIdx]
        const endNode = pointsArray[packet.endIdx]
        
        if (startNode && endNode) {
          for (let t = 0; t < instancesPerPacket; t++) {
            const instanceId = i * instancesPerPacket + t
            
            // Stagger tail progress (e.g. 0.04 segment offset)
            const tailProgress = Math.max(0, Math.min(1, packet.progress - (t * 0.05)))
            
            const x = THREE.MathUtils.lerp(startNode.x, endNode.x, tailProgress)
            const y = THREE.MathUtils.lerp(startNode.y, endNode.y, tailProgress)
            const z = THREE.MathUtils.lerp(startNode.z, endNode.z, tailProgress)
            
            dummy.position.set(x, y, z)
            
            // Tail segments get progressively smaller
            const baseScale = 0.045 + Math.sin(elapsed * 12 + i) * 0.015
            const tailScaleFactor = 1.0 - (t * 0.22) // 1.0, 0.78, 0.56, 0.34
            const finalScale = baseScale * tailScaleFactor
            
            dummy.scale.set(finalScale, finalScale, finalScale)
            dummy.updateMatrix()
            
            instRef.current!.setMatrixAt(instanceId, dummy.matrix)
            
            // Color trail gradient interpolation
            const color = t === 0 ? headColor : t === 1 ? tailColor1 : t === 2 ? tailColor2 : tailColor3
            instRef.current!.setColorAt(instanceId, color)
          }
        }
      })
      instRef.current.instanceMatrix.needsUpdate = true
      if (instRef.current.instanceColor) {
        instRef.current.instanceColor.needsUpdate = true
      }
    }
  })

  return (
    <group>
      {/* Major Hubs: Larger, glowing white/cyan */}
      <Points ref={pointsHubsRef} positions={hubsPositions}>
        <PointMaterial
          transparent
          color={PURE_WHITE}
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>

      {/* Minor Synapse Nodes: Smaller, emerald/mint */}
      <Points ref={pointsSynapsesRef} positions={synapsesPositions}>
        <PointMaterial
          transparent
          color={MINT_GREEN}
          size={0.045}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>

      {/* Pathways */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={EMERALD_GREEN}
          transparent
          opacity={0.2}
          linewidth={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Flowing comets with tails */}
      <instancedMesh ref={instRef} args={[undefined, undefined, packetCount * instancesPerPacket]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial
          transparent
          blending={THREE.AdditiveBlending}
        />
      </instancedMesh>
    </group>
  )
}

// Layer 1: Nested Double-Glass Shells (Faceted Refractions & Core Containment)
function GlassShells() {
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    if (outerRef.current) {
      outerRef.current.rotation.y = elapsed * -0.04
      outerRef.current.rotation.x = elapsed * 0.015
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = elapsed * 0.06
      innerRef.current.rotation.z = elapsed * -0.02
    }
  })

  return (
    <group>
      {/* Outer Shell: Polished Glass */}
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[2.2, 1]} />
        <meshPhysicalMaterial
          color={PURE_WHITE}
          transmission={0.9}
          opacity={1}
          metalness={0.1}
          roughness={0.1}
          ior={1.5}
          thickness={0.1}
        />
      </mesh>

      {/* Inner Shell: Rotating Faceted Crystal Wireframe */}
      <mesh ref={innerRef}>
        <dodecahedronGeometry args={[1.75, 0]} />
        <meshPhysicalMaterial
          color={MINT_GREEN}
          transparent
          opacity={0.15}
          roughness={0.0}
          metalness={0.1}
          transmission={0.8}
          ior={1.3}
          wireframe
        />
      </mesh>
    </group>
  )
}

// Base Platform with grids and indicators
function Platform() {
  return (
    <group position={[0, -3.5, 0]}>
      {/* Base cylinder */}
      <mesh receiveShadow>
        <cylinderGeometry args={[2.5, 3, 0.2, 64]} />
        <meshPhysicalMaterial
          color={PURE_WHITE}
          metalness={0.3}
          roughness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
        />
      </mesh>
      
      {/* Mint LED Accent Ring */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.05, 64]} />
        <meshStandardMaterial
          color={EMERALD_GREEN}
          emissive={EMERALD_GREEN}
          emissiveIntensity={4}
        />
      </mesh>

      {/* Grid interface simulation on platform */}
      <group position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.5, 0.52, 32]} />
          <meshBasicMaterial color={MINT_GREEN} transparent opacity={0.35} />
        </mesh>
        <mesh>
          <ringGeometry args={[1.2, 1.22, 32]} />
          <meshBasicMaterial color={MINT_GREEN} transparent opacity={0.35} />
        </mesh>
        <mesh>
          <ringGeometry args={[2.0, 2.02, 32]} />
          <meshBasicMaterial color={MINT_GREEN} transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Heavy crystal acrylic base */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[2.8, 3.2, 0.4, 64]} />
        <MeshTransmissionMaterial
          transmission={0.95}
          roughness={0.05}
          ior={1.4}
          color={PURE_WHITE}
          resolution={256}
        />
      </mesh>
    </group>
  )
}

// Moving key light sweeps for high-end cinematic reflections
function RotatingKeyLight() {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  
  useFrame((state) => {
    const elapsed = state.clock.elapsedTime
    if (lightRef.current) {
      lightRef.current.position.set(
        Math.sin(elapsed * 0.7) * 8,
        4,
        Math.cos(elapsed * 0.7) * 8
      )
    }
  })

  return <directionalLight ref={lightRef} intensity={1.5} color={PURE_WHITE} />
}

// Interactive Parallax Cam Rig
function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (group.current) {
      const targetX = (state.mouse.x * Math.PI) / 8
      const targetY = (state.mouse.y * Math.PI) / 8
      
      group.current.rotation.x += (targetY - group.current.rotation.x) * 0.05
      group.current.rotation.y += (targetX - group.current.rotation.y) * 0.05
    }
  })

  return <group ref={group}>{children}</group>
}

// Main 3D Scene Wrapper
export default function NeuralCore3D() {
  const [hovered, setHovered] = useState(false)

  return (
    <div 
      className="w-full h-full min-h-[500px] md:min-h-[600px] cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <React.Suspense fallback={null}>
          {/* Cinematic Sweeping Lights */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[-10, -10, -5]} intensity={0.6} color={MINT_GREEN} />
          <spotLight 
            position={[0, 8, 0]} 
            intensity={2} 
            angle={0.5} 
            penumbra={1} 
            color={EMERALD_GREEN} 
          />
          <RotatingKeyLight />

          <Rig>
            <Float
              speed={hovered ? 3.5 : 1.5}
              rotationIntensity={hovered ? 0.6 : 0.2}
              floatIntensity={hovered ? 2.5 : 1.0}
              floatingRange={[-0.2, 0.2]}
            >
              <group position={[0, 0.4, 0]}>
                <QuantumCore />
                <ProcessingRings />
                <NeuralNetwork />
                <GlassShells />
              </group>
            </Float>
          </Rig>
          
          <Platform />

          <Environment preset="city" />
        </React.Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}
