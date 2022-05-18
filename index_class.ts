const { Parser } = require("./parser/parser_class");

const fileNameClass = "./files/index.html";

const parser1 = new Parser();
parser1.parserMain(fileNameClass);
// Start the HTML parser
console.dir(parser1.results, {
    depth: 5,
});
