const escapeAnswer = (answer: string): string => {
    return answer
        .replace(/\&/gi, "&amp;")
        .replace(/\</gi, "&lt;")
        .replace(/\>/gi, "&gt;")
        .replace(/"/gi, "&quot;")
        .replace(/'/gi, "&#39");
};

export default escapeAnswer;