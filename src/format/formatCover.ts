import { Student } from "@types";

/**
 * Print a cover page, as HTML
 * @param student The student data to print
 * @returns HTML to be used for the cover page
 */
const formatCover = (student: Student): string => {
    return `<div class="cover-page"><h1>${student.login}</h1><p>${student.gtid}</p><p>${student.name}</p></div>`;
};

export default formatCover;