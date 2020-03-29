import QuizResponse from "./QuizResponse";

export interface Student {
    id: string;
    name: string;
    gtid: string;
    login: string;
    email: string;
    responses: QuizResponse[];
};