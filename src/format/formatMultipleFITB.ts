import { FITBQuizResponse } from "../types/QuizResponse";
import formatBlank from "./formatBlank";

// TODO: UNSAFE
const formatMultipleFITB = (qr: FITBQuizResponse): string => {
    const { question, response } = qr;
    if (response === undefined) {
        return formatBlank(qr);
    }
    const { prompt, name, blanks } = question;
    const qa = blanks.map((b, i) => {
        // UNSAFE: HTML INJECTION
        return `<p>${b}<code>${response[i]}</code></p>`;
    });
    // UNSAFE: HTML INJECTION
    return `<div class="question mfitb"><h2>${name}</h2>${prompt}<div class="mfitb-answers">${qa.join('')}</div></div>`;
}

export default formatMultipleFITB;