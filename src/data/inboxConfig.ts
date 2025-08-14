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
  phishingIndicatorsTitle: string;
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

export interface EmailData {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isPhishing: boolean;
  content: string;
  phishingIndicators?: string[];
  headers?: string[];
  difficulty?: string;
  explanation?: string;
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
    phishingIndicatorsTitle: "Potential Phishing Indicators",
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
      sender: "WhatsApp Support",
      subject: "🔒 Security Alert: Unusual Login Detected",
      preview: "We've detected multiple failed login attempts from Istanbul, Turkey. Verify your identity now...",
      timestamp: "10 minutes ago",
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
      phishingIndicators: [
        "Urgent action required with threat",
        "Account suspension threat",
        "Suspicious verification URL",
        "Generic greeting instead of personal name",
        "Pressure tactics with time limit"
      ],
      headers: [
        "Return-Path: <security@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 45.142.166.23 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM-EASY",
      explanation: "This is a WhatsApp QR code hijacking scam. The QR code links to a malicious site that can steal your WhatsApp session."
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
      phishingIndicators: [
        "Generic greeting 'Hello'",
        "Claims account is compromised",
        "Suspicious download link",
        "Extreme urgency (2 hours)",
        "Threat of permanent deletion"
      ],
      headers: [
        "Return-Path: <support@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 192.168.1.45 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM",
      explanation: "This phishing attempt uses urgent language and threatens permanent account deletion to pressure users into clicking malicious links."
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
      phishingIndicators: [
        "Asks for verification code input",
        "Suspicious security URL domain",
        "Creates false sense of urgency",
        "Requests sensitive information",
        "Generic 'Dear User' greeting"
      ],
      headers: [
        "Return-Path: <verify@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 203.0.113.42 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "HARD",
      explanation: "This sophisticated phishing email attempts to collect verification codes and personal information through fake security alerts."
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
      phishingIndicators: [
        "ALL CAPS urgent language",
        "Account termination threat",
        "Very short time limit (1 hour)",
        "Suspicious emergency domain",
        "Requests phone number and code"
      ],
      headers: [
        "Return-Path: <emergency@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 198.51.100.23 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "EASY",
      explanation: "This obvious phishing email uses aggressive tactics, ALL CAPS text, and extremely short time limits to create panic and rush users into making mistakes."
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
         <p style="font-size: 11px; color: #6c757d; margin-top: 20px;">This verification was triggered by a login attempt from: Chrome Browser, Windows 11, IP: 192.168.1.1</p>
       `,
      phishingIndicators: [
        "Informal greeting 'Hi there'",
        "Fake QR code verification",
        "Non-official domain name",
        "Creates artificial urgency",
        "Impersonates legitimate process"
      ],
      headers: [
        "Return-Path: <device@whatsapp.com>",
        "SPF: fail (whatsapp.com does not designate 172.16.254.1 as permitted sender)",
        "DMARC: fail (p=reject dis=none) header.from=whatsapp.com"
      ],
      difficulty: "MEDIUM-HARD",
      explanation: "This phishing email appears more legitimate but uses a fake domain and QR code verification to steal account access."
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
      explanation: "This is a routine service notification. It does not ask for sensitive information or include suspicious links."
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
      explanation: "Legitimate informational email. It directs users to in-app navigation instead of external links."
    }
  ]
};