import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function AlbumDetail({ toast }) {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [related, setRelated] = useState([]);
  const { addToCart, toggleSaved, saved } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSaved = album && saved.some(s => s.id === album.id);

  useEffect(() => {
    axios.get(`${API}/api/albums/${id}`).then(r => {
      setAlbum(r.data);
      axios.get(`${API}/api/albums?genre=${encodeURIComponent(r.data.genre)}`).then(rel => {
        setRelated(rel.data.filter(a => a.id !== r.data.id).slice(0, 4));
      });
    }).catch(() => navigate('/albums'));
  }, [id]);

  if (!album) return (
    <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text3)' }}>Loading...</div>
  );

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return; }
    await addToCart(album.id);
    toast(`"${album.title}" added to cart`, 'success');
  };

  const handleSave = async () => {
    if (!user) { navigate('/login'); return; }
    await toggleSaved(album.id);
    toast(isSaved ? 'Removed from saved' : 'Saved for later ♥', 'info');
  };

  const trackTitles = [
    'Intro', 'Opening Theme', 'Side A', 'Movement I', 'Deep Cut', 'Interlude',
    'Side B', 'Movement II', 'Reprise', 'Extended Mix', 'Hidden Track', 'Outro',
    'Bonus', 'Acoustic Version', 'Demo', 'Live Take'
  ];

  return (
    <div className="page">
      {/* Back */}
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 32, paddingLeft: 0 }}>
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 60, alignItems: 'start' }}>
        {/* Album art */}
        <div>
          <div style={{
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            marginBottom: 24,
            position: 'relative',
          }}>
            <img src={album.cover_url} alt={album.title} style={{ width: '100%', display: 'block' }} />
            {album.new_release && (
              <span className="tag tag-new" style={{ position: 'absolute', top: 16, left: 16 }}>New Release</span>
            )}
          </div>
          {/* Actions */}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginBottom: 10 }}
            onClick={handleAdd}>
            Add to Cart — ${album.price}
          </button>
          <button
            className={`btn btn-outline`}
            style={{ width: '100%', justifyContent: 'center', color: isSaved ? 'var(--accent)' : undefined, borderColor: isSaved ? 'var(--accent)' : undefined }}
            onClick={handleSave}
          >
            {isSaved ? '♥ Saved' : '♡ Save for Later'}
          </button>
        </div>

        {/* Details */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="tag tag-genre">{album.genre}</span>
            {album.featured && <span className="tag tag-featured">Featured</span>}
          </div>
          <h1 className="display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginBottom: 8 }}>{album.title}</h1>
          <p style={{ fontSize: 20, color: 'var(--text2)', marginBottom: 24 }}>{album.artist}</p>

          <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono', letterSpacing: '0.1em', marginBottom: 4 }}>YEAR</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 16 }}>{album.year}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono', letterSpacing: '0.1em', marginBottom: 4 }}>TRACKS</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 16 }}>{album.tracks}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Space Mono', letterSpacing: '0.1em', marginBottom: 4 }}>RATING</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 16, color: 'var(--accent)' }}>
                {'★'.repeat(Math.round(album.rating))} {album.rating}
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--text2)', lineHeight: 1.8, marginBottom: 36 }}>{album.description}</p>

          {/* Tracklist */}
          <div>
            <div className="section-label">Tracklist</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: album.tracks }).map((_, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: i % 2 === 0 ? 'var(--bg2)' : 'var(--bg3)',
                  borderRadius: i === 0 ? '4px 4px 0 0' : i === album.tracks - 1 ? '0 0 4px 4px' : 0,
                  gap: 16,
                }}>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text3)', minWidth: 24 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ flex: 1, fontSize: 13 }}>
                    {trackTitles[i] || `Track ${i + 1}`}
                  </span>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text3)' }}>
                    {Math.floor(Math.random() * 3 + 2)}:{String(Math.floor(Math.random() * 59)).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
