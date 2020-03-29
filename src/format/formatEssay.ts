import { EssayQuizResponse } from "@types";
import formatBlank from "./formatBlank";

const formatEssay = (qr: EssayQuizResponse): string => {
    const { question, response } = qr;
    if (response === undefined) {
        return formatBlank(qr);
    }
    const { name, prompt } = question;
    // UNSAFE: HTML INJECTION
    return `<div class="question essay"><h2>${name}</h2>${prompt}<pre>${response}</pre></div>`;
};

export default formatEssay;