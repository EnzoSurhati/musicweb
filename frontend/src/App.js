import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useToast } from './hooks/useToast';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Toasts from './components/Toasts';
import Footer from './components/Footer';
import Home from './pages/Home';
import Albums from './pages/Albums';
import AlbumDetail from './pages/AlbumDetail';
import { Login, Register } from './pages/Auth';
import { Account, Saved, Orders } from './pages/AccountPages';
import { NewReleases, Genres } from './pages/ExtraPages';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

function AppInner() {
  const { toasts, toast } = useToast();

  return (
    <>
      <Navbar />
      <CartSidebar toast={toast} />
      <main>
        <Routes>
          <Route path="/" element={<Home toast={toast} />} />
          <Route path="/albums" element={<Albums toast={toast} />} />
          <Route path="/albums/:id" element={<AlbumDetail toast={toast} />} />
          <Route path="/new" element={<NewReleases toast={toast} />} />
          <Route path="/genres" element={<Genres toast={toast} />} />
          <Route path="/login" element={<Login toast={toast} />} />
          <Route path="/register" element={<Register toast={toast} />} />
          <Route path="/account" element={<Account toast={toast} />} />
          <Route path="/saved" element={<Saved toast={toast} />} />
          <Route path="/orders" element={<Orders toast={toast} />} />
          <Route path="/checkout" element={<Checkout toast={toast} />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="*" element={
            <div style={{ textAlign: 'center', padding: '120px 24px', color: 'var(--text3)' }}>
              <div className="display" style={{ fontSize: 80, marginBottom: 16 }}>404</div>
              <p>Page not found</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <Toasts toasts={toasts} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppInner />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
