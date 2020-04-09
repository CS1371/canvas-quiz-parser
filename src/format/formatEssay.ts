import { EssayQuizResponse } from "../types";
import formatBlank from "./formatBlank";
import escapeAnswer from "./escapeAnswer";

/**
 * Format an Essay question
 * @param qr The Essay Question Response
 * @returns HTML markup for the essay question
 */
const formatEssay = (qr: EssayQuizResponse): string => {
    const { question, response } = qr;
    if (response === undefined) {
        return formatBlank(qr);
    }
    const { name, prompt, id } = question;
    // UNSAFE: HTML INJECTION
    return `<div class="question essay"><h2>${name}</h2><p class="question-id"><em>${id}</em></p>${prompt}<div class="answer"><pre>${escapeAnswer(response)}</pre></div></div>`;
};

export default formatEssay;