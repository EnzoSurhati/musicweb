import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [saved, setSaved] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const fetchCart = async () => {
    if (!user) { setCart([]); return; }
    const { data } = await axios.get(`${API}/api/cart`);
    setCart(data);
  };

  const fetchSaved = async () => {
    if (!user) { setSaved([]); return; }
    const { data } = await axios.get(`${API}/api/saved`);
    setSaved(data);
  };

  useEffect(() => { fetchCart(); fetchSaved(); }, [user]);

  const addToCart = async (albumId) => {
    await axios.post(`${API}/api/cart`, { album_id: albumId });
    await fetchCart();
  };

  const updateCart = async (albumId, quantity) => {
    await axios.put(`${API}/api/cart/${albumId}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (albumId) => {
    await axios.delete(`${API}/api/cart/${albumId}`);
    await fetchCart();
  };

  const toggleSaved = async (albumId) => {
    const isSaved = saved.some(s => s.id === albumId);
    if (isSaved) {
      await axios.delete(`${API}/api/saved/${albumId}`);
    } else {
      await axios.post(`${API}/api/saved/${albumId}`);
    }
    await fetchSaved();
  };

  const checkout = async () => {
    const { data } = await axios.post(`${API}/api/orders`);
    await fetchCart();
    return data;
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, saved, cartOpen, setCartOpen,
      addToCart, updateCart, removeFromCart,
      toggleSaved, checkout, fetchCart,
      cartCount, cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
