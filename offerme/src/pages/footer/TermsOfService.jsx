import { Link } from 'react-router-dom'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'
import styles from './TermsOfService.module.css'

export default function TermsOfService() {
  return (
    <div>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.lastUpdated}>Last updated: August 25, 2026</p>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using OfferMe, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
              </p>
            </section>

            <section className={styles.section}>
              <h2>2. User Accounts</h2>
              <p>To access certain features, you must create an account. You agree to:</p>
              <ul>
                <li>Provide accurate and complete registration information.</li>
                <li>Maintain the confidentiality of your account credentials.</li>
                <li>Be responsible for all activities that occur under your account.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. Business Listings</h2>
              <p>If you list a business on OfferMe, you agree to:</p>
              <ul>
                <li>Provide accurate, truthful, and up-to-date business information.</li>
                <li>Ensure your business complies with all applicable local laws and regulations.</li>
                <li>Respond to customer inquiries in a timely and professional manner.</li>
                <li>Not misrepresent your business, services, or offers.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>4. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the platform for any unlawful purpose.</li>
                <li>Post false, misleading, or fraudulent content.</li>
                <li>Impersonate another person or business.</li>
                <li>Interfere with or disrupt the platform's functionality.</li>
                <li>Collect user data without proper authorization.</li>
                <li>Use automated systems to access the platform without permission.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>5. Intellectual Property</h2>
              <p>
                All content on OfferMe, including logos, text, graphics, and software, is the property of OfferMe or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.
              </p>
            </section>

            <section className={styles.section}>
              <h2>6. Limitation of Liability</h2>
              <p>
                OfferMe is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. We do not guarantee the accuracy of business listings or offers.
              </p>
            </section>

            <section className={styles.section}>
              <h2>7. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at our discretion, without prior notice, for conduct that violates these terms or is harmful to other users or the platform.
              </p>
            </section>

            <section className={styles.section}>
              <h2>8. Changes to These Terms</h2>
              <p>
                We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <ul>
                <li>Email: <a href="mailto:support@offermee.com">support@offermee.com</a></li>
                <li>Phone: +91 98765 43210</li>
              </ul>
            </section>
          </div>

          <div className={styles.footerNav}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/sitemap">Sitemap</Link>
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
