/**
 * studentFiller will fill in student data into the resulting quiz JSON
 * 
 * The resulting JSON will have the following format:
 * {
 *   id: string,
 *   name: string,
 *   login: string,
 *   email: string,
 *   responses: [Response]
 * }
 * 
 * Students who did **not** take the test will **not** be included in the resulting
 * JSON!
 * 
 * Note that there could be other fields from Canvas, but these are **guaranteed**.
 * 
 * @param {Submission} responses The student responses, as specified in parseResponses
 * @param {Student} students The students, as fetched from Canvas
 */
export default function studentFiller(responses, students) {
    // for each student, see what responses match,
    // and fill in
    for (let s = 0; s < students.length; s++) {
        students[s].id = students[s].id.toString();
        const myResponses = [];
        for (let j = 0; j < responses.length; j++) {
            if (responses[j].userId === students[s].id) {
                myResponses.push(...responses[j].responses);
            }
        }
        // convert student
        students[s].login = students[s].login_id;
        // if empty, we need to remove them from the array
        students[s].responses = myResponses;
    }
    return students.filter((v) => v.responses.length > 0);
}