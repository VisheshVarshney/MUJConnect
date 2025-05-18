import { fetchMetadata } from './socialMediaEmbed';

export const parseSocialMediaLinks = async (
  text: string
): Promise<{ text: string; embeds: any[] }> => {
  // Match any URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];
  const embeds: any[] = [];
  let processedText = text;

  for (const url of matches) {
    const metadata = await fetchMetadata(url);
    if (metadata) {
      embeds.push(metadata);
      // Replace the URL with a placeholder that we'll use to insert the embed
      processedText = processedText.replace(
        url,
        `[EMBED_${embeds.length - 1}]`
      );
    }
  }

  return { text: processedText, embeds };
};
