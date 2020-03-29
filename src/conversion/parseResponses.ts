import parse from "csv-parse/lib/sync";
import {
    Question,
    Essay,
    FITB,
    Student,
    QuizResponse,
    CanvasStudent,
    QuestionType,
} from '@types';

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
        }
    }
    const submissions: Student[] = output.slice(1).map(record => {
        const responses: QuizResponse[] = questions.map((quest, q) => {
            const ind = questionStartCol + (q * 2);
            return dispatchResponse(record[ind], quest);
        });
        const login = studs.find(s => s.id.toString() === record[idCol]);
        if (login === undefined) {
            throw new Error("Unknown student encountered!");
        }
        return {
            id: record[idCol],
            login: login.login_id,
            email: login.email,
            name: login.name,
            gtid: login.sis_user_id,
            responses
        };
    });
    const overall: Student[] = studs.map(stud => {
        const sub = submissions.find(other => other.id === stud.id.toString());
        if (sub !== undefined) {
            return sub;
        } else {
            // questions will be in the right order!
            const resps: QuizResponse[] = questions.map(quest => dispatchResponse('', quest));
            return {
                id: stud.id.toString(),
                login: stud.login_id,
                email: stud.email,
                name: stud.name,
                gtid: stud.sis_user_id,
                responses: resps,
            }
        }
    });
    return overall;
}

const dispatchResponse = (ans: string, quest: Question): QuizResponse => {
    if (ans !== "") {
        if (quest.type === QuestionType.ESSAY) {
            return {
                type: QuestionType.ESSAY,
                question: quest as Essay,
                response: ans,
            };
        } else if (quest.type === QuestionType.FITB) {
            // Split blanks. ONLY invalid character is \n. Replace \, with it, then split, then re-engage:
            const sanitized = ans.replace(/\\,/gi, '\n');
            const answers = sanitized.split(',').map(a => a.replace(/\n/gi, ','));
            return {
                type: QuestionType.FITB,
                question: quest as FITB,
                response: answers
            }
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
}
export default parseResponses;