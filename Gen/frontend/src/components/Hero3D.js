"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Hero3D() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Shoes, 1: Watches, 2: Bags

  // Store active tab ref to access inside requestAnimationFrame
  const activeTabRef = useRef(0);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 5.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const textures = [
      textureLoader.load("/product_sneakers.png"),
      textureLoader.load("/product_watch.png"),
      textureLoader.load("/product_bag.png"),
    ];

    // Pedestal / Stage
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.3, 32);
    const pedestalMat = new THREE.MeshPhysicalMaterial({
      color: 0x18181b,
      roughness: 0.2,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.6;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Neon Pedestal Ring
    const neonRingGeo = new THREE.TorusGeometry(1.62, 0.04, 8, 64);
    const neonRingMat = new THREE.MeshBasicMaterial({
      color: 0xd90429,
    });
    const neonRing = new THREE.Mesh(neonRingGeo, neonRingMat);
    neonRing.rotation.x = Math.PI / 2;
    neonRing.position.y = -1.45;
    scene.add(neonRing);

    // Product Display Mesh (Floating Card displaying the products)
    const cardGeo = new THREE.PlaneGeometry(2.2, 2.2);
    
    // We create multiple materials, one for each product, and swap them
    const cardMaterials = textures.map((texture) => {
      // Configure texture filtering
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      return new THREE.MeshPhysicalMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 0.5,
        depthWrite: true,
      });
    });

    const card = new THREE.Mesh(cardGeo, cardMaterials[0]);
    card.position.y = 0.1;
    scene.add(card);

    // Glowing Hologram Cage (Wireframe Box enclosing the product)
    const cageGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    cage.position.copy(card.position);
    scene.add(cage);

    // Floating particles (dust)
    const particleCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 6 - 1;
      positions[i + 2] = (Math.random() - 0.5) * 8;

      // Color (blend between white and red)
      const isRed = Math.random() > 0.4;
      if (isRed) {
        colors[i] = 217 / 255;
        colors[i + 1] = 4 / 255;
        colors[i + 2] = 41 / 255;
      } else {
        colors[i] = 1.0;
        colors[i + 1] = 1.0;
        colors[i + 2] = 1.0;
      }
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const redLight = new THREE.PointLight(0xd90429, 3, 6);
    redLight.position.set(0, -1, 1);
    scene.add(redLight);

    const whiteLight = new THREE.PointLight(0xffffff, 1.5, 6);
    whiteLight.position.set(0, 1.5, 2);
    scene.add(whiteLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = container.clientWidth;
      height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Swap textures based on react state
      const currentTab = activeTabRef.current;
      if (card.material !== cardMaterials[currentTab]) {
        card.material = cardMaterials[currentTab];
      }

      // Rotate Stage & Neon Ring
      pedestal.rotation.y = elapsedTime * 0.1;
      neonRing.rotation.z = -elapsedTime * 0.2;

      // Float effect for Product Card
      card.position.y = 0.1 + Math.sin(elapsedTime * 1.5) * 0.15;
      cage.position.y = card.position.y;

      // Card Slow Hover Swing
      card.rotation.y = Math.sin(elapsedTime * 0.5) * 0.1;
      
      // Cage slow rotation
      cage.rotation.y = elapsedTime * 0.05;
      cage.rotation.x = elapsedTime * 0.02;

      // Particles drift
      particles.rotation.y = elapsedTime * 0.02;
      const positionsArr = particles.geometry.attributes.position.array;
      for (let i = 1; i < positionsArr.length; i += 3) {
        positionsArr[i] += Math.sin(elapsedTime + i) * 0.002; // tiny waving motion
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Mouse Parallax Follow
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.3;

      // Smooth Lerp
      card.rotation.y += (targetX - card.rotation.y) * 0.08;
      card.rotation.x += (targetY - card.rotation.x) * 0.08;

      renderer.render(scene, camera);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      pedestalGeo.dispose();
      pedestalMat.dispose();
      neonRingGeo.dispose();
      neonRingMat.dispose();
      cardGeo.dispose();
      cardMaterials.forEach((m) => m.dispose());
      cageGeo.dispose();
      cageMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 3D Canvas */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "450px",
          cursor: "grab",
        }}
      />

      {/* Showcase Control Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          background: "rgba(9, 9, 11, 0.8)",
          padding: "6px",
          borderRadius: "30px",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {["Crimson Sneakers", "Luxury Watch", "Designer Bag"].map((label, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              backgroundColor: activeTab === index ? "var(--primary)" : "transparent",
              color: "#ffffff",
              fontSize: "0.8rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "var(--transition)",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
