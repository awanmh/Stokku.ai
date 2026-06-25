export type ChatModelId = "gemini-2.5-flash" | "gemini-3.5-flash" | "gemma-3-27b-it";

export type ChatRole = "user" | "model";

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface ChatModelOption {
    id: ChatModelId;
    label: string;
    description: string;
    shortLabel: string;
}

export const CHAT_MODEL_OPTIONS: ChatModelOption[] = [
    {
        id: "gemini-2.5-flash",
        label: "Gemini 2.5 Flash",
        shortLabel: "2.5 Flash",
        description: "Cepat, responsif, cocok untuk pertanyaan operasional harian.",
    },
    {
        id: "gemini-3.5-flash",
        label: "Gemini 3.5 Flash",
        shortLabel: "3.5 Flash",
        description: "Model flagship terbaru dengan kemampuan pemikiran mendalam.",
    },
    {
        id: "gemma-3-27b-it",
        label: "Gemma 3 27B",
        shortLabel: "Gemma",
        description: "Lebih reflektif untuk analisis dan jawaban yang lebih panjang.",
    },
];

export const DEFAULT_CHAT_MODEL: ChatModelId = "gemini-2.5-flash";

export const CHAT_HISTORY_LIMIT = 12;