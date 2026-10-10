"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export interface IconGridItem {
  id: string;
  /** An SVG/React node — e.g. a react-icons mark. */
  icon: React.ReactNode;
  /** Accessible label for the tile. */
  name: string;
  /** When set, the tile is a link. */
  href?: string;
  target?: string;
  rel?: string;
}

export interface IconGridProps {
  items: IconGridItem[];
  className?: string;
  /**
   * Classes for each tile's inner box — size, padding and hover live here so
   * one grid can be a large showcase or a compact row. Replaces the default
   * entirely (so a caller's hover isn't fighting the built-in one).
   */
  itemClassName?: string;
}

/** The showcase default: large tiles with a lift-on-hover. */
const DEFAULT_ITEM_CLASS =
  "h-24 w-24 p-4 hover:bg-card/60 hover:shadow-md hover:-translate-y-1";

// Orchestrates the children so they fade in one after another.
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const IconGrid = React.forwardRef<HTMLDivElement, IconGridProps>(
  ({ items, className, itemClassName }, ref) => {
    const box = (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border bg-card transition-all duration-300 ease-in-out",
          itemClassName ?? DEFAULT_ITEM_CLASS
        )}
      />
    );

    return (
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "grid grid-cols-3 gap-4 text-center sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
          className
        )}
      >
        {items.map((item) => {
          const inner = React.cloneElement(box, {}, item.icon);
          const shared = {
            variants: itemVariants,
            className:
              "group relative flex flex-col items-center justify-center",
            "aria-label": item.name,
          };

          return item.href ? (
            <motion.a
              key={item.id}
              href={item.href}
              target={item.target}
              rel={item.rel}
              {...shared}
            >
              {inner}
            </motion.a>
          ) : (
            <motion.div key={item.id} {...shared}>
              {inner}
            </motion.div>
          );
        })}
      </motion.div>
    );
  }
);

IconGrid.displayName = "IconGrid";

export { IconGrid };
