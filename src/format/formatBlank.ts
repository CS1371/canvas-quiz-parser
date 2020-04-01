import { QuizResponse, QuestionType } from "../types";
import formatFITB from "./formatFITB";

/**
 * Format an unanswered Quiz Response
 * @param qr The generic Quiz Response
 * @returns HTML markup suitable for printing to a PDF
 */
const formatBlank = (qr: QuizResponse): string => {
    const { question } = qr;
    if (qr.type === QuestionType.FITB) {
        qr.response = qr.question.blanks.map(() => "NO SUBMISSION");
        return formatFITB(qr);
    }
    const { name, id, prompt } = question;
    // UNSAFE: HTML INJECTION
    return `<div class="question essay"><h2>${name}</h2><p class="question-id"><em>${id}</em></p>${prompt}<div class="answer"><pre>NO SUBMISSION</pre></div></div>`;
};

export default formatBlank;