import useSWR from "swr"
import { useEffect, useState } from "react"
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

interface Review {
  author: string
  rating: number
  comment: string
}

interface MovieDetails extends Movie {
  reviews?: Review[]
}

const toSafeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const API_BASE_URL = "http://localhost:3000"
const API_URL = `${API_BASE_URL}/movies`
const GENRES_URL = `${API_BASE_URL}/movies/genres`

const normalizePoster = (poster?: string) => {
  if (!poster) return ""
  return poster.startsWith("http") ? poster : `https://${poster}`
}

const parseApiError = async (response: Response) => {
  const text = await response.text()

  try {
    const json = JSON.parse(text)
    return json?.error || json?.message || text || "Request failed"
  } catch {
    return text || "Request failed"
  }
}

const toFriendlyReviewError = (message: string) => {
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes("unknown field `reviews`") || normalizedMessage.includes("unknown field reviews")) {
    return "Backend sin soporte de reviews todavía. Agrega la relación reviews en Prisma y corre migraciones."
  }

  return message
}

const normalizeMovieDetails = (payload: any, fallbackMovie?: Movie | null): MovieDetails => {
  const normalizedPayload = Array.isArray(payload) ? payload[0] : payload
  const sourceMovie = normalizedPayload?.movie ?? normalizedPayload
  const reviewsPayload = normalizedPayload?.reviews ?? sourceMovie?.reviews

  return {
    id: toSafeNumber(sourceMovie?.id, fallbackMovie?.id ?? 0),
    title: sourceMovie?.title ?? fallbackMovie?.title ?? "Untitled",
    year: toSafeNumber(sourceMovie?.year, fallbackMovie?.year ?? 0),
    rating: toSafeNumber(sourceMovie?.rating, fallbackMovie?.rating ?? 0),
    poster: normalizePoster(sourceMovie?.poster ?? fallbackMovie?.poster ?? ""),
    genre: sourceMovie?.genre ?? fallbackMovie?.genre ?? "N/A",
    reviews: Array.isArray(reviewsPayload)
      ? reviewsPayload.map((review) => ({
          author: String(review?.author ?? "Anonymous"),
          rating: toSafeNumber(review?.rating, 1),
          comment: String(review?.comment ?? ""),
        }))
      : [],
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  const data = json.data as Movie[]
  return data.map((m) => ({
    ...m,
    poster: normalizePoster(m.poster),
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
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<MovieDetails | null>(null)
  const [isMovieLoading, setIsMovieLoading] = useState(false)
  const [movieError, setMovieError] = useState("")
  const [reviewAuthor, setReviewAuthor] = useState("")
  const [reviewRating, setReviewRating] = useState("5")
  const [reviewComment, setReviewComment] = useState("")
  const [reviewError, setReviewError] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isDeletingMovie, setIsDeletingMovie] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const queryParams = new URLSearchParams()
  if (selectedGenre) queryParams.set("genre", selectedGenre)
  if (minRating !== "any") queryParams.set("minRating", minRating)

  const moviesUrl = queryParams.toString() ? `${API_URL}?${queryParams.toString()}` : API_URL

  const { data: movies = [], error, isLoading, mutate } = useSWR<Movie[]>(moviesUrl, fetcher)
  const { data: genres = [], isLoading: isGenresLoading } = useSWR<string[]>(GENRES_URL, genresFetcher)

  useEffect(() => {
    const fetchMovieWithReviews = async () => {
      if (!selectedMovieId) {
        return
      }

      setIsMovieLoading(true)
      setMovieError("")
      const fallbackMovie = movies.find((movie) => movie.id === selectedMovieId)

      try {
        const response = await fetch(`${API_URL}/${selectedMovieId}`)
        if (!response.ok) {
          const apiMessage = await parseApiError(response)
          throw new Error(apiMessage || "Failed to load movie details")
        }

        const json = await response.json()
        const payload = json?.data ?? json
        const normalizedMovie = normalizeMovieDetails(payload, fallbackMovie)
        setSelectedMovie(normalizedMovie)
      } catch (requestError) {
        if (fallbackMovie) {
          setSelectedMovie(normalizeMovieDetails(fallbackMovie, fallbackMovie))
        }

        const rawMessage = requestError instanceof Error ? requestError.message : "Failed to load movie details"
        setMovieError(toFriendlyReviewError(rawMessage))
      } finally {
        setIsMovieLoading(false)
      }
    }

    fetchMovieWithReviews()
  }, [selectedMovieId, movies])

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

  const closeMovieModal = () => {
    setSelectedMovieId(null)
    setSelectedMovie(null)
    setMovieError("")
    setReviewError("")
    setDeleteError("")
    setReviewAuthor("")
    setReviewRating("5")
    setReviewComment("")
  }

  const handleDeleteMovie = async () => {
    if (!selectedMovieId || isDeletingMovie) return

    const confirmed = window.confirm("Are you sure you want to delete this movie? This action cannot be undone.")
    if (!confirmed) return

    setDeleteError("")
    setIsDeletingMovie(true)

    try {
      const response = await fetch(`${API_URL}/${selectedMovieId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const apiMessage = await parseApiError(response)
        throw new Error(apiMessage || "Failed to delete movie")
      }

      await mutate()
      closeMovieModal()
    } catch (deletionError) {
      const rawMessage = deletionError instanceof Error ? deletionError.message : "Failed to delete movie"
      setDeleteError(rawMessage)
    } finally {
      setIsDeletingMovie(false)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMovieId) return

    const author = reviewAuthor.trim()
    const comment = reviewComment.trim()

    if (!author || !comment) {
      setReviewError("Name and comment are required")
      return
    }

    setReviewError("")
    setIsSubmittingReview(true)

    try {
      const newReview = {
        author,
        rating: Number(reviewRating),
        comment,
      }

      const response = await fetch(`${API_URL}/${selectedMovieId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Failed to submit review")
      }

      const json = await response.json().catch(() => null)
      const payload = json?.data ?? json

      setSelectedMovie((previousMovie) => {
        if (!previousMovie) return previousMovie

        const reviewToAppend: Review = {
          author: payload?.author ?? newReview.author,
          rating: Number(payload?.rating ?? newReview.rating),
          comment: payload?.comment ?? newReview.comment,
        }

        return {
          ...previousMovie,
          reviews: [...(previousMovie.reviews ?? []), reviewToAppend],
        }
      })

      setReviewAuthor("")
      setReviewRating("5")
      setReviewComment("")
    } catch (submissionError) {
      const rawMessage = submissionError instanceof Error ? submissionError.message : "Failed to submit review"
      setReviewError(toFriendlyReviewError(rawMessage))
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const renderStars = (rating: number) => {
    const validRating = Math.max(1, Math.min(5, Math.round(rating)))
    return `${"★".repeat(validRating)}${"☆".repeat(5 - validRating)}`
  }

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
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => {
              setSelectedMovieId(movie.id)
              setSelectedMovie(null)
              setMovieError("")
            }}
          />
        ))}
      </div>

      {selectedMovieId && (
        <div className="modal" onClick={closeMovieModal}>
          <div className="modal-content movie-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={closeMovieModal} aria-label="Close movie details">
              ×
            </button>

            {isMovieLoading && (
              <div className="detail-loading">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isMovieLoading && movieError && <p className="error-text">{movieError}</p>}
            {!isMovieLoading && deleteError && <p className="error-text">{deleteError}</p>}

            {!isMovieLoading && selectedMovie && (
              <>
                <div className="movie-detail-header">
                  <img src={selectedMovie.poster} alt={selectedMovie.title} className="movie-detail-poster" />
                  <div className="movie-detail-meta">
                    <h2>{selectedMovie.title}</h2>
                    <p className="subtitle">{selectedMovie.year}</p>
                    <div className="movie-badges">
                      <span className="genre-badge">{selectedMovie.genre}</span>
                      <span className="rating-badge">⭐ {selectedMovie.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteMovie}
                    disabled={isDeletingMovie}
                  >
                    {isDeletingMovie ? "Deleting..." : "Delete movie"}
                  </button>
                </div>

                <section className="reviews-section">
                  <h3>Reviews</h3>
                  {(selectedMovie.reviews ?? []).length === 0 ? (
                    <p className="subtitle">No reviews yet. Be the first!</p>
                  ) : (
                    <ul className="reviews-list">
                      {(selectedMovie.reviews ?? []).map((review, index) => (
                        <li className="review-item" key={`${review.author}-${index}`}>
                          <div className="review-header">
                            <strong>{review.author}</strong>
                            <span className="review-stars">{renderStars(review.rating)}</span>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form className="review-form" onSubmit={handleReviewSubmit}>
                    <input
                      className="input"
                      placeholder="Your name"
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      required
                    />

                    <select className="input" value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                      <option value="1">1 star</option>
                      <option value="2">2 stars</option>
                      <option value="3">3 stars</option>
                      <option value="4">4 stars</option>
                      <option value="5">5 stars</option>
                    </select>

                    <textarea
                      className="input"
                      placeholder="Write your review"
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    />

                    {reviewError && <p className="error-text">{reviewError}</p>}

                    <button type="submit" className="btn btn-primary" disabled={isSubmittingReview}>
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                </section>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )

}

export default MovieList