import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Account({ toast }) {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, email: user.email });
    else navigate('/login');
  }, [user]);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put(`${API}/api/auth/me`, form);
      setUser(data);
      toast('Profile updated', 'success');
      setEditing(false);
    } catch (err) {
      toast(err.response?.data?.error || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); toast('Logged out', 'info'); };

  const menuItems = [
    { label: 'My Orders', icon: '📦', path: '/orders' },
    { label: 'Saved for Later', icon: '♥', path: '/saved' },
    { label: 'Browse Albums', icon: '🎵', path: '/albums' },
  ];

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <div className="section-label">My Profile</div>
      <h1 className="display" style={{ fontSize: 52, marginBottom: 40 }}>ACCOUNT</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72, background: 'var(--accent)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28, color: '#0a0a0a', fontFamily: 'Bebas Neue',
            }}>
              {user.name[0].toUpperCase()}
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono' }}>{user.email}</div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {menuItems.map(m => (
              <button key={m.path} className="btn btn-ghost"
                style={{ textAlign: 'left', padding: '12px 16px', justifyContent: 'flex-start', gap: 12 }}
                onClick={() => navigate(m.path)}>
                <span>{m.icon}</span><span>{m.label}</span>
              </button>
            ))}
            <button className="btn btn-ghost"
              style={{ textAlign: 'left', padding: '12px 16px', justifyContent: 'flex-start', gap: 12, color: 'var(--red)', marginTop: 8 }}
              onClick={handleLogout}>
              <span>→</span><span>Sign Out</span>
            </button>
          </nav>
        </div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: '0.05em' }}>PROFILE INFO</h2>
            <button className="btn btn-outline" onClick={() => setEditing(!editing)} style={{ fontSize: 12 }}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
          {editing ? (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[['Full Name', user.name], ['Email Address', user.email]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono', letterSpacing: '0.1em', marginBottom: 6 }}>{label.toUpperCase()}</div>
                  <div style={{ fontSize: 15 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Saved({ toast }) {
  const { saved, toggleSaved, addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!user) navigate('/login'); }, [user]);
  if (!user) return null;

  const handleMove = async (albumId) => {
    await addToCart(albumId);
    await toggleSaved(albumId);
    toast('Moved to cart', 'success');
  };

  return (
    <div className="page">
      <div className="section-label">Wishlist</div>
      <h1 className="display" style={{ fontSize: 52, marginBottom: 36 }}>SAVED FOR LATER</h1>
      {saved.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>♡</div>
          <p style={{ marginBottom: 20 }}>No saved items yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/albums')}>Browse Albums</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {saved.map(album => (
            <div key={album.id} style={{
              display: 'flex', gap: 20, background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: 16, alignItems: 'center',
            }}>
              <img src={album.cover_url} alt={album.title}
                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 4, cursor: 'pointer' }}
                onClick={() => navigate(`/albums/${album.id}`)} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{album.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{album.artist}</div>
                <span className="tag tag-genre">{album.genre}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                <span style={{ fontFamily: 'Space Mono', fontSize: 16, color: 'var(--accent)' }}>${album.price}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => handleMove(album.id)}>Move to Cart</button>
                  <button className="btn btn-ghost" style={{ fontSize: 18, color: 'var(--red)' }} onClick={() => toggleSaved(album.id)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get(`${API}/api/orders`).then(r => { setOrders(r.data); setLoading(false); });
  }, [user]);

  if (!user) return null;

  return (
    <div className="page" style={{ maxWidth: 800 }}>
      <div className="section-label">Purchase History</div>
      <h1 className="display" style={{ fontSize: 52, marginBottom: 36 }}>MY ORDERS</h1>
      {loading ? (
        <div style={{ color: 'var(--text3)', textAlign: 'center', padding: 60 }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p style={{ marginBottom: 20 }}>No orders yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/albums')}>Start Shopping</button>
        </div>
      ) : orders.map(order => (
        <div key={order.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text3)', marginBottom: 4 }}>ORDER #{order.id}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 20, color: 'var(--accent)' }}>${parseFloat(order.total).toFixed(2)}</div>
              <span style={{ fontSize: 11, fontFamily: 'Space Mono', padding: '3px 8px', background: 'rgba(92,184,122,0.15)', color: 'var(--green)', borderRadius: 2 }}>
                {order.status?.toUpperCase()}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <img src={item.cover_url} alt={item.title} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 3 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{item.artist}</div>
                </div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 13, color: 'var(--text2)' }}>
                  x{item.quantity} · ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
