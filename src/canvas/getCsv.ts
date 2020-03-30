import fetch from "node-fetch";
import { CanvasConfig } from "../types";
/**
 * getCSV will return a Promise that resolves to the raw CSV textual data.
 * This uses the Canvas LMS API - specifically the Quiz Reports section. For
 * more information, look at the Canvas API Documentation.
 * @param config The Canvas Configuration
 * @returns A string, which represents the raw CSV output
 */
async function getCSV(config: CanvasConfig): Promise<string> {
    const reportApi = `https://${config.site}/api/v1/courses/${config.course}/quizzes/${config.quiz}/reports`
        + "?quiz_report[report_type]=student_analysis&"
        + "include[]=progress&include[]=file&quiz_report[includes_all_versions]=true";
    
    return fetch(reportApi, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${config.token}`,
        }
    })
        .then(resp => resp.json() as Promise<{ id: string; progress_url: string }>)
        .then(async resp => {
        // check progress every 5 seconds until workflow state is complete!
            let isDone = false;
            do {
                // fetch!
                await fetch(resp.progress_url, {
                    headers: {
                        "Authorization": `Bearer ${config.token}`,
                    }})
                    .then(resp => resp.json() as Promise<{ completion: number }>)
                    .then(resp => {
                        isDone = resp.completion === 100;
                    });
            } while (!isDone);
            // It's complete! Make GET request for file itself
            const repApi = `https://${config.site}/api/v1/courses/${config.course}/quizzes/${config.quiz}/reports/${resp.id}?include[]=file`;
            return fetch(repApi, {
                headers: {
                    Authorization: `Bearer ${config.token}`,
                }
            });
        })
        .then(resp => resp.json() as Promise<{ file: { url: string } }>)
        .then(resp => {
            // we have the response, get the file!
            return fetch(resp.file.url, {
                headers: {
                    Authorization: `Bearer ${config.token}`,
                }
            });
        })
        .then(resp => resp.text());
};

export default getCSV;