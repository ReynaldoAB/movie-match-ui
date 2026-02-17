interface Movie {
  id: number
  title: string
  year: number
  rating: number
  poster: string
  genre: string
}

interface MovieCardProps {
  movie: Movie
  onClick: () => void
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <button type="button" className="card card-button" onClick={onClick}>
      <div>
        <img src={movie.poster} alt={movie.title} />
      </div>
      <div className="card-body">
        <h3>{movie.title}</h3>
        <div className="subtitle">
          {movie.year} ⭐ {movie.rating.toFixed(1)}
        </div>
        <div className="subtitle">{movie.genre}</div>
      </div>
    </button>
  )
}
