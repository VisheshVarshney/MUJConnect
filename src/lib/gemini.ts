import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { academicCalendar } from '../data/academicCalendar';
import { restaurants } from '../data/restaurants';

const GEMINI_API_KEY = 'AIzaSyCKXLTgCBPFLKmGFrY1TNrR1J4WcA4cBQc';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are MUJ Connect Assistant, a helpful AI assistant for Manipal University Jaipur students. Your role is to provide accurate and helpful information about:

1. Academic Calendar and Events
Current Academic Calendar:
${JSON.stringify(academicCalendar, null, 2)}

2. Campus Facilities and Services
3. Food and Dining Options
Current Menu Information:
${JSON.stringify(restaurants, null, 2)}

4. Student Life and Activities
5. General University Information

Guidelines:
- Be friendly and professional
- Provide specific, accurate information
- If unsure, acknowledge limitations
- Focus on MUJ-specific information
- Use markdown formatting for better readability
- Generate beautiful responses very well written and with emojis
- Keep responses concise but informative
- When discussing food options, always mention the current menu items
- When discussing academic dates, always reference the current academic calendar

Remember: You are here to help MUJ students navigate campus life and access university resources effectively.`;

export async function generateGeminiResponse(
  messages: Message[],
  userMessage: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Convert messages to Gemini format
    const history = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Add the current user message
    history.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [
            {
              text: "I understand. I am MUJ Connect Assistant, ready to help students with information about Manipal University Jaipur. I'll provide accurate, specific information about academic matters, campus facilities, dining options, student life, and general university information. I'll be friendly and professional, use markdown formatting for better readability, and keep responses concise but informative. I have access to the current academic calendar and menu information, which I'll reference when relevant. How can I assist you today?",
            },
          ],
        },
        ...history,
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}
