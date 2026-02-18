import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg2)',
      marginTop: 80,
      padding: '48px 24px 32px',
    }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 9, height: 9, background: 'var(--bg)', borderRadius: '50%' }} />
              </div>
              <span className="display" style={{ fontSize: 18 }}>WAXROOM</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.7 }}>
              Premium digital music for collectors and enthusiasts. Own the music you love.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 16 }}>SHOP</div>
            {[['All Albums', '/albums'], ['New Releases', '/new'], ['Genres', '/genres']].map(([label, path]) => (
              <div key={path} style={{ marginBottom: 8 }}>
                <Link to={path} style={{ fontSize: 13, color: 'var(--text2)', transition: 'color 0.2s' }}>{label}</Link>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: 16 }}>ACCOUNT</div>
            {[['Login', '/login'], ['Register', '/register'], ['My Orders', '/orders'], ['Saved Items', '/saved']].map(([label, path]) => (
              <div key={path} style={{ marginBottom: 8 }}>
                <Link to={path} style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</Link>
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono' }}>
            © 2024 WAXROOM. All rights reserved.
          </span>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'Space Mono' }}>
            Built with React + Node.js + PostgreSQL
          </span>
        </div>
      </div>
    </footer>
  );
}
