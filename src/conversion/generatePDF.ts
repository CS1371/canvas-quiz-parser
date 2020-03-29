import puppeteer from "puppeteer";

/**
 * Print and save a PDF from given HTML
 * @param html The HTML to use to generate the PDF
 * @param path The path to save the PDF to
 * @param browser The browser to use to generate this
 */
const printPDF = async (html: string, path: string, browser: puppeteer.Browser): Promise<void> => {
    // create a new page, set content, engage
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path });
};

export default printPDF;