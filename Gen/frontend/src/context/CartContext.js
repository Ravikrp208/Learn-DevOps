"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem("crimson_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }

    const storedLikes = localStorage.getItem("crimson_likes");
    if (storedLikes) {
      try {
        setLikedItems(JSON.parse(storedLikes));
      } catch (e) {
        console.error("Failed to parse likes", e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("crimson_cart", JSON.stringify(cart));
    }
  }, [cart, isMounted]);

  // Save likes to localStorage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("crimson_likes", JSON.stringify(likedItems));
    }
  }, [likedItems, isMounted]);

  const addToCart = (product, quantity = 1, size = "", color = "") => {
    setCart((prevCart) => {
      const selectedSize = size || (product.sizes ? product.sizes[0] : "Standard");
      const selectedColor = color || (product.colors ? product.colors[0] : "Default");

      // Check if product with same size and color already in cart
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { product, quantity, selectedSize, selectedColor }];
      }
    });
    // Automatically open cart drawer for feedback
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, size, color) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleLike = (productId) => {
    setLikedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        likedItems,
        toggleLike,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
