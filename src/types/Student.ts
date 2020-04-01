import QuizResponse from "./QuizResponse";

export interface Student {
    id: string;
    name: string;
    sisid: string;
    login: string;
    email: string;
    attempt: number;
    responses: QuizResponse[];
};