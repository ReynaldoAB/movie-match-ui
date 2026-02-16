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
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="card">
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
    </div>
  )
}
