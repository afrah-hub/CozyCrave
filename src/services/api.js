import dbData from '../db.json';
import Cookies from 'js-cookie';

// Helper: load initial data into localStorage if not present
const getProducts = () => {
  const data = localStorage.getItem('cc_mock_products');
  if (!data) {
    // db.json premium category replaced with Chocolate
    const aligned = dbData.products.map(p => p.category === 'Premium' ? { ...p, category: 'Chocolate' } : p);
    localStorage.setItem('cc_mock_products', JSON.stringify(aligned));
    return aligned;
  }
  return JSON.parse(data);
};

const saveProducts = (products) => {
  localStorage.setItem('cc_mock_products', JSON.stringify(products));
};

const getUsers = () => {
  const data = localStorage.getItem('cc_mock_users');
  if (!data) {
    localStorage.setItem('cc_mock_users', JSON.stringify(dbData.users));
    return dbData.users;
  }
  return JSON.parse(data);
};

const saveUsers = (users) => {
  localStorage.setItem('cc_mock_users', JSON.stringify(users));
};

const getCurrentUser = () => {
  const userStr = Cookies.get('cc_user');
  if (userStr && userStr !== "null") {
    try {
      return JSON.parse(userStr);
    } catch (e) {}
  }
  return null;
};

const getOrders = () => {
  const data = localStorage.getItem('cc_mock_orders');
  if (!data) {
    const initialOrders = [];
    dbData.users.forEach(u => {
      if (u.orders) {
        u.orders.forEach(o => {
          initialOrders.push({
            id: o.id || `order-${Math.random().toString(36).substring(2, 9)}`,
            userId: u.id,
            createdAt: o.date,
            total: parseFloat(o.total || 0),
            status: o.status || 'success',
            items: o.items.map(item => ({
              id: item.id,
              quantity: item.qty,
              price: item.price,
              product: {
                id: item.id,
                name: item.name,
                price: item.price,
                primaryImageUrl: `/images/placeholder.jpg`
              }
            }))
          });
        });
      }
    });
    localStorage.setItem('cc_mock_orders', JSON.stringify(initialOrders));
    return initialOrders;
  }
  return JSON.parse(data);
};

const saveOrders = (orders) => {
  localStorage.setItem('cc_mock_orders', JSON.stringify(orders));
};

// Mock apiClient to intercept direct backend API calls made by admin panel
export const apiClient = {
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  },
  get: async (url) => {
    const cleanUrl = url.split('?')[0];

    if (cleanUrl.match(/^\/api\/admin\/users$/)) {
      return { data: { data: getUsers() } };
    }
    if (cleanUrl.match(/^\/api\/Product\/admin$/)) {
      return { data: { data: getProducts() } };
    }
    if (cleanUrl.match(/^\/api\/admin\/orders$/)) {
      return { data: { data: getOrders() } };
    }
    if (cleanUrl.match(/^\/api\/admin\/stats\/total-revenue$/)) {
      const totalRevenue = getOrders()
        .filter(o => o.status === 'success' || o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);
      return { data: { data: { totalRevenue } } };
    }
    if (cleanUrl.match(/^\/api\/admin\/stats\/total-products-purchased$/)) {
      const totalProductsPurchased = getOrders()
        .filter(o => o.status === 'success' || o.status === 'completed')
        .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
      return { data: { data: { totalProductsPurchased } } };
    }
    if (cleanUrl.match(/^\/api\/Product$/)) {
      return { data: { data: getProducts() } };
    }
    const productMatch = cleanUrl.match(/^\/api\/Product\/([^/]+)$/);
    if (productMatch) {
      const id = productMatch[1];
      const product = getProducts().find(p => String(p.id) === String(id));
      return { data: { data: product } };
    }

    return { data: { data: null } };
  },

  post: async (url, payload) => {
    const cleanUrl = url.split('?')[0];

    if (cleanUrl === '/api/Product') {
      const products = getProducts();
      let newProduct = {};
      if (payload instanceof FormData) {
        newProduct = {
          id: (products.length + 1).toString(),
          name: payload.get('Name'),
          description: payload.get('Description'),
          price: parseFloat(payload.get('Price') || 0),
          count: parseInt(payload.get('Count') || 0),
          category: payload.get('Category'),
          images: ['/images/placeholder.jpg'],
          isActive: true,
          created_at: new Date().toISOString()
        };
      } else {
        newProduct = {
          id: (products.length + 1).toString(),
          name: payload.name,
          description: payload.description,
          price: parseFloat(payload.price || 0),
          count: parseInt(payload.count || 0),
          category: payload.category,
          images: ['/images/placeholder.jpg'],
          isActive: true,
          created_at: new Date().toISOString(),
          ...payload
        };
      }
      products.push(newProduct);
      saveProducts(products);
      return { data: { success: true, data: newProduct } };
    }

    return { data: { success: false } };
  },

  put: async (url, payload) => {
    const cleanUrl = url.split('?')[0];

    const productMatch = cleanUrl.match(/^\/api\/Product\/([^/]+)$/);
    if (productMatch) {
      const id = productMatch[1];
      const products = getProducts();
      const index = products.findIndex(p => String(p.id) === String(id));
      if (index !== -1) {
        products[index] = { ...products[index], ...payload };
        saveProducts(products);
        return { data: { success: true, data: products[index] } };
      }
    }

    return { data: { success: false } };
  },

  delete: async (url) => {
    const cleanUrl = url.split('?')[0];

    const productMatch = cleanUrl.match(/^\/api\/Product\/([^/]+)$/);
    if (productMatch) {
      const id = productMatch[1];
      const products = getProducts();
      const filtered = products.filter(p => String(p.id) !== String(id));
      saveProducts(filtered);
      return { data: { success: true } };
    }

    return { data: { success: false } };
  },

  patch: async (url) => {
    const cleanUrl = url.split('?')[0];

    // Toggle user block
    const blockMatch = cleanUrl.match(/^\/api\/admin\/users\/([^/]+)\/block$/);
    if (blockMatch) {
      const userId = blockMatch[1];
      const users = getUsers();
      const index = users.findIndex(u => String(u.id) === String(userId));
      if (index !== -1) {
        users[index].isBlocked = !users[index].isBlocked;
        saveUsers(users);
        return { data: { success: true, data: users[index] } };
      }
    }

    // Cancel order
    const cancelMatch = cleanUrl.match(/^\/api\/Order\/([^/]+)\/cancel$/);
    if (cancelMatch) {
      const orderId = cancelMatch[1];
      const orders = getOrders();
      const index = orders.findIndex(o => String(o.id) === String(orderId));
      if (index !== -1) {
        orders[index].status = 'Cancelled';
        saveOrders(orders);
        return { data: { success: true, data: orders[index] } };
      }
    }

    // Update order status
    const statusMatch = cleanUrl.match(/^\/api\/Order\/([^/]+)\/status$/);
    if (statusMatch) {
      const orderId = statusMatch[1];
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      const newStatus = urlParams.get('status') || 'success';
      const orders = getOrders();
      const index = orders.findIndex(o => String(o.id) === String(orderId));
      if (index !== -1) {
        orders[index].status = newStatus;
        saveOrders(orders);
        return { data: { success: true, data: orders[index] } };
      }
    }

    return { data: { success: false } };
  }
};

// Frontend standard API functions
export const fetchProducts = async () => {
  return getProducts();
};

export const fetchProductById = async (id) => {
  const product = getProducts().find(p => String(p.id) === String(id));
  return product || null;
};

export const registerUser = async (userData) => {
  const users = getUsers();
  const exists = users.some(u => u.email === userData.email);
  if (exists) {
    throw new Error("User already exists");
  }
  const newUser = {
    id: `user-${Math.random().toString(36).substring(2, 9)}`,
    username: userData.username,
    name: userData.username,
    email: userData.email,
    password: userData.password,
    role: 'user',
    isBlock: false,
    cart: [],
    wishlist: [],
    orders: [],
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  return { success: true, message: "Registration successful" };
};

export const loginUser = async (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error("Invalid email or password");
  }
  if (user.isBlocked) {
    throw new Error("Account has been blocked");
  }
  return {
    token: `mock-jwt-token-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      name: user.name || user.username,
      email: user.email,
      role: user.role
    }
  };
};

export const getProfile = async (token) => {
  const parts = token.split('-');
  const userId = parts[3] || parts[parts.length - 2];
  const users = getUsers();
  const user = users.find(u => String(u.id) === String(userId));
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateProfileApi = async (name) => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  
  const users = getUsers();
  const index = users.findIndex(u => String(u.id) === String(currentUser.id));
  if (index !== -1) {
    users[index].name = name;
    users[index].username = name;
    saveUsers(users);
    
    const updatedUser = { ...currentUser, name, username: name };
    Cookies.set("cc_user", JSON.stringify(updatedUser), { expires: 7, sameSite: 'strict' });
    return updatedUser;
  }
  throw new Error("User not found");
};

export const fetchCartApi = async () => {
  const cartStr = localStorage.getItem("cc_cart");
  const cartItems = cartStr ? JSON.parse(cartStr) : [];
  return cartItems.map(item => ({
    id: item.id || `cart-${item.product.id}-${Date.now()}`,
    quantity: item.qty,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      primaryImageUrl: item.product.images?.[0] || '/images/placeholder.jpg'
    }
  }));
};

export const addToCartApi = async (productId, quantity) => {
  return { id: `cart-${productId}-${Date.now()}`, quantity };
};

export const updateCartItemApi = async (cartItemId, quantity) => {
  return { id: cartItemId, quantity };
};

export const removeFromCartApi = async (cartItemId) => {
  return { success: true };
};

export const fetchWishlistApi = async () => {
  const wishStr = localStorage.getItem("cc_wishlist");
  const wishItems = wishStr ? JSON.parse(wishStr) : [];
  return wishItems.map(item => ({
    id: item.wishlistItemId || `wish-${item.id}-${Date.now()}`,
    product: {
      id: item.id,
      name: item.name,
      price: item.price,
      primaryImageUrl: item.images?.[0] || '/images/placeholder.jpg'
    }
  }));
};

export const addToWishlistApi = async (productId) => {
  return { id: `wish-${productId}-${Date.now()}` };
};

export const removeFromWishlistApi = async (wishlistItemId) => {
  return { success: true };
};

export const createOrderApi = async (orderData) => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const cartStr = localStorage.getItem("cc_cart");
  const cartItems = cartStr ? JSON.parse(cartStr) : [];

  if (cartItems.length === 0) throw new Error("Cart is empty");

  const orderId = `order-${Math.random().toString(36).substring(2, 9)}`;
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const newOrder = {
    id: orderId,
    userId: currentUser.id,
    createdAt: new Date().toISOString(),
    total: total,
    status: 'Pending',
    items: cartItems.map(item => ({
      id: `item-${Math.random().toString(36).substring(2, 9)}`,
      quantity: item.qty,
      price: item.product.price,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        primaryImageUrl: item.product.images?.[0] || '/images/placeholder.jpg'
      }
    })),
    address: `${orderData.address}, ${orderData.city || ''}, ${orderData.state || ''}, ${orderData.pincode || ''}, ${orderData.country || ''}`,
    phone: orderData.phone,
    name: orderData.name
  };

  const orders = getOrders();
  orders.push(newOrder);
  saveOrders(orders);

  return {
    order: newOrder,
    payment: {
      clientSecret: `mock_client_secret_${orderId}_${Date.now()}`
    }
  };
};

export const confirmPaymentApi = async (orderId, paymentIntentId) => {
  const orders = getOrders();
  const index = orders.findIndex(o => String(o.id) === String(orderId));
  if (index !== -1) {
    orders[index].status = 'success';
    saveOrders(orders);

    const users = getUsers();
    const currentUser = getCurrentUser();
    if (currentUser) {
      const uIndex = users.findIndex(u => String(u.id) === String(currentUser.id));
      if (uIndex !== -1) {
        if (!users[uIndex].orders) users[uIndex].orders = [];
        users[uIndex].orders.unshift({
          id: orderId,
          date: orders[index].createdAt,
          total: orders[index].total.toFixed(2),
          status: 'success',
          items: orders[index].items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.price,
            qty: item.quantity
          }))
        });
        saveUsers(users);
      }
    }

    return orders[index];
  }
  throw new Error("Order not found");
};

export const fetchMyOrdersApi = async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];

  const orders = getOrders();
  return orders.filter(o => String(o.userId) === String(currentUser.id));
};

export const cancelOrderApi = async (orderId) => {
  const orders = getOrders();
  const index = orders.findIndex(o => String(o.id) === String(orderId));
  if (index !== -1) {
    orders[index].status = 'Cancelled';
    saveOrders(orders);

    const users = getUsers();
    const currentUser = getCurrentUser();
    if (currentUser) {
      const uIndex = users.findIndex(u => String(u.id) === String(currentUser.id));
      if (uIndex !== -1 && users[uIndex].orders) {
        const oIndex = users[uIndex].orders.findIndex(o => String(o.id) === String(orderId));
        if (oIndex !== -1) {
          users[uIndex].orders[oIndex].status = 'Cancelled';
          saveUsers(users);
        }
      }
    }

    return orders[index];
  }
  throw new Error("Order not found");
};

export const updateOrderStatusApi = async (orderId, status) => {
  const orders = getOrders();
  const index = orders.findIndex(o => String(o.id) === String(orderId));
  if (index !== -1) {
    orders[index].status = status;
    saveOrders(orders);
    return orders[index];
  }
  throw new Error("Order not found");
};

export const changePasswordApi = async (currentPassword, newPassword) => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const users = getUsers();
  const index = users.findIndex(u => String(u.id) === String(currentUser.id));
  if (index !== -1) {
    if (users[index].password !== currentPassword) {
      throw new Error("Incorrect current password");
    }
    users[index].password = newPassword;
    saveUsers(users);
    return { success: true, message: "Password updated successfully" };
  }
  throw new Error("User not found");
};

