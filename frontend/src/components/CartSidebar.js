import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar({ toast }) {
  const { cart, cartOpen, setCartOpen, updateCart, removeFromCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const handleCheckout = () => {
    if (!user) { navigate('/login'); setCartOpen(false); return; }
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => setCartOpen(false)} />
      <div className="cart-sidebar">
        <div className="cart-sidebar__header">
          <span className="cart-sidebar__title">YOUR CART</span>
          <button onClick={() => setCartOpen(false)} style={{ color: 'var(--text2)', fontSize: 22, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        <div className="cart-sidebar__items">
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
              <p>Your cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.cover_url} alt={item.title} />
              <div className="cart-item__info">
                <div className="cart-item__title">{item.title}</div>
                <div className="cart-item__artist">{item.artist}</div>
                <div className="cart-item__qty">
                  <button className="qty-btn" onClick={() => updateCart(item.id, item.quantity - 1)}>−</button>
                  <span className="qty-num">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateCart(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span className="cart-item__price">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ color: 'var(--text3)', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}
                >✕</button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="cart-sidebar__footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14 }}
              onClick={handleCheckout}
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
