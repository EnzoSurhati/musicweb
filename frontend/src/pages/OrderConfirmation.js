import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API } from '../context/AuthContext';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get(`${API}/api/orders/${id}`)
      .then(r => { setOrder(r.data); setLoading(false); })
      .catch(() => navigate('/orders'));
  }, [id, user]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text3)' }}>Loading...</div>
  );

  if (!order) return null;

  const orderNum = String(order.id).padStart(6, '0');
  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="page" style={{ maxWidth: 720 }}>

      {/* Success header */}
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderTop: '3px solid var(--green)',
        borderRadius: 8,
        marginBottom: 32,
      }}>
        <div style={{
          width: 72, height: 72,
          background: 'rgba(92,184,122,0.12)',
          border: '2px solid var(--green)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 30,
        }}>
          ✓
        </div>
        <div className="section-label" style={{ marginBottom: 8, color: 'var(--green)' }}>Payment Confirmed</div>
        <h1 className="display" style={{ fontSize: 'clamp(36px, 6vw, 56px)', marginBottom: 12 }}>
          ORDER PLACED!
        </h1>
        <p style={{ color: 'var(--text2)', fontSize: 15, lineHeight: 1.7, maxWidth: 420, margin: '0 auto 24px' }}>
          Thanks {user.name.split(' ')[0]}! Your order has been confirmed and a receipt has been sent to <strong style={{ color: 'var(--text)' }}>{order.billing_email || user.email}</strong>.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '12px 24px',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono', letterSpacing: '0.1em' }}>ORDER</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 20, color: 'var(--accent)', fontWeight: 700 }}>#{orderNum}</span>
        </div>
      </div>

      {/* Order details */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>

        {/* Meta row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {[
            ['Order Date', orderDate],
            ['Status', order.status?.toUpperCase()],
            ['Total', `$${parseFloat(order.total).toFixed(2)}`],
          ].map(([label, val], i) => (
            <div key={label} style={{
              padding: '20px 24px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
              <div style={{
                fontSize: i === 2 ? 22 : 14,
                fontFamily: i === 2 ? 'Space Mono' : 'inherit',
                color: i === 1 ? 'var(--green)' : i === 2 ? 'var(--accent)' : 'var(--text)',
                fontWeight: i === 1 ? 600 : 'normal',
              }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Items */}
        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 20 }}>YOUR ALBUMS ({order.items?.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {order.items?.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}
                onClick={() => navigate(`/albums/${item.album_id}`)}
                style={{ display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer' }}
              >
                <img src={item.cover_url} alt={item.title}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{item.artist}</div>
                  {item.genre && <span className="tag tag-genre">{item.genre}</span>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Space Mono', color: 'var(--accent)', fontSize: 15 }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  {item.quantity > 1 && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono' }}>x{item.quantity}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price breakdown */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: 'Space Mono' }}>${parseFloat(order.total).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
            <span>Tax</span>
            <span style={{ fontFamily: 'Space Mono' }}>$0.00</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Total Charged</span>
            <span style={{ fontFamily: 'Space Mono', fontSize: 22, color: 'var(--accent)', fontWeight: 700 }}>${parseFloat(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Billing address */}
      {order.billing_name && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text3)', letterSpacing: '0.1em', marginBottom: 16 }}>BILLING ADDRESS</div>
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.9 }}>
            <strong>{order.billing_name}</strong><br />
            {order.billing_email}<br />
            {order.billing_address && <>{order.billing_address}<br /></>}
            {order.billing_city && <>{order.billing_city}{order.billing_state ? `, ${order.billing_state}` : ''} {order.billing_zip}<br /></>}
            {order.billing_country}
          </div>
        </div>
      )}

      {/* Email notice */}
      <div style={{
        background: 'rgba(232,213,163,0.06)',
        border: '1px solid rgba(232,213,163,0.2)',
        borderRadius: 8,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
      }}>
        <span style={{ fontSize: 20 }}>📧</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Confirmation Email Sent</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>
            A full receipt has been sent to {order.billing_email || user.email}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate('/albums')}>
          Continue Shopping →
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/orders')}>
          View All Orders
        </button>
      </div>
    </div>
  );
}
