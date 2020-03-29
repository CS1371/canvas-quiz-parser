import Student from "../types/Student";

const formatCover = (student: Student): string => {
    return `<div class="cover-page"><h1>${student.login}</h1><p>${student.gtid}</p><p>${student.name}</p></div>`;
};

export default formatCover;