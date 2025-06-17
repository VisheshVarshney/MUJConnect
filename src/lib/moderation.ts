import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const MODERATION_PROMPT = `You are an AI content moderator for MUJ Connect, a social media platform for Manipal University Jaipur students. Your task is to analyze posts for:

1. Profanity and inappropriate language
2. Self-advertisements and spam
3. Hate speech or discriminatory content
4. Personal attacks or harassment

IMPORTANT: Respond with ONLY the JSON object, no markdown formatting, no code blocks, no additional text. The response should be a raw JSON object in this exact format:
{
  "isAcceptable": boolean,
  "reason": string (only if isAcceptable is false),
  "category": string (one of: "PROFANITY", "SELF_ADVERTISEMENT", "HATE_SPEECH", "HARASSMENT", "ACCEPTABLE")
}

Analyze the content strictly but fairly. For self-advertisements, allow genuine questions or academic collaborations, but flag commercial promotions.`;

export interface ModerationResult {
  isAcceptable: boolean;
  reason?: string;
  category: 'PROFANITY' | 'SELF_ADVERTISEMENT' | 'HATE_SPEECH' | 'HARASSMENT' | 'ACCEPTABLE';
}

export async function moderateContent(content: string, userId: string): Promise<ModerationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{text: MODERATION_PROMPT}],
        },
      ],
    });

    const result = await chat.sendMessage([{text: content}]);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the response text
    text = text.replace(/```json\n?|\n?```/g, ''); // Remove markdown code blocks
    text = text.trim(); // Remove any extra whitespace
    
    try {
      const moderationResult = JSON.parse(text) as ModerationResult;
      
      // Log the moderation result to the database
      const { error: logError } = await supabase
        .from('content_filter_logs')
        .insert({
          content: content,
          user_id: userId,
          is_acceptable: moderationResult.isAcceptable,
          reason: moderationResult.reason || null,
          category: moderationResult.category
        });

      if (logError) {
        console.error('Failed to log moderation result:', logError);
      }

      return moderationResult;
    } catch (e) {
      console.error('Failed to parse moderation result:', e);
      console.log('Raw response:', text);
      
      // Log the failure to the database
      const failureResult = {
        isAcceptable: false,
        reason: 'Failed to analyze content. Please try again.',
        category: 'ACCEPTABLE' as const
      };

      await supabase
        .from('content_filter_logs')
        .insert({
          content: content,
          user_id: userId,
          is_acceptable: failureResult.isAcceptable,
          reason: failureResult.reason,
          category: failureResult.category
        });

      return failureResult;
    }
  } catch (error) {
    console.error('Content moderation failed:', error);
    
    // Log the error to the database
    const errorResult = {
      isAcceptable: false,
      reason: 'Content moderation service unavailable. Please try again.',
      category: 'ACCEPTABLE' as const
    };

    await supabase
      .from('content_filter_logs')
      .insert({
        content: content,
        user_id: userId,
        is_acceptable: errorResult.isAcceptable,
        reason: errorResult.reason,
        category: errorResult.category
      });

    return errorResult;
  }
} 