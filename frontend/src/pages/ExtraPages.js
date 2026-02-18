import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '../context/AuthContext';
import AlbumCard from '../components/AlbumCard';

export function NewReleases({ toast }) {
  const [albums, setAlbums] = useState([]);
  useEffect(() => { axios.get(`${API}/api/albums?new_release=true`).then(r => setAlbums(r.data)); }, []);
  return (
    <div className="page">
      <div className="section-label">Just Dropped</div>
      <h1 className="display" style={{ fontSize: 'clamp(36px,6vw,64px)', marginBottom: 36 }}>NEW RELEASES</h1>
      <div className="albums-grid">
        {albums.map(a => <AlbumCard key={a.id} album={a} toast={toast} />)}
      </div>
    </div>
  );
}

export function Genres({ toast }) {
  const [genres, setGenres] = useState([]);
  const [allAlbums, setAllAlbums] = useState([]);
  const navigate = useNavigate();
  const colors = ['#e05c4b','#5cb87a','#5b8de0','#e0b45b','#9b5be0','#5be0d8','#e05bb3','#b8e05b'];

  useEffect(() => {
    axios.get(`${API}/api/genres`).then(r => setGenres(r.data));
    axios.get(`${API}/api/albums`).then(r => setAllAlbums(r.data));
  }, []);

  return (
    <div className="page">
      <div className="section-label">Browse By Style</div>
      <h1 className="display" style={{ fontSize: 'clamp(36px,6vw,64px)', marginBottom: 36 }}>ALL GENRES</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {genres.map((genre, i) => {
          const genreAlbums = allAlbums.filter(a => a.genre === genre);
          return (
            <div key={genre}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20, paddingBottom: 12,
                borderBottom: `2px solid ${colors[i % colors.length]}`,
              }}>
                <h2 className="display" style={{ fontSize: 36 }}>{genre.toUpperCase()}</h2>
                <span style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text3)' }}>{genreAlbums.length} albums</span>
              </div>
              <div className="albums-grid">
                {genreAlbums.slice(0, 4).map(a => <AlbumCard key={a.id} album={a} toast={toast} />)}
              </div>
              {genreAlbums.length > 4 && (
                <button className="btn btn-ghost" style={{ marginTop: 12 }}
                  onClick={() => navigate(`/albums?genre=${encodeURIComponent(genre)}`)}>
                  View all {genre} albums →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
