import { getCsv, getStudents } from ".";
/**
 * fetchFromCanvas will use the given site, course, and quiz to
 * query Canvas for the quiz results, as well as all of the students
 * so that the results will include any students that did not actually
 * take the test.
 * @param {string} site - The base site of canvas (i.e., site.instructure.com)
 * @param {string} course - The course ID for the specific Canvas Course.
 * @param {string} quiz - The Quiz ID for a specific quiz on Canvas
 * @param {string} token - The user's Canvas developer token
 */
export default async function fetchFromCanvas(site, course, quiz, token) {
    // Steps:
    // 1. POST to Canvas, and get back a progress (or possibly a file?)
    // 2. While we wait for Canvas to finish the report, get a list of all the students
    // 3. Once we finish that, we'll just have to wait until it's finished

    const fileData = getCsv(site, course, quiz, token);
    const students = getStudents(site, course, token);

    // 2. While we wait, we need to get all the students!
    
    const data = await fileData;
    const studs = await students;
    console.log(data);
    console.log(studs);

}

