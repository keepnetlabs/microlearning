// Static configuration for Inbox Scene
// This will be moved to JSON configs later for standardization

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
    ctaButtonText: "Improve Your Behavior"
  },
  emails: [
    {
      id: "1",
      sender: "WhatsApp Security",
      subject: "Action Required: Verify Your WhatsApp Account",
      preview: "We've detected unusual activity on your WhatsApp account. Please scan the QR code below to verify you...",
      timestamp: "10 minutes ago",
      isPhishing: true,
      content: `
        <p>Dear WhatsApp User,</p>
        <p>We've detected unusual activity on your WhatsApp account. Please scan the QR code below to verify your account immediately.</p>
        <p><strong>URGENT:</strong> If you don't verify within 24 hours, your account will be suspended permanently.</p>
        <p>Click here to verify: <a href="#">whatsapp-security-verify.net/urgent</a></p>
        <p>Best regards,<br>WhatsApp Security Team</p>
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
      ]
    },
    {
      id: "2", 
      sender: "WhatsApp Security",
      subject: "Action Required: Verify Your WhatsApp Account",
      preview: "We've detected unusual activity on your WhatsApp account. Please scan the QR code below to verify you...",
      timestamp: "10 minutes ago",
      isPhishing: true,
      content: `
        <p>Hello,</p>
        <p>Your WhatsApp account has been compromised. We need you to verify your identity immediately.</p>
        <p>Download our verification app from: <a href="#">whatsapp-verify-app.com</a></p>
        <p>Failure to act within 2 hours will result in permanent account deletion.</p>
        <p>WhatsApp Support</p>
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
      ]
    },
    {
      id: "3",
      sender: "WhatsApp Security", 
      subject: "Action Required: Verify Your WhatsApp Account",
      preview: "We've detected unusual activity on your WhatsApp account. Please scan the QR code below to verify you...",
      timestamp: "10 minutes ago", 
      isPhishing: true,
      content: `
        <p>Dear User,</p>
        <p>Someone tried to access your WhatsApp from a new device. To protect your account, please confirm your identity.</p>
        <p>Enter your verification code: <input type="text" placeholder="Enter code here"></p>
        <p>If this wasn't you, secure your account immediately by clicking: <a href="#">secure-whatsapp-now.org</a></p>
        <p>WhatsApp Team</p>
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
      ]
    },
    {
      id: "4",
      sender: "WhatsApp Security",
      subject: "Action Required: Verify Your WhatsApp Account", 
      preview: "We've detected unusual activity on your WhatsApp account. Please scan the QR code below to verify you...",
      timestamp: "10 minutes ago",
      isPhishing: true,
      content: `
        <p>SECURITY ALERT!</p>
        <p>Your WhatsApp account will be terminated in 1 hour due to suspicious activity.</p>
        <p>IMMEDIATE ACTION REQUIRED:</p>
        <p>1. Click this link: <a href="#">emergency-whatsapp-verify.net</a></p>
        <p>2. Enter your phone number and verification code</p>
        <p>3. Confirm your identity within 60 minutes</p>
        <p>Do not ignore this message!</p>
        <p>WhatsApp Security Department</p>
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
      ]
    },
    {
      id: "5",
      sender: "WhatsApp Security",
      subject: "Action Required: Verify Your WhatsApp Account",
      preview: "We've detected unusual activity on your WhatsApp account. Please scan the QR code below to verify you...", 
      timestamp: "10 minutes ago",
      isPhishing: true,
      content: `
        <p>Hi there,</p>
        <p>We noticed you're trying to use WhatsApp on a new device. For your security, please verify it's really you.</p>
        <p>Simply scan this QR code with your phone: [QR Code Image]</p>
        <p>Or click here to verify online: <a href="#">whatsapp-device-verify.com</a></p>
        <p>This link expires in 30 minutes for security reasons.</p>
        <p>Thanks,<br>WhatsApp Support</p>
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
      ]
    }
  ]
};