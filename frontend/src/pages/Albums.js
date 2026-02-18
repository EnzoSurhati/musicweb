import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import AlbumCard from '../components/AlbumCard';

export default function Albums({ toast }) {
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const genre = searchParams.get('genre') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    axios.get(`${API}/api/genres`).then(r => setGenres(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (genre) params.set('genre', genre);
    if (sort) params.set('sort', sort);
    axios.get(`${API}/api/albums?${params}`)
      .then(r => { setAlbums(r.data); setLoading(false); });
  }, [search, genre, sort]);

  const set = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    setSearchParams(p);
  };

  return (
    <div className="page">
      <div className="section-label">Catalogue</div>
      <h1 className="display" style={{ fontSize: 'clamp(36px, 6vw, 64px)', marginBottom: 32 }}>
        ALL ALBUMS
      </h1>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 32,
        padding: '20px',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 6,
      }}>
        <input
          className="form-input"
          style={{ flex: '1', minWidth: 200, maxWidth: 320 }}
          placeholder="Search titles, artists..."
          value={search}
          onChange={e => set('search', e.target.value)}
        />
        <select
          className="form-input"
          style={{ width: 160 }}
          value={genre}
          onChange={e => set('genre', e.target.value)}
        >
          <option value="">All Genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          className="form-input"
          style={{ width: 160 }}
          value={sort}
          onChange={e => set('sort', e.target.value)}
        >
          <option value="">Sort: Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
        {(search || genre || sort) && (
          <button className="btn btn-ghost" onClick={() => setSearchParams({})}>Clear</button>
        )}
      </div>

      {/* Active filters display */}
      {(genre) && (
        <div style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Filtered by:</span>
          <span className="tag tag-genre">{genre} ✕</span>
        </div>
      )}

      <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--text3)', fontFamily: 'Space Mono, monospace' }}>
        {loading ? 'Loading...' : `${albums.length} albums`}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>Loading albums...</div>
      ) : albums.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
          <p>No albums found</p>
        </div>
      ) : (
        <div className="albums-grid">
          {albums.map(a => <AlbumCard key={a.id} album={a} toast={toast} />)}
        </div>
      )}
    </div>
  );
}
