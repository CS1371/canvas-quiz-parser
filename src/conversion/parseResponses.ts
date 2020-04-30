import parse from "csv-parse/lib/sync";
import {
    Question,
    Essay,
    FITB,
    Student,
    QuizResponse,
    CanvasStudent,
    QuestionType,
    CanvasConfig,
} from "../types";
import { getQuestion } from "../canvas";

export interface ParseConfig {
    canvas: CanvasConfig;
    attemptStrategy: "first"|"last"|"all";
}

export interface ParseError extends Error {
    message: string;
    context: { [idx: string]: unknown };
}

export interface Output {
    template: Student;
    students: Student[];
    questions: Question[];
}

const dispatchResponse = (ans: string, quest: Question, strict = false): QuizResponse|ParseError => {
    if (ans !== "") {
        if (quest.type === QuestionType.ESSAY) {
            return {
                type: QuestionType.ESSAY,
                question: quest as Essay,
                response: ans,
            };
        } else if (quest.type === QuestionType.FITB) {
            // Split blanks. ONLY invalid character is \n. Replace \, with it, then split, then re-engage:
            const sanitized = ans.replace(/\\,/gi, "\n");
            const answers = sanitized.split(",").map(a => a.replace(/\n/gi, ","));
            if (strict && ((quest as FITB).blanks.length !== answers.length)) {
                return {
                    ...(new Error(`Length Mismatch: ${(quest as FITB).blanks.length} answer(s) expected; got ${answers.length} instead`)),
                    context: { ans, quest },
                };
            }
            return {
                type: QuestionType.FITB,
                question: quest as FITB,
                response: answers
            };
        } else {
            return {
                type: QuestionType.OTHER,
                question: quest,
                response: ans,
            };
        }
    } else if (quest.type === QuestionType.FITB) {
        return {
            type: QuestionType.FITB,
            question: quest as FITB,
            response: undefined,
        };
    } else if (quest.type === QuestionType.ESSAY) {
        return {
            type: QuestionType.ESSAY,
            question: quest as Essay,
            response: undefined,
        };
    } else {
        return {
            type: QuestionType.OTHER,
            question: quest,
            response: undefined,
        };
    }
};

async function parseResponses(data: string, roster: CanvasStudent[], config: ParseConfig): Promise<Output>;
async function parseResponses(data: string, roster: CanvasStudent[], config: ParseConfig, strict: boolean): Promise<Output|ParseError[]>;

/**
 * Parse quiz responses and generate their JSON equivalent.
 * @param data The raw CSV data from the CSV report; @see requestCSV
 * @param roster The students to interleave into the responses; students who did not submit anything will also be included
 * @param config The Canvas configuration to use when fetching questions; @see getQuestion
 * @param strict If true, then output
 * @returns A Promise that resolves to an array of complete Student responses.
 */
async function parseResponses(data: string, roster: CanvasStudent[], config: ParseConfig, strict = false): Promise<Output|ParseError[]> {
    const output = parse(data, {
        bom: true,
    }) as string[][];
    const header = output[0];
    const idCol = header.lastIndexOf("id");
    const attemptCol = header.lastIndexOf("attempt");
    const questionStartCol = Math.max(header.lastIndexOf("submitted"), header.lastIndexOf("attempt")) + 1;
    const questionStopCol = header.lastIndexOf("n correct");
    // convert header questions to literally just be ID
    const questions: Question[] = [];
    for (let j = questionStartCol; j < questionStopCol; j += 2) {
        const qId = header[j].split(":")[0];
        questions.push(await getQuestion(config.canvas, qId));
    }
    const errOut: ParseError[] = [];
    let submissions: Student[] = [];
    try {
        submissions = output.slice(1).flatMap(record => {
            const login = roster.find(s => s.id.toString() === record[idCol]);
            if (login === undefined) {
                return [];
            }
            const parseResults: (QuizResponse|ParseError)[] = questions.map((quest, q) => {
                const ind = questionStartCol + (q * 2);
                const ret = dispatchResponse(record[ind], quest, strict);
                if ("context" in ret) {
                    ret.context.sid = login.login_id;
                }
                return ret;
            });
            if (parseResults.some(qr => "context" in qr)) {
                errOut.push(...(parseResults.filter(qr => "context" in qr) as ParseError[]));
                return [];
            }
            const responses = (parseResults as QuizResponse[]).sort((qr1, qr2) => {
                return (qr1.question.position - qr2.question.position) || (parseInt(qr1.question.id) - parseInt(qr2.question.id));
            });
            return [{
                id: record[idCol],
                login: login.login_id,
                email: login.email,
                name: login.name,
                sisid: login.sis_user_id,
                attempt: parseInt(record[attemptCol]),
                responses,
            }];
        }).filter((s, _, subs) => {
            if (config.attemptStrategy === "all") {
                return true;
            } else if (config.attemptStrategy === "first") {
                // since it's first, only return me if my attempt is 1
                return s.attempt === 1;
            } else if (config.attemptStrategy === "last") {
                // since it's last, I need to get all that are mine. Then see if mine is last
                return s.attempt === Math.max(...subs.filter(stud => stud.login === s.login).map(stud => stud.attempt));
            }
        });
        if (errOut.length !== 0) {
            throw new Error("Parse Error");
        }
    } catch (e) {
        // we will have err out, just return that
        return errOut;
    }
    questions.sort((q1, q2) => {
        return (q1.position - q2.position) || q1.groupPosition.localeCompare(q2.groupPosition);
    });
    const template: Student = {
        id: "-1",
        login: "&nbsp;",
        email: "&nbsp;",
        name: "&nbsp;",
        sisid: "&nbsp;",
        attempt: 0,
        responses: questions.map(quest => dispatchResponse("", quest) as QuizResponse),
    };
    const students = roster.map(stud => {
        const sub = submissions.find(other => other.id === stud.id.toString());
        if (sub !== undefined) {
            return sub;
        } else {
            // questions will be in the right order!
            const resps: QuizResponse[] = questions.map(quest => dispatchResponse("", quest) as QuizResponse);
            return {
                id: stud.id.toString(),
                login: stud.login_id,
                email: stud.email,
                name: stud.name,
                sisid: stud.sis_user_id,
                attempt: 0,
                responses: resps,
            };
        }
    });
    return { template, students, questions };
};

export default parseResponses;