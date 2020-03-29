export default interface QuizResponse {
    userId: string;
    responses: {
        question: string;
        response: string;
    }[];
}