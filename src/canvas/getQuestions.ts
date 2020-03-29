import fetch from "node-fetch";
import {
    Question,
    FITB,
    Essay,
    CanvasSubmission,
    CanvasQuestion,
    CanvasConfig,
    QuestionType,
} from "@types";

interface CanvasSubmissionResult {
    quiz_submissions: CanvasSubmission[];
}

const convertFITB = (question: CanvasQuestion): FITB => {
    const txt = question.question_text.replace(/\n/gi, "");
    const parts = txt.split("</p><p>");
    //console.log(parts);
    parts[parts.length - 1] = 
        parts[parts.length - 1].substring(0, parts[parts.length - 1].length - 4);
    parts[0] = parts[0].slice(3);
    const blanks = parts.slice(1).map(p => {
        // p will look like: Prompt Part: [stuff]
        // we need to extract Prompt Part
        // UNSAFE: We assume naive HTML, with no errant []
        const stopInd = p.indexOf("<input");
        return p.slice(0, stopInd);
    });
    return {
        type: QuestionType.FITB,
        points: question.points_possible,
        name: question.question_name,
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
    };
};

const convertQuestions = (canvasQuestions: CanvasQuestion[]): Question[] => {
    return canvasQuestions.map((q): Question => {
        if (q.question_type === QuestionType.FITB) {
            return convertFITB(q);
        } else if (q.question_type === QuestionType.ESSAY) {
            return convertEssay(q);
        } else {
            return convertOther(q);
        }
    });
};

const submissionQuestions = async (config: CanvasConfig, id: string, attempt: string): Promise<CanvasQuestion[]> => {
    const questionApi = `https://${config.site}/api/v1/courses/${config.course}/quizzes/${config.quiz}/questions?quiz_submission_id=${id}&quiz_submission_attempt=${attempt}`;
    return fetch(questionApi, {
        headers: {
            Authorization: `Bearer ${config.token}`,
        }
    })
        .then(resp => resp.json() as Promise<CanvasQuestion[]>);
};

/**
 * Get the JSON form of all possible questions for the given quiz
 * @param config The Canvas configuration
 * @returns A Promise, which resolves to an array of all possible questions.
 */
export default async function getQuestions(config: CanvasConfig): Promise<Question[]> {
    const submissionApi = `https://${config.site}/api/v1/courses/${config.course}/quizzes/${config.quiz}/submissions`;
    // Quiz could have changed over time. Get all possible question IDs from their various submissions,
    // then make sure their unique and convert that final list of question IDs to the real life questions.

    return fetch(submissionApi, {
        headers: {
            Authorization: `Bearer ${config.token}`,
        }
    })
        .then(resp => resp.json() as Promise<CanvasSubmissionResult>)
        .then(res => res.quiz_submissions)
        .then(subs => {
        // We need submission IDs
            return subs.map(sub => {
                return {
                    id: sub.id.toString(),
                    attempt: sub.attempt.toString(),
                };
            });
        })
        .then(async subs => {
        // We have submission IDs; get the questions aligned with this:
            return Promise.all(
                subs.map(sub => submissionQuestions(config, sub.id, sub.attempt))
            ).then(cq => cq.flat(1));
        })
        .then(cQuestions => {
        // filter out so we only have unique
            return cQuestions.filter((cq, i, a) => a.findIndex(cqCheck => cqCheck.id === cq.id) === i);
        })
        .then(convertQuestions);
};