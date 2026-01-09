"use client"

import { motion, useScroll, useSpring, type MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

// We omit MotionProps from HTML attributes to avoid type conflicts
interface ScrollProgressProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  keyof MotionProps
> {
  // Explicitly typing the ref for the motion div
  ref?: React.Ref<HTMLDivElement>
}

export function ScrollProgress({
  className,
  ref,
  ...props
}: ScrollProgressProps) {
  // 1. Get the raw 0 to 1 scroll value
  const { scrollYProgress } = useScroll()

  // 2. Wrap it in a spring for a "premium" smooth effect
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <motion.div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-[100] h-1 origin-left bg-gradient-to-r from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]",
        className
      )}
      style={{
        scaleX, // Now uses the smooth spring value
      }}
      {...props}
    />
  )
}