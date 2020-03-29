export { getStudents, getCsv, getQuestions } from "./canvas";
import { getStudents, getCsv, getQuestions } from "./canvas";
export { quizJsonify, studentFiller, hydrate } from "./conversion";
import { parseResponses, studentFiller, hydrate } from "./conversion";
import formatMultipleFITB from "./conversion/formatMultipleFITB";

function createQuestionHtml(q) {
    return `<div class="question-listing">${q.prompt}</div>`;
}

/**
 * parseQuiz will fetch, parse, and fill in quiz results
 * from Canvas, via the Canvas API. In this case, however,
 * this is returned as a Promise, so that callers need not wait on the
 * results to populate.
 * 
 * For a more fine-grained approach, look at the member functions of each
 * sub module.
 * @param {string} site The Base Site (i.e., "institute.instructure.com")
 * @param {string} course The Course ID
 * @param {string} quiz The Quiz ID
 * @param {string} token The Canvas API token
 */
export default async function parseQuiz(site: string, course: string, quiz: string, token: string) {
    /* Steps:
    1. Start up fetching of all the data:
        * Questions
        * CSV Responses
        * Students
    2. Convert the CSV Data
    3. Add in the student data
    4. Hydrate with questions and corresponding answers
    */
    // 1. Fetching
    const csvReporter = getCsv(site, course, quiz, token);
    const studentReporter = getStudents(site, course, token);
    const questionReporter = getQuestions(site, course, quiz, token);
    const questions = await questionReporter;
    //console.log(questions);
    questions.forEach(q => {
        if (q.type === 'fill_in_multiple_blanks_question') {
            process.stderr.write(formatMultipleFITB(q, ["hello", "world", "fdsafdsa", "Asdf", "Fdsafdsafdasfdsa"]));
        }
    });
    //process.stderr.write(createQuestionHtml(questions[0]));

    // 2. We'll have to wait on csv Reporter, but then convert
    const responses = parseResponses(await csvReporter);
    // 3. Add in extra students (and existing student data)
    const dehydrated = studentFiller(responses, await studentReporter);
    // 4. Hydrate with out questions
    return hydrate(dehydrated, await questionReporter);
}

parseQuiz(process.argv[2], process.argv[3], process.argv[4], process.argv[5])
    .then(resp => JSON.stringify(resp))
    .then(resp => process.stdout.write(resp));