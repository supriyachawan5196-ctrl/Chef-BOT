
export enum Language {
  Marathi = "mr",
  English = "en",
  Hindi = "hi",
  Telugu = "te",
  Tamil = "ta",
  Kannada = "kn",
  Malayalam = "ml",
}

export const SUPPORTED_LANGUAGES: { name: string; code: Language }[] = [
    { name: "Marathi", code: Language.Marathi },
    { name: "English", code: Language.English },
    { name: "Hindi", code: Language.Hindi },
    { name: "Telugu", code: Language.Telugu },
    { name: "Tamil", code: Language.Tamil },
    { name: "Kannada", code: Language.Kannada },
    { name: "Malayalam", code: Language.Malayalam },
];

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  image?: string | null;
}

export type ChatStep = "language" | "cuisine" | "dish" | "recipe_generated";
