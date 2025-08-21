import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Download, FileText, Image, Video, Volume2, FileSpreadsheet, File } from 'lucide-react';
import { FontWrapper } from '../common/FontWrapper';
import { useIsMobile } from './use-mobile';
import { EmailAttachment } from '../../data/inboxConfig';

interface AttachmentPreviewModalProps {
  attachment: EmailAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  isOpen,
  onClose
}) => {
  const isMobile = useIsMobile();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';

        // Restore scroll position
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }
  }, [isOpen]);

  if (!attachment) return null;

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileTypeCategory = (type: EmailAttachment['type'], filename: string): string => {
    const ext = getFileExtension(filename);

    // Map existing types to preview categories
    if (type === 'img') return 'image';
    if (type === 'pdf') return 'pdf';
    if (type === 'xls') return 'spreadsheet';
    if (type === 'doc') return 'document';
    if (type === 'txt') return 'text';

    // Override based on extension if needed
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext)) return 'audio';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['txt', 'json', 'xml', 'csv', 'js', 'ts', 'jsx', 'tsx', 'html', 'css'].includes(ext)) return 'text';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'spreadsheet';
    if (['docx', 'doc', 'pptx', 'ppt'].includes(ext)) return 'document';

    return type;
  };

  const renderPreviewContent = () => {
    const fileType = getFileTypeCategory(attachment.type, attachment.name);

    // If we have content, render it
    if (attachment.content || attachment.url) {
      switch (fileType) {
        case 'image':
          return (
            <div className="flex items-center justify-center p-3 sm:p-6 md:p-8">
              <div className="max-w-full max-h-96 rounded-lg overflow-hidden">
                {attachment.url ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="max-w-full max-h-96 object-contain"
                  />
                ) : (
                  <div
                    className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: attachment.content || '' }}
                  />
                )}
              </div>
            </div>
          );

        case 'text':
          return (
            <div className={`${isMobile ? 'p-2' : 'p-3'}`}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1 mb-1">
                  <FileText size={isMobile ? 10 : 12} className="text-gray-500" />
                  <span className={`font-medium text-[#1C1C1E] dark:text-[#F2F2F7] ${isMobile ? 'text-xs' : 'text-xs'}`}>
                    {getFileExtension(attachment.name).toUpperCase()}
                  </span>
                </div>
                <div className={`bg-white dark:bg-gray-800 rounded border p-1 font-mono leading-none text-[#1C1C1E] dark:text-[#F2F2F7] ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  <div
                    className=""
                    style={{ lineHeight: '1.1', margin: 0, padding: 0 }}
                    dangerouslySetInnerHTML={{ __html: attachment.content || '' }}
                  />
                </div>
              </div>
            </div>
          );

        case 'document':
        case 'pdf':
          return (
            <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div
                  className={`prose dark:prose-invert max-w-none ${isMobile ? 'prose-sm p-3' : 'prose-sm p-4'}`}
                  dangerouslySetInnerHTML={{ __html: attachment.content || '' }}
                />
              </div>
            </div>
          );

        default:
          return (
            <div className={`${isMobile ? 'p-3' : 'p-6'}`}>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div
                  className="text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: attachment.content || '' }}
                />
              </div>
            </div>
          );
      }
    }

    // Fallback to placeholder previews if no content
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="max-w-full max-h-96 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <Image size={48} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Image Preview
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {attachment.name}
                </p>
              </div>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <FileText size={48} className="mx-auto mb-3 text-red-500" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                PDF Document
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500">
                PDF preview would be displayed here using PDF.js or iframe
              </p>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-2xl bg-black rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <Video size={48} className="mx-auto mb-2" />
                  <p className="text-sm">Video Preview</p>
                  <p className="text-xs text-gray-400 mt-1">{attachment.name}</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <Volume2 size={48} className="mx-auto mb-3 text-blue-500" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Audio File
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {attachment.name}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div className="bg-blue-500 h-2 rounded-full w-0"></div>
              </div>
              <p className="text-xs text-gray-500">
                Audio player would be displayed here
              </p>
            </div>
          </div>
        );

      case 'spreadsheet':
        return (
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-2xl bg-gray-100 dark:bg-gray-800 rounded-lg p-6 text-center">
              <FileSpreadsheet size={48} className="mx-auto mb-3 text-green-600" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Spreadsheet
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {attachment.name}
              </p>
              <p className="text-xs text-gray-500">
                Spreadsheet preview with table view would be displayed here
              </p>
            </div>
          </div>
        );

      case 'text':
        const ext = getFileExtension(attachment.name);
        return (
          <div className="p-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {ext.toUpperCase()} File
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded border p-4 font-mono text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  // File content would be displayed here
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  // with syntax highlighting for code files
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <File size={48} className="mx-auto mb-3 text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                {attachment.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                File size: {attachment.size}
              </p>
              <p className="text-xs text-gray-500">
                Preview not available for this file type
              </p>
            </div>
          </div>
        );
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-safari" />

          {/* Modal */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={isMobile
              ? { type: "spring", stiffness: 400, damping: 30 }
              : { type: "spring", stiffness: 300, damping: 30 }
            }
            className={`relative glass-modal flex flex-col ${isMobile
              ? 'w-full max-h-[90vh] rounded-t-xl'
              + ' pb-[calc(1.5rem+env(safe-area-inset-bottom))]'
              : 'w-full max-w-4xl max-h-[90vh]'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-white/20 dark:border-white/10">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="p-1.5 md:p-2 glass-border-1 rounded-lg flex-shrink-0">
                  {attachment.type === 'img' && <Image size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />}
                  {attachment.type === 'pdf' && <FileText size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />}
                  {attachment.type === 'xls' && <FileSpreadsheet size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />}
                  {!['img', 'pdf', 'xls'].includes(attachment.type) && <File size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <FontWrapper>
                    <h2 className={`font-semibold text-[#1C1C1E] dark:text-[#F2F2F7] truncate ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {attachment.name}
                    </h2>
                    <p className={`text-[#1C1C1E]/70 dark:text-[#F2F2F7]/70 truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      {attachment.size} • {attachment.type.toUpperCase()}
                    </p>
                  </FontWrapper>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`glass-border-1 rounded-lg transition-colors ${isMobile ? 'p-1.5' : 'p-2'}`}
                  title="Download"
                >
                  <Download size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className={`glass-border-1 rounded-lg transition-colors ${isMobile ? 'p-1.5' : 'p-2'}`}
                >
                  <X size={isMobile ? 16 : 20} className="text-[#1C1C1E] dark:text-[#F2F2F7]" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              {renderPreviewContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};