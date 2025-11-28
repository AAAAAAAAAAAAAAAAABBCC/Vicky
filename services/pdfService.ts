import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

export const mergePDFs = async (files: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
};

export const imagesToPDF = async (files: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;
    
    if (file.type === 'image/jpeg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    }

    if (image) {
      const page = pdfDoc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }
  }

  return await pdfDoc.save();
};

export const splitPDF = async (file: File): Promise<Uint8Array[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const numberOfPages = pdfDoc.getPageCount();
  const splitFiles: Uint8Array[] = [];

  for (let i = 0; i < numberOfPages; i++) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(page);
    splitFiles.push(await newPdf.save());
  }

  return splitFiles;
};

export const addWatermark = async (file: File, text: string): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  pages.forEach(page => {
    const { width, height } = page.getSize();
    const fontSize = 50;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    page.drawText(text, {
      x: width / 2 - textWidth / 2, 
      y: height / 2,
      size: fontSize,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
      rotate: degrees(45),
    });
  });

  return await pdfDoc.save();
};

export const removePages = async (file: File, pageNumbers: number[] = [0]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  // removePage is 0-indexed
  // We sort descending to avoid index shifting issues when removing multiple
  const uniquePages = [...new Set(pageNumbers)].sort((a, b) => b - a);
  
  for (const p of uniquePages) {
    if (p < pdfDoc.getPageCount()) {
       pdfDoc.removePage(p);
    }
  }
  return await pdfDoc.save();
};

export const reorderPages = async (file: File): Promise<Uint8Array> => {
   // Simple reverse for demo
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = pdfDoc.getPageCount();
  const newPdf = await PDFDocument.create();
  
  for (let i = pageCount - 1; i >= 0; i--) {
     const [page] = await newPdf.copyPages(pdfDoc, [i]);
     newPdf.addPage(page);
  }
  return await newPdf.save();
};


// Simulated server-side tools - Now returns a VALID PDF
export const mockServerProcess = async (file: File, type: string): Promise<Uint8Array> => {
  return new Promise(async (resolve) => {
    // Create a new valid PDF to ensure the user can view it
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`Processed with AnyFile`, {
      x: 50,
      y: height - 100,
      size: 30,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Operation: ${type}`, {
      x: 50,
      y: height - 150,
      size: 20,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    page.drawText(`Original File: ${file.name}`, {
      x: 50,
      y: height - 200,
      size: 15,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();
    
    setTimeout(() => {
      resolve(pdfBytes);
    }, 2000);
  });
};