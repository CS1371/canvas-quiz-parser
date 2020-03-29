import Question from "./Question";
import QuestionType from "./QuestionType";

interface QuizResponseBase {
    type: QuestionType;
    question: Question;
}

interface FITBQuizResponse extends QuizResponseBase {
    type: QuestionType.FITB;
    response?: string[];
}

interface EssayQuizResponse extends QuizResponseBase {
    type: QuestionType.ESSAY;
    response?: string;
}

interface OtherQuizResponse extends QuizResponseBase {
    type: QuestionType.OTHER;
    response?: unknown;
}
type QuizResponse = EssayQuizResponse | FITBQuizResponse | OtherQuizResponse;

export default QuizResponse;