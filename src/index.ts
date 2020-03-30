import puppeteer from "puppeteer";
import fs from "fs";
import rimraf from "rimraf";
import { getStudents, getCsv, getQuestions } from "./canvas";
import { parseResponses, generateHtml } from "./conversion";
import { CanvasConfig } from "./types";
import printPDF from "./conversion/generatePDF";

/**
 * parseQuiz will fetch, parse, and fill in quiz results
 * from Canvas, via the Canvas API. In this case, however,
 * this is returned as a Promise, so that callers need not wait on the
 * results to populate.
 * 
 * For a more fine-grained approach, look at the member functions of each
 * sub module.
 * @param site The Base Site (i.e., "institute.instructure.com")
 * @param course The Course ID
 * @param quiz The Quiz ID
 * @param token The Canvas API token
 * @param outDir The output directory; if it does not exist, it is created. If it already exists, it is deleted.
 */
export default async function parseQuiz(site: string, course: string, quiz: string, token: string, outDir: string): Promise<void> {
    /*
    const evil = String.raw`*\\,:;&$%^#@'<>?,\\\, \\\,\, \\,\, \\\,\\,ℂ◉℗⒴ ℘ⓐṨͲℰ Ⓒℌ◭ℝ◬ℂ⒯℮ℛ ,`;
    console.log(evil.replace(/\\,/gi, '_'));
    return;
    const evil2 = String.raw`Mason Richard Murphy,11896,903262534,sandbox-CS1371,1669,"",2020-03-29 21:18:10 UTC,1,"*\\,:;&$%^#@""'<>?,\\\, \\\,\, \\,\, \\\,\\,ℂ◉℗⒴ ℘ⓐṨͲℰ Ⓒℌ◭ℝ◬ℂ⒯℮ℛ ,"`;
    const out = parse(evil2);
    console.log(out);
    const out1 = out[0][8];
    console.log(out1);
    return;
    */
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
    const combined = parseResponses(await csvReporter, await questionReporter, await studentReporter);
    const template = combined[0];
    const responses = combined.slice(1);
    // stream every 10 students
    if (fs.existsSync(outDir)) {
        rimraf.sync(outDir);
    }
    fs.mkdirSync(outDir);
    const browser = await launcher;
    // create template:
    const templateHtml: string = generateHtml([template]);
    await printPDF(templateHtml, `${outDir}/template.pdf`, browser);
    responses.sort((s1, s2) => {
        return s1.login.localeCompare(s2.login);
    });
    for (let i = 0; i < responses.length; i += 10) {
        const endInd = i + 10 > responses.length ? responses.length : i + 10;
        const overall = generateHtml(responses.slice(i, endInd));
        const pgInd = `${i / 10}`.padStart(2, "0");
        await printPDF(overall, `${outDir}/${pgInd}.pdf`, browser);
    }
    await browser.close();
}

parseQuiz(process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);