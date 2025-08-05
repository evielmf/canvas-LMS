import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Easeboard</span>
            </Link>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white tracking-tight">Easeboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <p className="text-gray-300 text-lg mb-8">
            Last updated: August 5, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                At Easeboard, we respect your privacy and are committed to protecting your personal data. 
                This privacy policy explains how we collect, use, and safeguard your information when you use our Canvas LMS dashboard service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Account Information</h3>
                  <p className="text-gray-300 leading-relaxed">
                    When you sign up for Easeboard, we collect your Google account information (name, email address, profile picture) 
                    through secure OAuth authentication. We do not store your Google password.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Canvas LMS Data</h3>
                  <p className="text-gray-300 leading-relaxed">
                    With your explicit permission, we access and cache your Canvas LMS data including:
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    <li>Course information and enrollment details</li>
                    <li>Assignment titles, due dates, and submission status</li>
                    <li>Grade information and academic progress</li>
                    <li>Calendar events and announcements</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Usage Data</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We collect anonymized usage statistics to improve our service, including feature usage patterns, 
                    performance metrics, and error logs. This data cannot be linked back to individual users.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Provide and maintain the Easeboard dashboard service</li>
                <li>Sync and display your Canvas LMS data in an organized interface</li>
                <li>Send relevant notifications about assignments and deadlines</li>
                <li>Improve our service through analytics and user feedback</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Sharing and Disclosure</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Service Providers:</strong> We work with trusted third-party services (like Supabase for data storage) that help us operate our platform</li>
                <li><strong>Legal Requirements:</strong> If required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, with prior notice to users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                <li>All data transmission is encrypted using HTTPS/TLS</li>
                <li>Canvas API tokens are stored securely and encrypted at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Data backup and recovery procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Your Rights and Choices</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Access and Control</h3>
                  <p className="text-gray-300 leading-relaxed">
                    You can access, update, or delete your account information at any time through your dashboard settings.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Data Portability</h3>
                  <p className="text-gray-300 leading-relaxed">
                    You can request a copy of your data or delete your account and all associated data by contacting our support team.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Canvas Access</h3>
                  <p className="text-gray-300 leading-relaxed">
                    You can revoke Easeboard's access to your Canvas account at any time through your Canvas settings or by disconnecting in our dashboard.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your data only as long as necessary to provide our services. Canvas data is refreshed regularly and 
                older data is automatically purged. Account data is deleted within 30 days of account closure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Easeboard is designed for college and university students. We do not knowingly collect personal information 
                from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any material changes by posting 
                the new policy on this page and updating the "Last updated" date. Your continued use of Easeboard after 
                changes constitutes acceptance of the new policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                <p className="text-gray-300">
                  <strong>Email:</strong> privacy@easeboard.app<br/>
                  <strong>Subject:</strong> Privacy Policy Inquiry
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-black mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2025 Easeboard. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/#support" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
