import puppeteer from "puppeteer";


const printPDF = async (html: string, path: string, browser: puppeteer.Browser): Promise<void> => {
    // create a new page, set content, engage
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path });
};

export default printPDF;