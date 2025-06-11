import React, { useState } from 'react';
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
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-90 max-w-[calc(100%-1rem)] overflow-hidden"
        style={{ backgroundColor: `${color}15`, color }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon className="w-4 h-4" />
        <span className="truncate">{title}</span>
        <ExternalLink className="w-3 h-3" />
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
