import Question, { MultipleFITB, Essay } from "./Question";
import QuestionType from "./QuestionType";

export interface QuizResponseBase {
    type: QuestionType;
    question: Question;
}

export interface FITBQuizResponse extends QuizResponseBase {
    type: QuestionType.FITB;
    response?: string[];
    question: MultipleFITB;
}

export interface EssayQuizResponse extends QuizResponseBase {
    type: QuestionType.ESSAY;
    response?: string;
    question: Essay;
}

export interface OtherQuizResponse extends QuizResponseBase {
    type: QuestionType.OTHER;
    response?: unknown;
}
type QuizResponse = EssayQuizResponse | FITBQuizResponse | OtherQuizResponse;

export default QuizResponse;