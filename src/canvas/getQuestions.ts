import fetch from "node-fetch";
import { Question, MultipleFITB } from "../types/Question";

interface APIQuestion {
    id: number;
    question_type: string;
    points_possible: number;
    question_name: string;
    question_text: string;
}

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
 * The answer is assumed to be the "neutral" comment (HTML) from Canvas -
 * if you would like to splice your own, you will need to provide a 
 * consumer that takes in the complete Canvas question response.
 * 
 * @param {string} site The Base site (i.e., "institute.instructure.com")
 * @param {string} course The Course ID
 * @param {string} quiz The Quiz ID
 * @param {string} token The Canvas API Token
 */
export default async function getQuestions(site: string, course: string, quiz: string, token: string): Promise<Question[]> {
    // fetch all the questions. The answers MIGHT also be there!
    // If there are answers, it'll be in neutral comments - just place it there
    // for now. If the user wants different answers, let them be the one to fetch
    // it.

    const api = "https://" + site + "/api/v1/courses/" + course + "/quizzes/" + quiz + "/questions";
    return fetch(api, {
        headers: {
            Authorization: "Bearer " + token
        }
    })
        .then(resp => resp.json() as Promise<APIQuestion[]>)
        .then(resp => {
            // create each question
            const questions: Question[] = resp.map(q => {
                if (q.question_type === 'fill_in_multiple_blanks_question')
                {
                    // Because reasons, we can assume first P is the image;
                    // every P after is a prompt:
                    console.log(`==== ${q.question_name} ====`);
                    //console.log(q.question_text);
                    const txt = q.question_text.replace(/\n/gi, '');
                    console.log(txt);
                    const parts = txt.split('</p><p>');
                    parts[parts.length - 1] = 
                        parts[parts.length - 1].substring(0, parts[parts.length - 1].length - 4);
                    parts[0] = parts[0].slice(3);
                    console.log(parts);
                    const blanks = parts.slice(1).map(p => {
                        // p will look like: <p>Prompt Part: [stuff]</p>
                        // we need to extract Prompt Part
                        // UNSAFE: We assume naive HTML, with no errant []
                        const startInd = p.indexOf('>') + 1;
                        const stopInd = p.indexOf('[');
                        return p.slice(startInd, stopInd);
                    });
                    const out: MultipleFITB = {
                        type: 'fill_in_multiple_blanks_question',
                        points: q.points_possible,
                        name: q.question_name,
                        id: q.id.toString(),
                        prompt: parts[0],
                        blanks
                    };
                    return out;
                }
                return {
                    id: q.id.toString(),
                    type: q.question_type,
                    points: q.points_possible,
                    name: q.question_name,
                    prompt: q.question_text,
                }
            })
            return questions;
        });
}