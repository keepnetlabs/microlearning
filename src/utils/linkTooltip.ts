// Mapping of link text patterns to their actual URLs (phishing examples)
const linkUrlMapping: Record<string, string> = {
  'whatsapp-security-verify.net/urgent-protection': 'https://whatsapp-security-verify.net/urgent-protection',
  'whatsapp-verify-security.com/download': 'https://whatsapp-verify-security.com/download',
  'Click here to confirm completion': 'https://fake-whatsapp-verify.com/confirm',
  'secure-whatsapp-emergency.org/protect-now': 'https://secure-whatsapp-emergency.org/protect-now',
  'Help Center': 'https://fake-whatsapp-help.com/support',
  'emergency-whatsapp-verify.net/save-account': 'https://emergency-whatsapp-verify.net/save-account',
  'Verify Online': 'https://fake-whatsapp-verify.com/online'
};

// Utility function to enhance HTML content with link tooltips
export const enhanceLinkTooltips = (htmlContent: string): string => {
  if (!htmlContent) return htmlContent;

  // Regex to match <a> tags with href attributes
  const linkRegex = /<a\s+([^>]*?\s+)?href\s*=\s*["']([^"']+)["'][^>]*?>(.*?)<\/a>/gi;
  
  return htmlContent.replace(linkRegex, (match, beforeHref, href, linkText) => {
    let tooltipUrl = href;
    
    // If href is # or empty, try to extract URL from link text or mapping
    if (href === '#' || href === '') {
      const cleanLinkText = linkText.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
      
      // Look for URL in link text itself
      const urlInText = cleanLinkText.match(/[\w-]+\.[\w.-]+(?:\/[\w.-]*)?/);
      if (urlInText) {
        tooltipUrl = `https://${urlInText[0]}`;
      } else {
        // Check mapping
        const mappedUrl = linkUrlMapping[cleanLinkText];
        if (mappedUrl) {
          tooltipUrl = mappedUrl;
        } else {
          // If no mapping found, show the link text as URL hint
          tooltipUrl = `Suspicious link: ${cleanLinkText}`;
        }
      }
    }
    
    // Don't show tooltip for # or empty URLs without mapping
    if ((href === '#' || href === '') && tooltipUrl === href) {
      tooltipUrl = '';
    }
    
    // Insert data-tooltip attribute for the portal system
    let enhancedLink = match.replace(/(<a\s+[^>]*?)>/i, `$1 data-tooltip="${tooltipUrl}" class="link-with-portal-tooltip">`);
    
    // Add target="_blank" if not already present
    if (!enhancedLink.includes('target=')) {
      enhancedLink = enhancedLink.replace(/(<a\s+[^>]*?)>/i, `$1 target="_blank" rel="noopener noreferrer">`);
    }
    
    return enhancedLink;
  });
};

// Function to add event listeners for custom tooltips (if needed)
export const addCustomTooltipListeners = (containerElement: HTMLElement) => {
  const links = containerElement.querySelectorAll('a[href]:not([href="#"]):not([href=""])');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#' && href !== '') {
      link.setAttribute('title', href);
      link.classList.add('link-with-tooltip');
      
      // Add target="_blank" if not already present
      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    }
  });
};