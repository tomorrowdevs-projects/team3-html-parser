const parserTest = require("./parser");

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
