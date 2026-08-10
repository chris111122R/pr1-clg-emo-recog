"use client"

import React, { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  MeshTransmissionMaterial,
  Float,
  Trail,
  Decal
} from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing"

const PRIMARY = "#10B981"
const SECONDARY = "#34D399"
const ACCENT = "#6EE7B7"
const GLOW = "#ECFDF5"

const EMOJIS = [
  { id: "happy", char: "😊", name: "Happy" },
  { id: "sad", char: "😢", name: "Sad" },
  { id: "angry", char: "😡", name: "Angry" },
  { id: "fear", char: "😨", name: "Fear" },
  { id: "surprise", char: "😲", name: "Surprise" },
  { id: "neutral", char: "😐", name: "Neutral" },
  { id: "love", char: "😍", name: "Love" },
  { id: "thinking", char: "🤔", name: "Thinking" },
  { id: "fatigue", char: "😴", name: "Fatigue" },
  { id: "stress", char: "😖", name: "Stress" },
  { id: "calm", char: "😌", name: "Calm" },
  { id: "excited", char: "😁", name: "Excited" },
]

// Precompute textures for glossy emoji spheres
function createEmojiTexture(char: string) {
  if (typeof document === "undefined") return null
  const canvas = document.createElement("canvas")
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  // Transparent background for Decal
  ctx.clearRect(0, 0, 1024, 1024)
  
  ctx.font = "850px Arial"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(char, 512, 560) // Adjust y slightly for centering
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function EmojiSphere({
  position,
  char,
  targetPos,
  isFused,
  index,
  onHover,
}: {
  position: THREE.Vector3
  char: string
  targetPos: THREE.Vector3
  isFused: boolean
  index: number
  onHover: (idx: number | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useMemo(() => createEmojiTexture(char), [char])
  
  // Orbit logic
  const orbitRadius = 3.5 + Math.sin(index) * 0.8
  const orbitSpeed = 0.2 + (index % 3) * 0.1
  const orbitOffset = (index / 12) * Math.PI * 2
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    if (isFused) {
      // Move to brain outline position
      meshRef.current.position.lerp(targetPos, delta * 2.5)
    } else {
      // Orbit around the center
      const t = state.clock.elapsedTime * orbitSpeed + orbitOffset
      const targetX = Math.cos(t) * orbitRadius
      const targetZ = Math.sin(t) * orbitRadius
      const targetY = Math.sin(t * 2 + index) * 1.2
      
      const orbitPos = new THREE.Vector3(targetX, targetY, targetZ)
      meshRef.current.position.lerp(orbitPos, delta * 3)
    }
    
    // Slight pointer repulsion when not fused
    if (!isFused) {
      const pointer = new THREE.Vector3(
        (state.pointer.x * state.viewport.width) / 2,
        (state.pointer.y * state.viewport.height) / 2,
        0
      )
      const dist = meshRef.current.position.distanceTo(pointer)
      if (dist < 2.0) {
        const dir = meshRef.current.position.clone().sub(pointer).normalize()
        meshRef.current.position.add(dir.multiplyScalar(delta * 2))
      }
    }

    // Always face the camera
    meshRef.current.lookAt(state.camera.position)
  })

  return (
    <Float floatIntensity={isFused ? 0.5 : 2} rotationIntensity={isFused ? 0.2 : 1}>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => onHover(index)}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.35, 64, 64]} />
        <meshPhysicalMaterial
          color="#FFD700"
          emissive="#FFB900"
          emissiveIntensity={0.15}
          roughness={0.08}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          envMapIntensity={3.0}
        />
        {texture && (
          <Decal
            position={[0, 0, 0.35]} // Stick to the "front"
            rotation={[0, 0, 0]}
            scale={[0.6, 0.6, 0.6]} // Adjust scale for fullness
            map={texture}
          />
        )}
      </mesh>
    </Float>
  )
}

function AIBrain() {
  const coreRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2
      coreRef.current.rotation.x += delta * 0.1
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      coreRef.current.scale.set(scale, scale, scale)
    }
  })

  return (
    <group>
      {/* Outer Glass Sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 64, 64]} />
        <MeshTransmissionMaterial
          backside
          thickness={0.5}
          roughness={0.05}
          transmission={1}
          ior={1.3}
          chromaticAberration={0.06}
          color="#ffffff"
        />
      </mesh>
      
      {/* Inner Glowing Neural Brain (Abstract) */}
      <mesh ref={coreRef}>
        <torusKnotGeometry args={[0.6, 0.2, 128, 32]} />
        <meshPhysicalMaterial
          color={PRIMARY}
          emissive={SECONDARY}
          emissiveIntensity={2}
          wireframe
          transparent
          opacity={0.8}
        />
      </mesh>
      <pointLight color={ACCENT} intensity={10} distance={5} decay={2} />
    </group>
  )
}

function UncertaintyRings() {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.2
      ring1Ref.current.rotation.z += delta * 0.3
      const s = 1 + Math.sin(t * 2) * 0.05
      ring1Ref.current.scale.set(s, s, s)
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = Math.PI / 2 + Math.cos(t * 0.4) * 0.3
      ring2Ref.current.rotation.z -= delta * 0.2
      const s = 1 + Math.cos(t * 1.5) * 0.08
      ring2Ref.current.scale.set(s, s, s)
    }
  })

  return (
    <group>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshStandardMaterial color={PRIMARY} transparent opacity={0.3} emissive={PRIMARY} emissiveIntensity={1} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.2, 0.01, 16, 100]} />
        <meshStandardMaterial color={SECONDARY} transparent opacity={0.2} emissive={SECONDARY} emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

function NeuralConnections({
  emojis,
  isFused,
  hoveredIdx
}: {
  emojis: THREE.Vector3[]
  isFused: boolean
  hoveredIdx: number | null
}) {
  const linesRef = useRef<THREE.LineSegments>(null)
  
  const lineGeom = useMemo(() => new THREE.BufferGeometry(), [])
  
  useFrame(() => {
    if (!linesRef.current) return
    const positions: number[] = []
    
    // Draw lines between emojis that are close to each other, or if fused, draw brain connections
    for (let i = 0; i < emojis.length; i++) {
      for (let j = i + 1; j < emojis.length; j++) {
        const dist = emojis[i].distanceTo(emojis[j])
        if (dist < 4.0 || isFused) {
          positions.push(emojis[i].x, emojis[i].y, emojis[i].z)
          positions.push(emojis[j].x, emojis[j].y, emojis[j].z)
        }
      }
      // Occasionally connect to center brain
      if (Math.random() > 0.8 || hoveredIdx === i) {
        positions.push(emojis[i].x, emojis[i].y, emojis[i].z)
        positions.push(0, 0, 0)
      }
    }
    
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    lineGeom.attributes.position.needsUpdate = true
  })

  return (
    <lineSegments ref={linesRef} geometry={lineGeom}>
      <lineBasicMaterial color={GLOW} transparent opacity={0.15} />
    </lineSegments>
  )
}

function Scene() {
  const [isFused, setIsFused] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  // Track emoji positions for connections
  const emojiPositions = useMemo(() => Array.from({ length: 12 }, () => new THREE.Vector3()), [])

  // Calculate brain silhouette target positions for the 12 emojis
  const brainTargets = useMemo(() => {
    const targets: THREE.Vector3[] = []
    // Top hemisphere
    targets.push(new THREE.Vector3(-1, 2.5, 0))
    targets.push(new THREE.Vector3(1, 2.5, 0))
    targets.push(new THREE.Vector3(-2, 1.5, 0))
    targets.push(new THREE.Vector3(2, 1.5, 0))
    targets.push(new THREE.Vector3(-2.5, 0, 0))
    targets.push(new THREE.Vector3(2.5, 0, 0))
    // Lower hemisphere / cerebellum
    targets.push(new THREE.Vector3(-1.5, -1, 0))
    targets.push(new THREE.Vector3(1.5, -1, 0))
    targets.push(new THREE.Vector3(-0.5, -2, 0))
    targets.push(new THREE.Vector3(0.5, -2, 0))
    // Brain stem area
    targets.push(new THREE.Vector3(-0.2, -3, 0))
    targets.push(new THREE.Vector3(0.2, -3, 0))
    return targets
  }, [])

  // Toggle fusion every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFused((prev) => !prev)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle scene rotation based on pointer
      const targetRotationY = (state.pointer.x * Math.PI) / 8
      const targetRotationX = (state.pointer.y * Math.PI) / 16
      
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, delta * 2)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, delta * 2)
    }
  })

  return (
    <group ref={groupRef}>
      <AIBrain />
      <UncertaintyRings />
      
      {EMOJIS.map((emoji, idx) => (
        <EmojiSphere
          key={emoji.id}
          index={idx}
          char={emoji.char}
          position={emojiPositions[idx]}
          targetPos={brainTargets[idx]}
          isFused={isFused}
          onHover={setHoveredIdx}
        />
      ))}
      
      <NeuralConnections emojis={emojiPositions} isFused={isFused} hoveredIdx={hoveredIdx} />
    </group>
  )
}

export default function EmotionUniverse() {
  return (
    <div className="w-full h-[450px] sm:h-[550px] lg:h-[600px]">
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 8, 20]} />
        
        {/* Cinematic Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <spotLight position={[-5, 5, -5]} intensity={2} color={PRIMARY} angle={0.5} penumbra={1} />
        <spotLight position={[0, -5, 5]} intensity={1} color={SECONDARY} angle={0.8} penumbra={1} />
        
        <React.Suspense fallback={null}>
          <Environment preset="city" />
          <Scene />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.2} />
            <ToneMapping />
          </EffectComposer>
        </React.Suspense>
        
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  )
}
