import QuestionType from "./QuestionType";

export interface Question {
    type: QuestionType;
    id: string;
    points: number;
    name: string;
    prompt: string;
    position: number;
    groupPosition: string;
};

export interface FITB extends Question {
    type: QuestionType.FITB;
    prompt: string;
    blanks: string[];
};

export interface Essay extends Question {
    type: QuestionType.ESSAY;
};