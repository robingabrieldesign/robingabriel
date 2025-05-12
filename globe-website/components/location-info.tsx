"use client"

import { useEffect, useState } from "react"

interface LocationInfoProps {
  city: string
  country: string
  timezone: string
}

export default function LocationInfo({ city, country, timezone }: LocationInfoProps) {
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    // Update time every second
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }

      const formatter = new Intl.DateTimeFormat("en-US", {
        ...options,
        timeZone: timezone,
      })

      setCurrentTime(formatter.format(new Date()))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [timezone])

  return (
    <div className="absolute top-6 left-6 z-10 text-white font-light">
      <p className="text-sm opacity-70">
        {city}, {country}
      </p>
      <p className="text-3xl">{currentTime}</p>
    </div>
  )
}
