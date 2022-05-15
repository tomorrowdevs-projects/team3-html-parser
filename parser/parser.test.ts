const parserTest = require("./parser");
const propExtractTest = require("./prop_extract");


test("Tests ParserMain Function", () => {
  //====================================================================================================================
  const fileName = './files/sample_for_tests.html';
  expect(parserTest.parserMain(fileName)).toStrictEqual(
      [
        {
          raw: '<parse foo="bar">\r\n' +
              '      <div>\r\n' +
              '        <parse baz="hey"></parse>\r\n' +
              '      </div>\r\n' +
              '      <div>\r\n' +
              '        <parse baz="hoy"></parse>\r\n' +
              '      </div>\r\n' +
              '    </parse>',
          properties: { foo: 'bar' },
          from: 287,
          to: 441
        },
        {
          raw: '<parse property="stylesheet" href="styles.css"></parse>',
          properties: { property: 'stylesheet', href: 'styles.css' },
          from: 792,
          to: 846
        },
        {
          raw: '<parse foo="bar"/>',
          properties: { foo: 'bar' },
          from: 853,
          to: 870
        },
        {
          raw: '<parse foo="bar"/>',
          properties: { foo: 'bar' },
          from: 887,
          to: 904
        }
      ]
  );
  const fileNameError = 'Error';
  expect(parserTest.parserMain(fileNameError))
      .toStrictEqual([{ raw: 'Invalid Filename', properties: [], from: [], to: [] }])
});
//======================================================================================================================


test("Tests matchOpeningTags Function", () => {
  //====================================================================================================================
  expect(parserTest.matchOpeningTags("<parse ", 0)).toBe(5);
  expect(parserTest.matchOpeningTags("<parse ", -5)).toBe(-5);
  expect(parserTest.matchOpeningTags("<parse ", 1)).toBe(1);
  expect(parserTest.matchOpeningTags("", 0)).toBe(0);
  expect(parserTest.matchOpeningTags("<style", 0)).toBe(5);
  expect(parserTest.matchOpeningTags("<script", 0)).toBe(6);
  expect(parserTest.matchOpeningTags("<!--", 0)).toBe(3);
  expect(parserTest.matchOpeningTags("<!--#", 0)).toBe(4);
});
//======================================================================================================================

test("Tests matchClosingTags Function", () => {
  //====================================================================================================================
  expect(parserTest.matchClosingTags("/parse> ", 0)).toBe(6);
  expect(parserTest.matchClosingTags("/parse> ", -5)).toBe(-5);
  expect(parserTest.matchClosingTags("/parse> ", 1)).toBe(1);
  expect(parserTest.matchClosingTags("", 0)).toBe(0);
  expect(parserTest.matchClosingTags("/style>", 0)).toBe(6);
  expect(parserTest.matchClosingTags("/script>", 0)).toBe(7);
});
//======================================================================================================================

test("Tests checkClosingComment Function", () => {
  //====================================================================================================================
  expect(parserTest.checkClosingComment("-->", -5)).toBe(-5);
  expect(parserTest.checkClosingComment("", 0)).toBe(0);
  expect(parserTest.checkClosingComment("-->", 0)).toBe(2);
});
//======================================================================================================================

test("Tests checkString Function", () => {
  //====================================================================================================================
  expect(parserTest.checkString(0, 0)).toBe(1);
  expect(parserTest.checkString(1, 0)).toBe(0);
  expect(parserTest.checkString(-1, 0)).toBe(-2);
  expect(parserTest.checkString(0, 1)).toBe(0);
  expect(parserTest.checkString(1, 1)).toBe(0);
});
//======================================================================================================================


test("Tests extractParseProp Function", () => {
  //====================================================================================================================
  const parseSubstrings = [
    '<parse foo="bar">\r\n' +
    '      <div>\r\n' +
    '        <parse baz="hey"></parse>\r\n' +
    '      </div>\r\n' +
    '      <div>\r\n' +
    '        <parse baz="hoy"></parse>\r\n' +
    '      </div>\r\n' +
    '    </parse>',
    '<parse property="stylesheet" href="styles.css"></parse>',
    '<parse foo="bar"/>',
    '<parse foo="bar"/>'
  ]
  expect(propExtractTest.extractParseProp(parseSubstrings)).toStrictEqual(
  [
    { foo: 'bar' },
    { property: 'stylesheet', href: 'styles.css' },
    { foo: 'bar' },
    { foo: 'bar' }
  ])
  expect(propExtractTest.extractParseProp(["<parse></parse>"])).toStrictEqual([''])
  expect(propExtractTest.extractParseProp(["<parse ></parse>"])).toStrictEqual([''])
});


test("Tests ResultMaker Function", () => {
  //====================================================================================================================
  const parseProps =  [{ foo: 'bar' },{ property: 'stylesheet', href: 'styles.css' }, { foo: 'bar' }, { foo: 'bar' }]
  const parseSubstrings = [
    '<parse foo="bar">\r\n' +
    '      <div>\r\n' +
    '        <parse baz="hey"></parse>\r\n' +
    '      </div>\r\n' +
    '      <div>\r\n' +
    '        <parse baz="hoy"></parse>\r\n' +
    '      </div>\r\n' +
    '    </parse>',
    '<parse property="stylesheet" href="styles.css"></parse>',
    '<parse foo="bar"/>',
    '<parse foo="bar"/>'
  ]
  const parseIndexCouples = [ [ 287, 441 ], [ 792, 846 ], [ 853, 870 ], [ 887, 904 ] ]
  expect(propExtractTest.resultMaker(parseProps, parseSubstrings, parseIndexCouples)).toStrictEqual(
      [
        {
          raw: '<parse foo="bar">\r\n' +
              '      <div>\r\n' +
              '        <parse baz="hey"></parse>\r\n' +
              '      </div>\r\n' +
              '      <div>\r\n' +
              '        <parse baz="hoy"></parse>\r\n' +
              '      </div>\r\n' +
              '    </parse>',
          properties: { foo: 'bar' },
          from: 287,
          to: 441
        },
        {
          raw: '<parse property="stylesheet" href="styles.css"></parse>',
          properties: { property: 'stylesheet', href: 'styles.css' },
          from: 792,
          to: 846
        },
        {
          raw: '<parse foo="bar"/>',
          properties: { foo: 'bar' },
          from: 853,
          to: 870
        },
        {
          raw: '<parse foo="bar"/>',
          properties: { foo: 'bar' },
          from: 887,
          to: 904
        }
      ]
  )
  expect(propExtractTest.resultMaker([''], ['<parse></parse>'], [[ 0, 14 ]]))
      .toStrictEqual([{ raw: '<parse></parse>', properties: [], from: 0, to: 14 }]
      )
});
//======================================================================================================================

