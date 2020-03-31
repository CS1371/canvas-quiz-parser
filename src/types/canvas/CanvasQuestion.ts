import QuestionType from "../QuestionType";

export interface CanvasQuestion {
    id: number;
    quiz_id: number;
    quiz_group_id: number;
    assessment_question_id: number;
    position: number|null;
    question_name: string;
    question_type: QuestionType;
    question_text: string;
    points_possible: number;
    correct_comments: string;
    incorrect_comments: string;
    neutral_comments: string;
    correct_comments_html: string;
    incorect_comments_html: string;
    neutral_comments_html: string;
    answers: unknown;
    variables: unknown;
    formulas: unknown;
    answer_tolerance: unknown;
    formula_decimal_places: unknown;
    matches: unknown;
    matching_answer_incorrect_matches: unknown;
};