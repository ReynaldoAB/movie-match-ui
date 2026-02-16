import { useEffect, useState } from "react"

interface AddMovieFormProps {
  onAdd: (movie: { title: string; year: number; rating: number; poster: string; genre: string }) => Promise<void>
}

export function AddMovieForm({ onAdd }: AddMovieFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [year, setYear] = useState("")
  const [rating, setRating] = useState("any")
  const [poster, setPoster] = useState("")
  const [genre, setGenre] = useState("")
  const [genres, setGenres] = useState<string[]>([])
  const [isGenresLoading, setIsGenresLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const resetForm = () => {
    setTitle("")
    setYear("")
    setRating("any")
    setPoster("")
    setGenre("")
  }

  useEffect(() => {
    const fetchGenres = async () => {
      setIsGenresLoading(true)

      try {
        const res = await fetch("http://localhost:3000/movies/genres")
        const json = await res.json()
        const data = Array.isArray(json) ? json : json?.data
        if (Array.isArray(data)) {
          setGenres(data.filter((item) => typeof item === "string"))
        }
      } finally {
        setIsGenresLoading(false)
      }
    }

    if (isOpen && genres.length === 0 && !isGenresLoading) {
      fetchGenres()
    }
  }, [isOpen, genres.length, isGenresLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("")

    if (rating === "any") {
      setSubmitError("Select a rating (7+, 8+, or 9+) before saving.")
      return
    }

    setIsSubmitting(true)

    try {
      await onAdd({
        title,
        year: parseInt(year),
        rating: parseFloat(rating),
        poster,
        genre,
      })

      resetForm()
      setIsOpen(false)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to save movie")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setSubmitError("")
    resetForm()
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">
        Add Movie
      </button>
    )
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Movie</h2>
        <form onSubmit={handleSubmit}>
          <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className="input" type="number" placeholder="Year" value={year} onChange={(e) => setYear(e.target.value)} required />
          <select className="input" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="any">Any rating</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
            <option value="9">9+</option>
          </select>
          <input className="input" type="url" placeholder="Poster URL" value={poster} onChange={(e) => setPoster(e.target.value)} required />
          <select className="input" value={genre} onChange={(e) => setGenre(e.target.value)} required disabled={isGenresLoading}>
            <option value="" disabled>
              {isGenresLoading ? "Loading genres..." : "Select genre"}
            </option>
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {submitError && <p className="error-text">{submitError}</p>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}