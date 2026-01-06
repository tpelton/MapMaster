
import * as pdfjsLib from 'pdfjs-dist';

// Define the worker source. 
// We have copied pdf.worker.min.mjs to the public folder to avoid CORS issues with CDNs.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/**
 * Extracts all text content from a PDF file.
 * Returns a customized list of strings that look like map IDs.
 */
export const extractTextFromPDF = async (file: File): Promise<string[]> => {
    console.log("PDFService: Starting extraction for", file.name);
    console.log("PDFService: Worker SRC set to:", pdfjsLib.GlobalWorkerOptions.workerSrc);

    let fullText = '';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log("PDFService: Document loaded, pages:", pdf.numPages);

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);

            // 1. Get Regular Text
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');

            // 2. Get Annotation Text (Widgets, FreeText, Popups, etc.)
            const annotations = await page.getAnnotations();
            const annotationText = annotations
                .map((ann: any) => ann.contents || ann.richText || '')
                .join(' ');

            fullText += ' ' + pageText + ' ' + annotationText;
        }
        console.log("PDFService: Raw text length:", fullText.length);

        // HEURISTIC: Fix CAD/Kerning issues where text is like "D 1 0 1"
        // Regex looks for: Single Alphanumeric char, Space, Followed by Single Alphanumeric char
        // We run this iteratively or globally to merge "D 1 0 1" -> "D101"
        // Note: This matches "a b" -> "ab". Use caution.
        // For IDs (UPPERCASE usually), maybe restrict to uppercase?
        // Let's try aggressive merging for now as IDs are the priority.
        const mergedText = fullText.replace(/([A-Z0-9])\s+(?=[A-Z0-9]\b)/gi, '$1');
        console.log("PDFService: Merged text length:", mergedText.length);

        fullText = mergedText;

    } catch (error) {
        console.error("PDFService: Error during PDF processing:", error);
        throw error; // Re-throw the error to be handled by the caller
    }

    // Find potentials IDs using a broad regex
    // Looking for patterns like "D101", "SP01", "TV-1", etc.
    // We strictly look for alphanumeric strings that are 2-6 chars long typically.
    // We can just split by space and let the matching logic filter it out.
    const inputs = fullText.split(/[\s,]+/);

    // Basic cleaning
    const cleanedInputs = inputs
        .map(s => s.trim())
        // LOWERED THRESHOLD: Allow length > 0 (e.g. single letter "D" if it matches a prefix)
        // But usually we want the ID "D101". 
        // If we merged correctly, D101 should exist.
        .filter(s => s.length > 1 && s.length < 15)
        .filter(s => /^[a-zA-Z0-9\/-]+$/.test(s)); // Alphanumeric + slash/dash

    // Unique values
    return Array.from(new Set(cleanedInputs));
};
