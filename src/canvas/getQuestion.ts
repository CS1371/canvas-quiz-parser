import { CanvasConfig, Question, CanvasQuestion, QuestionType, FITB, Essay } from "../types";
import fetch from "node-fetch";

const convertFITB = (question: CanvasQuestion): FITB => {
    const txt = question.question_text.replace(/\n/gi, "");
    const parts = txt.split("</p><p>");
    // Remove last </p>
    parts[parts.length - 1] = 
        parts[parts.length - 1].substring(0, parts[parts.length - 1].length - 4);
    // remove front <p>
    parts[0] = parts[0].slice(3);
    const blanks = parts.slice(1).map(p => {
        // p will look like: Prompt Part: [stuff]
        // we need to extract Prompt Part
        // UNSAFE: We assume naive HTML, with no errant [] or :
        const stopInd = p.indexOf(":");
        return `${p.slice(0, stopInd)}: `;
    });
    return {
        type: QuestionType.FITB,
        points: question.points_possible,
        name: question.question_name,
        position: question.position,
        id: question.id.toString(),
        prompt: parts[0],
        blanks
    };
};

const convertEssay = (question: CanvasQuestion): Essay => {
    return {
        id: question.id.toString(),
        type: QuestionType.ESSAY,
        points: question.points_possible,
        name: question.question_name,
        position: question.position,
        prompt: question.question_text,
    };
};

const convertOther = (question: CanvasQuestion): Question => {
    return {
        id: question.id.toString(),
        type: QuestionType.OTHER,
        points: question.points_possible,
        name: question.question_name,
        prompt: question.question_text,
        position: question.position,
    };
};

const convertQuestion = (q: CanvasQuestion): Question => {
    if (q.question_type === QuestionType.FITB) {
        return convertFITB(q);
    } else if (q.question_type === QuestionType.ESSAY) {
        return convertEssay(q);
    } else {
        return convertOther(q);
    }
};

/**
 * Fetch a question, given it's ID.
 * @param config The canvas configuration to use
 * @param id The ID of the question to fetch
 * @note We don't actually know which "version" of this question we are fetching, only
 * that we are most likely fetching the latest version.
 */
const getQuestion = async (config: CanvasConfig, id: string): Promise<Question> => {
    const { site, course, quiz, token } = config;
    const api = `https://${site}/api/v1/courses/${course}/quizzes/${quiz}/questions/${id}`;
    return fetch(api, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then(resp => resp.json() as Promise<CanvasQuestion>)
        .then(convertQuestion);
};

export default getQuestion;