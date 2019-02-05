/**
 * hydrate will expand a quiz response array with the actual quiz questions
 * 
 * @param {[Student]} students The quiz submissions (as from studentFiller)
 * @param {[Question]} questions The original quiz questions
 */
export default function hydrate(students, questions) {
    // for each response, fill in question
    for (let s = 0; s < students.length; s++) {
        for (let r = 0; r < students[s].responses.length; r++) {
            // for each, replace question!
            // search for question
            const question = questions.find((val) => val.id === students[s].responses[r].question);
            if (question !== undefined) {
                students[s].responses[r].question = question;
            } else {
                students[s].responses[r].question = null;
            }
        }
    }
    return students;
}