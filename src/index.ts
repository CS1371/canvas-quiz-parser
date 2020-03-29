import puppeteer from "puppeteer";
import fs from "fs";
import rimraf from "rimraf";
import { getStudents, getCsv, getQuestions } from "./canvas";
import { parseResponses } from "./conversion";
import formatMultipleFITB from "./format/formatFITB";
import { CanvasConfig, QuestionType } from "@types";
import formatEssay from "./format/formatEssay";
import formatOther from "./format/formatOther";
import formatCover from "./format/formatCover";
import printPDF from "./conversion/generatePDF";

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
export default async function parseQuiz(site: string, course: string, quiz: string, token: string, outDir: string): Promise<void> {
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
    // start up browser
    const launcher = puppeteer.launch({ headless: true });
    
    const config: CanvasConfig = { site, course, quiz, token };
    const csvReporter = getCsv(config);
    const studentReporter = getStudents(config);
    const questionReporter = getQuestions(config);

    // now that we have questions and students, matchmake!
    // Parse their responses, providing the question library.
    // We're guaranteed that every question will be accounted for.
    // 2. We'll have to wait on csv Reporter, but then convert
    const responses = parseResponses(await csvReporter, await questionReporter, await studentReporter);

    // stream every 10 students
    if (fs.existsSync(outDir)) {
        rimraf.sync(outDir);
    }
    fs.mkdirSync(outDir);
    const browser = await launcher;
    for (let i = 0; i < responses.length; i += 10) {
        const endInd = i + 10 > responses.length - 1 ? responses.length - 1 : 10;
        const html: string[] = responses.slice(i, endInd).map(resp => {
            return [formatCover(resp), ...resp.responses.map(qr => {
                if (qr.type === QuestionType.ESSAY) {
                    return formatEssay(qr);
                } else if (qr.type === QuestionType.FITB) {
                    return formatMultipleFITB(qr);
                } else {
                    return formatOther(qr);
                }
            })].join("");
        })
            .map(studHtml => {
                return `<div class="student">${studHtml}</div>`;
            });
        const overall = `<!DOCTYPE html><html><head><meta charset="utf8"><style>.cover-page { text-align: center; break-after: page; font-family: 'Courier New'; } .cover-page h1 { font-size: 200%; } .cover-page p { font-size: 150%; } .question { break-after: page } .question.essay { min-height: 20in; max-height: 20in; overflow: hidden; } .question.essay img { break-after: page } img {height: 50% !important; width: 50% !important; }</style></head><body><div class="root">${html.join("")}</div></body></html>`;
        const pgInd = `${i / 10}`.padStart(2, "0");
        await printPDF(overall, `${outDir}/${pgInd}.pdf`, browser);
    }
    await browser.close();
}

parseQuiz(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
//.then(resp => JSON.stringify(resp))
//.then(resp => process.stdout.write(resp));