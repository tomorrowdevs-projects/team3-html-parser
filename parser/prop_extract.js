

// test string used as input for extractParseProp function
// const parseStrings = [
//     '<parse baz="hey"> </parse>',
//     '<parse foo="bar">\n' +
//     '    <div>\n' +
//     '        <parse baz="hey" </parse>\n' +
//     '    </div>\n' +
//     '    <div>\n' +
//     '        <parse baz="hoy" </parse>\n' +
//     '    </div>\n' +
//     '</parse>',
//     '<parse property="stylesheet" href=""></parse>',
//     '<parse> foo bar </parse>'
// ]


/* Function to extract valid properties from parseStrings, will return an array of objects =============================
   with property names as keys and prop values as values */
function extractParseProp(parseStrings) {

    const regex = /(?<key>[a-zA-Z]+)=["|'](?<val>[^"']*)['|"]/gm
    const propertiesArr = [];

    // TODO: the following part is incomplete
    parseStrings.forEach(str => {

        const start = str.indexOf("<parse ") + "<parse ".length;
        const end = str.indexOf(">");

        let cleanStr = str.substring(start, end);

        if (cleanStr === "") {
            cleanStr = null;
            propertiesArr.push(cleanStr);
        } else {
            // match = cleanStr.match(regex)
            const resObj = {};
            let match = regex.exec(cleanStr);

            do {
                // console.log(`Match ${match.groups.key} ${match.groups.val}`);
                resObj[match.groups.key] = (match.groups.val !== "") ? match.groups.val : null
            } while ((match = regex.exec(cleanStr)) !== null)

            propertiesArr.push(resObj);
        }
    });

    return propertiesArr;
}
//======================================================================================================================


// console.log(`Input: \n`, parseStrings)
// props = extractParseProp(parseStrings)
// console.log(`Output: \n`, props)


// This function is used to generate the results array =================================================================
function resultMaker(objects, strings, intervals) {

    const results = [];

    // TODO: check if length of the 3 arrays is equal, otherwise something is missing
    for (let i = 0; i < strings.length; i++) {
        results.push({
            "raw": strings[i],
            "properties": (objects[i] !== null) ? [objects[i]] : [],
            "from": intervals[i][0],
            "to": intervals[i][1],
        });
    }

    return results;
}
//======================================================================================================================




module.exports = {
    extractParseProp,
    resultMaker
}