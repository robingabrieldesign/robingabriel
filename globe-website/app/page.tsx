"use client"

import { Suspense, useRef, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import Globe from "@/components/globe"
import LocationInfo from "@/components/location-info"
import Header from "@/components/header"
import { useLocationData } from "@/hooks/use-location"

export default function Home() {
  const { locationData, loading } = useLocationData()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Create starry background effect
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create stars
    const stars: { x: number; y: number; size: number; opacity: number }[] = []
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5,
        opacity: Math.random() * 0.8 + 0.2,
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Twinkle effect
        star.opacity = Math.max(0.2, Math.min(1, star.opacity + (Math.random() - 0.5) * 0.05))
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Starry background */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />

      <Header />

      {/* Location info display */}
      {!loading && locationData && locationData.city && locationData.country && locationData.timezone && (
        <LocationInfo city={locationData.city} country={locationData.country} timezone={locationData.timezone} />
      )}

      {/* 3D Globe */}
      <div className="relative w-full h-full z-10">
        <Canvas className="w-full h-full">
          <ambientLight intensity={0.2} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Suspense fallback={null}>
            <Globe userLocation={locationData?.coordinates} />
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              autoRotate={true}
              autoRotateSpeed={0.5}
              minDistance={2}
              maxDistance={10}
            />
          </Suspense>
        </Canvas>
      </div>
    </main>
  )
}
