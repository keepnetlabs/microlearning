// Static configuration for Inbox Scene
// This will be moved to JSON configs later for standardization

export interface PhishingReportModalTexts {
  title: string;
  subtitle: string;
  question: string;
  options: string[];
  reportButton: string;
  cancelButton: string;
}

export interface PhishingResultModalTexts {
  correctTitle: string;
  correctSubtitle: string;
  incorrectTitle: string;
  incorrectSubtitle: string;
  difficultyLabel: string;
  emailInfoTitle: string;
  phishingExplanationTitle: string;
  legitimateExplanationTitle: string;
  continueButton: string;
}

export interface InboxSceneTexts {
  title: string;
  description: string;
  instructions: string;
  selectEmailMessage: string;
  reportButtonText: string;
  nextButtonText: string;
  phishingReportLabel: string;
  inboxLabel: string;
  reportsLabel: string;
  accuracyLabel: string;
  emailReportedMessage: string;
  emailHeadersTitle: string;
  ctaButtonText: string;
  mobileTitle: string;
  backToInboxText: string;
  headersButtonText: string;
  correctReportMessage: string;
  cautiousReportMessage: string;
  phishingReportModal: PhishingReportModalTexts;
  phishingResultModal: PhishingResultModalTexts;
}

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'xls' | 'zip' | 'img' | 'exe' | 'txt' | 'unknown';
  content?: string; // HTML content for preview
  url?: string; // External URL for images/files
}

export interface EmailData {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isPhishing: boolean;
  content: string;
  headers?: string[];
  difficulty?: string;
  explanation?: string;
  attachments?: EmailAttachment[];
}

export interface InboxSceneConfig {
  texts: InboxSceneTexts;
  emails: EmailData[];
}

export const defaultInboxConfig: InboxSceneConfig = {
  texts: {
    title: "Recognizing and Reporting Phishing Emails",
    description: "Learn to identify and report phishing attempts in this interactive email simulation",
    instructions: "Look for phishing indicators and report suspicious emails",
    selectEmailMessage: "Select an email to view its content",
    reportButtonText: "Report as Phishing",
    nextButtonText: "Continue",
    phishingReportLabel: "Phishing Report",
    inboxLabel: "Inbox",
    reportsLabel: "Reports",
    accuracyLabel: "Accuracy",
    emailReportedMessage: "Email has been reported",
    emailHeadersTitle: "Email Headers",
    ctaButtonText: "Improve Your Behavior",
    mobileTitle: "Phishing Training",
    backToInboxText: "Back to Inbox",
    headersButtonText: "Headers",
    correctReportMessage: "Marked as phishing — well done identifying red flags.",
    cautiousReportMessage: "Marked as suspicious — good caution even when legitimate.",
    phishingReportModal: {
      title: "Phishing Reporter",
      subtitle: "Do you want to report this email to the system administrator for analysis and receive the result by email?",
      question: "Why are you reporting this email?",
      options: [
        "Received spam email.",
        "Received a phishing email.",
        "I'm not sure this is a legitimate email."
      ],
      reportButton: "Report",
      cancelButton: "Cancel"
    },
    phishingResultModal: {
      correctTitle: "Excellent catch!",
      correctSubtitle: "You correctly identified this phishing attempt.",
      incorrectTitle: "Good security thinking!",
      incorrectSubtitle: "Being cautious with suspicious emails is always wise.",
      difficultyLabel: "MEDIUM-EASY",
      emailInfoTitle: "Action Required: Verify Your WhatsApp Account",
      phishingExplanationTitle: "Why this was phishing",
      legitimateExplanationTitle: "Why this was legitimate",
      continueButton: "Continue Learning"
    }
  },
  emails: [
    {
      id: "1",
      sender: "security@whatsapp.com",
      subject: "New device verification required",
      preview: "We noticed someone tried to access your account from Istanbul. Please verify...",
      timestamp: "3 hours ago",
      isPhishing: true,
      content: `
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Hello,</p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">We noticed someone tried to access your WhatsApp account from a new device. As part of our standard security procedure, we need to verify this was you.</p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">Login attempt details:</strong></p>
      <ul class="text-[#1C1C1E] dark:text-[#F2F2F7]">
        <li>Device: Samsung Galaxy S21</li>
        <li>Location: Istanbul, Turkey</li>
        <li>Time: February 16, 2024 at 2:30 PM</li>
      </ul>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">If this was you, please verify by clicking the link below to confirm the new device:</p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><a href="https://whatsapp-security-verification.net/device-confirm" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Verify new device login</a></p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">If you didn't try to log in from this device, your account is still secure. You can safely ignore this message.</p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">For your security, we recommend enabling two-step verification in WhatsApp Settings.</p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Thanks,<br>WhatsApp Security Team</p>
      <p style="font-size: 11px; color: #999; margin-top: 20px;">If you have questions, visit our Help Center in the WhatsApp app.</p>
      `,
      headers: [
        "Return-Path: <security@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 45.142.166.23 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM",
      explanation: "This email looks professional but the link leads to a fake domain. Real WhatsApp security notifications come through the app, not email with external links.",
      attachments: [
        {
          id: "att-1-1",
          name: "security_report.pdf",
          size: "245 KB",
          type: "pdf",
          content: `
            <div class="p-3 sm:p-4 md:p-6 bg-white">
              <div class="border-b border-gray-200 pb-4 mb-6">
                <h1 class="text-xl font-bold text-gray-900">WhatsApp Security Report</h1>
                <p class="text-sm text-gray-600 mt-1">Account Verification Details</p>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Login Attempt Summary</h3>
                <div class="bg-gray-50 p-3 sm:p-4 rounded border">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><span class="text-gray-600">IP Address:</span> 185.234.217.82</div>
                    <div><span class="text-gray-600">Device:</span> Samsung Galaxy S21</div>
                    <div><span class="text-gray-600">Location:</span> Istanbul, Turkey</div>
                    <div><span class="text-gray-600">Time:</span> Feb 16, 2:30 PM</div>
                  </div>
                </div>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Verification Steps</h3>
                <ol class="space-y-2 text-sm text-gray-700">
                  <li>1. Review the login details above</li>
                  <li>2. Confirm if this was an authorized access</li>
                  <li>3. Update your security settings if needed</li>
                </ol>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded">
                <p class="text-sm text-blue-800">
                  <strong>Note:</strong> This report is generated automatically for your security. 
                  No action is required if you recognize this login attempt.
                </p>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: "2",
      sender: "business-support@whatsapp.com",
      subject: "Complete your business verification",
      preview: "Your WhatsApp Business application is almost ready. One more step to complete...",
      timestamp: "5 hours ago",
      isPhishing: true,
      content: `
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Hi there,</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Good news! Your WhatsApp Business verification is 90% complete. We just need one final step to activate your business features.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To complete your setup:</p>
        <ul class="text-[#1C1C1E] dark:text-[#F2F2F7]">
          <li>Download and run the verification tool below</li>
          <li>Confirm your business details</li>
          <li>Get access to advanced messaging features</li>
        </ul>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">This verification ensures your business meets Meta's standards for authentic communication.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Your application will expire in 48 hours if not completed.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Best regards,<br><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">WhatsApp Business Team</strong><br>Meta Inc.</p>
      `,
      headers: [
        "Return-Path: <business-support@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 192.168.1.45 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM-HARD",
      explanation: "This email creates urgency about business verification, but WhatsApp Business verification doesn't require downloading external tools.",
      attachments: [
        {
          id: "att-2-1",
          name: "business_verification_tool.exe",
          size: "1.8 MB",
          type: "exe",
          content: `
            <div class="text-center p-3 sm:p-4 md:p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <div class="text-orange-600 text-4xl mb-4">⚠️</div>
              <h2 class="text-xl font-bold text-orange-800 mb-3">SUSPICIOUS EXECUTABLE</h2>
              <p class="text-orange-700 mb-4">This file claims to be a business verification tool</p>
              <div class="bg-white p-3 sm:p-4 rounded border-l-4 border-orange-500 text-left">
                <p class="text-sm text-gray-700 mb-2"><strong>File Name:</strong> business_verification_tool.exe</p>
                <p class="text-sm text-gray-700 mb-2"><strong>Size:</strong> 1.8 MB</p>
                <p class="text-sm text-gray-700 mb-2"><strong>Risk Level:</strong> <span class="text-orange-600 font-bold">HIGH</span></p>
                <p class="text-sm text-gray-700">Legitimate business verification happens within the WhatsApp app, not through external executables.</p>
              </div>
              <div class="mt-4 p-3 bg-red-100 rounded">
                <p class="text-sm text-red-800"><strong>🚫 Security Alert:</strong> WhatsApp never requires downloading verification tools!</p>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: "3",
      sender: "notifications@whatsapp.com",
      subject: "Enhanced privacy settings available",
      preview: "New privacy features are now available for your account. Update your settings...",
      timestamp: "1 day ago",
      isPhishing: true,
      content: `
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Hello,</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">We're excited to introduce new privacy features to better protect your conversations and personal information.</p>
         <div style="background: #f8f9fa; border-left: 4px solid #25D366; padding: 15px; margin: 15px 0;">
           <p style="margin: 0; font-weight: bold; color: #1C1C1E;">🔐 Enhanced Privacy Features</p>
           <ul style="margin: 10px 0; color: #1C1C1E;">
             <li>Advanced message encryption</li>
             <li>Improved contact privacy</li>
             <li>Enhanced backup security</li>
           </ul>
         </div>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To enable these features, please update your privacy settings:</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><a href="https://privacy-settings.whatsapp-updates.com/enhanced" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Update privacy settings now</a></p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">These new features are rolling out gradually and will be available to all users by the end of this month.</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Thank you for using WhatsApp,<br>The WhatsApp Team</p>
         <p style="font-size: 11px; color: #6c757d; margin-top: 20px;">Learn more about privacy at whatsapp.com/privacy</p>
       `,
      headers: [
        "Return-Path: <notifications@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 203.0.113.42 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "HARD",
      explanation: "This email looks very legitimate and uses subtle social engineering about privacy features, but the external link is suspicious.",
      attachments: []
    },
    {
      id: "4",
      sender: "support@whatsapp.com",
      subject: "✅ Backup Complete: 1.2 GB Saved Successfully",
      preview: "Your chat backup completed yesterday at 21:15. No action required.",
      timestamp: "Yesterday",
      isPhishing: false,
      content: `
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Hello,</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">This is a confirmation that your WhatsApp chat backup completed successfully.</p>
        <ul class="text-[#1C1C1E] dark:text-[#F2F2F7]">
          <li>Backup size: 1.2 GB</li>
          <li>Device: iPhone 14</li>
          <li>Time: Yesterday at 21:15</li>
        </ul>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">No further action is required. If you did not initiate this backup, you can review your backup settings in the WhatsApp app: Settings → Chats → Chat Backup.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To learn more about backups, visit the Help Center inside the app.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Regards,<br/>WhatsApp Team</p>
      `,
      headers: [
        "Return-Path: <no-reply@support.whatsapp.com>",
        "SPF: pass (support.whatsapp.com designates 203.0.113.5 as permitted sender)",
        "DMARC: pass (p=reject dis=none) header.from=support.whatsapp.com"
      ],
      difficulty: "EASY",
      explanation: "This is a routine service notification. It does not ask for sensitive information or include suspicious links.",
      attachments: [
        {
          id: "att-4-1",
          name: "backup_summary.txt",
          size: "2.1 KB",
          type: "txt",
          content: `
            <div class="p-3 bg-gray-50 rounded">
              <div class="text-center mb-2">
                <h3 class="text-base font-semibold text-gray-900">WhatsApp Backup Summary</h3>
                <p class="text-xs text-gray-600">Generated: February 15, 2024 at 21:15</p>
              </div>
              
              <div class="space-y-2 font-mono text-xs">
                <div class="bg-white p-3 rounded border">
                  <div class="text-green-600 font-bold">✓ BACKUP COMPLETED SUCCESSFULLY</div>
                </div>
                
                <div class="bg-white p-3 rounded border">
                  <div class="grid grid-cols-2 gap-2">
                    <div><span class="text-gray-600">Device:</span> iPhone 14</div>
                    <div><span class="text-gray-600">iOS Version:</span> 17.3.1</div>
                    <div><span class="text-gray-600">WhatsApp Version:</span> 24.2.75</div>
                    <div><span class="text-gray-600">Backup Size:</span> 1.2 GB</div>
                  </div>
                </div>
                
                <div class="bg-white p-3 rounded border">
                  <div class="text-gray-700 font-semibold mb-2">Backup Contents:</div>
                  <div class="space-y-1 text-xs">
                    <div>• Chat messages: 45,892 messages</div>
                    <div>• Media files: 3,245 photos, 234 videos</div>
                    <div>• Voice notes: 456 recordings</div>
                    <div>• Documents: 89 files</div>
                    <div>• Contact cards: 2,341 contacts</div>
                  </div>
                </div>
                
                <div class="bg-white p-3 rounded border">
                  <div class="text-gray-700 font-semibold mb-2">Storage Information:</div>
                  <div class="space-y-1 text-xs">
                    <div>• iCloud Storage Used: 1.2 GB / 50 GB</div>
                    <div>• Available Space: 48.8 GB</div>
                    <div>• Last Backup: Yesterday at 21:15</div>
                    <div>• Backup Frequency: Daily (Enabled)</div>
                  </div>
                </div>
                
                <div class="bg-green-50 p-3 rounded border border-green-200">
                  <div class="text-green-800 text-xs">
                    <strong>NOTE:</strong> This backup is encrypted and can only be restored to your device using your WhatsApp account. Keep your phone number and verification code secure.
                  </div>
                </div>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: "5",
      sender: "business@whatsapp.com",
      subject: "📊 Monthly Insights Report - February 2024",
      preview: "Your business performance summary is ready. View analytics and trends...",
      timestamp: "2 days ago",
      isPhishing: false,
      content: `
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Hi,</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Your WhatsApp Business monthly usage summary is now available in your dashboard.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To view it, open the WhatsApp Business app and navigate to Settings → Business Tools → Insights.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">This email is for your information only and does not require any immediate action.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">If you have questions, please contact support from within the app.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">— WhatsApp Business Team</p>
      `,
      headers: [
        "Return-Path: <notifications@business.whatsapp.com>",
        "SPF: pass (business.whatsapp.com designates 192.0.2.35 as permitted sender)",
        "DMARC: pass (p=reject dis=none) header.from=business.whatsapp.com"
      ],
      difficulty: "MEDIUM",
      explanation: "Legitimate informational email. It directs users to in-app navigation instead of external links.",
      attachments: [
        {
          id: "att-5-1",
          name: "February_2024_Report.pdf",
          size: "456 KB",
          type: "pdf",
          content: `
            <div class="p-3 sm:p-4 md:p-6 bg-white">
              <div class="border-b border-gray-200 pb-4 mb-6">
                <h1 class="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
                <h2 class="text-xl text-gray-700 mt-2">Monthly Usage Report - February 2024</h2>
                <p class="text-sm text-gray-500 mt-1">Generated on March 1, 2024</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                  <h3 class="font-semibold text-green-800">Messages Sent</h3>
                  <p class="text-2xl font-bold text-green-600">3,142</p>
                  <p class="text-sm text-green-600">↑ 15% from January</p>
                </div>
                <div class="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                  <h3 class="font-semibold text-blue-800">Active Customers</h3>
                  <p class="text-2xl font-bold text-blue-600">1,456</p>
                  <p class="text-sm text-blue-600">↑ 12% from January</p>
                </div>
                <div class="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-200">
                  <h3 class="font-semibold text-purple-800">Response Rate</h3>
                  <p class="text-2xl font-bold text-purple-600">96%</p>
                  <p class="text-sm text-purple-600">↑ 2% from January</p>
                </div>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Top Performing Categories</h3>
                <div class="space-y-2">
                  <div class="flex justify-between bg-gray-50 p-3 rounded">
                    <span class="text-gray-700">Customer Support</span>
                    <span class="font-semibold text-gray-900">48%</span>
                  </div>
                  <div class="flex justify-between bg-gray-50 p-3 rounded">
                    <span class="text-gray-700">Product Updates</span>
                    <span class="font-semibold text-gray-900">29%</span>
                  </div>
                  <div class="flex justify-between bg-gray-50 p-3 rounded">
                    <span class="text-gray-700">Promotional Messages</span>
                    <span class="font-semibold text-gray-900">23%</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p class="text-sm text-gray-600">
                  <strong>Note:</strong> This report is automatically generated and reflects your account activity for the specified period. 
                  For detailed analytics, please visit your WhatsApp Business dashboard.
                </p>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: "6",
      sender: "updates@whatsapp.com",
      subject: "Important: Update your payment method",
      preview: "Your payment method for WhatsApp Business expires soon. Update to avoid service interruption...",
      timestamp: "6 hours ago",
      isPhishing: true,
      content: `
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Dear valued customer,</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">We're reaching out to inform you that your payment method for WhatsApp Business Premium will expire on February 25, 2024.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To ensure uninterrupted service, please update your payment information before the expiration date.</p>
        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #856404;">💳 Payment Method Expiring</p>
          <p style="margin: 5px 0 0 0; color: #856404;">Card ending in ****4327 expires 02/25/2024</p>
        </div>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Update your payment method securely:</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><a href="https://billing.whatsapp-business.com/update-payment" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">Update payment information</a></p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">If you don't update by the expiration date, your account will be downgraded to the free tier and some features may be limited.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Thank you for choosing WhatsApp Business,<br>WhatsApp Billing Team</p>
        <p style="font-size: 11px; color: #6c757d; margin-top: 20px;">This email was sent regarding your WhatsApp Business account. For support, contact us through the app.</p>
      `,
      headers: [
        "Return-Path: <updates@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 198.51.100.15 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM-HARD",
      explanation: "This phishing email targets business users with payment urgency. WhatsApp Business billing notifications typically come through the app, not email with external payment links.",
      attachments: [
        {
          id: "att-6-1",
          name: "payment_invoice.pdf",
          size: "156 KB",
          type: "pdf",
          content: `
            <div class="p-3 sm:p-4 md:p-6 bg-white">
              <div class="border-b border-gray-200 pb-4 mb-6">
                <h1 class="text-xl font-bold text-gray-900">WhatsApp Business</h1>
                <h2 class="text-lg text-gray-700 mt-2">Payment Reminder</h2>
                <p class="text-sm text-gray-500 mt-1">Invoice #WB-2024-00127</p>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                <div class="bg-gray-50 p-3 sm:p-4 rounded border">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><span class="text-gray-600">Account:</span> WhatsApp Business Premium</div>
                    <div><span class="text-gray-600">Billing Cycle:</span> Monthly</div>
                    <div><span class="text-gray-600">Next Payment:</span> February 25, 2024</div>
                    <div><span class="text-gray-600">Amount:</span> $19.99/month</div>
                  </div>
                </div>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div class="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-yellow-600">⚠️</span>
                    <span class="font-semibold text-yellow-800">Payment Method Expiring</span>
                  </div>
                  <p class="text-sm text-yellow-700">
                    Your credit card ending in ****4327 expires on 02/25/2024.
                    Please update your payment method to avoid service interruption.
                  </p>
                </div>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Service Features</h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li>• Advanced analytics and insights</li>
                  <li>• Unlimited messaging to customers</li>
                  <li>• Priority customer support</li>
                  <li>• Advanced automation tools</li>
                </ul>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded">
                <p class="text-sm text-blue-800">
                  <strong>Important:</strong> Update your payment method before February 25, 2024 
                  to continue enjoying WhatsApp Business Premium features.
                </p>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: "7",
      sender: "no-reply@whatsapp.com",
      subject: "Account activity summary - January 2024",
      preview: "Your monthly WhatsApp usage report is available. 2,547 messages sent this month...",
      timestamp: "3 days ago",
      isPhishing: false,
      content: `
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Hi,</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Here's your WhatsApp activity summary for January 2024.</p>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; color: #1C1C1E;">📊 Your Activity</h3>
          <ul style="margin: 0; color: #1C1C1E; list-style: none; padding: 0;">
            <li style="margin-bottom: 8px;">• Messages sent: 2,547</li>
            <li style="margin-bottom: 8px;">• Media shared: 445 files</li>
            <li style="margin-bottom: 8px;">• Voice messages: 67</li>
            <li style="margin-bottom: 8px;">• Video calls: 23 minutes</li>
          </ul>
        </div>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Your data is private and encrypted. This summary is generated locally on your device and helps you understand your usage patterns.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To manage your privacy settings, go to WhatsApp Settings → Account → Privacy.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Thanks for using WhatsApp,<br>The WhatsApp Team</p>
        <p style="font-size: 11px; color: #6c757d; margin-top: 20px;">This email is sent monthly and contains only aggregated data. Your individual messages remain private and encrypted.</p>
      `,
      headers: [
        "Return-Path: <no-reply@whatsapp.com>",
        "SPF: pass (whatsapp.com designates 192.0.2.10 as permitted sender)",
        "DMARC: pass (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "EASY",
      explanation: "Legitimate monthly activity summary. Contains only general usage statistics and directs users to in-app settings rather than external links.",
      attachments: []
    }
  ]
};