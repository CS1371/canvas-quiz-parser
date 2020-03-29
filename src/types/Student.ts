import Question from "./Question";
import QuizResponse from "./QuizResponse";

export default interface Student {
    id: string;
    name: string;
    gtid: string;
    login: string;
    email: string;
    responses: QuizResponse[];
};