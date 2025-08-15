import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, AlertTriangle, Flag, ChevronRight, Reply, CornerUpRight, Archive, Delete, ArrowLeft, Eye, Star, FileText, EyeOff, MailSearch, Check, X, FileSpreadsheet, Image, Download } from "lucide-react";
import { FontWrapper } from "../common/FontWrapper";
import { useIsMobile } from "../ui/use-mobile";
import { CallToAction } from "../ui/CallToAction";
import { PhishingReportButton } from "../ui/PhishingReportButton";
import { PhishingReportModal } from "../ui/PhishingReportModal";
import { PhishingResultModal } from "../ui/PhishingResultModal";
import { InboxSceneConfig, EmailData, EmailAttachment } from "../../data/inboxConfig";
import { useEditMode } from "../../contexts/EditModeContext";
import { enhanceLinkTooltips } from "../../utils/linkTooltip";

interface InboxSceneProps {
  config: InboxSceneConfig;
  onNextSlide?: () => void;
  onEmailReport?: (emailId: string, isCorrect: boolean) => void;
}

export function InboxScene({ config, onNextSlide, onEmailReport }: InboxSceneProps) {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [reportedEmails, setReportedEmails] = useState<Set<string>>(new Set());
  const [reportResults, setReportResults] = useState<Map<string, boolean>>(new Map());
  const [accuracy, setAccuracy] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastReportedEmail, setLastReportedEmail] = useState<EmailData | null>(null);
  const [lastReportCorrect, setLastReportCorrect] = useState(false);
  const isMobile = useIsMobile();

  // Optional edit mode - only use if EditModeProvider is available
  let isEditMode = false;
  try {
    const editModeContext = useEditMode();
    isEditMode = editModeContext.isEditMode;
  } catch (error) {
    // EditModeProvider not available, default to false
    isEditMode = false;
  }

  const selectedEmail = config.emails.find(email => email.id === selectedEmailId);

  // Phishing Report icon component
  const PhishingIcon = () => (
    <svg width="28" height="16" viewBox="0 0 29 16" fill="none" className="flex-shrink-0">
      <path d="M0.521774 12.6882C0.504807 12.7999 0.663163 12.8395 0.71265 12.7377C2.74159 8.62464 6.8829 -0.74668 19.7098 3.13164C19.7098 3.13164 20.462 3.60106 19.6165 4.9174C19.6165 4.9174 20.3149 4.85094 20.8989 4.59361C21.2905 4.42253 21.7133 4.34335 22.1417 4.32922C22.8797 4.30518 23.9585 3.62085 23.5089 2.29603C23.1597 1.26671 22.1558 0.927376 21.0996 0.667219C16.513 -0.4639 2.74159 -1.92163 0.521774 12.6882Z" fill="currentColor" />
      <path d="M3.96289 8.32319C3.96289 8.32319 13.5265 -1.99261 25.6549 10.6264C26.0664 11.0548 26.1554 11.2443 26.7125 11.4493C27.1508 11.6105 28.2013 11.4705 26.3364 9.26344L25.9193 8.7516C25.7256 8.47024 25.9193 8.17049 26.3124 8.35854C26.5202 8.45751 26.8525 8.62577 26.8525 8.62577C27.9101 9.36948 28.1795 9.69552 28.4276 9.94493C28.4276 9.94493 30.284 12.1068 27.3106 12.4716C27.3106 12.4716 27.4166 17.5828 23.5058 13.4231L23.1636 12.9933C23.0873 12.8972 22.9558 12.4716 23.3785 12.5069C23.7009 12.5338 24.1972 12.7331 25.0455 13.2492C25.0455 13.2492 27.4265 14.2573 24.7599 11.2839C24.7627 11.2839 17.1602 1.89561 3.96289 8.32319Z" fill="currentColor" />
      <path d="M1.72279 15.8465C3.80829 16.1604 11.4023 16.7387 13.1542 8.90568C13.2065 8.67521 12.9138 8.52534 12.7568 8.70349C11.3104 10.3535 7.85486 14.2728 5.23208 13.7073C5.23208 13.7073 5.62797 13.5291 5.58414 11.9569C5.5799 11.824 5.40882 11.7716 5.33247 11.8805C5.04403 12.2905 4.41202 13.3411 3.48026 13.5489C2.1512 13.8472 0.0713525 14.0692 0.728815 15.206C0.938072 15.5623 1.31558 15.7843 1.72279 15.8465Z" fill="currentColor" />
      <path d="M2.742 12.9313C3.26128 12.9313 3.68224 12.5103 3.68224 11.991C3.68224 11.4717 3.26128 11.0508 2.742 11.0508C2.22272 11.0508 1.80176 11.4717 1.80176 11.991C1.80176 12.5103 2.22272 12.9313 2.742 12.9313Z" fill="currentColor" />
    </svg>
  );

  // Attachment component with proper icons
  const AttachmentIcon = ({ type }: { type: EmailAttachment['type'] }) => {
    switch (type) {
      case 'pdf':
      case 'doc':
        return <FileText size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />;
      case 'xls':
        return <FileSpreadsheet size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />;
      case 'img':
        return <Image size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />;
      case 'zip':
        return <Archive size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />;
      case 'exe':
        return <AlertTriangle size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />;
      case 'txt':
        return <FileText size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />;
      default:
        return <FileText size={16} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />;
    }
  };

  const AttachmentComponent = ({ attachments }: { attachments: EmailAttachment[] }) => (
    <div className="border-t border-white/20 dark:border-white/10 pt-4 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Download size={14} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />
        <FontWrapper>
          <span className="text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7]">
            Attachments ({attachments.length})
          </span>
        </FontWrapper>
      </div>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <motion.div
            key={attachment.id}
            whileHover={{ x: 2 }}
            className={`flex items-center justify-between p-3 glass-border-2 cursor-pointer transition-all`}
          >
            <div className="flex items-center gap-3">
              <AttachmentIcon type={attachment.type} />
              <div>
                <FontWrapper>
                  <p className="text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7]">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70">
                    {attachment.size}
                  </p>
                </FontWrapper>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const handleEmailSelect = useCallback((emailId: string) => {
    setSelectedEmailId(emailId);
  }, []);

  const handleEmailReport = useCallback((emailId: string) => {
    const email = config.emails.find(e => e.id === emailId);
    if (!email || reportedEmails.has(emailId)) return;

    const isCorrect = email.isPhishing;
    const newReportedEmails = new Set(reportedEmails);
    newReportedEmails.add(emailId);
    setReportedEmails(newReportedEmails);

    const newReportResults = new Map(reportResults);
    newReportResults.set(emailId, isCorrect);
    setReportResults(newReportResults);

    const newTotalReports = totalReports + 1;
    setTotalReports(newTotalReports);

    const correctReports = Array.from(newReportedEmails).filter(id => {
      const reportedEmail = config.emails.find(e => e.id === id);
      return reportedEmail?.isPhishing;
    }).length;

    const newAccuracy = Math.round((correctReports / newTotalReports) * 100);
    setAccuracy(newAccuracy);

    onEmailReport?.(emailId, isCorrect);
  }, [config.emails, reportedEmails, reportResults, totalReports, onEmailReport]);

  const handlePhishingReportClick = useCallback(() => {
    if (selectedEmail) {
      setShowReportModal(true);
    }
  }, [selectedEmail]);

  const handleModalReport = useCallback((selectedOptions: number[]) => {
    if (selectedEmail) {
      const isCorrect = selectedEmail.isPhishing;
      setLastReportedEmail(selectedEmail);
      setLastReportCorrect(isCorrect);
      handleEmailReport(selectedEmail.id);
      setShowReportModal(false);
      // Show result modal after a brief delay
      setTimeout(() => {
        setShowResultModal(true);
      }, 300);
    }
  }, [selectedEmail, handleEmailReport]);

  return (
    <div>
      <div>
        {/* Single Card with Header and Two-Column Layout */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 rounded-lg border border-white/20 dark:border-white/10 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 40px)', maxHeight: 'calc(100vh - 40px)' }}>
          {/* Header - Desktop layout */}
          <div className="hidden lg:block p-6 border-b border-white/20 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                <FontWrapper>
                  <h1 className="text-base font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">{config.texts.title}</h1>
                </FontWrapper>
              </div>
              <div className="flex items-center gap-6 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold">
                <span>{config.texts.reportsLabel}: {totalReports}</span>
                <span>{config.texts.accuracyLabel}: {accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Header - Mobile layout */}
          <div className="lg:hidden p-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/20 dark:border-white/10 mb-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                <FontWrapper>
                  <h1 className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7]">{config.texts.mobileTitle}</h1>
                </FontWrapper>
              </div>
              <div className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] font-semibold">
                {config.texts.accuracyLabel}: {accuracy}%
              </div>
            </div>
            {/* Phishing Report Button - Mobile */}
            <div className="pb-4 border-b border-white/20 dark:border-white/10 mx-4">
              <PhishingReportButton
                text={config.texts.phishingReportLabel}
                onClick={handlePhishingReportClick}
                disabled={!selectedEmail}
                icon={<PhishingIcon />}
              />
            </div>
          </div>

          {/* Toolbar row - Desktop only */}
          <div className="hidden lg:block px-6 py-3 border-b border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Email toolbar icons */}
                <button className="p-3 glass-border-4">
                  <Reply className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                </button>
                <button className="p-3 glass-border-4">
                  <CornerUpRight className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                </button>
                <button className="p-3 glass-border-4">
                  <Archive className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                </button>
                <button className="p-3 glass-border-4">
                  <Delete className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                </button>
                <button className="p-3 glass-border-4">
                  <Flag className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                </button>
              </div>
              <PhishingReportButton
                text={config.texts.phishingReportLabel}
                onClick={handlePhishingReportClick}
                disabled={!selectedEmail}
                icon={<PhishingIcon />}
              />
            </div>
          </div>

          {/* Content - Mobile: Conditional view, Desktop: Two-column */}
          <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 min-h-0 overflow-hidden">
            {/* Mobile: Show email list or detail view */}
            <div className="lg:border-r border-white/20 dark:border-white/10 flex flex-col min-h-0">
              {/* Mobile: Back to Inbox button when email is selected */}
              {isMobile && selectedEmail && (
                <div className="px-4 py-3 border-b border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/5">
                  <button
                    onClick={() => setSelectedEmailId(null)}
                    className="flex items-center gap-2 text-sm text-[#1C1C1E] dark:text-[#F2F2F7] hover:text-[#1C1C1E] dark:hover:text-[#F2F2F7] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <FontWrapper>
                      <span>{config.texts.backToInboxText}</span>
                    </FontWrapper>
                  </button>
                </div>
              )}

              {/* Mobile: Email detail view or Email list */}
              {isMobile && selectedEmail ? (
                <div className="p-4 overflow-y-auto flex-1 min-h-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedEmail.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Email Header */}
                      <div className="border-b border-white/20 dark:border-white/10 pb-4 mb-6">
                        <FontWrapper>
                          <h3 className="text-lg font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">{selectedEmail.subject}</h3>
                          <div className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] space-y-1">
                            <p><span className="font-semibold">From:</span> {selectedEmail.sender}</p>
                            <p><span className="font-semibold">Time:</span> {selectedEmail.timestamp}</p>
                          </div>
                        </FontWrapper>
                      </div>

                      {/* Headers button */}
                      <div className="mb-4">
                        <button
                          onClick={() => setShowHeaders(!showHeaders)}
                          className="flex items-center gap-2 px-3 py-2 glass-border-4 text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                        >
                          {showHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <FontWrapper>{config.texts.headersButtonText}</FontWrapper>
                        </button>
                      </div>

                      {/* Email Headers - Mobile */}
                      {showHeaders && selectedEmail.headers && (
                        <div className="mb-6 border-b border-white/20 dark:border-white/10 pb-4">
                          <FontWrapper>
                            <h4 className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-3">{config.texts.emailHeadersTitle}</h4>
                            <div className="bg-white/5 dark:bg-black/5 rounded-lg p-3 border border-white/20 dark:border-white/10">
                              {selectedEmail.headers.map((header, index) => (
                                <div key={index} className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] mb-1">
                                  {header}
                                </div>
                              ))}
                            </div>
                          </FontWrapper>
                        </div>
                      )}

                      {/* Email Content */}
                      <div className="prose prose-sm max-w-none mb-6 prose-p:text-[#1C1C1E] dark:prose-p:text-[#F2F2F7] prose-strong:text-[#1C1C1E] dark:prose-strong:text-[#F2F2F7] prose-li:text-[#1C1C1E] dark:prose-li:text-[#F2F2F7] prose-a:text-[#1C1C1E] dark:prose-a:text-[#F2F2F7] email-content-container">
                        <FontWrapper>
                          <div dangerouslySetInnerHTML={{ __html: enhanceLinkTooltips(selectedEmail.content) }} />
                        </FontWrapper>
                      </div>

                      {/* Email Attachments - Mobile */}
                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <AttachmentComponent attachments={selectedEmail.attachments} />
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1 min-h-0 relative" style={{ scrollbarWidth: 'none' }}>
                  {config.emails.map((email) => (
                    <motion.div
                      key={email.id}
                      className={`p-4 border-b border-white/20 dark:border-white/10 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 glass-border-no-radius transition-colors ${selectedEmailId === email.id ? 'lg:border-l-[7px] border-l-white/40 dark:border-l-white' : ''
                        } ${reportedEmails.has(email.id) ? 'opacity-60' : ''}`}
                      onClick={() => handleEmailSelect(email.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FontWrapper className="truncate">
                              <p className="font-medium text-[#1C1C1E] dark:text-[#F2F2F7] truncate lg:mt-3 xl:mt-0">{email.sender}</p>
                            </FontWrapper>
                            {reportedEmails.has(email.id) && (
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-white/10 dark:bg-white/5 flex-shrink-0 ml-2 ${isEditMode ? 'glass-border-4-no-overflow' : 'glass-border-4'}`}>
                                {reportResults.get(email.id) ? (
                                  <Check className="w-3 h-3 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                                ) : (
                                  <X className="w-3 h-3 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                                )}
                              </div>
                            )}
                          </div>
                          <FontWrapper>
                            <p className="text-sm font-medium text-[#1C1C1E] dark:text-[#F2F2F7] truncate mb-1">{email.subject}</p>
                            {reportedEmails.has(email.id) ? (
                              reportResults.get(email.id) ? (
                                <p className="text-xs text-[#1C1C1E]/80 dark:text-[#F2F2F7]/70 truncate">{config.texts.correctReportMessage}</p>
                              ) : (
                                <p className="text-xs text-[#1C1C1E]/80 dark:text-[#F2F2F7]/70 truncate">{config.texts.cautiousReportMessage}</p>
                              )
                            ) : (
                              <p className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] truncate">{email.preview}</p>
                            )}
                          </FontWrapper>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7]">{email.timestamp}</span>
                          <ChevronRight className="w-4 h-4 text-[#1C1C1E] dark:text-[#F2F2F7]" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Email Viewer - Desktop only */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="p-6 overflow-y-auto scrollbar-hide" style={{ height: 'calc(-200px + 100vh)' }}>
                {selectedEmail ? (
                  <div>
                    {/* Email Header */}
                    <div className="flex items-start justify-between pb-4 mb-6 border-b border-white/20 dark:border-white/10">
                      <div className="flex-1">
                        <FontWrapper>
                          <h3 className="text-lg font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">{selectedEmail.subject}</h3>
                          <div className="text-sm text-[#1C1C1E] dark:text-[#F2F2F7] space-y-1">
                            <p><span className="font-semibold">From:</span> {selectedEmail.sender}</p>
                            <p><span className="font-semibold">Time:</span> {selectedEmail.timestamp}</p>
                          </div>
                        </FontWrapper>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setShowHeaders(!showHeaders)}
                          className="flex items-center gap-2 px-3 py-2 glass-border-4 text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                        >
                          {showHeaders ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          <FontWrapper>{config.texts.headersButtonText}</FontWrapper>
                        </button>
                        <button className="p-2 glass-border-4 text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                          <Star className="w-4 h-4" />
                        </button>
                        <button className="p-2 glass-border-4 text-[#1C1C1E] dark:text-[#F2F2F7] hover:bg-white/5 dark:hover:bg-white/5 transition-colors">
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Email Headers */}
                    {showHeaders && selectedEmail.headers && (
                      <div className="mb-6 border-b border-white/20 dark:border-white/10 pb-4">
                        <FontWrapper>
                          <h4 className="text-sm font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] mb-3">{config.texts.emailHeadersTitle}</h4>
                          <div className="bg-white/5 dark:bg-black/5 rounded-lg p-3 border border-white/20 dark:border-white/10">
                            {selectedEmail.headers.map((header, index) => (
                              <div key={index} className="text-xs text-[#1C1C1E] dark:text-[#F2F2F7] mb-1">
                                {header}
                              </div>
                            ))}
                          </div>
                        </FontWrapper>
                      </div>
                    )}

                    {/* Email Content */}
                    <div className="prose prose-sm max-w-none mb-6 prose-p:text-[#1C1C1E] dark:prose-p:text-[#F2F2F7] prose-strong:text-[#1C1C1E] dark:prose-strong:text-[#F2F2F7] prose-li:text-[#1C1C1E] dark:prose-li:text-[#F2F2F7] prose-a:text-[#1C1C1E] dark:prose-a:text-[#F2F2F7] email-content-container">
                      <FontWrapper>
                        <div dangerouslySetInnerHTML={{ __html: enhanceLinkTooltips(selectedEmail.content) }} />
                      </FontWrapper>
                    </div>

                    {/* Email Attachments - Desktop */}
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                      <AttachmentComponent attachments={selectedEmail.attachments} />
                    )}

                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <Mail className="w-16 h-16 text-[#1C1C1E] dark:text-[#F2F2F7] mx-auto mb-4" />
                    <FontWrapper>
                      <h3 className="text-lg font-medium text-[#1C1C1E] dark:text-[#F2F2F7] mb-2">{config.texts.selectEmailMessage}</h3>
                      <p className="text-[#1C1C1E] dark:text-[#F2F2F7]">{config.texts.instructions}</p>
                    </FontWrapper>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        {config.texts.ctaButtonText && onNextSlide && (
          <div className="flex justify-center">
            <CallToAction
              onClick={onNextSlide}
              text={config.texts.ctaButtonText}
              icon={<MailSearch className="w-4 h-4" />}
              iconPosition="left"
              className="!mt-0"
              reserveSpace={false}
            />
          </div>
        )}

        {/* Phishing Report Modal */}
        <PhishingReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onReport={handleModalReport}
          modalTexts={config.texts.phishingReportModal}
        />

        {/* Phishing Result Modal */}
        {lastReportedEmail && (
          <PhishingResultModal
            isOpen={showResultModal}
            onClose={() => setShowResultModal(false)}
            modalTexts={config.texts.phishingResultModal}
            email={lastReportedEmail}
            isCorrect={lastReportCorrect}
          />
        )}
      </div>
    </div>
  );
}