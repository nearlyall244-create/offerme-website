import { Link } from 'react-router-dom'
import Navbar from '@/components/navbar/Navbar'
import Footer from '@/pages/footer/Footer'
import styles from './PrivacyPolicy.module.css'

export default function PrivacyPolicy() {
  return (
    <div>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: August 25, 2026</p>

          <div className={styles.content}>
            <section className={styles.section}>
              <h2>1. Information We Collect</h2>
              <p>
                When you use OfferMe, we may collect the following types of information:
              </p>
              <ul>
                <li><strong>Personal Information:</strong> Name, email address, phone number, and profile details when you create an account.</li>
                <li><strong>Business Information:</strong> Business name, address, category, description, and operating hours when you list a business.</li>
                <li><strong>Usage Data:</strong> Pages visited, search queries, interactions with listings, and device information.</li>
                <li><strong>Location Data:</strong> Approximate location to show nearby businesses and offers (only with your permission).</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>2. How We Use Your Information</h2>
              <p>We use the collected information to:</p>
              <ul>
                <li>Provide and maintain the OfferMe platform.</li>
                <li>Process your account registration and authentication.</li>
                <li>Display relevant businesses, offers, and recommendations.</li>
                <li>Communicate with you about your account, listings, and updates.</li>
                <li>Improve our services and user experience.</li>
                <li>Ensure platform security and prevent fraud.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>3. Data Sharing</h2>
              <p>
                We do not sell your personal information to third parties. We may share your data only in the following cases:
              </p>
              <ul>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information.</li>
                <li><strong>Business Owners:</strong> When a user contacts a business through OfferMe, the business receives the relevant inquiry details.</li>
                <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process.</li>
                <li><strong>Service Providers:</strong> With trusted third-party services that help us operate the platform (hosting, analytics, etc.).</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>4. Cookies and Tracking</h2>
              <p>
                OfferMe uses cookies and similar technologies to maintain your session, remember your preferences, and analyze platform usage. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className={styles.section}>
              <h2>5. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className={styles.section}>
              <h2>6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and review your personal data.</li>
                <li>Update or correct inaccurate information.</li>
                <li>Request deletion of your account and associated data.</li>
                <li>Opt out of non-essential communications.</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>7. Children's Privacy</h2>
              <p>
                OfferMe is not intended for users under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.
              </p>
            </section>

            <section className={styles.section}>
              <h2>8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className={styles.section}>
              <h2>9. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <ul>
                <li>Email: <a href="mailto:support@offermee.com">support@offermee.com</a></li>
                <li>Phone: +91 98765 43210</li>
              </ul>
            </section>
          </div>

          <div className={styles.footerNav}>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/sitemap">Sitemap</Link>
            <Link to="/">Back to Home</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
