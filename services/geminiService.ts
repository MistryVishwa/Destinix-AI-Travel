
import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryResponse, TripPlan, ChatMessage } from "../types";

// Always initialize GoogleGenAI with the API key directly from process.env
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Use gemini-3-pro-preview for complex reasoning tasks like itinerary generation
export const generateItinerary = async (prompt: string): Promise<ItineraryResponse> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a detailed travel itinerary based on this request: "${prompt}". 
    Include day-wise details, costs, safety advice, and best visiting times.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          destination: { type: Type.STRING },
          duration: { type: Type.STRING },
          totalEstimatedCost: { type: Type.STRING },
          bestVisitingTime: { type: Type.STRING },
          riskScore: { type: Type.NUMBER, description: "Risk score from 1-10" },
          safetyAdvice: { type: Type.STRING },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                meals: { type: Type.ARRAY, items: { type: Type.STRING } },
                transport: { type: Type.STRING }
              },
              required: ["day", "title", "activities", "meals", "transport"]
            }
          }
        },
        required: ["destination", "duration", "totalEstimatedCost", "bestVisitingTime", "days", "riskScore", "safetyAdvice"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateTripPlan = async (destination: string, days: number, budget: string, vibe: string): Promise<TripPlan> => {
  const ai = getGeminiClient();
  const prompt = `Generate a comprehensive trip plan for ${destination} for ${days} days. 
  Budget level: ${budget}. Vibe: ${vibe}.
  Provide a destination overview, estimated budget in ${budget} currency if applicable (otherwise USD), best time to visit, hotel suggestions, highlights (adventure, food, culture, nature, relaxation), a budget breakdown (stay, transport, activities, food as percentages/numbers), travel tips, packing suggestions, safety advice, current typical weather, and a detailed day-by-day itinerary.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          destination: { type: Type.STRING },
          duration: { type: Type.NUMBER },
          budget: { type: Type.STRING },
          vibe: { type: Type.STRING },
          destinationOverview: { type: Type.STRING },
          estimatedBudget: { type: Type.STRING },
          bestTimeToVisit: { type: Type.STRING },
          hotelSuggestion: { type: Type.STRING },
          highlights: {
            type: Type.OBJECT,
            properties: {
              adventure: { type: Type.STRING },
              food: { type: Type.STRING },
              culture: { type: Type.STRING },
              nature: { type: Type.STRING },
              relaxation: { type: Type.STRING }
            },
            required: ["adventure", "food", "culture", "nature", "relaxation"]
          },
          budgetBreakdown: {
            type: Type.OBJECT,
            properties: {
              stay: { type: Type.NUMBER },
              transport: { type: Type.NUMBER },
              activities: { type: Type.NUMBER },
              food: { type: Type.NUMBER }
            },
            required: ["stay", "transport", "activities", "food"]
          },
          travelTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          packingSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          safetyAdvice: { type: Type.STRING },
          weather: {
            type: Type.OBJECT,
            properties: {
              temp: { type: Type.STRING },
              condition: { type: Type.STRING }
            },
            required: ["temp", "condition"]
          },
          itinerary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                transportation: { type: Type.STRING },
                notes: { type: Type.STRING },
                shops: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["day", "title", "activities", "recommendations"]
            }
          }
        },
        required: [
          "destination", "duration", "budget", "vibe", "destinationOverview", 
          "estimatedBudget", "bestTimeToVisit", "highlights", "budgetBreakdown", 
          "travelTips", "packingSuggestions", "safetyAdvice", "weather", "itinerary"
        ]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const chatWithAdvisor = async (message: string, history: { role: 'user' | 'assistant', content: string }[]): Promise<string> => {
  const ai = getGeminiClient();
  
  // Map history to Gemini format: 'user' -> 'user', 'assistant' -> 'model'
  const geminiHistory = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));

  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    history: geminiHistory,
    config: {
      systemInstruction: "You are Destinix AI, a world-class travel advisor. You are helpful, professional, and have deep knowledge of global destinations, cultures, and travel logistics. Keep your responses concise but insightful."
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I'm sorry, I couldn't process that request.";
};

export const analyzeTravelPersonality = async (userInputs: any) => {
  const ai = getGeminiClient();
  const prompt = `Analyze this user data and generate a "Travel Personality Model": ${JSON.stringify(userInputs)}.
  Provide a personality name, preferred travel month, and destination affinity scores.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalityName: { type: Type.STRING },
          preferredMonth: { type: Type.STRING },
          affinityScores: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                category: { type: Type.STRING }, 
                score: { type: Type.NUMBER } 
              } 
            } 
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
