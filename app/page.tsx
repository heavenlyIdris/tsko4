"use client"

import { useEffect, useState } from "react"
import { FightMenu } from "@/components/fight-menu"
import { FightCard } from "@/components/fight-card"

const toMinutesOfDay = (hour24: number, minute: number) => hour24 * 60 + minute

const fights = [
  {
    id: 1,
    label: "fight 1",
    startTime: toMinutesOfDay(0, 0),
    endTime: toMinutesOfDay(0, 10),
    fighterA: {
      name: "esteban",
      image: "/images/estebanvotegradient.jpg",
      mobileScale: 2,
      mobileShiftX: 5,
      mobileShiftY: -8,
      mobileObjectPosition: "50% bottom",
    },
    fighterB: {
      name: "munir",
      image: "/images/munirvotegradient.jpg",
      mobileScale: 2,
      mobileShiftX: -18,
      mobileShiftY: -8,
      mobileObjectPosition: "50% bottom",
    },
  },
  {
    id: 2,
    label: "fight 2",
    startTime: toMinutesOfDay(0, 12),
    endTime: toMinutesOfDay(0, 22),
    fighterA: {
      name: "ari",
      image: "/images/arivotegradient.jpg",
      mobileScale: 2,
      mobileShiftX: -10,
      mobileShiftY: -8,
      mobileObjectPosition: "50% bottom",
    },
    fighterB: {
      name: "fiona",
      image: "/images/fionavotegradient.jpg",
      mobileScale: 2,
      mobileShiftX: -18,
      mobileShiftY: -8,
      mobileObjectPosition: "50% bottom",
    },
  },
  {
    id: 3,
    label: "fight 3",
    startTime: toMinutesOfDay(1, 0),
    endTime: toMinutesOfDay(1, 10),
    fighterA: {
      name: "caroline",
      image: "/images/carolinevotegradient.jpg",
      mobileScale: 2,
      mobileShiftX: 11,
      mobileShiftY: -8,
    },
    fighterB: {
      name: "leo",
      image: "/images/leonvote.png",
      mobileScale: 2,
      mobileShiftX: 2,
      mobileShiftY: -8,
    },
  },
  {
    id: 4,
    label: "fight 4",
    startTime: toMinutesOfDay(1, 12),
    endTime: toMinutesOfDay(1, 22),
    fighterA: {
      name: "amman",
      image: "/images/ammanvotegradient.jpg",
      mobileScale: 2,
      mobileShiftX: -15,
      mobileShiftY: -8,
    },
    fighterB: {
      name: "mikey",
      image: "/images/mikeyvotegradients.png",
      mobileScale: 2,
      mobileShiftX: -40,
      mobileShiftY: -8,
      mobileObjectPosition: "26% bottom",
    },
  },
  {
    id: 5,
    label: "fight 5",
    startTime: toMinutesOfDay(2, 50),
    endTime: toMinutesOfDay(3, 0),
    fighterA: {
      name: "iskander",
      image: "/images/iskandervotegradient.jpg",
      mobileScale: 2,
      mobileShiftX: 20,
      mobileShiftY: -8,
      mobileObjectPosition: "74% bottom",
    },
    fighterB: {
      name: "robin",
      image: "/images/robinvoteGRADIENT.jpg",
      mobileScale: 2,
      mobileShiftX: -25,
      mobileShiftY: -8,
      mobileObjectPosition: "26% bottom",
    },
  },
  {
    id: 6,
    label: "fight 6",
    startTime: toMinutesOfDay(3, 0),
    endTime: toMinutesOfDay(3, 10),
    fighterA: {
      name: "marat",
      image: "/images/maratvoteGRADIENT.jpg",
      mobileScale: 2.6,
      mobileShiftX: 50,
      mobileShiftY: -7,
      mobileObjectPosition: "70% bottom",
    },
    fighterB: {
      name: "logan",
      image: "/images/loganvotegradient.jpg",
      mobileScale: 2,
      mobileShiftX: -25,
      mobileShiftY: -8,
      mobileObjectPosition: "26% bottom",
    },
  },
]

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [selectedFight, setSelectedFight] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <main className="min-h-screen bg-background" />
  }

  const activeFight = fights.find((f) => f.id === selectedFight)

  if (activeFight) {
    return (
      <main>
        <FightCard
          fightId={activeFight.id}
          fightLabel={activeFight.label}
          fighterA={activeFight.fighterA}
          fighterB={activeFight.fighterB}
          mockVotes={"mockVotes" in activeFight ? activeFight.mockVotes : undefined}
          onBack={() => setSelectedFight(null)}
        />
      </main>
    )
  }

  return (
    <main>
      <FightMenu
        fights={fights.map((f) => ({ id: f.id, label: f.label, startTime: f.startTime, endTime: f.endTime }))}
        onSelectFight={(id) => setSelectedFight(id)}
      />
    </main>
  )
}
