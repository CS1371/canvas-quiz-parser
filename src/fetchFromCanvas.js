import fetch from "node-fetch";
/**
 * fetchFromCanvas will use the given site, course, and quiz to
 * query Canvas for the quiz results, as well as all of the students
 * so that the results will include any students that did not actually
 * take the test.
 * @param {string} site - The base site of canvas (i.e., site.instructure.com)
 * @param {string} course - The course ID for the specific Canvas Course.
 * @param {string} quiz - The Quiz ID for a specific quiz on Canvas
 * @param {string} token - The user's Canvas developer token
 */
export default function fetchFromCanvas(site, course, quiz, token) {
    // Steps:
    // 1. POST to Canvas, and get back a progress (or possibly a file?)
    // 2. While we wait for Canvas to finish the report, get a list of all the students
    // 3. Once we finish that, we'll just have to wait until it's finished
    
    // Step 1: POST to canvas
    const reportApi = "https://" + site + "/api/v1/courses/" + course + "/quizzes/" + quiz 
        + "/reports?quiz_report[report_type]=student_analysis&"
        + "include[]=progress&include[]=file";
    let fileReady = false;
    let fileData = "";
    fetch(reportApi, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(resp => resp.json())
    .then(async resp => {
        // check progress every 5 seconds until workflow state is complete!
        let isDone = false;
        do {
            // fetch!
            await fetch(resp.progress_url, {
                headers: {
                    "Authorization": "Bearer " + token
                }})
                .then(resp => resp.json())
                .then(resp => {
                    isDone = resp.completion === 100;
                });
        } while (!isDone);
        // It's complete! Make GET request for file itself
    })
    .then(resp => {
        // get the file
        return fetch(reportApi, {
            headers: {
                "Authorization": "Bearer " + token
            }})
    })
    .then(resp => res.json())
    .then(async resp => {
        // get the file
        await fetch(resp.file.url, {
            headers: {
                "Authorization": "Bearer " + token
            }})
            .then(resp => {
                fileData = resp.text();
            })
            .then(resp => {
                fileReady = true;
            });
    });

    while (!fileReady) {}

    console.log(fileData);


}
