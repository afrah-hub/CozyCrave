import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { 
  registerUser, loginUser, getProfile, updateProfileApi,
  fetchCartApi, addToCartApi, updateCartItemApi, removeFromCartApi,
  fetchWishlistApi, addToWishlistApi, removeFromWishlistApi,
  createOrderApi, confirmPaymentApi, fetchMyOrdersApi, cancelOrderApi
} from "../services/api";
import { AppContext } from "./AppContext";
export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const userStr = Cookies.get("cc_user");
    if (userStr && userStr !== "null") {
      try {
        const sUser = JSON.parse(userStr);
        if (sUser && typeof sUser === 'object') return sUser;
      } catch (e) { console.warn("Error parsing user cookie", e); }
    }
    return null;
  });

  const [cart, setCart] = useState(() => {
    try {
      const cartStr = localStorage.getItem("cc_cart");
      return cartStr ? JSON.parse(cartStr) : [];
    } catch (e) { return []; }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const wishStr = localStorage.getItem("cc_wishlist");
      return wishStr ? JSON.parse(wishStr) : [];
    } catch (e) { return []; }
  });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  useEffect(() => {
    // Sync with server on mount if logged in
    const syncWithServer = async () => {
      const token = Cookies.get("cc_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch profile and other data in parallel
        const [profile, cartData, wishData, ordersData] = await Promise.allSettled([
          getProfile(token),
          fetchCartApi(),
          fetchWishlistApi(),
          fetchMyOrdersApi()
        ]);

        if (profile.status === 'fulfilled') {
          setUser(profile.value);
        }

        if (cartData.status === 'fulfilled') {
          const serverCart = cartData.value.map(c => ({
            id: c.id,
            product: { ...c.product, images: c.product.primaryImageUrl ? [c.product.primaryImageUrl] : [] },
            qty: c.quantity
          }));
          // Merge local and server cart
          setCart(prev => mergeCarts(prev, serverCart));
        }

        if (wishData.status === 'fulfilled') {
          const serverWish = wishData.value.map(w => ({
            ...w.product,
            images: w.product.primaryImageUrl ? [w.product.primaryImageUrl] : [],
            wishlistItemId: w.id
          }));
          setWishlist(prev => mergeWishlists(prev, serverWish));
        }

        if (ordersData.status === 'fulfilled') {
          const mappedOrders = (ordersData.value || []).map(o => ({
            id: o.id,
            date: o.createdAt,
            total: o.total,
            status: o.status,
            items: (o.items || []).map(i => ({
              id: i.id,
              name: i.product?.name || i.product?.Name || "Product",
              price: i.price,
              qty: i.quantity,
              image: i.product?.primaryImageUrl || (i.product?.images && i.product?.images[0])
            }))
          }));
          setOrders(mappedOrders);
        }

      } catch (error) {
        console.warn('Error during server sync:', error);
      } finally {
        setIsLoading(false);
      }
    };

    syncWithServer();
  }, []);

  useEffect(() => {
    if (user) {
      Cookies.set("cc_user", JSON.stringify(user), { expires: 7, sameSite: 'strict' });
    } else {
      Cookies.remove("cc_user");
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
      if (patch.name) {
        await updateProfileApi(patch.name);
        const updatedUser = { ...user, name: patch.name };
        setUser(updatedUser);
        Cookies.set("cc_user", JSON.stringify(updatedUser), { expires: 7, sameSite: 'strict' });
      }
      return { ok: true };
    } catch (error) {
      console.warn("Failed to patch user on server", error);
      return { ok: false, message: error.response?.data || "Update failed" };
    }
  }
  function mergeCarts(localCart, serverCart) {
    const merged = [...serverCart];
    localCart.forEach(localItem => {
      const existing = merged.find(m => String(m.product.id) === String(localItem.product.id));
      if (!existing) {
        merged.push(localItem);
      }
      // If item already exists on server, we keep the server version
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
  const login = async ({ identifier, password }) => {
    try {
      const res = await loginUser(identifier, password);
      Cookies.set("cc_token", res.token, { expires: 7, sameSite: 'strict' });
      
      const profile = await getProfile(res.token);
      
      const localCart = JSON.parse(localStorage.getItem("cc_cart")) || [];
      const localWish = JSON.parse(localStorage.getItem("cc_wishlist")) || [];
      
      let serverCart = [];
      let serverWish = [];
      try {
        const cartData = await fetchCartApi();
        serverCart = cartData.map(c => ({
          id: c.id,
          product: { ...c.product, images: c.product.primaryImageUrl ? [c.product.primaryImageUrl] : [] },
          qty: c.quantity
        }));

        const wishData = await fetchWishlistApi();
        serverWish = wishData.map(w => ({
          ...w.product,
          images: w.product.primaryImageUrl ? [w.product.primaryImageUrl] : [],
          wishlistItemId: w.id
        }));
      } catch (e) {
        console.warn("Failed to fetch server cart/wishlist", e);
      }
      
      let serverOrders = [];
      
      const mergedCart = mergeCarts(localCart, serverCart);
      const mergedWish = mergeWishlists(localWish, serverWish);

      setCart(mergedCart);
      setWishlist(mergedWish);
      setUser(profile);
      localStorage.setItem("cc_wishlist", JSON.stringify(mergedWish));
      Cookies.set("cc_user", JSON.stringify(profile), { expires: 7, sameSite: 'strict' });
      
      try {
        const ordersData = await fetchMyOrdersApi();
        const mappedOrders = (ordersData || []).map(o => ({
          id: o.id,
          date: o.createdAt,
          total: o.total,
          status: o.status,
          items: (o.items || []).map(i => ({
            id: i.id,
            name: i.product?.name || i.product?.Name || "Product",
            price: i.price,
            qty: i.quantity,
            image: i.product?.primaryImageUrl || (i.product?.images && i.product?.images[0])
          }))
        }));
        setOrders(mappedOrders);
      } catch (e) {
        console.warn("Failed to fetch server orders", e);
      }

      return { ok: true };
    } catch (err) {
      console.warn("Server auth failed:", err?.response?.data || err?.message || err);
      const errData = err?.response?.data;
      // Backend wraps errors in ApiResponse: { success, message, ... }
      const errMsg = errData?.message
        || (typeof errData === 'string' ? errData : null)
        || err?.message
        || "Invalid credentials";
      return { ok: false, message: errMsg };
    }
  };

  const register = async ({ username, password, email }) => {
    try {
      await registerUser({ username, password, email });
      return { ok: true };
    } catch (err) {
      const msg = err?.response?.data || "Username or email already exists";
      return { ok: false, message: typeof msg === 'string' ? msg : JSON.stringify(msg) };
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("cc_user");
    Cookies.remove("cc_token");
    try {
        axios.post('/api/Auth/logout', {}, { withCredentials: true });
    } catch (e) {}
  };

  const updateUser = async (updates) => {
    if (!user) return;
    if (user.id) {
      return await patchUserOnServer(user.id, updates);
    } else {
      const updated = { ...user, ...updates };
      setUser(updated);
      Cookies.set("cc_user", JSON.stringify(updated), { expires: 7, sameSite: 'strict' });
      return { ok: true };
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
    // Optimistic UI update
    setCart((prev) => {
      const found = prev.find((p) => String(p.product.id) === String(product.id));
      if (found) return prev.map((p) => (String(p.product.id) === String(product.id) ? { ...p, qty: p.qty + qty } : p));
      return [...prev, { product, qty }];
    });

    if (user && user.id) {
      try {
        const res = await addToCartApi(product.id, qty);
        // Sync generated ID back if needed
        setCart((prev) => prev.map((p) => String(p.product.id) === String(product.id) ? { ...p, id: res.id, qty: res.quantity } : p));
      } catch (error) {
        console.warn("Failed to add to cart on server:", error);
      }
    }
  };
  const updateCartQty = async (productId, qty) => {
    // Optimistic UI update
    setCart((prev) => prev.map((p) => (String(p.product.id) === String(productId) ? { ...p, qty } : p)).filter((p) => p.qty > 0));

    if (user && user.id) {
      try {
        const cartItem = cart.find(c => String(c.product?.id) === String(productId) || String(c.productId) === String(productId));
        if (cartItem && cartItem.id) {
           await updateCartItemApi(cartItem.id, qty);
        }
      } catch (error) {
        console.warn("Failed to update cart qty on server:", error);
      }
    }
  };
  const removeFromCart = async (productId) => {
    // Optimistic UI update
    setCart((prev) => prev.filter((p) => String(p.product.id) !== String(productId)));

    if (user && user.id) {
      try {
        const cartItem = cart.find(c => String(c.product?.id) === String(productId) || String(c.productId) === String(productId));
        if (cartItem && cartItem.id) {
           await removeFromCartApi(cartItem.id);
        }
      } catch (error) {
        console.warn("Failed to remove from cart on server:", error);
      }
    }
  };
  const addToWishlist = async (product) => {
    // Optimistic UI update
    setWishlist((prev) => {
        if (prev.find((p) => p.id === product.id)) return prev;
        return [...prev, product];
    });

    if (user && user.id) {
      try {
        const res = await addToWishlistApi(product.id);
        // Sync generated ID back if needed
        setWishlist((prev) => prev.map(p => String(p.id) === String(product.id) ? { ...p, wishlistItemId: res.id } : p));
      } catch (error) {
        console.warn("Failed to add to wishlist on server:", error);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    // Optimistic UI update
    setWishlist((prev) => prev.filter((p) => String(p.id) !== String(productId)));

    if (user && user.id) {
      try {
        const item = wishlist.find((p) => String(p.id) === String(productId));
        if (item && item.wishlistItemId) {
          await removeFromWishlistApi(item.wishlistItemId);
        }
      } catch (error) {
        console.warn("Failed to remove from wishlist on server:", error);
      }
    }
  };
  const checkout = async (addressData) => {
    if (!user) {
      addNotification("Please login to place an order", "error");
      throw new Error("No user");
    }
    if (cart.length === 0) {
      addNotification("Your cart is empty", "warning");
      throw new Error("Cart empty");
    }

    try {
      // Create order and get Stripe clientSecret
      const data = await createOrderApi(addressData);
      
      // CRITICAL: We do NOT clear the cart state here.
      // The user wants to see their items and total during the payment process.
      // cart state remains untouched until confirmOrderPayment is called.
      return data; 
    } catch (err) {
      console.warn("Failed to create order:", err?.response?.data || err.message);
      addNotification("Failed to initiate order. Please try again.", "error");
      throw err;
    }
  };

  const confirmOrderPayment = async (orderId, paymentIntentId) => {
    try {
      const updatedOrder = await confirmPaymentApi(orderId, paymentIntentId);
      const mappedOrder = {
        id: updatedOrder.id,
        date: updatedOrder.createdAt,
        total: updatedOrder.total,
        status: updatedOrder.status,
        items: (updatedOrder.items || []).map(i => ({
          id: i.id,
          name: i.product?.name || i.product?.Name || "Product",
          price: i.price,
          qty: i.quantity,
          image: i.product?.primaryImageUrl || (i.product?.images && i.product?.images[0])
        }))
      };
      setOrders(prev => [mappedOrder, ...prev]);
      
      // Clear cart ONLY after successful payment confirmation from server
      setCart([]);
      localStorage.setItem("cc_cart", JSON.stringify([]));
      
      addNotification("Payment successful! Order confirmed.", "success");
      return updatedOrder;
    } catch (err) {
      console.warn("Payment confirmation failed:", err);
      addNotification("Payment confirmation failed. Please contact support.", "error");
      throw err;
    }
  };
  
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 3000); 
  };
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }; 

  const cancelOrder = async (orderId) => {
    try {
      const updatedOrder = await cancelOrderApi(orderId);
      
      // Update local state - only need to update the status 
      // since the other fields (items, etc) shouldn't have changed
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: updatedOrder.status } : o
      ));
      
      addNotification(`Order #${orderId} was cancelled`, "success");
      return updatedOrder;
    } catch (err) {
      console.error("Failed to cancel order:", err);
      const errorMsg = err.response?.data || "Failed to cancel order";
      addNotification(typeof errorMsg === 'string' ? errorMsg : "Cancellation failed", "error");
      throw err;
    }
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
        confirmOrderPayment,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        orders,
        setOrders,
        notifications,
        addNotification,
        removeNotification,
        cancelOrder,
      }} > {children} </AppContext.Provider>
  );
}