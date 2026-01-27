import useSWR from "swr"
import { MovieCard } from "./movie-card"
import { AddMovieForm } from "./add-movie-form"
import { Film, Loader2 } from "lucide-react"

interface Movie {
  id: number
  title: string
  year: number
  rating: number
  poster: string
}

const API_URL = "http://localhost:3000/movies"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  const data = json.data as Movie[]
  return data.map((m) => ({
    ...m,
    poster: m.poster?.startsWith("http") ? m.poster : `https://${m.poster}`,
  }))
}

export function MovieList() {
  const { data: movies, error, isLoading, mutate } = useSWR<Movie[]>(API_URL, fetcher)

  const handleAddMovie = async (movie: { title: string; year: number; rating: number; poster: string }) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(movie),
    })

    if (!response.ok) throw new Error("Failed to add movie")
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

 
  return (
  <div className="app">
    <div className="header">
      <AddMovieForm onAdd={handleAddMovie} />
    </div>

    <div className="grid">
      {movies?.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  </div>
)

}

export default MovieList