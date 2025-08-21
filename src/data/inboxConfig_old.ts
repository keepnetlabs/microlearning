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
      sender: "support@whatsapp.com",
      subject: "Account verification required",
      preview: "We noticed a new device tried to access your account. Please verify it was you...",
      timestamp: "2 hours ago",
      isPhishing: true,
      content: `
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Dear WhatsApp User,</p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Our security systems have detected multiple failed login attempts from an unrecognized device in <strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">Istanbul, Turkey</strong> on your WhatsApp account associated with this email address.</p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">Security Alert Details:</strong></p>
      <ul class="text-[#1C1C1E] dark:text-[#F2F2F7]">
        <li>IP Address: 185.234.217.82</li>
        <li>Device: Samsung Galaxy S21 (Android 12)</li>
        <li>Time: Today at 14:32 GMT+3</li>
        <li>Location: Istanbul, Turkey</li>
      </ul>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To secure your account and prevent unauthorized access, please verify your identity by scanning the QR code below with your registered device:</p>
      <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUoAAAFKAQAAAABTUiuoAAACYElEQVR4nO2bMY7jMAxFH0cCUsrAHCBHsW82V7OPMgdYwCoDyPhbSI6zWwySIomAIQsX9is+QFDgJ2UTd8bycS8Jjjrq6AdkazFlM5vYzGzYzMwi+6fYiVZHCZIkAUEsA0jfEUYVGCVJazdaHYVWPeli0hpa3siRWnnT0wU4+jiaIywWMTtfjOVcXi3A0QfQJNmUCozfJ2l+vQBHf44IwN7Gb1FkQ8uAAbFAEpCfJ8DRB9Gt9n2QT7KJIPtagxhXYDEzs6Ebrb8bja16AMibQSqttpYhcOud367V0Q/IkWawzgXNbNa+pYJNbMbifqsPFGkFzYDmVJrLIunaZQRJa5Dmt2t1FEmlPhhVWt50eOIkteS9XaujVDs8qrQqq3WUJMa1DTm8tnpBb3LU0nNN3pyk/XT02uoCvTn1jooCgjQTxLgPED1bHaC0gW5N1O271mUkz1Zf6GaQI8epZ1OOtN7i+qEPrY6GWkc2XSfvy7lgX+tmcNivLrT+bjRSp4OAFgtFyxBo7/IApD/RSM8T4Ohj2cqfslpCaYV2MJ60D3RPsnHuQquje0942GHYBxrXpbJ38B2hW90Omw3NarXB4DGcf7IAR++N/2vrapH3B+AdfD/ocefp6A7TpW61bALv4LtCjztPm9mULga0bWS1yNU2d6H1d6N1028Q6lbfyJ9iMVBdThKK1Wbx7Vod/QfNZsdWq94snNmsXi/sTKujgE2pYF8q2LSvtmx6oQBHf4rW+u226lg/tml8uu5O3q7V0ea32p0nM805trainoT5pBv0OQIcvTPM/why1NGnoH8B6bKow7td0U8AAAAASUVORK5CYII=" alt="QR Code" style="max-width:200px;margin:0 auto;">
        <p style="font-size: 12px; color: #666; margin: 5px 0 0 0;">Scan this code with WhatsApp on your phone</p>
      </div>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">⚠️ URGENT ACTION REQUIRED:</strong></p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">If you don't verify within 24 hours, your account will be temporarily suspended for security reasons. If this wasn't you, secure your account immediately by clicking: <a href="#" style="color: #25D366; text-decoration: none;">whatsapp-security-verify.net/urgent-protection</a></p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">For immediate assistance, contact our 24/7 Security Team at: <strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">+1 (800) WHATSAPP</strong></p>
      <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Best regards,<br>WhatsApp Security & Trust Team<br>Meta Inc.</p>
      <p style="font-size: 11px; color: #999; margin-top: 20px;">This email was sent to protect your account. If you believe this is an error, please ignore this message.</p>
      `,
      headers: [
        "Return-Path: <security@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 45.142.166.23 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM-EASY",
      explanation: "This is a WhatsApp QR code hijacking scam. The QR code links to a malicious site that can steal your WhatsApp session.",
      attachments: [
        {
          id: "att-1-1",
          name: "WhatsApp_Authenticator.exe",
          size: "2.3 MB",
          type: "exe",
          content: `
            <div class="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
              <div class="text-red-600 text-4xl mb-4">⚠️</div>
              <h2 class="text-xl font-bold text-red-800 mb-3">EXECUTABLE FILE WARNING</h2>
              <p class="text-red-700 mb-4">This is a potentially dangerous executable file (.exe)</p>
              <div class="bg-white p-4 rounded border-l-4 border-red-500 text-left">
                <p class="text-sm text-gray-700 mb-2"><strong>File Name:</strong> WhatsApp_Authenticator.exe</p>
                <p class="text-sm text-gray-700 mb-2"><strong>Size:</strong> 2.3 MB</p>
                <p class="text-sm text-gray-700 mb-2"><strong>Risk Level:</strong> <span class="text-red-600 font-bold">HIGH</span></p>
                <p class="text-sm text-gray-700">This file claims to be a "WhatsApp authenticator" but executable files received via email are often malware.</p>
              </div>
              <div class="mt-4 p-3 bg-yellow-100 rounded">
                <p class="text-sm text-yellow-800"><strong>🛡️ Security Tip:</strong> Never run executable files from unknown sources!</p>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: "2",
      sender: "WhatsApp Business Security",
      subject: "⚠️ Account Compromised - Immediate Action Required",
      preview: "Your WhatsApp Business account has been flagged for suspicious activity. Secure now...",
      timestamp: "10 minutes ago",
      isPhishing: true,
      content: `
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Hello WhatsApp User,</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">We've identified <strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">suspicious activity</strong> on your WhatsApp Business account that requires immediate attention. Your account security may have been compromised.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">Detected Issues:</strong></p>
        <ul class="text-[#1C1C1E] dark:text-[#F2F2F7]">
          <li>✗ Multiple devices attempting to access your account</li>
          <li>✗ Unusual messaging patterns detected</li>
          <li>✗ Account reported by 3 different users for spam</li>
          <li>✗ Login attempts from 5 different countries in past hour</li>
        </ul>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To restore full access to your account and prevent permanent suspension, please complete the following steps:</p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <p style="margin: 0; font-weight: bold; color: #856404;">🔒 Secure Your Account Now</p>
          <p style="margin: 5px 0 0 0; color: #856404;">Download our official WhatsApp Security Verification Tool</p>
        </div>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">👉 <strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">Download Link:</strong> <a href="#" style="color: #dc3545; text-decoration: underline;">whatsapp-verify-security.com/download</a></p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">This lightweight verification tool (2.1MB) will scan your device for security threats and restore your account access within minutes.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">⚠️ TIME SENSITIVE:</strong> You have <span style="color: #dc3545; font-weight: bold;">2 hours</span> to complete verification before your account is permanently deleted due to security policy violations.</p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Already verified? <a href="#" style="color: #007bff;">Click here to confirm completion</a></p>
        <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Thank you for using WhatsApp Business,<br><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">WhatsApp Support Team</strong><br>Meta Platforms Inc.</p>
        <p style="font-size: 10px; color: #6c757d; margin-top: 25px; border-top: 1px solid #dee2e6; padding-top: 10px;">
          WhatsApp Inc. | 1601 Willow Rd, Menlo Park, CA 94025 | © 2024 Meta Inc.
        </p>
      `,
      headers: [
        "Return-Path: <support@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 192.168.1.45 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM",
      explanation: "This phishing attempt uses urgent language and threatens permanent account deletion to pressure users into clicking malicious links.",
      attachments: [
        {
          id: "att-2-1",
          name: "WhatsApp_Security_Tool.zip",
          size: "1.8 MB",
          type: "zip",
          content: `
            <div class="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="text-center mb-6">
                <div class="text-yellow-600 text-4xl mb-2">📦</div>
                <h2 class="text-xl font-bold text-yellow-800 mb-3">ZIP ARCHIVE WARNING</h2>
                <p class="text-yellow-700 mb-4">This compressed archive contains executable files</p>
              </div>
              
              <div class="bg-white p-4 rounded border-l-4 border-yellow-500 text-left mb-4">
                <h3 class="font-semibold text-gray-900 mb-2">📋 Archive Contents</h3>
                <div class="space-y-1 text-sm text-gray-700 font-mono">
                  <div>📄 WhatsApp_Security_Tool.exe (1.75 MB)</div>
                  <div>📄 install.bat (245 bytes)</div>
                  <div>📄 config.ini (1.2 KB)</div>
                  <div>📄 license.txt (892 bytes)</div>
                </div>
              </div>
              
              <div class="bg-red-50 border border-red-200 p-4 rounded">
                <h4 class="font-semibold text-red-800 mb-2">⚠️ Security Risk</h4>
                <ul class="text-sm text-red-700 space-y-1">
                  <li>• Contains executable (.exe) files</li>
                  <li>• Batch script (.bat) for automatic installation</li>
                  <li>• May bypass antivirus detection when compressed</li>
                  <li>• Claims to be official WhatsApp software</li>
                </ul>
              </div>
            </div>
          `
        },
        {
          id: "att-2-2",
          name: "readme.txt",
          size: "1.2 KB",
          type: "txt",
          content: `
            <div class="p-3 bg-gray-50 rounded">
              <div class="text-center mb-2">
                <h3 class="text-base font-semibold text-gray-900">readme.txt</h3>
                <p class="text-xs text-gray-600">Installation Instructions</p>
              </div>
              
              <div class="font-mono text-xs bg-white p-3 rounded border leading-tight">
                <div class="text-blue-600 font-bold mb-2">=== WhatsApp Security Tool v2.4 ===</div>
                <div class="text-gray-800">
                  <div>URGENT SECURITY UPDATE REQUIRED</div>
                  <div class="h-1"></div>
                  <div>Your WhatsApp account has been flagged for suspicious activity.</div>
                  <div>This tool will restore your account security and prevent termination.</div>
                  <div class="h-1"></div>
                  <div class="text-red-600 font-bold">INSTALLATION STEPS:</div>
                  <div>1. Extract all files to Desktop</div>
                  <div>2. Right-click install.bat → "Run as Administrator"</div>
                  <div>3. Enter your phone number when prompted</div>
                  <div>4. Input verification code from SMS</div>
                  <div>5. Wait for security scan to complete</div>
                  <div class="h-1"></div>
                  <div class="text-green-600">✓ Official WhatsApp Security Team</div>
                  <div class="text-green-600">✓ Authorized by Meta Platforms Inc.</div>
                  <div class="h-1"></div>
                  <div class="text-red-600 font-bold">WARNING: Failure to run this tool within 24 hours</div>
                  <div class="text-red-600 font-bold">will result in permanent account suspension!</div>
                </div>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: "3",
      sender: "WhatsApp Verification Team",
      subject: "New Device Login - Verification Required",
      preview: "iPhone 14 Pro Max detected in New York. Enter verification code to continue...",
      timestamp: "10 minutes ago",
      isPhishing: true,
      content: `
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Dear Valued User,</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">We noticed an attempt to log into your WhatsApp account from a new device that we don't recognize:</p>
         <div style="background: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0;">
           <p style="margin: 0; font-weight: bold; color: #1C1C1E;">📱 New Device Login Detected</p>
           <p style="margin: 5px 0 0 0; color: #1C1C1E;"><strong style="color: #1C1C1E;">Device:</strong> iPhone 14 Pro Max</p>
           <p style="margin: 5px 0 0 0; color: #1C1C1E;"><strong style="color: #1C1C1E;">Location:</strong> New York, United States</p>
           <p style="margin: 5px 0 0 0; color: #1C1C1E;"><strong style="color: #1C1C1E;">Time:</strong> Today at 16:45 EST</p>
           <p style="margin: 5px 0 0 0; color: #1C1C1E;"><strong style="color: #1C1C1E;">Browser:</strong> Safari 17.2</p>
         </div>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">As an additional security measure, please verify this login attempt by entering your 6-digit verification code below:</p>
         <div style="text-align: center; margin: 20px 0;">
           <input type="text" placeholder="Enter 6-digit code" style="padding: 12px; font-size: 18px; width: 200px; text-align: center; border: 2px solid #25D366; border-radius: 8px; letter-spacing: 3px;">
           <br><br>
           <button style="background: #25D366; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Verify Account</button>
         </div>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">If you didn't attempt to log in, someone may be trying to access your account. Secure it immediately:</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">👉 <strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">Emergency Security:</strong> <a href="#" style="color: #dc3545; font-weight: bold;">secure-whatsapp-emergency.org/protect-now</a></p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">This secure link will immediately lock your account and send you recovery instructions.</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Stay Safe,<br>The WhatsApp Security Team<br>Meta Inc.</p>
         <p style="font-size: 11px; color: #6c757d; margin-top: 20px;">Need help? Visit our <a href="#" style="color: #1C1C1E;">Help Center</a> or contact support at support@whatsapp.com</p>
       `,
      headers: [
        "Return-Path: <verify@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 203.0.113.42 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "HARD",
      explanation: "This sophisticated phishing email attempts to collect verification codes and personal information through fake security alerts.",
      attachments: [
        {
          id: "att-3-1",
          name: "WhatsApp_Business_Setup.exe",
          size: "892 KB",
          type: "exe"
        }
      ]
    },
    {
      id: "4",
      sender: "WhatsApp Emergency Security",
      subject: "🚨 CRITICAL: Account Termination in 59 Minutes",
      preview: "Your account violates Terms of Service. Complete verification or lose everything...",
      timestamp: "10 minutes ago",
      isPhishing: true,
      content: `
         <div style="background: #dc3545; color: white; padding: 15px; text-align: center; font-weight: bold; font-size: 18px; margin-bottom: 20px;">
           🚨 CRITICAL SECURITY ALERT 🚨
         </div>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">URGENT NOTIFICATION:</strong> Your WhatsApp account has been flagged for immediate termination due to violations of our Terms of Service.</p>
         <div style="background: #ffe6e6; border: 2px solid #dc3545; border-radius: 8px; padding: 20px; margin: 20px 0;">
           <p style="margin: 0; font-weight: bold; color: #dc3545; font-size: 16px;">⏰ ACCOUNT TERMINATION IN: 59 MINUTES</p>
           <p style="margin: 10px 0 0 0; color: #721c24;">Reason: Automated spam detection triggered by unusual message volume</p>
         </div>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">IMMEDIATE STEPS TO PREVENT ACCOUNT LOSS:</strong></p>
         <ol style="background: #f8f9fa; padding: 20px; border-radius: 8px;" class="text-[#1C1C1E] dark:text-[#F2F2F7]">
           <li><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">STEP 1:</strong> Click emergency verification: <a href="#" style="color: #dc3545; font-weight: bold; text-decoration: underline;">emergency-whatsapp-verify.net/save-account</a></li>
           <li><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">STEP 2:</strong> Enter your registered phone number</li>
           <li><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">STEP 3:</strong> Input the verification code sent to your device</li>
           <li><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">STEP 4:</strong> Complete identity confirmation within 60 minutes</li>
         </ol>
         <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 20px 0;">
           <p style="margin: 0; font-weight: bold; color: #856404;">⚠️ WARNING</p>
           <p style="margin: 5px 0 0 0; color: #856404;">Failure to verify will result in permanent account deletion. All chat history, media, and contacts will be permanently lost.</p>
         </div>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">If you believe this is an error, contact our Emergency Response Team immediately at: <strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">+1-800-WHATSAPP-HELP</strong></p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]"><strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">DO NOT IGNORE THIS MESSAGE!</strong></p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">WhatsApp Emergency Security Department<br>Trust & Safety Division<br>Meta Platforms Inc.</p>
         <p style="font-size: 10px; color: #dc3545; margin-top: 25px; font-weight: bold;">This is an automated security alert. Response required within 60 minutes to prevent data loss.</p>
       `,
      headers: [
        "Return-Path: <emergency@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 198.51.100.23 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "EASY",
      explanation: "This obvious phishing email uses aggressive tactics, ALL CAPS text, and extremely short time limits to create panic and rush users into making mistakes.",
      attachments: [
        {
          id: "att-4-1",
          name: "Emergency_Verification_Guide.pdf",
          size: "1.2 MB",
          type: "pdf",
          content: `
            <div class="p-6 bg-red-50 border border-red-200">
              <div class="text-center mb-6">
                <div class="text-red-600 text-4xl mb-2">🚨</div>
                <h1 class="text-2xl font-bold text-red-800">EMERGENCY VERIFICATION GUIDE</h1>
                <p class="text-red-600 font-semibold">URGENT - Account Termination Imminent</p>
              </div>
              
              <div class="bg-white border-l-4 border-red-500 p-4 mb-6">
                <h2 class="text-lg font-bold text-red-800 mb-3">⏰ CRITICAL TIMELINE</h2>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-700">Account Flagged:</span>
                    <span class="font-bold text-red-600">3 hours ago</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-700">Termination Scheduled:</span>
                    <span class="font-bold text-red-600">In 59 minutes</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-700">Last Chance:</span>
                    <span class="font-bold text-red-600">This verification</span>
                  </div>
                </div>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">📋 Violation Details</h3>
                <div class="bg-gray-100 p-4 rounded">
                  <ul class="space-y-2 text-sm text-gray-700">
                    <li>• Automated spam detection triggered</li>
                    <li>• Unusual message volume detected</li>
                    <li>• Multiple reports from recipients</li>
                    <li>• Terms of Service violation: Section 4.2.1</li>
                  </ul>
                </div>
              </div>
              
              <div class="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
                <h3 class="text-lg font-semibold text-yellow-800 mb-2">🔐 Required Verification Steps</h3>
                <ol class="space-y-2 text-sm text-yellow-700">
                  <li><strong>1.</strong> Visit: emergency-whatsapp-verify.net/save-account</li>
                  <li><strong>2.</strong> Enter your WhatsApp phone number</li>
                  <li><strong>3.</strong> Input verification code sent to device</li>
                  <li><strong>4.</strong> Complete identity verification</li>
                  <li><strong>5.</strong> Download security certificate</li>
                </ol>
              </div>
              
              <div class="text-center p-4 bg-red-100 rounded">
                <p class="text-sm text-red-800">
                  <strong>⚠️ WARNING:</strong> Failure to complete verification within the time limit 
                  will result in permanent account deletion. This action cannot be undone.
                </p>
              </div>
            </div>
          `
        }
      ]
    },
    {
      id: "5",
      sender: "WhatsApp Device Management",
      subject: "Enhanced Security Setup - Complete Your Profile",
      preview: "Upgrade your WhatsApp with advanced encryption. QR scan or online verification...",
      timestamp: "10 minutes ago",
      isPhishing: true,
      content: `
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Hi there,</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Great news! We're upgrading your WhatsApp experience with enhanced security features. We noticed you're setting up WhatsApp on a new device - let's make sure everything is secure.</p>
         <div style="background: linear-gradient(135deg, #25D366, #128C7E); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
           <h3 style="margin: 0; font-size: 20px;">🔐 Enhanced Security Setup</h3>
           <p style="margin: 10px 0 0 0; opacity: 0.9;">Protect your conversations with advanced encryption</p>
         </div>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">To complete your secure setup, please verify your identity using one of these methods:</p>
         <div style="display: flex; gap: 20px; margin: 20px 0;">
           <div style="flex: 1; background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
             <p style="font-size: 48px; margin: 0;">📱</p>
             <p style="margin: 10px 0 5px 0; font-weight: bold; color: #1C1C1E;">Method 1: QR Scan</p>
             <div style="background: white; border: 2px dashed #25D366; padding: 20px; margin: 10px 0; border-radius: 8px;">
               <p style="margin: 0; font-size: 14px; color: #666;">[QR CODE SCANNER]</p>
               <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Scan with your registered device</p>
             </div>
           </div>
           <div style="flex: 1; background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
             <p style="font-size: 48px; margin: 0;">🌐</p>
             <p style="margin: 10px 0 5px 0; font-weight: bold; color: #1C1C1E;">Method 2: Online Verification</p>
             <a href="#" style="display: inline-block; background: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0;">Verify Online</a>
             <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">whatsapp-device-verify.com</p>
           </div>
         </div>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">⏰ <strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">Time Remaining:</strong> <span style="color: #dc3545; font-weight: bold;">29 minutes 45 seconds</span></p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">This verification link expires in 30 minutes for your security. Don't worry - if you miss it, we'll send you a new one!</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">New features you'll unlock after verification:</p>
         <ul class="text-[#1C1C1E] dark:text-[#F2F2F7]">
           <li>✅ End-to-end encryption for all devices</li>
           <li>✅ Advanced spam protection</li>
           <li>✅ Priority customer support</li>
           <li>✅ Enhanced backup security</li>
         </ul>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Questions? Our 24/7 support team is here to help at <strong class="text-[#1C1C1E] dark:text-[#F2F2F7]">help@whatsapp.com</strong></p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]">Thanks for choosing WhatsApp!<br>WhatsApp Device Management Team<br>Meta Inc.</p>
         <p class="text-[#1C1C1E] dark:text-[#F2F2F7]" style="margin-top: 20px;">This verification was triggered by a login attempt from: Chrome Browser, Windows 11, IP: 192.168.1.1</p>
       `,
      headers: [
        "Return-Path: <device@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 172.16.254.1 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM-HARD",
      explanation: "This phishing email appears more legitimate but uses a fake domain and QR code verification to steal account access.",
      attachments: [
        {
          id: "att-5-1",
          name: "QR_Security_Setup.png",
          size: "245 KB",
          type: "img",
          content: `
            <div class="p-6 bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200">
              <div class="text-center mb-6">
                <h2 class="text-xl font-bold text-gray-900 mb-2">WhatsApp QR Security Setup</h2>
                <p class="text-gray-600">Enhanced Protection Protocol</p>
              </div>
              
              <div class="flex justify-center mb-6">
                <div class="bg-white p-6 rounded-lg shadow-md border">
                  <div class="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded">
                    <div class="text-center">
                      <div class="text-4xl mb-2">📱</div>
                      <p class="text-sm text-gray-600">QR Code Placeholder</p>
                      <p class="text-xs text-gray-500 mt-1">
                        whatsapp-verify.net/qr/abc123
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                <h3 class="font-semibold text-gray-900 mb-3">📋 Setup Instructions</h3>
                <ol class="space-y-2 text-sm text-gray-700">
                  <li><strong>1.</strong> Open WhatsApp on your mobile device</li>
                  <li><strong>2.</strong> Go to Settings → Security → QR Setup</li>
                  <li><strong>3.</strong> Scan the QR code above</li>
                  <li><strong>4.</strong> Enter verification code: <span class="font-mono bg-gray-100 px-2 py-1 rounded">WA2024</span></li>
                  <li><strong>5.</strong> Complete device authorization</li>
                </ol>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 p-4 rounded">
                <h4 class="font-semibold text-blue-800 mb-2">🔒 Security Features</h4>
                <ul class="text-sm text-blue-700 space-y-1">
                  <li>• End-to-end encryption upgrade</li>
                  <li>• Advanced threat detection</li>
                  <li>• Multi-device sync protection</li>
                  <li>• Automatic backup encryption</li>
                </ul>
              </div>
            </div>
          `
        },
        {
          id: "att-5-2",
          name: "WhatsApp_Mobile_Companion.exe",
          size: "892 KB",
          type: "exe",
          content: `
            <div class="text-center p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <div class="text-orange-600 text-4xl mb-4">⚠️</div>
              <h2 class="text-xl font-bold text-orange-800 mb-3">SUSPICIOUS EXECUTABLE</h2>
              <p class="text-orange-700 mb-4">This file claims to be a verification tool</p>
              <div class="bg-white p-4 rounded border-l-4 border-orange-500 text-left">
                <p class="text-sm text-gray-700 mb-2"><strong>File Name:</strong> WhatsApp_Mobile_Companion.exe</p>
                <p class="text-sm text-gray-700 mb-2"><strong>Size:</strong> 892 KB</p>
                <p class="text-sm text-gray-700 mb-2"><strong>Risk Level:</strong> <span class="text-orange-600 font-bold">VERY HIGH</span></p>
                <p class="text-sm text-gray-700">This executable is disguised as a WhatsApp mobile companion app but is likely malware designed to steal account credentials.</p>
              </div>
              <div class="mt-4 p-3 bg-red-100 rounded">
                <p class="text-sm text-red-800"><strong>🚫 Security Alert:</strong> WhatsApp NEVER requires downloading executable files for verification!</p>
              </div>
            </div>
          `
        }
      ]
    }
    ,
    {
      id: "6",
      sender: "WhatsApp Support",
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
          id: "att-6-1",
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
      id: "7",
      sender: "WhatsApp Business",
      subject: "📊 Monthly Insights Report - January 2024",
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
          id: "att-7-1",
          name: "January_2024_Report.pdf",
          size: "456 KB",
          type: "pdf",
          content: `
            <div class="p-6 bg-white">
              <div class="border-b border-gray-200 pb-4 mb-6">
                <h1 class="text-2xl font-bold text-gray-900">WhatsApp Business</h1>
                <h2 class="text-xl text-gray-700 mt-2">Monthly Usage Report - January 2024</h2>
                <p class="text-sm text-gray-500 mt-1">Generated on February 1, 2024</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 class="font-semibold text-green-800">Messages Sent</h3>
                  <p class="text-2xl font-bold text-green-600">2,847</p>
                  <p class="text-sm text-green-600">↑ 12% from December</p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 class="font-semibold text-blue-800">Active Customers</h3>
                  <p class="text-2xl font-bold text-blue-600">1,234</p>
                  <p class="text-sm text-blue-600">↑ 8% from December</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 class="font-semibold text-purple-800">Response Rate</h3>
                  <p class="text-2xl font-bold text-purple-600">94%</p>
                  <p class="text-sm text-purple-600">↑ 2% from December</p>
                </div>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Top Performing Categories</h3>
                <div class="space-y-2">
                  <div class="flex justify-between bg-gray-50 p-3 rounded">
                    <span class="text-gray-700">Customer Support</span>
                    <span class="font-semibold text-gray-900">45%</span>
                  </div>
                  <div class="flex justify-between bg-gray-50 p-3 rounded">
                    <span class="text-gray-700">Product Updates</span>
                    <span class="font-semibold text-gray-900">32%</span>
                  </div>
                  <div class="flex justify-between bg-gray-50 p-3 rounded">
                    <span class="text-gray-700">Promotional Messages</span>
                    <span class="font-semibold text-gray-900">23%</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600">
                  <strong>Note:</strong> This report is automatically generated and reflects your account activity for the specified period. 
                  For detailed analytics, please visit your WhatsApp Business dashboard.
                </p>
              </div>
            </div>
          `
        },
        {
          id: "att-7-2",
          name: "Business_Insights.xls",
          size: "89 KB",
          type: "xls",
          content: `
            <div class="p-4 bg-white">
              <div class="mb-4 border-b border-gray-200 pb-2">
                <h3 class="text-lg font-semibold text-gray-900">Business Insights.xls</h3>
                <p class="text-sm text-gray-600">WhatsApp Business Analytics Data</p>
              </div>
              
              <div class="overflow-x-auto">
                <table class="min-w-full border-collapse border border-gray-300">
                  <thead class="bg-green-100">
                    <tr>
                      <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Date</th>
                      <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Messages</th>
                      <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Customers</th>
                      <th class="border border-gray-300 px-3 py-2 text-left text-sm font-semibold">Response Rate</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm">
                    <tr class="bg-white">
                      <td class="border border-gray-300 px-3 py-2">2024-01-01</td>
                      <td class="border border-gray-300 px-3 py-2">89</td>
                      <td class="border border-gray-300 px-3 py-2">45</td>
                      <td class="border border-gray-300 px-3 py-2">92%</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-300 px-3 py-2">2024-01-02</td>
                      <td class="border border-gray-300 px-3 py-2">156</td>
                      <td class="border border-gray-300 px-3 py-2">78</td>
                      <td class="border border-gray-300 px-3 py-2">95%</td>
                    </tr>
                    <tr class="bg-white">
                      <td class="border border-gray-300 px-3 py-2">2024-01-03</td>
                      <td class="border border-gray-300 px-3 py-2">203</td>
                      <td class="border border-gray-300 px-3 py-2">89</td>
                      <td class="border border-gray-300 px-3 py-2">97%</td>
                    </tr>
                    <tr class="bg-gray-50">
                      <td class="border border-gray-300 px-3 py-2">2024-01-04</td>
                      <td class="border border-gray-300 px-3 py-2">178</td>
                      <td class="border border-gray-300 px-3 py-2">67</td>
                      <td class="border border-gray-300 px-3 py-2">93%</td>
                    </tr>
                    <tr class="bg-white">
                      <td class="border border-gray-300 px-3 py-2">2024-01-05</td>
                      <td class="border border-gray-300 px-3 py-2">234</td>
                      <td class="border border-gray-300 px-3 py-2">98</td>
                      <td class="border border-gray-300 px-3 py-2">96%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="mt-4 p-3 bg-green-50 rounded border border-green-200">
                <h4 class="font-semibold text-green-800 mb-2">Summary Statistics</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span class="text-green-700">Total Messages:</span>
                    <span class="font-semibold ml-1">860</span>
                  </div>
                  <div>
                    <span class="text-green-700">Unique Customers:</span>
                    <span class="font-semibold ml-1">377</span>
                  </div>
                  <div>
                    <span class="text-green-700">Avg Response Rate:</span>
                    <span class="font-semibold ml-1">94.6%</span>
                  </div>
                </div>
              </div>
            </div>
          `
        }
      ]
    }
  ]
};