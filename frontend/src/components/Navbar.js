import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, setCartOpen } = useCart();
  const loc = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/albums', label: 'All Albums' },
    { to: '/genres', label: 'Genres' },
    { to: '/new', label: 'New Releases' },
  ];

  return (
    <nav style={{
      background: 'rgba(10,10,10,0.95)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1300,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--accent)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: 12, height: 12,
              background: 'var(--bg)',
              borderRadius: '50%',
              position: 'absolute',
            }} />
          </div>
          <span className="display" style={{ fontSize: 22, letterSpacing: '0.1em', color: 'var(--text)' }}>
            WAXROOM
          </span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                padding: '6px 14px',
                borderRadius: 4,
                fontSize: 13,
                fontWeight: 500,
                color: loc.pathname.startsWith(l.to) ? 'var(--accent)' : 'var(--text2)',
                background: loc.pathname.startsWith(l.to) ? 'rgba(232,213,163,0.08)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <Link to="/saved" style={{ padding: '8px', color: 'var(--text2)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                title="Saved for later">
                ♥
              </Link>
              <Link to="/account" style={{ padding: '8px 12px', color: 'var(--text2)', fontSize: 13, transition: 'color 0.2s' }}>
                {user.name.split(' ')[0]}
              </Link>
            </>
          ) : (
            <Link to="/login" className="btn btn-outline" style={{ fontSize: 12, padding: '8px 16px' }}>
              Login
            </Link>
          )}

          <button
            onClick={() => setCartOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '8px 14px',
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            <span>🛒</span>
            <span>Cart</span>
            {cartCount > 0 && (
              <span style={{
                background: 'var(--accent)',
                color: '#0a0a0a',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Space Mono',
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
