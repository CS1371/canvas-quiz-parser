import { Student } from "../types";

/**
 * Print a cover page, as HTML
 * @param student The student data to print
 * @returns HTML to be used for the cover page
 */
const formatCover = (student: Student): string => {
    return `<div class="cover-page"><h1>${student.login}</h1><p class="cover-subtitle"><em>Login</em></p><p>${student.sisid}</p><p class="cover-subtitle"><em>ID</em></p><p>${student.name}</p><p class="cover-subtitle"><em>Name</em></p></div>`;
};

export default formatCover;
