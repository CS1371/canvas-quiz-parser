import Student from "../types/Student";
import StudentResponse from "../types/StudentResponse";
import QuizResponse from "../types/QuizResponse";

/**
 * studentFiller will fill in student data into the resulting quiz JSON
 * 
 * The resulting JSON will have the following format:
 * {
 *   id: string,
 *   name: string,
 *   login: string,
 *   email: string,
 *   responses: [Response]
 * }
 * 
 * Students who did **not** take the test will **not** be included in the resulting
 * JSON!
 * 
 * Note that there could be other fields from Canvas, but these are **guaranteed**.
 * 
 * @param {Submission} responses The student responses, as specified in parseResponses
 * @param {Student} students The students, as fetched from Canvas
 */
export default function studentFiller(responses: QuizResponse[], students: Student[]) {
    // for each student, see what responses match,
    // and fill in
    const out: StudentResponse[] = students.map(s => {
        const myResponses: ({ question: string; response: string; })[] = [];
        for (let j = 0; j < responses.length; j++) {
            if (responses[j].userId === s.id.toString()) {
                myResponses.push(...responses[j].responses);
            }
        };
        return {
            login: s.login_id,
            id: s.id.toString(),
            responses: myResponses,
        };
    });
    return out.filter((v) => v.responses.length > 0);
}