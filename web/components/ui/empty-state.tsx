"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center py-24 text-center ${className || ""}`}
    >
      {/* Animated icon container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        {/* Decorative rings */}
        <div className="absolute inset-0 -m-4 rounded-full bg-primary/5 animate-pulse" />
        <div className="absolute inset-0 -m-2 rounded-full bg-primary/5" />
        <div className="relative p-5 rounded-full bg-secondary/80 border border-border/50">
          <Icon size={32} className="text-muted-foreground" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm font-semibold text-foreground mb-1.5">{title}</p>
        <p className="text-xs text-muted-foreground mb-6 max-w-[260px] leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* CTA Button */}
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
