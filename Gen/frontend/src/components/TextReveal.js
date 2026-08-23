"use client";

import React, { useEffect, useRef, useState } from "react";

export default function TextReveal({ text, delay = 0, duration = 1000 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Animate once
        }
      },
      {
        threshold: 0.05,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const words = text.split(" ");

  return (
    <span ref={ref} style={{ display: "inline-flex", flexWrap: "wrap" }}>
      {words.map((word, index) => (
        <span
          key={index}
          className="mask-text-wrapper"
          style={{ marginRight: "0.28em", display: "inline-block" }}
        >
          <span
            className="mask-text-child"
            style={{
              animationPlayState: isVisible ? "running" : "paused",
              animationDelay: `${delay + index * 90}ms`,
              animationDuration: `${duration}ms`,
            }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
