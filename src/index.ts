import { getStudents, getCsv, getQuestions } from "./canvas";
import { parseResponses } from "./conversion";
import formatMultipleFITB from "./conversion/formatMultipleFITB";

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
    4. For each student, generate an array of questions and their answers
    4. Hydrate with questions and corresponding answers
    */
    // 1. Fetching
    const csvReporter = getCsv(site, course, quiz, token);
    const studentReporter = getStudents(site, course, token);
    const questionReporter = getQuestions(site, course, quiz, token);
    
    //process.stderr.write(createQuestionHtml(questions[0]));
    // now that we have questions and students, matchmake!
    // Parse their responses, providing the question library.
    // We're guaranteed that every question will be accounted for.
    // 2. We'll have to wait on csv Reporter, but then convert
    const responses = parseResponses(await csvReporter, await questionReporter, await studentReporter);
    //console.log(responses);
    //console.log('=== ANGELA RESPONSE ===');
    const aho = responses.filter(stud => stud.login === 'aho41')[0];
    console.log(aho.responses);
    console.log(aho.responses.length);
}

parseQuiz(process.argv[2], process.argv[3], process.argv[4], process.argv[5])
    //.then(resp => JSON.stringify(resp))
    //.then(resp => process.stdout.write(resp));