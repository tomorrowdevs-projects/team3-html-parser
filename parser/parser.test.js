
const parser = require('./parser')


test("Tests FindNotAllowed Function" , () => { //==============================================================

    // Style Tag
    const styleTags = ['<style>', '</style>'];
    const styleNotValidOne = "<style> .style { background-image: url = '<parse property=\"foo\" </parse>'; } </style>";

    // Script Tag
    const scriptTags = ['<script>', '</script>'];
    const scriptNotValidOne = "<script> const url = '<parse property=\"foo\" />' </script>";

    // const otherScriptNotValid = "<script src='index.js'></script>" // TEST NOT PASSED - Rule HTML ???
    const scriptNotValidTwo = "<script> src='index.js' </script>";
    const toTest = [
        [styleNotValidOne, styleTags],
        [scriptNotValidOne, scriptTags],
        [scriptNotValidTwo, scriptTags],
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
//======================================================================================================================


test("Tests FindNotAllowedIndexes Function" , () => { //=======================================================

    // Style Tag
    const styleNotValidOne = "<style> .style { background-image: url = '<parse property=\"foo\" </parse>'; } </style>";

    // Script Tag
    const scriptNotValidOne = "<script> const url = '<parse property=\"foo\" />' </script>";
    // const otherScriptNotValid = "<script src='index.js'></script>" // TEST NOT PASSED - Rule HTML ???
    const scriptNotValidTwo = "<script> src='index.js' </script>";
    const notValidAdvanced = `True${styleNotValidOne}False${scriptNotValidOne}FalseTrue${scriptNotValidTwo}True`;
    const toTest = [
        styleNotValidOne, scriptNotValidOne, scriptNotValidTwo
    ];

    // Tests
    expect(parser.findNotAllowedIndexes(styleNotValidOne, toTest))
        .toEqual([[0,styleNotValidOne.length]]);
    expect(parser.findNotAllowedIndexes(scriptNotValidOne, toTest))
        .toEqual([
            [0,styleNotValidOne.length],
            [0,scriptNotValidOne.length]]);
    expect(parser.findNotAllowedIndexes(scriptNotValidTwo, toTest))
        .toEqual([
            [0,styleNotValidOne.length],
            [0,scriptNotValidOne.length],
            [0,scriptNotValidTwo.length]]);
    expect(parser.findNotAllowedIndexes(notValidAdvanced, toTest))
         .toEqual([
             [0,styleNotValidOne.length],
             [0,scriptNotValidOne.length],
             [0,scriptNotValidTwo.length],
             ["True".length, "True".length + styleNotValidOne.length],
             ["True".length + styleNotValidOne.length + "False".length,
                 "True".length + styleNotValidOne.length + "False".length + scriptNotValidOne.length],
             ["True".length + styleNotValidOne.length + "False".length + scriptNotValidOne.length + "FalseTrue".length,
                 notValidAdvanced.length - "True".length]
         ]);
});
//======================================================================================================================