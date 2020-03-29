import parse from "csv-parse/lib/sync";
import Question from "../types/Question";
import Student from "../types/Student";
import QuizResponse from "../types/QuizResponse";
import CanvasStudent from "../types/CanvasStudent";
import QuestionType from "../types/QuestionType";

const parseResponses = (data: string, questionBank: Question[], studs: CanvasStudent[]): Student[] => {
    const output = parse(data, {}) as string[][];
    const header = output[0];
    const idCol = header.lastIndexOf('id');
    const questionStartCol = Math.max(header.lastIndexOf('submitted'), header.lastIndexOf('attempt')) + 1;
    const questionStopCol = header.lastIndexOf('n correct');
    // convert header questions to literally just be ID
    const questions: Question[] = [];
    for (let j = questionStartCol; j < questionStopCol; j += 2) {
        const qId = header[j].split(':')[0];
        const quest = questionBank.find(q => q.id === qId);
        if (quest !== undefined) {
            questions.push(quest);
            //throw new Error(`Unknown Question ${qId}`);
        }
    }
    const submissions: Student[] = output.slice(1).map(record => {
        const responses: QuizResponse[] = questions.map((quest, q) => {
            const ind = questionStartCol + (q * 2);
            if (q === 0) {
                //console.log(record);
                //console.log(ind);
                //console.log(questionStartCol);
                //console.log(q);
                //console.log(record[ind]);
            }
            let resp: QuizResponse;
            if (record[ind] !== "") {
                if (quest.type === QuestionType.ESSAY) {
                    resp = {
                        type: QuestionType.ESSAY,
                        question: quest,
                        response: record[ind]
                    };
                } else if (quest.type === QuestionType.FITB) {
                    // Split blanks! newline will be our friend here
                    const answers = record[ind].split(/\n/gi);
                    resp = {
                        type: QuestionType.FITB,
                        question: quest,
                        response: answers
                    }
                } else {
                    resp = {
                        type: QuestionType.OTHER,
                        question: quest,
                        response: undefined,
                    };
                }
            } else {
                resp = {
                    type: quest.type,
                    question: quest,
                    response: undefined,
                };
            }
            return resp;
        });
        const login = studs.find(s => s.id.toString() === record[idCol]);
        if (login === undefined) {
            throw new Error("Unknown student encountered!");
        }
        return {
            id: record[idCol],
            login: login.login_id,
            email: login.email,
            responses
        };
    });
    const overall: Student[] = studs.map(stud => {
        const sub = submissions.find(other => other.id === stud.id.toString());
        if (sub !== undefined) {
            return sub;
        } else {
            // questions will be in the right order!
            const resps: QuizResponse[] = questions.map(q => {
                return {
                    type: q.type,
                    question: q,
                    response: undefined,
                };
            });
            return {
                id: stud.id.toString(),
                login: stud.login_id,
                responses: resps,
            }
        }
    });
    return overall;
}

export default parseResponses;

/**
 * quizJsonify will turn CSV quiz Data into JSON. The format will be an array,
 * where each element represents a single complete submission.
 * 
 * Each submission will be of the form:
 * <code><pre>
 * {
 *  userId: string,
 *  responses: [Question]
 * }
 * </pre></code>
 * 
 * Unlike other functions in this module, this one does *not* return
 * a Promise! In other words, this function is **synchronous**.
 * 
 * The Question resource looks like this:
 * <code><pre>
 * {
 *   question: string,
 *   response: string
 * }
 * When hydrate is called, the question will be converted to a Question object.
 * @param {string} data The CSV output from Canvas, as a string
 *
export default function parseResponses2(data: string) {
    const output = parse(data, {});
    const submissions = [];
    // first row is headers! Get question info from that
    const header = output[0];
    let idCol = -1;
    let questionStartCol = -1;
    let questionStopCol = -1;
    for (let j = 0; j < header.length; j++) {
        if (header[j] === "id") {
            idCol = j;
        } else if (header[j] === "submitted") {
            questionStartCol = j + 1;
        } else if (header[j] === "attempt") {
            questionStartCol = j + 1;
        } else if (header[j] === "n correct") {
            // Don't subtract, so that we can safely iterate from start -> stop - 1 (zero based!)
            questionStopCol = j;
        }
    }
    // convert header questions to literally just be ID
    for (let j = questionStartCol; j < questionStopCol; j += 2) {
        header[j] = header[j].split(":")[0];
    }
    for (let i = 1; i < output.length; i++) {
        // create submissions
        const responses: { question: string; response: string; }[] = [];
        for (let j = questionStartCol; j < questionStopCol; j+= 2) {
            // j = Answer, j+1 = Points (?)
            // if j + 1 = '', then no answer; don't add
            if (output[i][j+1] !== "") {
                responses.push({
                    question: header[j],
                    response: output[i][j]
                });
            } else {
                responses.push({
                    question: header[j],
                    response: "NOT ANSWERED"
                })
            }
        }
        submissions.push({
            userId: output[i][idCol],
            responses
        });
    }
    return submissions;
}
*/