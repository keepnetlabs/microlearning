import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
  disabled?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 300,
  className = "",
  disabled = false
}) => {
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
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 14px; }',
        }}
      />
    </div>
  );
};