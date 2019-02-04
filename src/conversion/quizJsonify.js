/**
 * quizJsonify will turn CSV quiz Data into JSON. The format will be an array,
 * where each element represents a single complete submission.
 * 
 * Each submission will be of the form:
 * <code><pre>
 * {
 *  userId: string,
 *  questionId: string,
 *  answer: string
 * }
 * </pre></code>
 * To 
 * @param {string} data The CSV output from Canvas, as a string
 */
export default async function quizJsonify(data) {

}