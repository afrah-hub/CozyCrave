import React, { useEffect, useState } from "react";
import axios from "axios";
import { registerUser } from "../services/api";
import { AppContext } from "./AppContext";
const API_BASE = "http://localhost:3001";
export function AppProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [cart, setCart] = useState([]); 
  const [wishlist, setWishlist] = useState([]); 
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("cc_user");
      const cartStr = localStorage.getItem("cc_cart");
      const wishStr = localStorage.getItem("cc_wishlist");
      if (userStr && userStr !== "null") {
        const sUser = JSON.parse(userStr);
        if (sUser && typeof sUser === 'object') {
          setUser(sUser);
        }
      }
      if (cartStr) {
        const sCart = JSON.parse(cartStr);
        setCart(Array.isArray(sCart) ? sCart : []);
      }
      
      if (wishStr) {
        const sWish = JSON.parse(wishStr);
        setWishlist(Array.isArray(sWish) ? sWish : []);
      }
    } catch (error) {
      console.warn('Error parsing localStorage data:', error);
    
      localStorage.removeItem("cc_user");
      localStorage.removeItem("cc_cart");
      localStorage.removeItem("cc_wishlist");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("cc_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cc_user");
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem("cc_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("cc_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  async function patchUserOnServer(userId, patch) {
    if (!userId) return;
    try {
      const res = await axios.patch(`${API_BASE}/users/${userId}`, patch);
      setUser(res.data);
      localStorage.setItem("cc_user", JSON.stringify(res.data));
      return res.data;
    } catch (error) {
      console.warn("Failed to patch user on server", error);
      return null;
    }
  }
  function mergeCarts(localCart, serverCart) {
    const merged = [...serverCart];
    localCart.forEach(localItem => {
      const existing = merged.find(m => m.product.id === localItem.product.id);
      if (existing) {
        existing.qty += localItem.qty;
      } else {
        merged.push(localItem);
      }
    });
    return merged;
  }
  function mergeWishlists(localWish, serverWish) {
    const merged = [...serverWish];
    localWish.forEach(item => {
      if (!merged.find(m => m.id === item.id)) {
        merged.push(item);
      }
    });
    return merged;
  }
  function mergeOrders(localOrders, serverOrders) {
    const merged = [...serverOrders];
    localOrders.forEach(order => {
      const exists = merged.find(m =>
        m.date === order.date && m.total === order.total
      );
      if (!exists) {
        merged.push(order);
      }
    });
    return merged;
  }
  const login = async ({ identifier, password }) => {
    const norm = (v) => (v || "").trim().toLowerCase();
    const idNorm = norm(identifier);

    try {
      const res = await axios.get(`${API_BASE}/users`);
      const allUsers = res.data || [];
      const found = allUsers.find((u) => {
        const email = norm(u.email);
        const username = norm(u.username);
        const nameAsUsername = norm(u.name);
        return idNorm === email || idNorm === username || idNorm === nameAsUsername;
      });
      if (!found) {
        return { ok: false, message: "Invalid credentials" };
      }
      if (found.isBlock) {
        return { ok: false, message: "Account is blocked" };
      }
      if (String(found.password) !== String(password)) {
        return { ok: false, message: "Invalid credentials" };
      }

      const localCart = JSON.parse(localStorage.getItem("cc_cart")) || [];
      const localWish = JSON.parse(localStorage.getItem("cc_wishlist")) || [];
      const serverCart = (found.cart || []).map((entry) => normalizeCartEntry(entry));
      const serverWish = found.wishlist || [];
      const serverOrders = found.orders || [];
      const mergedCart = mergeCarts(localCart, serverCart);
      const mergedWish = mergeWishlists(localWish, serverWish);
      const mergedOrders = mergeOrders(found.orders || [], serverOrders);

      setCart(mergedCart);
      setWishlist(mergedWish);
      const updatedUser = { ...found, orders: mergedOrders };
      setUser(updatedUser);
      localStorage.setItem("cc_cart", JSON.stringify(mergedCart));
      localStorage.setItem("cc_wishlist", JSON.stringify(mergedWish));
      localStorage.setItem("cc_user", JSON.stringify(updatedUser));
      return { ok: true };
    } catch (err) {
      console.warn("Server auth fallback due to error:", err?.message || err);
    }

    const localUsers = JSON.parse(localStorage.getItem("cc_users")) || [
      { username: "demo", password: "demo123", id: "local-demo" },
    ];
    const foundLocal = localUsers.find((u) => {
      const email = norm(u.email);
      const username = norm(u.username);
      const nameAsUsername = norm(u.name);
      return idNorm === email || idNorm === username || idNorm === nameAsUsername;
    });
    if (foundLocal && String(foundLocal.password) === String(password)) {
      setUser(foundLocal);
      setCart(JSON.parse(localStorage.getItem("cc_cart")) || []);
      setWishlist(JSON.parse(localStorage.getItem("cc_wishlist")) || []);
      return { ok: true };
    }
    return { ok: false, message: "Invalid credentials" };
  };

  const register = async ({ username, password, email }) => {
    try {
      const user = await registerUser({ username, password, email });
      setUser(user);
      setCart([]);

      return { ok: true, user };
    } catch {
      // server unavailable, fallback next
    }    const users = JSON.parse(localStorage.getItem("cc_users")) || [
      { username: "demo", password: "demo123", id: "local-demo" },
    ];
    if (users.find((u) => u.username === username)) {
      return { ok: false, message: "Username already exists" };
    }
    const newUser = { id: `local-${Date.now()}`, username, password, email: email || "", role: "user", isBlock: false, cart: [], wishlist: [], orders: [], created_at: new Date().toISOString() };
    users.push(newUser);
    localStorage.setItem("cc_users", JSON.stringify(users));
    setUser(newUser);
    setCart([]);
    setWishlist([]);
    return { ok: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cc_user");
  };

  const updateUser = async (updates) => {
    if (!user) return;
    if (user.id) {
      await patchUserOnServer(user.id, updates);
    } else {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem("cc_user", JSON.stringify(updated));
      const users = JSON.parse(localStorage.getItem("cc_users")) || [];
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx >= 0) {
        users[idx] = updated;
        localStorage.setItem("cc_users", JSON.stringify(users));
      }
    }
  };

  function normalizeCartEntry(entry) {
    if (!entry) return null;
    if (entry.product && typeof entry.qty === "number") {
      return { product: entry.product, qty: entry.qty };
    }
    if (entry.productId) {
      return { product: { id: entry.productId, name: entry.name || "", price: entry.price || "" }, qty: entry.qty || 1 };
    }
    return { product: entry, qty: 1 };
  }
  const addToCart = async (product, qty = 1) => {
    setCart((prev) => {
      const found = prev.find((p) => String(p.product.id) === String(product.id));
      if (found) return prev.map((p) => (String(p.product.id) === String(product.id) ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { product, qty }];
    });
    if (user && user.id) {
      try {
        const res = await axios.get(`${API_BASE}/users/${user.id}`);
        const userData = res.data;
        const currentCart = userData.cart || [];
        let merged = [...currentCart];
        const idx = merged.findIndex((c) => {
          if (!c) return false;
          if (c.product && c.product.id) return String(c.product.id) === String(product.id);
          if (c.productId) return String(c.productId) === String(product.id);
          return false;
        });
        if (idx >= 0) {
          const existing = merged[idx];
          const existingQty = existing.qty || 1;
          merged[idx] = { ...existing, product: product, qty: existingQty + qty };
        } else {
          merged.push({ product, qty });
        }
        await patchUserOnServer(user.id, { cart: merged });
      } catch (error) {
        console.warn("Failed to sync cart to server:", error);
      }
    }
  };
  const updateCartQty = async (productId, qty) => {
    setCart((prev) => prev.map((p) => (String(p.product.id) === String(productId) ? { ...p, qty } : p)).filter((p) => p.qty > 0));
    if (user && user.id) {
      try {
        const res = await axios.get(`${API_BASE}/users/${user.id}`);
        const userData = res.data;
        const currentCart = userData.cart || [];
        const merged = currentCart.map((c) => {
          const pid = c.product?.id || c.productId;
          if (String(pid) === String(productId)) {
            return { ...c, product: c.product || {}, qty };
          }
          return c;
        }).filter((c) => (c.qty || 0) > 0);
        await patchUserOnServer(user.id, { cart: merged });
      } catch (error) {
        console.warn("Failed to sync cart update to server:", error);
      }
    }
  };
  const removeFromCart = async (productId) => {
    setCart((prev) => prev.filter((p) => String(p.product.id) !== String(productId)));

    if (user && user.id) {
      try {
        const res = await axios.get(`${API_BASE}/users/${user.id}`);
        const u = res.data;
        const currentCart = u.cart || [];
        const merged = currentCart.filter((c) => {
          const pid = c.product?.id || c.productId;
          return String(pid) !== String(productId);
        });
        await patchUserOnServer(user.id, { cart: merged });
      } catch (error) {
        console.warn("Failed to sync cart removal to server:", error);
      }
    }
  };
  const addToWishlist = async (product) => {
    setWishlist((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    if (user && user.id) {
      try {
        const res = await axios.get(`${API_BASE}/users/${user.id}`);
        const u = res.data;
        const currentWish = u.wishlist || [];
        if (!currentWish.find((p) => (p.id || p.productId) === product.id)) {
          const merged = [...currentWish, product];
          await patchUserOnServer(user.id, { wishlist: merged });
        }
      } catch (error) {
        console.warn("Failed to sync wishlist to server:", error);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
    if (user && user.id) {
      try {
        const res = await axios.get(`${API_BASE}/users/${user.id}`);
        const u = res.data;
        const currentWish = u.wishlist || [];
        const merged = currentWish.filter((p) => (p.id || p.productId) !== productId);
        await patchUserOnServer(user.id, { wishlist: merged });
      } catch (error) {
        console.warn("Failed to sync wishlist removal to server:", error);
      }
    }
  };
  const checkout = async (address = null) => {
    if (!user) {
      addNotification("Please login to place an order", "error");
      return;
    }
    if (cart.length === 0) {
      addNotification("Your cart is empty", "warning");
      return;
    }
    const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    const order = {
      date: new Date().toISOString(),
      total: total.toFixed(2),
      status: "success",
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty
      }))
    };

  const updatedOrders = [...(user.orders || []), order];
  const updatedUser = { ...user, orders: updatedOrders, address: address || user.address || null };
    setUser(updatedUser);
    localStorage.setItem("cc_user", JSON.stringify(updatedUser));

    setCart([]);
    localStorage.setItem("cc_cart", JSON.stringify([]));

    if (user.id) {
      try {
        const patch = { orders: updatedOrders, cart: [], ...(address ? { address } : {}) };
        await patchUserOnServer(user.id, patch);
      } catch (err) {
        console.warn("Failed to sync order to server:", err);
      }
    }

    addNotification("Order placed successfully! Cash on Delivery.", "success");
  };
  
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 3000); 
  };
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }; 

const removeOrder = async (orderIndex) => {
    if (!user) return;
    const updatedOrders = (user.orders || []).filter((_, index) => index !== orderIndex);
    const updatedUser = { ...user, orders: updatedOrders };
    setUser(updatedUser);
    localStorage.setItem("cc_user", JSON.stringify(updatedUser));

    if (user.id) {
      try {
        await patchUserOnServer(user.id, { orders: updatedOrders });
      } catch (err) {
        console.warn("Failed to sync order removal to server:", err);
      }
    }

    addNotification("Order removed successfully", "success");
  };
  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        patchUserOnServer,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        checkout,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        notifications,
        addNotification,
        removeNotification,
        removeOrder,
      }} > {children} </AppContext.Provider>
  );
}