import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function AlbumCard({ album, toast, onNavigate }) {
  const { addToCart, toggleSaved, saved } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isSaved = saved.some(s => s.id === album.id);

  const handleAddCart = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    await addToCart(album.id);
    toast?.(`"${album.title}" added to cart`, 'success');
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    await toggleSaved(album.id);
    toast?.(isSaved ? 'Removed from saved' : 'Saved for later ♥', 'info');
  };

  const stars = '★'.repeat(Math.round(album.rating)) + '☆'.repeat(5 - Math.round(album.rating));

  return (
    <div className="album-card" onClick={() => navigate(`/albums/${album.id}`)}>
      <div className="album-card__cover">
        <img src={album.cover_url} alt={album.title} loading="lazy" />
        <div className="album-card__overlay">
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '8px 14px' }} onClick={handleAddCart}>
            + Cart
          </button>
          <button
            className={`album-card__save ${isSaved ? 'saved' : ''}`}
            onClick={handleSave}
            title={isSaved ? 'Remove from saved' : 'Save for later'}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        </div>
        <div className="album-card__tags">
          {album.new_release && <span className="tag tag-new">New</span>}
          {album.featured && <span className="tag tag-featured">Featured</span>}
        </div>
      </div>
      <div className="album-card__body">
        <div className="album-card__title">{album.title}</div>
        <div className="album-card__artist">{album.artist}</div>
        <div className="album-card__footer">
          <span className="album-card__price">${album.price}</span>
          <span className="album-card__stars" title={`${album.rating}/5`} style={{ fontSize: 12 }}>
            {'★'.repeat(Math.round(album.rating))}
          </span>
        </div>
      </div>
    </div>
  );
}
