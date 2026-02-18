import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import AlbumCard from '../components/AlbumCard';

export default function Home({ toast }) {
  const [featured, setFeatured] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/albums?featured=true`).then(r => setFeatured(r.data));
    axios.get(`${API}/api/albums?new_release=true`).then(r => setNewReleases(r.data));
    axios.get(`${API}/api/genres`).then(r => setGenres(r.data));
  }, []);

  const genreColors = ['#e05c4b', '#5cb87a', '#5b8de0', '#e0b45b', '#9b5be0', '#5be0d8', '#e05bb3', '#b8e05b'];

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #141414 50%, #1a1208 100%)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Decorative record - centered behind text */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, #1a1a1a 30%, #2a2a2a 31%, #2a2a2a 45%, #1a1a1a 46%, #2a2a2a 47%, #2a2a2a 60%, #1a1a1a 61%, #2a2a2a 62%, #2a2a2a 100%)',
          opacity: 0.15,
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '100px 24px 90px', position: 'relative', textAlign: 'center' }}>
          <div className="section-label" style={{ justifyContent: 'center', display: 'flex' }}>Welcome to Waxroom</div>
          <h1 className="display" style={{ fontSize: 'clamp(56px, 10vw, 120px)', lineHeight: 0.9, marginBottom: 28 }}>
            MUSIC<br />
            <span style={{ color: 'var(--accent)' }}>WORTH</span><br />
            OWNING
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 480, marginBottom: 36, lineHeight: 1.7, margin: '0 auto 36px' }}>
            Premium digital albums across every genre. Build your collection, discover new artists, and own the music you love.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/albums')}>
              Browse All Albums →
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/new')}>
              New Releases
            </button>
          </div>
        </div>
      </div>

      <div className="page">
        {/* Featured */}
        <section style={{ marginBottom: 60 }}>
          <div className="section-label">Editor's Picks</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 className="display" style={{ fontSize: 42 }}>FEATURED ALBUMS</h2>
            <button className="btn btn-ghost" onClick={() => navigate('/albums')}>View all →</button>
          </div>
          <div className="albums-grid">
            {featured.map(a => <AlbumCard key={a.id} album={a} toast={toast} />)}
          </div>
        </section>

        {/* New Releases */}
        <section style={{ marginBottom: 60 }}>
          <div className="section-label">Just Dropped</div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 className="display" style={{ fontSize: 42 }}>NEW RELEASES</h2>
            <button className="btn btn-ghost" onClick={() => navigate('/new')}>View all →</button>
          </div>
          <div className="albums-grid">
            {newReleases.slice(0, 4).map(a => <AlbumCard key={a.id} album={a} toast={toast} />)}
          </div>
        </section>

        {/* Genres */}
        <section>
          <div className="section-label">Browse By Style</div>
          <h2 className="display" style={{ fontSize: 42, marginBottom: 24 }}>GENRES</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {genres.map((g, i) => (
              <button
                key={g}
                onClick={() => navigate(`/albums?genre=${encodeURIComponent(g)}`)}
                style={{
                  background: 'var(--bg3)',
                  border: `1px solid var(--border)`,
                  borderTop: `3px solid ${genreColors[i % genreColors.length]}`,
                  color: 'var(--text)',
                  padding: '20px 16px',
                  borderRadius: 4,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1f1f1f'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
              >
                {g}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
