import { Essay } from "../types/Question";

const formatEssay = (q: Essay, answer: string): string => {
    const { prompt, name } = q;
    return `<div class="question essay"><h2>${name}</h2>${prompt}<pre>${answer}</pre></div>`;
}