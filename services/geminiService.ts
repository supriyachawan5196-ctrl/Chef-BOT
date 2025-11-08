
import { GoogleGenAI, Modality } from "@google/genai";
import { Language, ChatStep } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getLanguageName = (code: Language): string => {
    switch (code) {
        case Language.Marathi: return "Marathi";
        case Language.English: return "English";
        case Language.Hindi: return "Hindi";
        case Language.Telugu: return "Telugu";
        case Language.Tamil: return "Tamil";
        case Language.Kannada: return "Kannada";
        case Language.Malayalam: return "Malayalam";
        default: return "English";
    }
}

export const getBotPrompt = async (step: ChatStep, language: Language): Promise<string> => {
    const languageName = getLanguageName(language);

    let promptText = "";
    switch (step) {
        case "cuisine":
            promptText = `Translate this to ${languageName}: "Pick a cuisine (e.g., Indian, Chinese, Mexican, Thai, Italian)." Respond with only the translation.`;
            break;
        case "dish":
            promptText = `Translate this to ${languageName}: "Tell me the dish name." Respond with only the translation.`;
            break;
        default:
            return "Choose language: Marathi / English / Hindi / Telugu / Tamil / Kannada / Malayalam.";
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating bot prompt:", error);
        // Fallback to English
        if (step === 'cuisine') return "Pick a cuisine (e.g., Indian, Chinese, Mexican, Thai, Italian).";
        if (step === 'dish') return "Tell me the dish name.";
        return "Choose language: Marathi / English / Hindi / Telugu / Tamil / Kannada / Malayalam.";
    }
};

export const generateRecipe = async (language: Language, cuisine: string, dish: string): Promise<string> => {
    const languageName = getLanguageName(language);
    const prompt = `
You are ChefBot, a master-chef assistant.
Generate a recipe for the dish "${dish}" from "${cuisine}" cuisine.
The entire response MUST be in the ${languageName} language.
Follow this exact format, using short lines and WhatsApp-friendly formatting (no markdown tables):

<Dish Name> · <Cuisine>
Time: Prep <X> min · Cook <Y> min · Total <Z> min
Servings: <N>

Ingredients:
• <qty> <unit> <ingredient> (e.g., 1 cup (200 g) Rajma, soaked overnight)
• ...

Method:
1. <step>
2. <step>
...

Tips/Notes:
• <tip 1> (optional)
• <tip 2> (optional)

Actions: Reply Save to favorite · My favorites to view

VERY IMPORTANT:
- Do not add any introductory text or closing remarks.
- The entire response must be a single block of text.
- Be concise and clear.
- Provide exact metric quantities, with US units in parentheses if natural.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.2,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating recipe:", error);
        return `Sorry, I couldn't generate the recipe for ${dish}. Please try another dish.`;
    }
};


export const generateRecipeImage = async (dish: string, cuisine: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `A clear, appetizing photo of "${dish}", a classic ${cuisine} dish. High quality, food photography style.` }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating recipe image:", error);
        return null;
    }
};
