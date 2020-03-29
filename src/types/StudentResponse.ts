import Student from "./Student";

export default interface StudentResponse {
    id: string;
    login: string;
    responses: {
        question: string;
        response: string;
    }[];
}