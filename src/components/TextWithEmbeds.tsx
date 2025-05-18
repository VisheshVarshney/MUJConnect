import React, { useEffect, useState } from 'react';
import { parseSocialMediaLinks } from '../lib/parseSocialMediaLinks';
import SocialMediaEmbed from './SocialMediaEmbed';

interface TextWithEmbedsProps {
  text: string;
}

export default function TextWithEmbeds({ text }: TextWithEmbedsProps) {
  const [parsedContent, setParsedContent] = useState<{
    text: string;
    embeds: any[];
  }>({ text, embeds: [] });

  useEffect(() => {
    const processText = async () => {
      const result = await parseSocialMediaLinks(text);
      setParsedContent(result);
    };
    processText();
  }, [text]);

  const renderContent = () => {
    // Split the text into lines
    const lines = parsedContent.text.split('\n');

    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\[EMBED_\d+\])/);
      const renderedParts = parts.map((part, index) => {
        const embedMatch = part.match(/\[EMBED_(\d+)\]/);
        if (embedMatch) {
          const embedIndex = parseInt(embedMatch[1]);
          const embed = parsedContent.embeds[embedIndex];
          return (
            <SocialMediaEmbed key={`${lineIndex}-${index}`} metadata={embed} />
          );
        }
        return <span key={`${lineIndex}-${index}`}>{part}</span>;
      });

      return (
        <React.Fragment key={lineIndex}>
          {renderedParts}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return <div className="inline">{renderContent()}</div>;
}
