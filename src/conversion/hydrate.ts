import Student from "../types/Student";
import StudentResponse from "../types/StudentResponse";
import { Question } from "../types/Question";
import HydratedResponse from "../types/HydratedResponse";

/**
 * hydrate will expand a quiz response array with the actual quiz questions
 * 
 * @param {[Student]} students The quiz submissions (as from studentFiller)
 * @param {[Question]} questions The original quiz questions
 */
export default function hydrate(students: StudentResponse[], questions: Question[]) {
    // for each response, fill in question
    const hydrated: HydratedResponse[] = students.map(stud => {
        const resps: { question: Question; response: string; }[] = stud.responses.map(r => {
            return {
                question: questions.find((val) => val.id === r.question)!,
                response: r.response,
            };
        });
        return { ...stud, responses: resps };
    });
    return hydrated;
}