const { Parser } = require("./parser_class");

const fileNameClass = "../../files/sample_for_tests.html";

const parser1 = new Parser(fileNameClass);
// Start the HTML parser
console.dir(parser1.results, {
    depth: 5,
});
