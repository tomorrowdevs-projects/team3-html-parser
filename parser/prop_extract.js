/* Function to extract valid properties from parseSubstrings, will return an array of parseProps =============================
   with property names as keys and prop values as values */
function extractParseProp(parseSubstrings) {

    const regex = /(?<key>[a-zA-Z]+)=["|'](?<val>[^"']*)['|"]/gm
    const propertiesArr = [];

    parseSubstrings.forEach(str => {

        const start = str.indexOf("<parse ") + "<parse ".length;
        const end = str.indexOf(">");

        let cleanStr = str.substring(start, end);

        if (cleanStr === "") {
            cleanStr = null;
            propertiesArr.push(cleanStr);
        } else {
            const propertiesObject = {};
            let match = regex.exec(cleanStr);

            do {
                propertiesObject[match.groups.key] = (match.groups.val !== "") ? match.groups.val : null
            } while ((match = regex.exec(cleanStr)) !== null)

            propertiesArr.push(propertiesObject);
        }
    });

    return propertiesArr;
}
//======================================================================================================================


// This function is used to generate the results array =================================================================
function resultMaker(parseProps, parseSubstrings, parseIndexCouples) {

    const results = [];

    // TODO: check if length of the 3 arrays is equal, otherwise something is missing

    for (let i = 0; i < parseSubstrings.length; i++) {
        results.push({
            "raw": parseSubstrings[i],
            "properties": parseProps[i] ? parseProps[i] : [],
            "from": parseIndexCouples[i][0],
            "to": parseIndexCouples[i][1],
        });
    }

    return results;
}
//======================================================================================================================




module.exports = {
    extractParseProp,
    resultMaker
}