import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  disabled?: boolean;
  // Optional URLs (string or array) to load as CSS inside the editor iframe
  contentCssUrls?: string | string[];
  // Optional raw CSS string to inject into the editor iframe head
  extraContentStyle?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 300,
  className = "",
  disabled = false,
  contentCssUrls,
  extraContentStyle
}) => {
  const resolvedContentCss = Array.isArray(contentCssUrls)
    ? contentCssUrls
    : (contentCssUrls ? [contentCssUrls] : undefined);

  return (
    <div className={`rich-text-editor ${className} relative`}>
      <Editor
        value={value}
        onEditorChange={(content) => onChange(content)}
        disabled={disabled}
        tinymceScriptSrc={`${(process.env.PUBLIC_URL || '')}/tinymce/tinymce.min.js`}
        licenseKey="gpl"
        init={{
          base_url: `${(process.env.PUBLIC_URL || '')}/tinymce`,
          suffix: '.min',
          height,
          menubar: false,
          branding: false,
          promotion: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
            'searchreplace', 'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar:
            'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image | removeformat | code',
          placeholder: placeholder || '',
          verify_html: false,
          valid_elements: '*[*]',
          extended_valid_elements: '*[*]',
          forced_root_block: '',
          // Load external CSS files into the iframe (if provided)
          content_css: resolvedContentCss,
          content_css_cors: true,
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; } .tox-statusbar__branding { display: none !important; }',
          setup: (editor) => {
            editor.on('init', () => {
              if (extraContentStyle) {
                const doc = editor.getDoc();
                if (doc) {
                  const styleEl = doc.createElement('style');
                  styleEl.type = 'text/css';
                  styleEl.appendChild(doc.createTextNode(extraContentStyle));
                  doc.head?.appendChild(styleEl);
                }
              }
            });
          }
        }}
      />
    </div>
  );
};