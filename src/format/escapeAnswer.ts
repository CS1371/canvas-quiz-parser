const escapeAnswer = (answer?: string): string => {
    return (answer ?? "Parsing Error - Check Canvas for this student's responses!")
        .replace(/\&/gi, "&amp;")
        .replace(/\</gi, "&lt;")
        .replace(/\>/gi, "&gt;")
        .replace(/"/gi, "&quot;")
        .replace(/'/gi, "&#39");
};

export default escapeAnswer;