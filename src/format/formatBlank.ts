import QuizResponse from "../types/QuizResponse";
import QuestionType from "../types/QuestionType";
import formatMultipleFITB from "./formatMultipleFITB";

const formatBlank = (qr: QuizResponse): string => {
    const { question } = qr;
    if (qr.type === QuestionType.FITB) {
        qr.response = qr.question.blanks.map(() => 'NO SUBMISSION');
        return formatMultipleFITB(qr);
    }
    // UNSAFE: HTML INJECTION
    return `<div class="question essay"><h2>${question.name}</h2>${question.prompt}<p class="no-submission">NO SUBMISSION</p></div>`;
}

export default formatBlank;