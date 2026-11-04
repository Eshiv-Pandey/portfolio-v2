"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./profile-photo.module.css";

interface ProfileFlipProps {
  images: [{ src: string; alt: string }, { src: string; alt: string }];
  sizes?: string;
  className?: string;
}

export function ProfileFlip({ images, sizes = "144px", className = "" }: ProfileFlipProps) {
  const [active, setActive] = useState(0);

  return (
    <div className={`${styles.card} ${className}`}>
      <button
        type="button"
        className={styles.photo}
        aria-label="Change profile photo"
        aria-pressed={active === 1}
        onClick={() => setActive((photo) => 1 - photo)}
      >
        {images.map((image, index) => (
          <Image
            key={image.src}
            src={image.src}
            alt={active === index ? image.alt : ""}
            aria-hidden={active !== index}
            fill
            sizes={sizes}
            quality={90}
            preload={index === 0}
            loading={index === 1 ? "eager" : undefined}
            className={`${styles.image} ${active === index ? styles.visible : ""}`}
            draggable={false}
          />
        ))}
      </button>
      <p className={styles.caption}>New Delhi, India</p>
    </div>
  );
}
