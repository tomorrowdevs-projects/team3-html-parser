const { Parser } = require("./parser_class");

const fileName = "../../files/sample_for_tests.html";

const parser1 = new Parser(fileName);
// Start the HTML parser
console.dir(parser1.results, {
    depth: 5,
});
