"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { XLogo } from "./x-logo"

interface Fighter {
  name: string
  image: string
  flipHorizontal?: boolean
  scale?: number
  mobileScale?: number
  mobileShiftX?: number
  mobileShiftY?: number
  mobileObjectPosition?: string
  desktopShiftX?: number
  desktopObjectPosition?: string
}

interface FightCardProps {
  fightId: number
  fightLabel: string
  fighterA: Fighter
  fighterB: Fighter
  mockVotes?: Record<string, number>
  onBack: () => void
}

export function FightCard({ fightId, fightLabel, fighterA, fighterB, mockVotes, onBack }: FightCardProps) {
  const [voted, setVoted] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [total, setTotal] = useState(0)
  const [voting, setVoting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const [debugFraming, setDebugFraming] = useState(false)

  useEffect(() => {
    // Trigger fade-in after a short delay for dramatic effect
    const timer = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    setDebugFraming(params.get("frameDebug") === "1")
  }, [])

  useEffect(() => {
    let cancelled = false
    setAssetsReady(false)

    if (typeof window === "undefined") return

    const preloadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new window.Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = src
      })

    Promise.all([preloadImage(fighterA.image), preloadImage(fighterB.image)]).then(() => {
      if (cancelled) return
      // Small delay makes the reveal feel intentional and smooth.
      setTimeout(() => {
        if (!cancelled) setAssetsReady(true)
      }, 120)
    })

    return () => {
      cancelled = true
    }
  }, [fighterA.image, fighterB.image])

  // Fetch existing votes on mount (merge with mock data)
  const fetchVotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/votes/${fightId}`)
      if (res.ok) {
        const data = await res.json()
        const realCounts: Record<string, number> = data.counts || {}

        // Merge mock votes with real votes
        if (mockVotes) {
          for (const [name, count] of Object.entries(mockVotes)) {
            realCounts[name] = (realCounts[name] || 0) + count
          }
        }

        const realTotal = Object.values(realCounts).reduce((sum, c) => sum + c, 0)
        setCounts(realCounts)
        setTotal(realTotal)
        if (data.userVote) setVoted(data.userVote)
      }
    } catch (err) {
      console.error("Failed to fetch votes:", err)
    }
  }, [fightId, mockVotes])

  useEffect(() => {
    fetchVotes()
  }, [fetchVotes])

  const castVote = async (fighterName: string) => {
    if (voted || voting) return
    setVoting(true)

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fightId, fighter: fighterName }),
      })

      const data = await res.json()

      if (res.ok) {
        // Optimistically update counts so percentages are correct immediately
        const newCounts = { ...counts, [fighterName]: (counts[fighterName] || 0) + 1 }
        const newTotal = total + 1
        setCounts(newCounts)
        setTotal(newTotal)
        setVoted(fighterName)
        // Sync with server in background
        fetchVotes()
      } else if (data.error === "already_voted") {
        // They already voted (maybe from another tab or IP match)
        setVoted(data.vote)
        await fetchVotes()
      }
    } catch (err) {
      console.error("Failed to vote:", err)
    } finally {
      setVoting(false)
    }
  }

  const getPercentage = (name: string) => {
    if (total === 0) return 0
    return Math.round(((counts[name] || 0) / total) * 100)
  }

  const pctA = getPercentage(fighterA.name)
  const pctB = getPercentage(fighterB.name)
  const showFighters = mounted && assetsReady

  const wrapperStyle = (fighter: Fighter): React.CSSProperties => ({
    '--d-scale': fighter.scale ?? 1,
    '--m-scale': fighter.mobileScale ?? 1.28,
    '--m-shift-x': `${fighter.mobileShiftX ?? 0}%`,
    '--m-shift': `${fighter.mobileShiftY ?? -6}%`,
    '--d-shift-x': `${fighter.desktopShiftX ?? 0}%`,
    '--m-object-position': fighter.mobileObjectPosition ?? "center bottom",
    '--d-object-position': fighter.desktopObjectPosition ?? "center bottom",
  } as React.CSSProperties)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="absolute top-6 left-6 z-20 text-foreground text-sm lowercase tracking-wider hover:opacity-60 transition-opacity cursor-pointer"
        aria-label="Back to fight list"
      >
        {"< back"}
      </button>

      {/* Main matchup area - fills the screen */}
      <div className="flex-1 flex flex-col w-full max-w-[430px] mx-auto md:max-w-none">
        {/* Fighter names row */}
        <div className="flex items-center justify-between px-8 md:px-16 pt-16 pb-2">
          <span
            className={`text-foreground lowercase tracking-wider transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
            style={{ fontSize: "clamp(1.4rem, 4vw, 2.5rem)" }}
          >
            {fighterA.name}
            {voted && <span className="ml-2 text-muted-foreground" style={{ fontSize: "0.6em" }}>{pctA}%</span>}
          </span>
          <span
            className={`text-foreground lowercase tracking-wider transition-all duration-700 ease-out ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
            style={{ fontSize: "clamp(1.4rem, 4vw, 2.5rem)" }}
          >
            {voted && <span className="mr-2 text-muted-foreground" style={{ fontSize: "0.6em" }}>{pctB}%</span>}
            {fighterB.name}
          </span>
        </div>

        {/* Fighters and center text */}
        <div className="relative flex-1 flex items-stretch overflow-hidden">
          {/* Left bar - height scales like a progress bar with fighter A votes */}
          <div className={`shrink-0 flex flex-col justify-end ml-4 md:ml-8 transition-opacity duration-700 ease-out ${
            mounted ? "opacity-100" : "opacity-0"
          }`} style={{ width: "9px", transitionDelay: "300ms" }}>
            <div
              className="w-full bg-foreground transition-all duration-700 ease-out"
              style={{ height: voted ? `${Math.max(2, pctA)}%` : "100%" }}
            />
          </div>

          {/* Fighter A */}
          <button
            type="button"
            onClick={() => castVote(fighterA.name)}
            disabled={!!voted || voting}
            className={`relative flex-1 cursor-pointer transition-all duration-700 ease-out overflow-hidden ${
              showFighters ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            } ${
              voted === fighterA.name
                ? "!opacity-100"
                : voted
                  ? "!opacity-30"
                  : "hover:scale-[1.02]"
            } ${voted || voting ? "cursor-default" : ""}`}
            style={{ transitionDelay: "200ms" }}
            aria-label={`Vote for ${fighterA.name}`}
          >
            <div className="absolute inset-0 fighter-img-wrap" style={wrapperStyle(fighterA)}>
              <Image
                src={fighterA.image || "/placeholder.svg"}
                alt={fighterA.name}
                fill
                className={`fighter-image object-contain transition-opacity duration-[1200ms] ease-out ${
                  showFighters ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: fighterA.flipHorizontal ? "scaleX(-1)" : undefined,
                  transformOrigin: "center bottom",
                }}
                sizes="50vw"
              />
            </div>
          </button>

          {/* Center text - vertical */}
          <div className={`flex flex-col items-center justify-center shrink-0 z-10 transition-all duration-700 ease-out ${
            mounted ? "opacity-100" : "opacity-0"
          }`} style={{ transitionDelay: "600ms" }}>
            <p
              className="text-foreground lowercase tracking-wider text-center"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: "clamp(0.7rem, 1.5vw, 1rem)",
                letterSpacing: "0.15em",
              }}
            >
              {voting
                ? "voting..."
                : voted
                  ? `you voted ${voted}`
                  : "click your fighter to vote"}
            </p>
          </div>

          {/* Fighter B */}
          <button
            type="button"
            onClick={() => castVote(fighterB.name)}
            disabled={!!voted || voting}
            className={`relative flex-1 cursor-pointer transition-all duration-700 ease-out overflow-hidden ${
              showFighters ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            } ${
              voted === fighterB.name
                ? "!opacity-100"
                : voted
                  ? "!opacity-30"
                  : "hover:scale-[1.02]"
            } ${voted || voting ? "cursor-default" : ""}`}
            style={{ transitionDelay: "400ms" }}
            aria-label={`Vote for ${fighterB.name}`}
          >
            <div className="absolute inset-0 fighter-img-wrap" style={wrapperStyle(fighterB)}>
              <Image
                src={fighterB.image || "/placeholder.svg"}
                alt={fighterB.name}
                fill
                className={`fighter-image object-contain transition-opacity duration-[1200ms] ease-out ${
                  showFighters ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: fighterB.flipHorizontal ? "scaleX(-1)" : undefined,
                  transformOrigin: "center bottom",
                }}
                sizes="50vw"
              />
            </div>
          </button>

          {/* Right bar - height scales like a progress bar with fighter B votes */}
          <div className={`shrink-0 flex flex-col justify-end mr-4 md:mr-8 transition-opacity duration-700 ease-out ${
            mounted ? "opacity-100" : "opacity-0"
          }`} style={{ width: "9px", transitionDelay: "500ms" }}>
            <div
              className="w-full bg-foreground transition-all duration-700 ease-out"
              style={{ height: voted ? `${Math.max(2, pctB)}%` : "100%" }}
            />
          </div>

          {debugFraming && (
            <div className="pointer-events-none absolute inset-0 z-30">
              <div className="absolute inset-x-0 top-[15%] border-t border-red-500/70" />
              <div className="absolute inset-x-0 top-[25%] border-t border-blue-500/60" />
              <div className="absolute inset-x-0 top-[35%] border-t border-emerald-500/60" />
              <div className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] text-white">
                frameDebug on
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom logo */}
      <div className="flex justify-center py-8">
        <XLogo className="w-14" />
      </div>
    </div>
  )
}
