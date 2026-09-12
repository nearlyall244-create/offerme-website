import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'

export default function ContactPage() {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Contact Us</h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Have questions or feedback? We would love to hear from you.
        </p>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Name</label>
            <input type="text" placeholder="Your name" style={{ padding: '0.625rem 0.75rem', fontSize: '0.9375rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Email</label>
            <input type="email" placeholder="you@example.com" style={{ padding: '0.625rem 0.75rem', fontSize: '0.9375rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Message</label>
            <textarea rows={4} placeholder="Your message..." style={{ padding: '0.625rem 0.75rem', fontSize: '0.9375rem', border: '1px solid var(--color-border)', borderRadius: '0.5rem', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" style={{ padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'white', background: 'var(--color-primary)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
            Send Message
          </button>
        </form>
      </main>
      <Footer />
    </div>
  )
}
