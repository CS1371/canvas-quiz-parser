import StudentResponse from "./StudentResponse";
import { Question } from "./Question";

export default interface HydratedResponse {
    id: string;
    login: string;
    responses: {
        question: Question;
        response: string;
    }[];
}