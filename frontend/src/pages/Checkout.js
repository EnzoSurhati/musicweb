import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { useAuth, API } from '../context/AuthContext';

// ─── Stripe Payment Form ──────────────────────────────────────────────────────
function PaymentForm({ billing, clientSecret, onSuccess, toast }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      await onSuccess(paymentIntent.id);
    } else {
      setError('Payment could not be confirmed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: 24 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Payment Details</div>
        <div style={{
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          padding: 16,
        }}>
          <PaymentElement options={{
            style: {
              base: {
                color: '#f0ede8',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px',
                '::placeholder': { color: '#555' },
              }
            }
          }} />
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(224,92,75,0.1)',
          border: '1px solid rgba(224,92,75,0.3)',
          borderRadius: 4,
          padding: '12px 16px',
          color: 'var(--red)',
          fontSize: 13,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <button
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 15 }}
        type="submit"
        disabled={!stripe || loading}
      >
        {loading ? 'Processing...' : `Pay Now`}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>🔒 Secured by Stripe</span>
      </div>
    </form>
  );
}

// ─── Dev Checkout Form (no Stripe key) ───────────────────────────────────────
function DevPaymentForm({ onSuccess, loading }) {
  return (
    <div>
      <div style={{
        background: 'rgba(232,213,163,0.08)',
        border: '1px dashed var(--accent)',
        borderRadius: 6,
        padding: '16px 20px',
        marginBottom: 20,
        fontSize: 13,
        color: 'var(--accent)',
      }}>
        ⚠️ <strong>Dev mode:</strong> Stripe keys not configured. Add them to docker-compose.yml to enable real payments.
      </div>
      <div style={{ marginBottom: 20 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>Test Card</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            ['Card Number', '4242 4242 4242 4242'],
            ['Expiry', 'Any future date'],
            ['CVC', 'Any 3 digits'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg3)', borderRadius: 4, fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{label}</span>
              <span style={{ fontFamily: 'Space Mono', color: 'var(--accent)' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 15 }}
        onClick={() => onSuccess(null)}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Complete Order (Dev Mode)'}
      </button>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function Checkout({ toast }) {
  const { cart, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [billing, setBilling] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (cart.length === 0) { navigate('/albums'); return; }

    // Check if Stripe is configured
    axios.get(`${API}/api/payments/config`).then(async ({ data }) => {
      if (data.publishable_key && !data.publishable_key.includes('YOUR_')) {
        setStripeEnabled(true);
        const sp = loadStripe(data.publishable_key);
        setStripePromise(sp);
        // Create payment intent
        const { data: intentData } = await axios.post(`${API}/api/payments/create-intent`);
        setClientSecret(intentData.client_secret);
      }
    }).catch(() => {});
  }, [user, cart]);

  const handleSuccess = async (paymentIntentId) => {
    setSubmitting(true);
    try {
      const { data: order } = await axios.post(`${API}/api/orders`, {
        payment_intent_id: paymentIntentId,
        billing,
      });
      await fetchCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      toast(err.response?.data?.error || 'Order failed', 'error');
      setSubmitting(false);
    }
  };

  const set = (k, v) => setBilling(b => ({ ...b, [k]: v }));

  if (!user || cart.length === 0) return null;

  const stripeOptions = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#e8d5a3',
        colorBackground: '#1a1a1a',
        colorText: '#f0ede8',
        colorDanger: '#e05c4b',
        fontFamily: 'DM Sans, sans-serif',
        borderRadius: '4px',
      }
    }
  } : null;

  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ paddingLeft: 0, marginBottom: 32 }}>← Back to Cart</button>

      <div className="section-label">Almost there</div>
      <h1 className="display" style={{ fontSize: 52, marginBottom: 40 }}>CHECKOUT</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>

        {/* Left: Billing + Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Billing Info */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 28 }}>
            <div className="section-label" style={{ marginBottom: 20 }}>Billing Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={billing.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={billing.email} onChange={e => set('email', e.target.value)} placeholder="john@email.com" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1', marginBottom: 0 }}>
                <label className="form-label">Street Address</label>
                <input className="form-input" value={billing.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input className="form-input" value={billing.city} onChange={e => set('city', e.target.value)} placeholder="New York" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">State</label>
                <input className="form-input" value={billing.state} onChange={e => set('state', e.target.value)} placeholder="NY" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">ZIP Code</label>
                <input className="form-input" value={billing.zip} onChange={e => set('zip', e.target.value)} placeholder="10001" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Country</label>
                <select className="form-input" value={billing.country} onChange={e => set('country', e.target.value)}>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="IT">Italy</option>
                  <option value="ES">Spain</option>
                  <option value="NL">Netherlands</option>
                  <option value="BR">Brazil</option>
                  <option value="MX">Mexico</option>
                  <option value="JP">Japan</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 28 }}>
            {stripeEnabled && clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={stripeOptions}>
                <PaymentForm billing={billing} clientSecret={clientSecret} onSuccess={handleSuccess} toast={toast} />
              </Elements>
            ) : (
              <DevPaymentForm onSuccess={handleSuccess} loading={submitting} />
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, position: 'sticky', top: 84 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>Order Summary</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img src={item.cover_url} alt={item.title} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    background: 'var(--accent)', color: '#0a0a0a',
                    borderRadius: '50%', width: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700,
                  }}>{item.quantity}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.artist}</div>
                </div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 13, color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'Space Mono' }}>${cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
              <span>Tax</span>
              <span style={{ fontFamily: 'Space Mono' }}>$0.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontFamily: 'Space Mono', fontSize: 20, color: 'var(--accent)', fontWeight: 700 }}>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
