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

// ParseMode means that we have found a open parse tag and we have to search the closing tag
let inParse = false

// SelfClosing means that we are searching for a /> that closes the parse tag
let selfClosing = true

//======================================================================================================================

// Array of parse substrings
const parseSubstrings = []

// Array of the last valid open parse tag index found
const openParseIndex = []

// Array where parse index couples will be stored
const parseIndexCouples = []

// Array of indexes of <!--# tags
const openCommentIndex = []

// Array of parse comments starting and ending indexes in couples ex: [[50,78], [10,22]]
const commentIndexCouples = []

// Array of parse comments substrings that need to be validated
const commentSubstrings = []

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

        // If true ve can parse
        canParse = inHtmlComment || inString || inInvalidTag

        switch (htmlString[i]) {

            // Open Tag
            case "<":
                // Counter
                z = matchOpeningTags(htmlString, i)
                // Counter Updated (if tag found) or Not Updated (tag not found)
                i = z
                break;

            // Closing tag Parse
            case "/" && inParse && canParse && selfClosing && htmlString[i + 1] === ">":
                if (openParseIndex.length === 1) {
                    parseSubstrings.push(htmlString.substring(openParseIndex[0], i + 2));
                    parseIndexCouples.push([openParseIndex[0], i + 1])
                    console.log(parseSubstrings, parseIndexCouples)
                }
                openParseIndex.pop()
                inParse = false
                break;

            // Not Self Closing tag Parse
            case ">" && inParse && canParse:
                console.log("selfClosing off")
                selfClosing = false
                break;

            case "-":
                z = checkClosingComment(htmlString, i)
                i = z
                break;

            case "/":
                z = matchClosingTags(htmlString, i)
                i = z
                break;

            case "\'":
                // currently this function doesn't work
                // checkApex()

            case "\"":

                // currently this function doesn't work
                // checkQuotation()

        }
        //console.log(i)
        i++
    }
}
//======================================================================================================================



function matchOpeningTags(htmlString, counter) { //===========================================================================

    // Tag PARSE
    if (htmlString.substring(counter, counter + 6) === "<parse" && canParse) {
        console.log("parse")
        if (!inParse) {
            inParse = true
            selfClosing = true
        }
        openParseIndex.push(counter)
        return counter + 5
    }
    // Tag STYLE
    else if (htmlString.substring(counter, counter + 6) === "<style") {
        console.log("style")
        inInvalidTag = true
        return counter + 5
    }
    // Tag SCRIPT
    else if ((htmlString.substring(counter, counter + 7) === "<script")) {
        console.log("script")
        inInvalidTag = true
        return counter + 6
    }
    // COMMENT
    else if (htmlString.substring(counter, counter + 4) === "<!--") {
        if (htmlString[counter + 4] === "#") {
            console.log("parse comment")
            openCommentIndex.push(counter)
            return counter + 4
        }
        else {
            console.log("html comment")
            inHtmlComment = true
            return counter + 3
        }
    }
    // No Tag found
    else {
        return counter
    }
}
//======================================================================================================================



function matchClosingTags(htmlString, counter) { //===========================================================================

    // Tag /PARSE
    if (htmlString.substring(counter, counter + 7) === "/parse>" && canParse && inParse) {
        console.log("closing parse")

        if (openParseIndex.length === 1) {
            inParse = false
            parseSubstrings.push(htmlString.substring(openParseIndex[0], counter + 7))
            parseIndexCouples.push([openParseIndex[0], counter + 6])
            openParseIndex.pop()
        }
        openParseIndex.pop()
        return counter + 6

    }
    // Tag /STYLE
    else if (htmlString.substring(counter, counter + 7) === "/style>") {
        console.log("closing style")
        inInvalidTag = false
        return counter + 6

    }
    // Tag /SCRIPT
    else if ((htmlString.substring(counter, counter + 8) === "/script>")) {
        console.log("closing script")
        inInvalidTag = false
        return counter + 7

    }
    else {
        return counter
    }
}
//======================================================================================================================



// TODO: this following two functions dont' work properly
function checkApex() {
    if (apexCounter === 0) {
        apexCounter++
        inString = true
    } else {
        apexCounter--
        if (apexCounter === 0 && quotationCounter === 0) {
            inString = false
        }
    }
}



function checkQuotation() {
    if (quotationCounter === 0) {
        quotationCounter++
        inString = true
    } else {
        quotationCounter--
        if (quotationCounter === 0 && apexCounter === 0) {
            inString = false
        }
    }
}


function checkClosingComment(text, counter) { //========================================================================
    if (text.substring(counter, counter + 3) === "-->") {
        console.log("closing comment")
        if (inHtmlComment) {
            inHtmlComment = false
        } else if (commentIndexCouples.length === 1) {
            commentSubstrings.push(text.substring(openCommentIndex[0], counter + 3))
            commentIndexCouples.push(openCommentIndex[0], counter + 2)
            openCommentIndex.pop()
        }
        return counter + 2
    }
    return counter
}
//======================================================================================================================



/* This function verifies if a comment string is valid, it means that we can have only parse tags ======================
    with eventually other tags nested inside */
function verifyComment(parseComments) {
    parseComments.forEach(comment => {
        /* here we have to remove all the <parse> parts and check if there are any other types of tags remaining,
        if, for example, there is a <div> remaining the comment is invalid */

        cleanComment = comment.replace("<!--#", "")

        // here we delete new line characters and spaces from the string
        cleanComment = cleanComment.replace(/\r?\n|\r| /g, "").trim()

        if (cleanComment.startsWith("<parse")) {
            cleanComment = cleanComment.replace("-->", "")
            if (cleanComment.endsWith("</parse>")) {
                // here we have a valid  parse comment
                console.log("Valid comment", comment)
            } else if (cleanComment.endsWith("/>")) {
                // this is the case where it ends with />
                // TODO: check if "/>"" is the closing tag of "<parse" and validate the comment
            } else {
                throw Error("Error! Comment ends with an invalid tag")
            }
        } else {
            // if comment doesn't start with <parse tag it's and invalid comment
            throw ("Error! Comment starts with an invalid tag")
        }
    });
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



// THIS PART IS ONLY TO TEST IF CODE WORKS =============================================================================
//const text = openFile("../files/test.html")
//parser_V2(text)
// console.log("parse substrings", parseSubstrings)
// console.log("parse index couples: ", parseIndexCouples)
const parseProps = propExtract.extractParseProp(parseSubstrings)
// console.log("Parse props: ", parseProps)
//console.log()
const results = propExtract.resultMaker(parseProps, parseSubstrings, parseIndexCouples)
console.log("results: ", results)
// ==============================================================================================

// TODO:(1) the case where style have a nested script tag or viceversa is not verified / working
// TODO:(2) check if parse comment is valid, see requirements

module.exports = {
    parser_V2
}