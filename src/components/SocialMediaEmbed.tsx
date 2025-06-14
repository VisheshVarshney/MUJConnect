import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SocialMediaMetadata } from '../lib/socialMediaEmbed';
import LinkWarningDialog from './LinkWarningDialog';

interface SocialMediaEmbedProps {
  metadata: SocialMediaMetadata;
}

export default function SocialMediaEmbed({ metadata }: SocialMediaEmbedProps) {
  const [showWarning, setShowWarning] = useState(false);
  const { platform, title, url, icon: Icon, color } = metadata;
  const [displayTitle, setDisplayTitle] = useState(title);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!spanRef.current) return;
    const span = spanRef.current;
    // Reset to full title first
    setDisplayTitle(title);
    // Wait for DOM update
    setTimeout(() => {
      if (!spanRef.current) return;
      const parent = spanRef.current.parentElement;
      if (!parent) return;
      // If the span wraps, truncate
      if (span.offsetHeight > 24) {
        let truncated = title;
        for (let i = title.length; i > 0; i--) {
          span.textContent = title.slice(0, i) + '...';
          if (span.offsetHeight <= 24) {
            // Check if the next char would wrap with less than 10 chars
            if (title.length - i < 10) {
              setDisplayTitle(title.slice(0, i) + '...');
            } else {
              setDisplayTitle(title.slice(0, i) + '...');
            }
            break;
          }
        }
      }
    }, 0);
  }, [title]);

  const handleClick = (e: React.MouseEvent) => {
    if (platform === 'generic') {
      e.preventDefault();
      setShowWarning(true);
    }
  };

  const handleProceed = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowWarning(false);
  };

  return (
    <>
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-90 sm:px-3 sm:py-1.5 sm:text-sm sm:gap-2 px-2 py-1 text-xs gap-1"
        style={{ backgroundColor: `${color}15`, color }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="w-4 h-4 sm:w-4 sm:h-4 w-3 h-3" />
        <span
          ref={spanRef}
          className="truncate max-w-[110px] inline-block align-middle align-text-top"
          title={title}
          style={{ verticalAlign: 'middle', lineHeight: '1.5', maxWidth: 110 }}
        >
          {displayTitle}
        </span>
        <ExternalLink className="w-3 h-3 sm:w-3 sm:h-3 w-2 h-2" />
      </motion.a>

      <LinkWarningDialog
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onProceed={handleProceed}
        url={url}
      />
    </>
  );
}
