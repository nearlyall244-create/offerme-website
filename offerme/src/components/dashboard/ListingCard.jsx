import { useState } from 'react'
import styles from './ListingCard.module.css'

export default function ListingCard({ listing, onLike, onComment, onFavorite, isLiked, isFavorited }) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState(listing.comments || [])

  const handleComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      author: 'You',
      createdAt: new Date().toISOString(),
    }
    setComments((prev) => [...prev, newComment])
    onComment?.(listing.id, newComment)
    setCommentText('')
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={listing.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop'}
          alt={listing.shopName}
          className={styles.image}
        />
        <span className={styles.category}>{listing.category}</span>
        {listing.status && (
          <span className={`${styles.status} ${styles[listing.status]}`}>
            {listing.status}
          </span>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.shopName}>{listing.shopName}</h3>
        <p className={styles.description}>{listing.description}</p>
        <div className={styles.offers}>
          <span className={styles.offersLabel}>Offers:</span>
          <span className={styles.offersText}>{listing.offers}</span>
        </div>
        <div className={styles.meta}>
          <span>{listing.views || 0} views</span>
          <span>{listing.likes || 0} likes</span>
          <span>{comments.length} comments</span>
        </div>

        <div className={styles.actions}>
          <button
            onClick={() => onLike?.(listing.id)}
            className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
          >
            {isLiked ? '❤️' : '🤍'} Like
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={styles.actionBtn}
          >
            💬 Comment
          </button>
          <button
            onClick={() => onFavorite?.(listing.id)}
            className={`${styles.actionBtn} ${isFavorited ? styles.favorited : ''}`}
          >
            {isFavorited ? '⭐' : '☆'} Save
          </button>
        </div>

        {showComments && (
          <div className={styles.commentsSection}>
            <div className={styles.commentsList}>
              {comments.map((c) => (
                <div key={c.id} className={styles.comment}>
                  <strong>{c.author}</strong>
                  <p>{c.text}</p>
                </div>
              ))}
              {comments.length === 0 && <p className={styles.noComments}>No comments yet</p>}
            </div>
            <form onSubmit={handleComment} className={styles.commentForm}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
              />
              <button type="submit">Post</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
