import fetch from "node-fetch";
/**
 * getQuestions will fetch the complete question JSON from Canvas, via
 * the Canvas API. It outputs this as an array of standard Questions, which
 * look like this:
 * 
 * <code><pre>
 * {
 *   id: string,
 *   type: string,
 *   points: float,
 *   name: string,
 *   prompt: string,
 *   answer: string
 * }
 * </code></pre>
 * 
 * Note that both prompt and answer will be HTML (unescaped!) strings, 
 * as fetched from canvas.
 * 
 * The answer is assumed to be the "correct" comment (HTML) from Canvas -
 * if you would like to splice your own, you will need to provide a 
 * consumer.
 * @param {string} site The Base site (i.e., "institute.instructure.com")
 * @param {string} course The Course ID
 * @param {string} quiz The Quiz ID
 * @param {string} token The Canvas API Token
 */
export default async function getQuestions(site, course, quiz, token) {
    // fetch all the questions. The answers MIGHT also be there!
    // If there are answers, it'll be in neutral comments - just place it there
    // for now. If the user wants different answers, let them be the one to fetch
    // it.
    const api = "https://" + site + "/courses/" + course + "/quizzes/" + quiz + "/questions";
    return fetch(api, {
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(resp => resp.json())
        .then(resp => {
            // create each question
            const questions = [];
            resp.forEach(r => {
                questions.push({
                    id: r.id,
                    type: r.question_type,
                    points: r.points_possible,
                    name: r.question_name,
                    prompt: r.question_text,
                    answer: r.neutral_comments_html
                });
            });
            return questions;
        });
}