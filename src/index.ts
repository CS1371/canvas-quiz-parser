#!/usr/bin/env node
import puppeteer from "puppeteer";
import fs from "fs";
import rimraf from "rimraf";
import { getStudents, requestCSV } from "./canvas";
import { parseResponses, generateHtml } from "./conversion";
import { CanvasConfig } from "./types";
import yargs from "yargs";
import printPDF from "./conversion/generatePDF";


interface DataConfig {
    input?: string;
    outDir?: string;
    template: string;
    chunk: number;
}

/**
 * parseQuiz will fetch, parse, and fill in quiz results
 * from Canvas, via the Canvas API. In this case, however,
 * this is returned as a Promise, so that callers need not wait on the
 * results to populate.
 * 
 * For a more fine-grained approach, look at the member functions of each
 * sub module.
 * @param config The Canvas Configuration to use
 * @param outConfig The output configuration to use
 * @returns A Promise that resolves when this function is completely done and disposal is complete.
 */
export default async function parseQuiz(config: CanvasConfig, dataConfig: DataConfig): Promise<void> {
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
    const { outDir, template: includeTemplate, input, chunk } = dataConfig;
    const launcher = outDir === undefined ? undefined : puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    
    const csvReporter = input === undefined ? requestCSV(config) : Promise.resolve(fs.readFileSync(input).toString());
    const studentReporter = getStudents(config);

    // now that we have questions and students, matchmake!
    // Parse their responses, providing the question library.
    // We're guaranteed that every question will be accounted for.
    // 2. We'll have to wait on csv Reporter, but then convert
    const combined = await parseResponses(await csvReporter, await studentReporter, config);
    const template = combined[0];
    const responses = combined.slice(1);
    // stream every chunk students
    if (outDir !== undefined) {
        if (fs.existsSync(outDir)) {
            rimraf.sync(outDir);
        }
        fs.mkdirSync(outDir);
    }
    // create template:
    let browser = await launcher;
    if (includeTemplate === "include" || includeTemplate === "only") {
        const templateHtml: string = generateHtml([template]);
        if (browser !== undefined) {
            await printPDF(templateHtml, `${outDir}/template.pdf`, browser);
        } else {
            process.stdout.write(templateHtml);
        }
    }
    if (includeTemplate === "only") {
        await browser?.close();
        return;
    }
    responses.sort((s1, s2) => {
        return s1.login.localeCompare(s2.login);
    });
    const chunkSize = chunk === 0 ? 1 : chunk;
    for (let i = 0; i < responses.length; i += chunkSize) {
        const endInd = i + chunkSize > responses.length ? responses.length : i + chunkSize;
        const overall = generateHtml(responses.slice(i, endInd));
        const pName = chunk === 0 ? responses[i].login  : `${i / chunkSize}`.padStart(2, "0");
        if (browser !== undefined) {
            try {
                await printPDF(overall, `${outDir}/${pName}.pdf`, browser);
            } catch {
                // browser failed, but we need to formally close it. remake the browser and attempt again...
                await browser.close();
                browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
                await printPDF(overall, `${outDir}/${pName}.pdf`, browser);
            }
        } else {
            process.stdout.write(overall);
        }
    }
    if (browser !== undefined) {
        await browser.close();
    }
}

const args = yargs
    .command("[OPTS]", "Parse a Canvas Quiz and Responses into a unified PDF")
    .usage("Usage: $0 -s [SITE] -c [COURSE] -q [QUIZ] -t [TOKEN]")
    .version("1.0.0")
    .option("site", {
        alias: "s",
        describe: "The base site, such as instructure.university.com",
        demandOption: true,
        nargs: 1,
        string: true,
    })
    .option("course", {
        alias: "c",
        describe: "The course ID that this quiz belongs to",
        demandOption: true,
        nargs: 1,
        string: true,
    })
    .option("quiz", {
        alias: "q",
        describe: "The ID of the quiz you would ike parsed",
        demandOption: true,
        nargs: 1,
        string: true,
    })
    .option("token", {
        alias: "t",
        describe: "Your Canvas API Token. Usually begins with 2096~",
        demandOption: true,
        nargs: 1,
        string: true,
    })
    .option("output", {
        alias: "o",
        describe: "The output folder destination. If not given, the raw HTML is given in stdout",
        demandOption: false,
        nargs: 1,
        string: true,
    })
    .option("template", {
        describe: "Include the template. If 'include', then the template, along with all other documents, is printed. If 'only', only the template is provided. Any other value will not include the template.",
        demandOption: false,
        nargs: 1,
        string: true,
        default: "include",
    })
    .option("input", {
        alias: "i",
        describe: "The input CSV file; if none given, we will use the API",
        demandOption: false,
        nargs: 1,
        string: true,
        default: undefined,
    })
    .option("chunk", {
        describe: "The chunk size to use for generating HTML and PDF. If 0, then each student gets their own PDF, which is named <login_id>.pdf",
        demandOption: false,
        nargs: 1,
        number: true,
        default: 10,
    })
    .help()
    .argv;

const config: CanvasConfig = {
    course: args.course,
    site: args.site,
    quiz: args.quiz,
    token: args.token,
};

const data: DataConfig = {
    outDir: args.output,
    input: args.input,
    template: args.template,
    chunk: args.chunk,
};

parseQuiz(config, data);