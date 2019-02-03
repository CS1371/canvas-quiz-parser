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
export default async function fetchFromCanvas(site, course, quiz, token) {
    // Steps:
    // 1. POST to Canvas, and get back a progress (or possibly a file?)
    // 2. While we wait for Canvas to finish the report, get a list of all the students
    // 3. Once we finish that, we'll just have to wait until it's finished
    
    // Step 1: POST to canvas
    let fileData = 0;
    const reportApi = "https://" + site + "/api/v1/courses/" + course + "/quizzes/" + quiz 
        + "/reports?quiz_report[report_type]=student_analysis&"
        + "include[]=progress&include[]=file";
    
    const csvReporter = fetch(reportApi, {
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
    .then(resp => resp.json())
    .then(async resp => {
        // get the file
        // if we have two items, get the first one
        const fileUrl = resp.length > 1 ? resp[0].file.url : resp.file.url;
        await fetch(fileUrl, {
            headers: {
                "Authorization": "Bearer " + token
            }})
            .then(resp => resp.text())
            .then(resp => {
                fileData = resp;
            });
    });
    // 2. While we wait, we need to get all the students!
    const students = [];
    const studentApi = "https://" + site + "/api/v1/courses/" + course + "/users"
        + "?enrollment_type[]=student&include[]=enrollments&per_page=100";

    let isDone = false;
    let currentLink = studentApi;
    do {
        await fetch(currentLink, {
            headers: {
                "Authorization": "Bearer " + token
            }})
            .then(resp => {
                // if we don't even _have_ links, make one up
                const links = {
                    current: "",
                    next: "",
                    first: "",
                    last: "",
                    raw: ""
                };
                if (resp.headers.has("link")) {
                    links.raw = resp.headers.get("link").split(",");
                    // We don't necessarily have everything...
                    for (let i = 0; i < links.raw.length; i++) {
                        // split and engage
                        let tmp = links.raw[i].split(";");
                        if (tmp[1].includes("current")) {
                            links.current = decodeURI(tmp[0].slice(1, -1));
                        } else if (tmp[1].includes("next")) {
                            links.next = decodeURI(tmp[0].slice(1, -1));
                        } else if (tmp[1].includes("first")) {
                            links.first = decodeURI(tmp[0].slice(1, -1));
                        } else if (tmp[1].includes("last")) {
                            links.last = decodeURI(tmp[0].slice(1, -1));
                        }
                    }
                    // each follows the same formula:
                    // 1. Split via the ";" - we only need the first part!
                    // 2. slice it to remove the opening and closing <>
                    // 3. Decode it!
                    if (links.current == links.last || links.next === "") {
                        // we are at the last page; finished!
                        isDone = true;
                    } else {
                        currrentLink = links.next;
                    }
                } else {
                    // no link, just die
                    isDone = true;
                }
                return resp;
            })
            .then(resp => resp.json())
            .then(resp => {
                // We will just push in a loop. While this LOOKS inefficient, this actually isn't that bad.
                // Plus, it's thread safe now, since we're just editing the initial students array.
                for (let i = 0; i < resp.length; i++) {
                    students.push(resp[i]);
                }
            }); 
    } while (!isDone);
    await csvReporter;
    console.log(fileData);


}
