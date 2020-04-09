import { FITBQuizResponse } from "../types";
import formatBlank from "./formatBlank";
import escapeAnswer from "./escapeAnswer";

// TODO: UNSAFE
/**
 * Format a Fill in the Blank as HTML
 * @param qr The Fill in the Blank Response
 * @returns HTML markup for this fill in the blank question
 */
const formatFITB = (qr: FITBQuizResponse): string => {
    const { question, response } = qr;
    if (response === undefined) {
        return formatBlank(qr);
    }
    const { prompt, name, blanks, id } = question;
    const qa = blanks.map((b, i) => {
        // UNSAFE: HTML INJECTION
        return `<p>${escapeAnswer(b)}<code>${escapeAnswer(response[i])}</code></p>`;
    });
    // UNSAFE: HTML INJECTION
    return `<div class="question mfitb"><h2>${name}</h2><p class="question-id"><em>${id}</em></p>${prompt}<div class="answer fitb-answers">${qa.join("")}</div></div>`;
};

export default formatFITB;