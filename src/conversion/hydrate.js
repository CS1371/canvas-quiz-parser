/**
 * hydrate will expand a quiz response array with the actual quiz questions
 * 
 * @param {[Student]} students The quiz submissions (as from studentFiller)
 * @param {[Question]} questions The original quiz questions
 */
export default function hydrate(students, questions) {
    // for each response, fill in question
    for (let s of students) {
        for (let r of students[s].responses) {
            // for each, replace question!
            
        }
    }
}