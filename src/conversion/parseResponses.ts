import parse from "csv-parse/lib/sync";
/**
 * quizJsonify will turn CSV quiz Data into JSON. The format will be an array,
 * where each element represents a single complete submission.
 * 
 * Each submission will be of the form:
 * <code><pre>
 * {
 *  userId: string,
 *  responses: [Question]
 * }
 * </pre></code>
 * 
 * Unlike other functions in this module, this one does *not* return
 * a Promise! In other words, this function is **synchronous**.
 * 
 * The Question resource looks like this:
 * <code><pre>
 * {
 *   question: string,
 *   response: string
 * }
 * When hydrate is called, the question will be converted to a Question object.
 * @param {string} data The CSV output from Canvas, as a string
 */
export default function parseResponses(data: string) {
    const output = parse(data, {});
    const submissions = [];
    // first row is headers! Get question info from that
    const header = output[0];
    let idCol = -1;
    let questionStartCol = -1;
    let questionStopCol = -1;
    for (let j = 0; j < header.length; j++) {
        if (header[j] === "id") {
            idCol = j;
        } else if (header[j] === "submitted") {
            questionStartCol = j + 1;
        } else if (header[j] === "attempt") {
            questionStartCol = j + 1;
        } else if (header[j] === "n correct") {
            // Don't subtract, so that we can safely iterate from start -> stop - 1 (zero based!)
            questionStopCol = j;
        }
    }
    // convert header questions to literally just be ID
    for (let j = questionStartCol; j < questionStopCol; j += 2) {
        header[j] = header[j].split(":")[0];
    }
    for (let i = 1; i < output.length; i++) {
        // create submissions
        const responses: { question: string; response: string; }[] = [];
        for (let j = questionStartCol; j < questionStopCol; j+= 2) {
            // j = Answer, j+1 = Points (?)
            // if j + 1 = '', then no answer; don't add
            if (output[i][j+1] !== "") {
                responses.push({
                    question: header[j],
                    response: output[i][j]
                });
            }
        }
        submissions.push({
            userId: output[i][idCol],
            responses
        });
    }
    return submissions;
}