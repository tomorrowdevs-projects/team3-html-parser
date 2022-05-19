import {Parser} from "./parser_class";


test("Test OBJECT creation", () => {
  //====================================================================================================================
  const parser = new Parser()
  expect(parser.canParse).toBe(true);
  expect(parser.inInvalidTag).toBe(false);
  expect(parser.inString).toBe(false);
  expect(parser.inHtmlComment).toBe(false);
  expect(parser.inParseComment).toBe(false);
  expect(parser.inParse).toBe(false);
  expect(parser.parseSubstrings).toStrictEqual([]);
  expect(parser.openParseIndex).toStrictEqual([]);
  expect(parser.parseIndexCouples).toStrictEqual([]);
  expect(parser.propertiesArr).toStrictEqual([]);
  expect(parser.results).toStrictEqual([]);
  expect(parser.apexCounter).toBe(0);
  expect(parser.quotationCounter).toBe(0);
  expect(parser.counter).toBe(0);
  expect(parser.htmlString).toBe("")
});
//======================================================================================================================

test("Tests ParserMain Method", () => {
  //====================================================================================================================
  let parser = new Parser()
  const fileName = "./files/sample_for_tests.html";
  parser.openHtmlFile(fileName)
  parser.parserMain()
  expect(parser.results).toStrictEqual([
    {
      raw:
        '<parse foo="bar">\n' +
        "            <div>\n" +
        '                <parse baz="hey"></parse>\n' +
        "            </div>\n" +
        "            <div>\n" +
        '                <parse baz="hoy"></parse>\n' +
        "            </div>\n" +
        "        </parse>",
      properties: { foo: "bar" },
      from: 350, //350
      to: 541,
    },
    {
      raw: '<parse property="stylesheet" href="styles.css"></parse>',
      properties: { property: "stylesheet", href: "styles.css" },
      from: 910,
      to: 964,
    },
    {
      raw: '<parse foo="bar" />',
      properties: { foo: "bar" },
      from: 974,
      to: 992,
    },
    {
      raw: '<parse foo="bar" />',
      properties: { foo: "bar" },
      from: 1002,
      to: 1020,
    },
  ]);
  parser = new Parser()
  const fileNameError = "Error";
  parser.openHtmlFile(fileNameError)
  parser.parserMain()
  expect(parser.results).toStrictEqual([
    { raw: "Invalid Filename", properties: [], from: [], to: [] },
  ]);
  parser = new Parser()
  parser.htmlString = '<!--# <parse property="stylesheet" href="styles.css"></parse><div> error </div>> -->'
  parser.parserMain(parser.htmlString)
  expect(parser.results).toStrictEqual([
    { raw: "Invalid Parse Comment", properties: [], from: [], to: [] },
  ]);




});
//======================================================================================================================

// test("Tests matchOpeningTags Function", () => {
//   //====================================================================================================================
//   expect(parserTest.matchOpeningTags("<parse ", 0)).toBe(5);
//   expect(parserTest.matchOpeningTags("<parse ", -5)).toBe(-5);
//   expect(parserTest.matchOpeningTags("<parse ", 1)).toBe(1);
//   expect(parserTest.matchOpeningTags("", 0)).toBe(0);
//   expect(parserTest.matchOpeningTags("<style", 0)).toBe(5);
//   expect(parserTest.matchOpeningTags("<script", 0)).toBe(6);
//   expect(parserTest.matchOpeningTags("<!--", 0)).toBe(3);
//   expect(parserTest.matchOpeningTags("<!--#", 0)).toBe(4);
// });
//======================================================================================================================

// test("Tests matchClosingTags Function", () => {
//   //====================================================================================================================
//   expect(parserTest.matchClosingTags("/parse> ", 0)).toBe(6);
//   expect(parserTest.matchClosingTags("/parse> ", -5)).toBe(-5);
//   expect(parserTest.matchClosingTags("/parse> ", 1)).toBe(1);
//   expect(parserTest.matchClosingTags("", 0)).toBe(0);
//   expect(parserTest.matchClosingTags("/style>", 0)).toBe(6);
//   expect(parserTest.matchClosingTags("/script>", 0)).toBe(7);
// });
// //======================================================================================================================
//
test("Tests checkClosingComment Function", () => {
  //====================================================================================================================
  const parser = new Parser()
  parser.inHtmlComment = false;
  parser.inParseComment = true;
  parser.inString = false;
  parser.htmlString = '-->'
  parser.checkClosingComment()
  expect(parser.inParseComment).toBe(false)
  // expect(parserTest.checkClosingComment("-->", -5)).toBe(-5);
  // expect(parserTest.checkClosingComment("", 0)).toBe(0);
  // expect(parserTest.checkClosingComment("-->", 0)).toBe(2);
});
//======================================================================================================================

test("Tests checkString Function", () => {
  //====================================================================================================================
  const parser = new Parser()
  parser.apexCounter = 1;
  parser.quotationCounter = 1;
  parser.apexCounter = parser.checkString(parser.apexCounter, parser.quotationCounter)
  expect(parser.apexCounter).toBe(0)
  expect(parser.quotationCounter).toBe(1)
  // expect(parserTest.checkString(0, 0)).toBe(1);
  // expect(parserTest.checkString(1, 0)).toBe(0);
  // expect(parserTest.checkString(-1, 0)).toBe(-2);
  // expect(parserTest.checkString(0, 1)).toBe(0);
  // expect(parserTest.checkString(1, 1)).toBe(0);
});
//======================================================================================================================

test("Tests extractParseProp Function", () => {
  //====================================================================================================================
  const parser = new Parser()
  parser.parseSubstrings = [
    '<parse foo="bar">\r\n' +
      "      <div>\r\n" +
      '        <parse baz="hey"></parse>\r\n' +
      "      </div>\r\n" +
      "      <div>\r\n" +
      '        <parse baz="hoy"></parse>\r\n' +
      "      </div>\r\n" +
      "    </parse>",
    '<parse property="stylesheet" href="styles.css"></parse>',
    '<parse foo="bar" />',
    '<parse foo="bar" />',
  ];
  parser.extractParseProp()
  expect(parser.propertiesArr).toStrictEqual([
    { foo: "bar" },
    { property: "stylesheet", href: "styles.css" },
    { foo: "bar" },
    { foo: "bar" },
  ]);
  parser.propertiesArr = [];
  parser.parseSubstrings = ["<parse></parse>"]
  parser.extractParseProp()
  expect(parser.propertiesArr).toStrictEqual(["",]);
});
//======================================================================================================================


test("Tests ResultMaker Function", () => {
  //====================================================================================================================
  let parser = new Parser()
  parser.propertiesArr = [
    { foo: "bar" },
    { property: "stylesheet", href: "styles.css" },
    { foo: "bar" },
    { foo: "bar" },
  ];
  parser.parseSubstrings = [
    '<parse foo="bar">\r\n' +
      "      <div>\r\n" +
      '        <parse baz="hey"></parse>\r\n' +
      "      </div>\r\n" +
      "      <div>\r\n" +
      '        <parse baz="hoy"></parse>\r\n' +
      "      </div>\r\n" +
      "    </parse>",
    '<parse property="stylesheet" href="styles.css"></parse>',
    '<parse foo="bar"/>',
    '<parse foo="bar"/>',
  ];
  parser.parseIndexCouples = [
    [287, 441],
    [792, 846],
    [853, 870],
    [887, 904],
  ];
  parser.resultMaker()
  expect(parser.results).toStrictEqual([
    {
      raw:
        '<parse foo="bar">\r\n' +
        "      <div>\r\n" +
        '        <parse baz="hey"></parse>\r\n' +
        "      </div>\r\n" +
        "      <div>\r\n" +
        '        <parse baz="hoy"></parse>\r\n' +
        "      </div>\r\n" +
        "    </parse>",
      properties: { foo: "bar" },
      from: 287,
      to: 441,
    },
    {
      raw: '<parse property="stylesheet" href="styles.css"></parse>',
      properties: { property: "stylesheet", href: "styles.css" },
      from: 792,
      to: 846,
    },
    {
      raw: '<parse foo="bar"/>',
      properties: { foo: "bar" },
      from: 853,
      to: 870,
    },
    {
      raw: '<parse foo="bar"/>',
      properties: { foo: "bar" },
      from: 887,
      to: 904,
    },
  ]);
  parser = new Parser()
  parser.parseSubstrings = ["<parse></parse>"]
  parser.propertiesArr = [""]
  parser.parseIndexCouples = [[0, 14]]
  parser.resultMaker()
  expect(parser.results).toStrictEqual([
      { raw: "<parse></parse>",
        properties: [],
        from: 0,
        to: 14
      },
  ]);
  parser = new Parser()
  parser.propertiesArr = ["",""]
  parser.parseSubstrings = ["<parse></parse>"]
  parser.parseIndexCouples = [[0, 14]]
  parser.resultMaker()
  expect(parser.results).toStrictEqual([
    { raw: "Error during the parsing", properties: [], from: [], to: [] }
  ]);
});
//======================================================================================================================
