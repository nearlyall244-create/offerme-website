import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'
import CategoriesFullPage from '@/pages/categories/CategoriesFullPage'

export default function CategoriesPage() {
  return (
    <div>
      <Navbar />
      <main>
        <CategoriesFullPage />
      </main>
      <Footer />
    </div>
  )
}
