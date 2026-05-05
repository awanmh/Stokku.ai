export type ChatModelId = "gemini-2.5-flash" | "gemma-3-27b-it";

export type ChatRole = "user" | "model";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface ChatModelOption {
    id: ChatModelId;
    label: string;
    description: string;
}

export const CHAT_MODEL_OPTIONS: ChatModelOption[] = [
    {
        id: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        description: "Cepat, responsif, cocok untuk pertanyaan operasional harian.",
    },
    {
        id: "gemma-3-27b-it",
        label: "Gemma 3 27B",
        description: "Lebih reflektif untuk analisis dan jawaban yang lebih panjang.",
    },
];

export const DEFAULT_CHAT_MODEL: ChatModelId = "gemini-2.5-flash";

export const CHAT_HISTORY_LIMIT = 12;