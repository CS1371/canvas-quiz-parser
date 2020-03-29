export interface Question {
    type: string;
    id: string;
    points: number;
    name: string;
    prompt: string;
}

export interface MultipleFITB extends Question {
    type: 'fill_in_multiple_blanks_question';
    prompt: string;
    blanks: string[];
}

export interface Essay extends Question {
    type: 'essay_question';
}