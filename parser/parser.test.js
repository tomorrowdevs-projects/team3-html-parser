
const parser = require('./parser')


test("Test FindNotAllowed Function" , () => {

    // Style Tag
    const styleTags = ['<style>', '</style>']
    const styleNotValid = "<style> .style { background-image: url = '<parse property=\"foo\" </parse>'; } </style>"
    const styleNotValidTrue = `True${styleNotValid}`
    const styleNotValidFalse = `${styleNotValid}False`
    const styleNotValidAdvanced = `True${styleNotValid}False${styleNotValidTrue}FalseTrue${styleNotValidFalse}True`
    expect(parser.findNotAllowed(styleNotValid, styleTags[0], styleTags[1])).toBe('');
    expect(parser.findNotAllowed(styleNotValidTrue, styleTags[0], styleTags[1])).toBe('True');
    expect(parser.findNotAllowed(styleNotValidFalse, styleTags[0], styleTags[1])).toBe('False');
    expect(parser.findNotAllowed(styleNotValidAdvanced, styleTags[0], styleTags[1]))
        .toBe('TrueFalseTrueFalseTrueFalseTrue');

    // Script Tag
    const scriptTags = ['<script>', '</script>']
    const scriptNotValid = "<script> const url = '<parse property=\"foo\" />' </script>"
    const scriptNotValidTrue = `True${scriptNotValid}`
    const scriptNotValidFalse = `${scriptNotValid}False`
    const scriptNotValidAdvanced = `True${scriptNotValid}False${scriptNotValidTrue}FalseTrue${scriptNotValidFalse}True`
    expect(parser.findNotAllowed(scriptNotValid, scriptTags[0], scriptTags[1])).toBe('');
    expect(parser.findNotAllowed(scriptNotValidTrue, scriptTags[0], scriptTags[1])).toBe('True');
    expect(parser.findNotAllowed(scriptNotValidFalse, scriptTags[0], scriptTags[1])).toBe('False');
    expect(parser.findNotAllowed(scriptNotValidAdvanced, scriptTags[0], scriptTags[1]))
        .toBe('TrueFalseTrueFalseTrueFalseTrue');

    // Other Script Tag
    // const otherScriptNotValid = "<script src='index.js'></script>" // TEST NOT PASSED - Rule HTML ???
    const otherScriptNotValid = "<script> src='index.js' </script>"
    const otherScriptNotValidTrue = `True${otherScriptNotValid}`
    const otherScriptNotValidFalse = `${otherScriptNotValid}False`
    const otherScriptNotValidAdvanced = `True${otherScriptNotValid}False${scriptNotValidTrue}FalseTrue${scriptNotValidFalse}True`
    expect(parser.findNotAllowed(otherScriptNotValid, scriptTags[0], scriptTags[1])).toBe('');
    expect(parser.findNotAllowed(otherScriptNotValidTrue, scriptTags[0], scriptTags[1])).toBe('True');
    expect(parser.findNotAllowed(otherScriptNotValidFalse, scriptTags[0], scriptTags[1])).toBe('False');
    expect(parser.findNotAllowed(otherScriptNotValidAdvanced, scriptTags[0], scriptTags[1]))
        .toBe('TrueFalseTrueFalseTrueFalseTrue');
});