import { MultipleFITB } from "../types/Question";

// TODO: UNSAFE
const formatMultipleFITB = (question: MultipleFITB, answers: string[]): string => {
    const { prompt, blanks, name } = question;
    console.log(question);
    const qa = blanks.map((b, i) => {
        // UNSAFE: HTML INJECTION
        return `<p>${b}${answers[i]}</p>`;
    });
    // UNSAFE: HTML INJECTION
    return `<div class="question mfitb"><h2>${name}</h2>${prompt}<div class="mfitb-answers">${qa.join('')}</div></div>`;
}

export default formatMultipleFITB;