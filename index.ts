
const parser = require("./parser/parser");

// Source file path
const fileName = './files/test.html';

// Start the HTML parser
console.dir(
    parser.parserMain(fileName), {
    depth: 5,
});
