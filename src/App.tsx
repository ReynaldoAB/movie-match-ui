import useSWR from "swr"
import { useState } from "react"
import { MovieCard } from "./movie-card"
import { AddMovieForm } from "./add-movie-form"
import { Film, Loader2 } from "lucide-react"

interface Movie {
  id: number
  title: string
  year: number
  rating: number
  poster: string
  genre: string
}

const API_URL = "http://localhost:3000/movies"
const GENRES_URL = "http://localhost:3000/movies/genres"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  const data = json.data as Movie[]
  return data.map((m) => ({
    ...m,
    poster: m.poster?.startsWith("http") ? m.poster : `https://${m.poster}`,
  }))
}

const genresFetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  const data = Array.isArray(json) ? json : json?.data
  if (!Array.isArray(data)) return []
  return data.filter((item) => typeof item === "string")
}

export function MovieList() {
  const [selectedGenre, setSelectedGenre] = useState("")
  const [minRating, setMinRating] = useState("any")

  const queryParams = new URLSearchParams()
  if (selectedGenre) queryParams.set("genre", selectedGenre)
  if (minRating !== "any") queryParams.set("minRating", minRating)

  const moviesUrl = queryParams.toString() ? `${API_URL}?${queryParams.toString()}` : API_URL

  const { data: movies = [], error, isLoading, mutate } = useSWR<Movie[]>(moviesUrl, fetcher)
  const { data: genres = [], isLoading: isGenresLoading } = useSWR<string[]>(GENRES_URL, genresFetcher)

  const handleAddMovie = async (movie: { title: string; year: number; rating: number; poster: string; genre: string }) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || "Failed to add movie")
    }
    mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Film className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Unable to load movies</h3>
        <p className="text-muted-foreground text-sm">
          Make sure the API server is running at {API_URL}
        </p>
      </div>
    )
  }

 
  const hasActiveFilters = selectedGenre !== "" || minRating !== "any"

  return (
    <div className="app">
      <div className="header">
        <AddMovieForm onAdd={handleAddMovie} />
      </div>

      <div className="filters">
        <div className="filter-group">
          <label className="filter-label" htmlFor="genre-filter">Genre</label>
          <select
            id="genre-filter"
            className="input"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            disabled={isGenresLoading}
          >
            <option value="">{isGenresLoading ? "Loading..." : "All genres"}</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="rating-filter">Minimum rating</label>
          <select
            id="rating-filter"
            className="input"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="any">Any rating</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
            <option value="9">9+</option>
          </select>
        </div>

        {hasActiveFilters && (
          <div className="filter-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSelectedGenre("")
                setMinRating("any")
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  )

}

export default MovieList