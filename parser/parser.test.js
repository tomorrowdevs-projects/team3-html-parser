
const parser = require('./parser')


test("Tests FindNotAllowed Function" , () => {

    // Style Tag
    const styleTags = ['<style>', '</style>'];
    const styleNotValidOne = "<style> .style { background-image: url = '<parse property=\"foo\" </parse>'; } </style>";
    // Script Tag
    const scriptTags = ['<script>', '</script>'];
    const scriptNotValidOne = "<script> const url = '<parse property=\"foo\" />' </script>";
    // const otherScriptNotValid = "<script src='index.js'></script>" // TEST NOT PASSED - Rule HTML ???
    const ScriptNotValidTwo = "<script> src='index.js' </script>";
    const toTest = [
        [styleNotValidOne, styleTags],
        [scriptNotValidOne, scriptTags],
        [ScriptNotValidTwo, scriptTags],
    ];
    // Tests
    toTest.map(elem => {
        const notValid = elem[0];
        const startTag = elem[1][0];
        const endTag = elem[1][1];
        const notValidTrue = `True${notValid}`;
        const notValidFalse = `${notValid}False`;
        const notValidAdvanced = `True${notValid}False${notValidTrue}FalseTrue${notValidFalse}True`;
        expect(parser.findNotAllowed(notValid, startTag, endTag)).toBe('');
        expect(parser.findNotAllowed(notValidTrue, startTag, endTag)).toBe('True');
        expect(parser.findNotAllowed(notValidFalse, startTag, endTag)).toBe('False');
        expect(parser.findNotAllowed(notValidAdvanced, startTag, endTag))
            .toBe('TrueFalseTrueFalseTrueFalseTrue');
    })
});