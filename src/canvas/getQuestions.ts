import fetch from "node-fetch";
import Question, { MultipleFITB, Essay } from "../types/Question";
import CanvasSubmission from "../types/CanvasSubmission";
import CanvasQuestion from "../types/CanvasQuestion";
import CanvasConfig from "../types/CanvasConfig";
import QuestionType from "../types/QuestionType";

interface APIQuestion {
    id: number;
    question_type: string;
    points_possible: number;
    question_name: string;
    question_text: string;
}

interface CanvasSubmissionResult {
    quiz_submissions: CanvasSubmission[];
}

const convertFITB = (question: CanvasQuestion): Question => {
    const txt = question.question_text.replace(/\n/gi, '');
    const parts = txt.split('</p><p>');
    parts[parts.length - 1] = 
        parts[parts.length - 1].substring(0, parts[parts.length - 1].length - 4);
    parts[0] = parts[0].slice(3);
    const blanks = parts.slice(1).map(p => {
        // p will look like: <p>Prompt Part: [stuff]</p>
        // we need to extract Prompt Part
        // UNSAFE: We assume naive HTML, with no errant []
        const startInd = p.indexOf('>') + 1;
        const stopInd = p.indexOf('[');
        return p.slice(startInd, stopInd);
    });
    const out: MultipleFITB = {
        type: QuestionType.FITB,
        points: question.points_possible,
        name: question.question_name,
        id: question.id.toString(),
        prompt: parts[0],
        blanks
    };
    return out;
};

const convertEssay = (question: CanvasQuestion): Question => {
    return {
        id: question.id.toString(),
        type: QuestionType.ESSAY,
        points: question.points_possible,
        name: question.question_name,
        prompt: question.question_text,
    };
}

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
    const submissionApi = `https://${config.site}/api/v1/courses/${config.course}/quizzes/${config.quiz}/questions?quiz_submission_id=${id}&quiz_submission_attempt=${attempt}`;
    return fetch(submissionApi, {
        headers: {
            Authorization: `Bearer ${config.token}`,
        }
    })
    .then(resp => resp.json() as Promise<CanvasQuestion[]>);
}
/**
 * getQuestions will fetch the complete question JSON from Canvas, via
 * the Canvas API. It outputs this as an array of standard Questions, which
 * look like this:
 * 
 * <code><pre>
 * {
 *   id: string,
 *   type: string,
 *   points: float,
 *   name: string,
 *   prompt: string,
 *   answer: string
 * }
 * </code></pre>
 * 
 * Note that both prompt and answer will be HTML (unescaped!) strings, 
 * as fetched from canvas.
 * 
 * The answer is assumed to be the "neutral" comment (HTML) from Canvas -
 * if you would like to splice your own, you will need to provide a 
 * consumer that takes in the complete Canvas question response.
 * 
 * @param {string} site The Base site (i.e., "institute.instructure.com")
 * @param {string} course The Course ID
 * @param {string} quiz The Quiz ID
 * @param {string} token The Canvas API Token
 */
export default async function getQuestions(site: string, course: string, quiz: string, token: string): Promise<Question[]> {
    // fetch all the questions. The answers MIGHT also be there!
    // If there are answers, it'll be in neutral comments - just place it there
    // for now. If the user wants different answers, let them be the one to fetch
    // it.
    const config = { site, course, quiz, token };

    const api = "https://" + site + "/api/v1/courses/" + course + "/quizzes/" + quiz + "/submissions?include[]=";
    // This is stupid. First, request EVERY SINGLE SUBMISSION. Each submission will have different question IDs.
    // Get the ID of the quiz submission. Use this to get the questions shown to THAT STUDENT

    return fetch(api, {
        headers: {
            Authorization: `Bearer ${token}`,
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
        const a = subs.map(sub => submissionQuestions(config, sub.id, sub.attempt));
        const b = await Promise.all(a);
        const c = b.flat(1);
        return c;
    })
    .then(cQuestions => {
        // filter out so we only have unique
        return cQuestions.filter((cq, i, a) => a.findIndex(cqCheck => cqCheck.id === cq.id) === i);
    })
    .then(cQuestions => {
        return convertQuestions(cQuestions)
    });
}
    /*
    .then((quizInfo): Question[] => {
        // for each info, get the questions associated with that submission
        const a = quizInfo.flatMap((info): Promise<Question[]> => {
            const questionApi = `https://${site}/api/v1/courses/${course}/quizzes/${quiz}/questions?quiz_submission_id=${info.id}&quiz_submission_attempt=${info.attempt}`;
            return fetch(questionApi, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(resp => resp.json() as Promise<CanvasQuestion[]>)
            .then(convertQuestions);
        }) as Promise<;
        return Promise.all(a);
        return a;
    })
    .then(questions => {
        // filter out
        return questions.filter((q, i, a) => a.indexOf(q) === i);
    });;
    return fetch(api, {
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(resp => resp.json() as Promise<APIQuestion[]>)
        .then(resp => {
            console.log('=== QUESTIONS ===');
            resp.forEach(r => {
                console.log(`id: ${r.id}\nquiz_id: ${r.quiz_id}\nquiz_group_id: ${r.quiz_group_id}\nassessment_question_id: ${r.assessment_question_id}`);
            })
            throw new Error("SHIT");
            // create each question
            const questions: Question[] = resp.map(q => {
                if (q.question_type === 'fill_in_multiple_blanks_question')
                {
                    // Because reasons, we can assume first P is the image;
                    // every P after is a prompt:
                    //console.log(q.question_text);
                    const txt = q.question_text.replace(/\n/gi, '');
                    const parts = txt.split('</p><p>');
                    parts[parts.length - 1] = 
                        parts[parts.length - 1].substring(0, parts[parts.length - 1].length - 4);
                    parts[0] = parts[0].slice(3);
                    const blanks = parts.slice(1).map(p => {
                        // p will look like: <p>Prompt Part: [stuff]</p>
                        // we need to extract Prompt Part
                        // UNSAFE: We assume naive HTML, with no errant []
                        const startInd = p.indexOf('>') + 1;
                        const stopInd = p.indexOf('[');
                        return p.slice(startInd, stopInd);
                    });
                    const out: MultipleFITB = {
                        type: 'fill_in_multiple_blanks_question',
                        points: q.points_possible,
                        name: q.question_name,
                        id: q.id.toString(),
                        prompt: parts[0],
                        blanks
                    };
                    return out;
                }
                return {
                    id: q.id.toString(),
                    type: q.question_type,
                    points: q.points_possible,
                    name: q.question_name,
                    prompt: q.question_text,
                }
            })
            return questions;
        });
}
*/