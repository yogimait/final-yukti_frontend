"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, type HTMLMotionProps, useInView, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

interface TypingAnimationProps extends HTMLMotionProps<any> {
  children?: string
  words?: string[]
  duration?: number
  typeSpeed?: number
  deleteSpeed?: number
  delay?: number
  pauseDelay?: number
  loop?: boolean
  as?: React.ElementType
  startOnView?: boolean
  showCursor?: boolean
  cursorStyle?: "line" | "block" | "underscore"
}

export function TypingAnimation({
  children,
  words,
  className,
  duration = 100,
  typeSpeed,
  deleteSpeed,
  delay = 0,
  pauseDelay = 1000,
  loop = false,
  as: Component = "span",
  startOnView = true,
  showCursor = true,
  cursorStyle = "line",
  ...props
}: TypingAnimationProps) {
  const MotionComponent = motion.create(Component)

  const [displayedText, setDisplayedText] = useState<string>("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [phase, setPhase] = useState<"typing" | "pause" | "deleting">("typing")
  
  const elementRef = useRef<HTMLElement | null>(null)
  const isInView = useInView(elementRef as React.RefObject<Element>, {
    amount: 0.3,
    once: true,
  })

  const wordsToAnimate = useMemo(
    () => words || (children ? [children] : []),
    [words, children]
  )
  
  const typingSpeed = typeSpeed || duration
  const deletingSpeed = deleteSpeed || typingSpeed / 2
  const shouldStart = startOnView ? isInView : true

  useEffect(() => {
    if (!shouldStart || wordsToAnimate.length === 0) return

    const timeoutDelay =
      delay > 0 && displayedText === ""
        ? delay
        : phase === "typing"
          ? typingSpeed
          : phase === "deleting"
            ? deletingSpeed
            : pauseDelay

    const timeout = setTimeout(() => {
      const currentWord = wordsToAnimate[currentWordIndex] || ""
      const graphemes = Array.from(currentWord)

      switch (phase) {
        case "typing":
          if (currentCharIndex < graphemes.length) {
            setDisplayedText(graphemes.slice(0, currentCharIndex + 1).join(""))
            setCurrentCharIndex(currentCharIndex + 1)
          } else {
            if (wordsToAnimate.length > 1 || loop) {
              setPhase("pause")
            }
          }
          break

        case "pause":
          setPhase("deleting")
          break

        case "deleting":
          if (currentCharIndex > 0) {
            setDisplayedText(graphemes.slice(0, currentCharIndex - 1).join(""))
            setCurrentCharIndex(currentCharIndex - 1)
          } else {
            const nextIndex = (currentWordIndex + 1) % wordsToAnimate.length
            setCurrentWordIndex(nextIndex)
            setPhase("typing")
          }
          break
      }
    }, timeoutDelay)

    return () => clearTimeout(timeout)
  }, [shouldStart, phase, currentCharIndex, currentWordIndex, wordsToAnimate, typingSpeed, deletingSpeed, pauseDelay, delay, loop])

  const getCursorChar = () => {
    switch (cursorStyle) {
      case "block": return "▌"
      case "underscore": return "_"
      default: return "|"
    }
  }

  return (
    <MotionComponent
      ref={elementRef}
      className={cn("inline-flex items-center whitespace-pre-wrap", className)}
      {...props}
    >
      {/* Motion span for the text ensures layout shifts are handled smoothly */}
      <motion.span layout transition={{ duration: 0.05 }}>
        {displayedText}
      </motion.span>

      {/* Motion-driven Cursor */}
      <AnimatePresence>
        {showCursor && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: "linear",
            }}
            className="ml-0.5 inline-block font-normal"
          >
            {getCursorChar()}
          </motion.span>
        )}
      </AnimatePresence>
    </MotionComponent>
  )
}