import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>About OfferMe</h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          OfferMe connects local businesses with customers looking for the best deals.
          We make it easy for businesses to list their offers and for users to discover
          amazing deals in their neighborhood.
        </p>
        <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
          Whether you are a small business owner looking to reach more customers or a
          savvy shopper hunting for deals, OfferMe is your go-to platform.
        </p>
      </main>
      <Footer />
    </div>
  )
}
