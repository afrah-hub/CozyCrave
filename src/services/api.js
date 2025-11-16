import axios from 'axios';

const API_BASE = 'http://localhost:3001';

// Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Fetch a specific product by ID
export const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE}/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};


export const loginUser = async (email, password) => {
  try {
    const response = await axios.get(`${API_BASE}/users?email=${email}`);
    const users = response.data;
    if (users.length > 0 && users[0].password === password) {
      return users[0];
    }
    throw new Error('Invalid credentials');
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};
