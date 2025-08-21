import React, { useRef, useEffect } from 'react';
import { TooltipPortal } from './TooltipPortal';

interface EmailContentWithTooltipsProps {
  htmlContent: string;
  className?: string;
}

export const EmailContentWithTooltips: React.FC<EmailContentWithTooltipsProps> = ({
  htmlContent,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all links with data-tooltip attributes
    const links = contentRef.current.querySelectorAll('a[data-tooltip]');
    
    links.forEach((link) => {
      const tooltipText = link.getAttribute('data-tooltip');
      if (!tooltipText) return;

      // Wrap each link with TooltipPortal
      const wrapper = document.createElement('span');
      wrapper.style.display = 'contents';
      
      link.parentNode?.insertBefore(wrapper, link);
      wrapper.appendChild(link);
      
      // We'll handle this through React portals instead
      // This is just to mark the elements for React to find
      link.setAttribute('data-needs-tooltip', 'true');
    });
  }, [htmlContent]);

  return (
    <div 
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

// Enhanced version that wraps links with tooltips at the React level
interface EmailContentWithPortalTooltipsProps {
  htmlContent: string;
  className?: string;
}

export const EmailContentWithPortalTooltips: React.FC<EmailContentWithPortalTooltipsProps> = ({
  htmlContent,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [tooltippedContent, setTooltippedContent] = React.useState<React.ReactNode>(null);

  useEffect(() => {
    if (!htmlContent) {
      setTooltippedContent(null);
      return;
    }

    // Parse HTML and create React elements with tooltip portals
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const processNode = (node: Node): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        if (element.tagName.toLowerCase() === 'a' && element.hasAttribute('data-tooltip')) {
          const tooltip = element.getAttribute('data-tooltip');
          const href = element.getAttribute('href');
          const target = element.getAttribute('target');
          const rel = element.getAttribute('rel');
          const className = element.getAttribute('class');
          
          return (
            <TooltipPortal key={Math.random()} tooltip={tooltip || ''} disabled={!tooltip}>
              <a
                href={href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={className || undefined}
                style={{ textDecoration: 'underline' }}
              >
                {Array.from(element.childNodes).map(processNode)}
              </a>
            </TooltipPortal>
          );
        }
        
        // For other elements, create React element
        const tagName = element.tagName.toLowerCase() as keyof JSX.IntrinsicElements;
        const props: any = {};
        
        // Copy attributes
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          let propName = attr.name;
          
          // Convert HTML attributes to React props
          if (propName === 'class') propName = 'className';
          if (propName === 'for') propName = 'htmlFor';
          
          // Handle style attribute specially - convert CSS string to object
          if (propName === 'style' && attr.value) {
            try {
              const styleObj: { [key: string]: string } = {};
              attr.value.split(';').forEach(declaration => {
                const colonIndex = declaration.indexOf(':');
                if (colonIndex > 0) {
                  const property = declaration.slice(0, colonIndex).trim();
                  const value = declaration.slice(colonIndex + 1).trim();
                  
                  // Convert kebab-case to camelCase for React
                  const camelProperty = property.replace(/-([a-z])/g, (match, letter) => 
                    letter.toUpperCase()
                  );
                  
                  if (property && value) {
                    styleObj[camelProperty] = value;
                  }
                }
              });
              props.style = styleObj;
            } catch (e) {
              // If parsing fails, skip the style attribute
              console.warn('Failed to parse style attribute:', attr.value);
            }
          } else {
            props[propName] = attr.value;
          }
        }
        
        const children = Array.from(element.childNodes).map(processNode);
        
        return React.createElement(tagName, { ...props, key: Math.random() }, ...children);
      }
      
      return null;
    };
    
    const processedContent = Array.from(tempDiv.childNodes).map(processNode);
    setTooltippedContent(processedContent);
  }, [htmlContent]);

  return (
    <div className={className}>
      {tooltippedContent}
    </div>
  );
};