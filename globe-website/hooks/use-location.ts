"use client"

import { useState, useEffect } from "react"

interface LocationData {
  city: string
  country: string
  coordinates: [number, number] // [longitude, latitude]
  timezone: string
}

export function useLocationData() {
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // First get user's coordinates
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject("Geolocation is not supported by your browser")
            return
          }

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          })
        })

        const { latitude, longitude } = position.coords

        // Then use a reverse geocoding API to get city and country
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch location data")
        }

        const data = await response.json()

        // Get timezone from browser
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

        setLocationData({
          city: data.city || data.locality || "Unknown City",
          country: data.countryName || "Unknown Country",
          coordinates: [longitude, latitude],
          timezone: timezone,
        })
      } catch (err) {
        console.error("Error fetching location:", err)
        setError(err instanceof Error ? err.message : "Unknown error")

        // Fallback to browser's timezone if geolocation fails
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const cityFromTimezone = browserTimezone.split("/").pop()?.replace("_", " ") || "Unknown"

        setLocationData({
          city: cityFromTimezone,
          country: "Unknown",
          coordinates: [0, 0], // Default to center of the map
          timezone: browserTimezone,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLocationData()
  }, [])

  return { locationData, loading, error }
}
