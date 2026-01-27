import { useState } from "react"

interface AddMovieFormProps {
  onAdd: (movie: { title: string; year: number; rating: number; poster: string }) => Promise<void>
}

export function AddMovieForm({ onAdd }: AddMovieFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [year, setYear] = useState("")
  const [rating, setRating] = useState("")
  const [poster, setPoster] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onAdd({
        title,
        year: parseInt(year),
        rating: parseFloat(rating),
        poster,
      })

      setTitle("")
      setYear("")
      setRating("")
      setPoster("")
      setIsOpen(false)
    } finally {
      setIsSubmitting(false)
    }
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
          <input className="input" type="number" step="0.1" placeholder="Rating" value={rating} onChange={(e) => setRating(e.target.value)} required />
          <input className="input" type="url" placeholder="Poster URL" value={poster} onChange={(e) => setPoster(e.target.value)} required />
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  )
}