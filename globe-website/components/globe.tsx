"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere } from "@react-three/drei"
import * as THREE from "three"

interface GlobeProps {
  userLocation?: [number, number] // [longitude, latitude]
}

export default function Globe({ userLocation }: GlobeProps) {
  const globeRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)

  // Create textures
  const [earthTexture, displacementMap] = useMemo(() => {
    const loader = new THREE.TextureLoader()

    // Set crossOrigin to allow loading from blob URLs
    loader.setCrossOrigin("anonymous")

    const earthTex = loader.load("/textures/earth-grayscale.png", undefined, (error) =>
      console.error("Error loading texture:", error),
    )

    const dispMap = loader.load("/textures/earth-displacement.png", undefined, (error) =>
      console.error("Error loading displacement map:", error),
    )

    return [earthTex, dispMap]
  }, [])

  // Convert lat/long to 3D coordinates on sphere
  const latLongToVector3 = (lat: number, long: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (long + 180) * (Math.PI / 180)

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)

    return new THREE.Vector3(x, y, z)
  }

  // Position marker if user location is available
  const markerPosition = useMemo(() => {
    if (!userLocation || !Array.isArray(userLocation) || userLocation.length !== 2) {
      return new THREE.Vector3(0, 0, 0)
    }
    // Calculate the position based on latitude and longitude
    const lat = userLocation[1]
    const long = userLocation[0]
    return latLongToVector3(lat, long, 1.01) // Slightly larger than globe radius
  }, [userLocation])

  // Subtle animation
  useFrame((state, delta) => {
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.02
    }
  })

  return (
    <group>
      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#444444" transparent={true} opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Earth Globe */}
      <Sphere ref={globeRef} args={[1, 128, 128]}>
        <meshStandardMaterial
          color="#333333"
          map={earthTexture}
          displacementMap={displacementMap}
          displacementScale={0.05}
          roughness={0.8}
          metalness={0.2}
          emissive="#111111"
          emissiveIntensity={0.1}
        />
      </Sphere>

      {/* User location marker */}
      {userLocation && Array.isArray(userLocation) && userLocation.length === 2 && (
        <group position={markerPosition}>
          <mesh>
            <sphereGeometry args={[0.01, 16, 16]} />
            <meshBasicMaterial color="#00ff00" />
          </mesh>
        </group>
      )}
    </group>
  )
}
