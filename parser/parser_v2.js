const fs = require('fs');
const propExtract = require("./prop_extract");

// Status checkers =====================================================================================================

// Bool used to check if we can Parse
let canParse = true

// Bool to check if we are inside an invalid tag
let inInvalidTag = false

// Bool to check if we are inside a string
let inString = false

// Bool to check if we are inside an html comment
let inHtmlComment = false

// Bool to check if we are inside a parse comment ex: <!--#
let inParseComment = false

// In parse means that we have found a open parse tag and we have to search the closing tag
let inParse = false

//======================================================================================================================

// Array of parse substrings
const parseSubstrings = []

// Array of the last valid open parse tag index found
const openParseIndex = []

// Array where parse index couples will be stored
const parseIndexCouples = []

// Counter for ' characters
let apexCounter = 0

// Counter for " characters
let quotationCounter = 0


function parser_V2(fileName) { //=====================================================================================

    // OPEN FILE
    const htmlString = openHtmlFile(fileName)

    let i = 0;
    let z = 0;

    while (i < htmlString.length) {

        // If true we can parse 
        canParse = !(inHtmlComment || inString || inInvalidTag)

        switch (htmlString[i]) {
            // Open Tag
            case ("<"):
                // Counter
                z = matchOpeningTags(htmlString, i)
                // Counter Updated (if tag found) or Not Updated (tag not found)
                i = z
                break;

            case "/":
                z = matchClosingTags(htmlString, i)
                i = z
                break;

            case "\'":
                checkApex()
                break;

            case "\"":
                checkQuotation()
                break;

            case "-":
                z = checkClosingComment(htmlString, i)
                i = z
                break;
        }
        i++
    }
    const parseProps = propExtract.extractParseProp(parseSubstrings)
    const parseResults = propExtract.resultMaker(parseProps, parseSubstrings, parseIndexCouples)
    console.dir(parseResults, {
        depth: 5
    });
    return parseResults
}
//======================================================================================================================



function matchOpeningTags(htmlString, counter) { //===========================================================================

    // Tag PARSE
    if (htmlString.substring(counter, counter + 6) === "<parse" && canParse && !inString) {
        if (!inParse) {
            inParse = true
            selfClosing = true
        }
        openParseIndex.push(counter)
        return counter + 5
    }
    // Tag STYLE
    else if (htmlString.substring(counter, counter + 6) === "<style" && !inString) {
        inInvalidTag = true
        return counter + 5
    }
    // Tag SCRIPT
    else if ((htmlString.substring(counter, counter + 7) === "<script" && !inString)) {
        inInvalidTag = true
        return counter + 6
    }
    // COMMENT
    else if (htmlString.substring(counter, counter + 4) === "<!--") {
        if (htmlString[counter + 4] === "#") {
            inParseComment = true
            return counter + 4
        } else {
            inHtmlComment = true
            return counter + 3
        }
    }
    // INVALID TAG IN PARSE COMMENT
    else if (inParseComment && !inParse) {
        throw new Error("Invalid parse comment!");
    }
    // No Tag found
    else {
        return counter
    }
}
//======================================================================================================================


function matchClosingTags(htmlString, counter) { //=====================================================================

    // Tag /PARSE
    if (htmlString.substring(counter, counter + 7) === "/parse>" && canParse && inParse) {

        if (openParseIndex.length === 1) {
            inParse = false
            parseSubstrings.push(htmlString.substring(openParseIndex[0], counter + 7))
            parseIndexCouples.push([openParseIndex[0], counter + 6])
        }
        openParseIndex.pop()
        return counter + 6
    }
    // Tag /STYLE
    else if (htmlString.substring(counter, counter + 7) === "/style>" && !inString) {
        inInvalidTag = false
        return counter + 6
    }
    // Tag /SCRIPT
    else if ((htmlString.substring(counter, counter + 8) === "/script>" && !inString)) {
        inInvalidTag = false
        return counter + 7
    }
    // SELF CLOSING TAG
    if (htmlString.substring(counter, counter + 2) === "/>" && canParse && inParse) {

        if (openParseIndex.length === 1) {
            inParse = false
            parseSubstrings.push(htmlString.substring(openParseIndex[0], counter + 2))
            parseIndexCouples.push([openParseIndex[0], counter + 1])
        }
        openParseIndex.pop()
        return counter + 1
    } else {
        return counter
    }
}
//======================================================================================================================


function checkApex() {
    if (apexCounter === 0 && quotationCounter === 0) {
        apexCounter++
        inString = true
    } else if (apexCounter !== 0 && quotationCounter === 0) {
        apexCounter--
        inString = false
    } else if (apexCounter !== 0 && quotationCounter !== 0) {
        apexCounter--
    }
}



function checkQuotation() {
    if (quotationCounter === 0 && apexCounter === 0) {
        quotationCounter++
        inString = true
    } else if (quotationCounter !== 0 && apexCounter === 0) {
        quotationCounter--
        inString = false
    } else if (quotationCounter !== 0 && apexCounter !== 0) {
        quotationCounter--
    }
}


function checkClosingComment(text, counter) { //========================================================================
    if (text.substring(counter, counter + 3) === "-->") {
        if (inHtmlComment && !inString) {
            inHtmlComment = false
        } else if (inParseComment && !inString) {
            inParseComment = false
        }
        return counter + 2
    }
    return counter
}
//======================================================================================================================



// This function reads an html file and returns its contents ===========================================================
function openHtmlFile(filename) {
    try {
        return fs.readFileSync(filename).toString();
    } catch (error) {
        console.error(`Got an error trying to read the file: ${error.message}`);
    }
}
//======================================================================================================================


// the case where script have a nested style tag is not verified, is it valid html?

module.exports = {
    parser_V2
}