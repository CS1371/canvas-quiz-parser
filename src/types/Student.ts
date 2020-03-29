import Question from "./Question";
import QuizResponse from "./QuizResponse";

export default interface Student {
    id: string;
    login: string;
    responses: QuizResponse[];
};