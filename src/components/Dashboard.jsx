import { useState, useEffect } from 'react';

const API_URL = '/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('No se pudo cargar el dashboard. Verifica que el backend esté corriendo en http://localhost:3000');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando dashboard...</div>;
  if (error) return <div style={{ padding: '2rem' }}>{error}</div>;
  if (!stats) return <div style={{ padding: '2rem' }}>No hay datos para mostrar.</div>;

  return (
    <div style={{ padding: '2rem', background: '#1a1a1a', minHeight: '100vh', color: 'white' }}>
      <h1>🎬 Movie Match Dashboard</h1>

      {/* Cards de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard label="Películas" value={stats.totalMovies} icon="🎬" />
        <MetricCard label="Reviews" value={stats.totalReviews} icon="📝" />
        <MetricCard label="Rating Promedio" value={stats.avgRating} icon="⭐" />
        <MetricCard label="Géneros" value={stats.moviesByGenre.length} icon="🎭" />
      </div>

      {/* Dos columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Top películas */}
        <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
          <h3>🏆 Top Películas</h3>
          {stats.topRated.map((movie, i) => (
            <div key={movie.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
              <span style={{ marginRight: '1rem' }}>#{i + 1}</span>
              <strong>{movie.title}</strong>
              <span style={{ float: 'right' }}>⭐ {movie.rating}</span>
            </div>
          ))}
        </div>

        {/* Por género */}
        <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
          <h3>📊 Por Género</h3>
          {stats.moviesByGenre.map(g => (
            <div key={g.genre} style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center' }}>
              <span style={{ width: '80px' }}>{g.genre}</span>
              <div style={{
                flex: 1,
                height: '20px',
                background: '#444',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(g.count / stats.totalMovies) * 100}%`,
                  height: '100%',
                  background: '#2a9d8f'
                }} />
              </div>
              <span style={{ marginLeft: '1rem', minWidth: '30px' }}>{g.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      <div style={{ marginTop: '2rem', background: '#2a2a2a', padding: '1rem', borderRadius: '8px' }}>
        <h3>🕐 Actividad Reciente</h3>
        {stats.recentReviews.map(review => (
          <div key={review.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #333' }}>
            <strong>{review.author}</strong> revisó "{review.movieTitle}"
            <span style={{ marginLeft: '0.5rem' }}>{'⭐'.repeat(review.rating)}</span>
            <span style={{ float: 'right', color: '#888' }}>
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }) {
  return (
    <div style={{
      background: '#2a2a2a',
      padding: '1.5rem',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ color: '#888' }}>{label}</div>
    </div>
  );
}

export default Dashboard;