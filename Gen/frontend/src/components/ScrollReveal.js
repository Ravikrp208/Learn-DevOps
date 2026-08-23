"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 800,
  style: customStyle = {},
}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); // Reveal only once
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before it fully enters
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

  const getDirectionStyle = () => {
    if (isVisible) {
      return {
        transform: "translate(0, 0) scale(1)",
      };
    }
    switch (direction) {
      case "up":
        return { transform: "translateY(50px) scale(0.98)" };
      case "down":
        return { transform: "translateY(-50px)" };
      case "left":
        return { transform: "translateX(50px)" };
      case "right":
        return { transform: "translateX(-50px)" };
      case "scale":
        return { transform: "scale(0.92)" };
      default:
        return {};
    }
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    transition: `opacity ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    transitionDelay: `${delay}ms`,
    willChange: "transform, opacity",
    ...getDirectionStyle(),
    ...customStyle,
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
