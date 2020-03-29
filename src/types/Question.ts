import QuestionType from "./QuestionType";

export default interface Question {
    type: QuestionType;
    id: string;
    points: number;
    name: string;
    prompt: string;
}

export interface MultipleFITB extends Question {
    type: QuestionType.FITB;
    prompt: string;
    blanks: string[];
}

export interface Essay extends Question {
    type: QuestionType.ESSAY;
};