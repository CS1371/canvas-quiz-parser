import { QuizResponse, QuestionType } from "@types";
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
    // UNSAFE: HTML INJECTION
    return `<div class="question essay"><h2>${question.name}</h2>${question.prompt}<p class="no-submission">NO SUBMISSION</p></div>`;
};

export default formatBlank;