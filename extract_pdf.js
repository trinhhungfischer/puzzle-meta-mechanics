const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('private/Building Blocks of Digital Puzzle Game Design_ A Comprehensive Taxonomy and Reference.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('private/extracted_pdf.txt', data.text);
    console.log("PDF extracted successfully to private/extracted_pdf.txt");
}).catch(function(error){
    console.error("Error parsing PDF:", error);
});
