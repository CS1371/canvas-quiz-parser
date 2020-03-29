import fetch from "node-fetch";
import { CanvasStudent, CanvasConfig } from '@types';
/**
 * getStudents will fetch all available students from the specified course.
 * This also uses the Canvas API, but only expects the basic information to
 * be given. Incidentally, this also returns a promise that resolves to the
 * array of all canvas students.
 * @param {string} site The Base site (i.e., "institute.instructure.com")
 * @param {string} course The Course ID
 * @param {string} token The Canvas API Token
 */
export default async function getStudents(config: CanvasConfig): Promise<CanvasStudent[]> {
    const studentApi = `https://${config.site}/api/v1/courses/${config.course}/users?enrollment_type[]=student&include[]=enrollment&per_page=100`;
    return getPage(config, studentApi);
}

async function getPage(config: CanvasConfig, link: string): Promise<CanvasStudent[]> {
    return fetch(link, {
        headers: {
            Authorization: `Bearer ${config.token}`,
        }
    })
        .then(resp => {
        // check if we have next. If we do, RETURN OURSELVES!

            // if we don't even _have_ links, make one up
            let next = "";
            if (resp.headers.has("link")) {
                const links = {
                    current: "",
                    next: "",
                    first: "",
                    last: "",
                    raw: [""]
                };
                const link = resp.headers.get("link");
                if (link === null) {
                    throw new Error("Undefined link");
                } else {
                    links.raw = link.split(',');
                }
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
                    next = "";
                } else {
                    next = links.next;
                }
            }
            // if we do NOT have next, just return resp?
            if (next === "") {
                return resp.json();
            } else {
                const pager = getPage(config, next)
                    .then(async pagerResponse => {
                        // concatenate with our own response!
                        const current = await resp.json();
                        // concat and return
                        return current.concat(pagerResponse);
                    });
                return pager;
            }
        });
}