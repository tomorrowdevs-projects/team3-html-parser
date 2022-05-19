import {Parser} from "./parser/parser_class";

const fileNameClass = "./files/index.html";

const parser = new Parser();
parser.openHtmlFile(fileNameClass);
parser.parserMain()
// Start the HTML parser
console.dir(parser.results, {
    depth: 5,
});
