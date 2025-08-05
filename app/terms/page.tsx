import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <p className="text-gray-300 text-lg mb-8">
            Last updated: August 5, 2025
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using Easeboard ("the Service"), you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Description of Service</h2>
              <p className="text-gray-300 leading-relaxed">
                Easeboard is a web-based dashboard service that integrates with Canvas LMS to provide students with 
                an enhanced, organized view of their academic information including assignments, grades, schedules, 
                and course materials. The service is designed to improve the student experience with Canvas LMS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">User Accounts and Registration</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Account Creation</h3>
                  <p className="text-gray-300 leading-relaxed">
                    To use Easeboard, you must create an account by authenticating with your Google account. 
                    You are responsible for maintaining the confidentiality of your account credentials.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Eligibility</h3>
                  <p className="text-gray-300 leading-relaxed">
                    You must be at least 13 years old and enrolled in an educational institution that uses Canvas LMS 
                    to use this service. By using Easeboard, you represent that you meet these requirements.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Account Responsibility</h3>
                  <p className="text-gray-300 leading-relaxed">
                    You are responsible for all activities that occur under your account. You agree to notify us 
                    immediately of any unauthorized use of your account.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Canvas LMS Integration</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Authorization</h3>
                  <p className="text-gray-300 leading-relaxed">
                    By connecting your Canvas account to Easeboard, you grant us permission to access your Canvas 
                    data on your behalf. This access is limited to read-only operations and data display purposes.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Data Accuracy</h3>
                  <p className="text-gray-300 leading-relaxed">
                    While we strive to display accurate and up-to-date information from Canvas, Easeboard is not 
                    responsible for any discrepancies. Always verify important information directly in Canvas.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Canvas Terms Compliance</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Your use of Easeboard must comply with your institution's Canvas usage policies and terms of service.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Acceptable Use</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Permitted Use</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Easeboard is intended for personal academic use by students. You may use the service to view, 
                    organize, and manage your own academic information.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Prohibited Activities</h3>
                  <p className="text-gray-300 leading-relaxed">You agree not to:</p>
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    <li>Access another person's account or Canvas data without permission</li>
                    <li>Use the service for commercial purposes</li>
                    <li>Attempt to reverse engineer, hack, or compromise the service</li>
                    <li>Share your account credentials with others</li>
                    <li>Use the service in any way that violates applicable laws or regulations</li>
                    <li>Interfere with or disrupt the service's functionality</li>
                    <li>Upload malicious code or attempt to gain unauthorized access</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Service Availability</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Uptime and Maintenance</h3>
                  <p className="text-gray-300 leading-relaxed">
                    While we strive to maintain high availability, we do not guarantee uninterrupted access to 
                    Easeboard. The service may be temporarily unavailable due to maintenance, updates, or unforeseen issues.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Canvas Dependency</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Easeboard's functionality depends on Canvas LMS availability and API access. We are not responsible 
                    for service interruptions caused by Canvas downtime or API changes.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Easeboard Rights</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Easeboard, including its design, code, features, and branding, is owned by us and protected by 
                    intellectual property laws. You may not copy, modify, or distribute our service.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Your Data Rights</h3>
                  <p className="text-gray-300 leading-relaxed">
                    You retain ownership of your academic data. By using Easeboard, you grant us a limited license 
                    to display and organize your data for the purpose of providing our service.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Privacy and Data Protection</h2>
              <p className="text-gray-300 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, 
                use, and protect your information. By using Easeboard, you agree to the collection and use of 
                information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Disclaimers and Limitations</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Service "As Is"</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Easeboard is provided "as is" without warranties of any kind. We do not guarantee that the 
                    service will meet your specific requirements or that it will be error-free.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Academic Responsibility</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Easeboard is a supplementary tool and should not replace direct engagement with Canvas LMS or 
                    your institution's official academic systems. You are responsible for verifying all academic 
                    information and meeting your educational obligations.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Limitation of Liability</h3>
                  <p className="text-gray-300 leading-relaxed">
                    To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                    special, or consequential damages arising from your use of Easeboard.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Account Termination</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Voluntary Termination</h3>
                  <p className="text-gray-300 leading-relaxed">
                    You may delete your account at any time through the dashboard settings. Upon deletion, 
                    your data will be removed from our systems within 30 days.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Termination for Cause</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We reserve the right to suspend or terminate accounts that violate these terms of service 
                    or engage in prohibited activities.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these terms of service at any time. Material changes will be 
                communicated to users via email or dashboard notifications. Continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Governing Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These terms shall be governed by and construed in accordance with applicable laws. Any disputes 
                arising from these terms or your use of Easeboard shall be resolved through appropriate legal channels.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these terms of service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                <p className="text-gray-300">
                  <strong>Email:</strong> legal@easeboard.app<br/>
                  <strong>Subject:</strong> Terms of Service Inquiry
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Severability</h2>
              <p className="text-gray-300 leading-relaxed">
                If any provision of these terms is found to be unenforceable or invalid, the remaining provisions 
                will continue to be valid and enforceable to the fullest extent permitted by law.
              </p>
            </section>

            <section className="mt-12 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Acknowledgment</h2>
              <p className="text-gray-300 leading-relaxed">
                By using Easeboard, you acknowledge that you have read, understood, and agree to be bound by these 
                terms of service. If you do not agree with any part of these terms, please discontinue use of the service.
              </p>
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
