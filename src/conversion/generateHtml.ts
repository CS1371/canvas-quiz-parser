import {
    formatCover,
    formatEssay,
    formatFITB,
    formatOther
} from "../format";
import { QuestionType, Student } from "../types";

const generateHtml = (students: Student[]): string => {
    // We can't use this for general, because there is no underline
    let fontFamily = "Liu Jian Mao Cao";
    if (students.length === 1 && students[0].id === "-1") {
        fontFamily = "Courier New";
    }
    const html: string[] = students.map(resp => {
        return [formatCover(resp), ...resp.responses.map(qr => {
            if (qr.type === QuestionType.ESSAY) {
                return formatEssay(qr);
            } else if (qr.type === QuestionType.FITB) {
                return formatFITB(qr);
            } else {
                return formatOther(qr);
            }
        })].join("");
    }).map(studHtml => {
        return `<div class="student">${studHtml}</div>`;
    });
    return `<!DOCTYPE html><html><head><meta charset="utf8">
    <link href="https://fonts.googleapis.com/css?family=Liu+Jian+Mao+Cao&display=swap" rel="stylesheet"> 
    <style>
    .fitb-answers p { max-height: 0.75in; min-height: 0.75in; height: 0.75in; overflow: hidden; } 
    .cover-page { text-align: left; break-after: page; font-family: '${fontFamily}'; } 
    .cover-page h1, .cover-page p { margin-top: 50px; margin-bottom: 50px; } 
    .cover-page h1 { font-size: 200%; } 
    .cover-page p { font-size: 150%; } 
    .question, .question img { break-after: page; } 
    .question .answer { break-before: page; margin: 20px; }
    .question h2 { margin-bottom: 0; padding-bottom: 0; } 
    .question.essay .answer { min-height: 20in; max-height: 20in; overflow: hidden; } 
    .question-id { font-size: 75%; color: darkgrey; margin: 0; padding: 0; } 
    img { height: 50% !important; width: 50% !important; }
    pre { white-space: pre-wrap; } 
    </style>
    </head><body><div class="root">${html.join("")}</div></body></html>`;
};

export default generateHtml;