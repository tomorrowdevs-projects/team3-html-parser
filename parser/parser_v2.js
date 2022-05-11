const fs = require('fs');
const propExtract = require("./prop_extract");

// status checkers ===========================================================
// bool to check if we are inside an html comment
let inHtmlComment = false
// bool to check if we are inside an invalid tag
let inInvalidTag = false
// canParse bool is used to check if we are in a valid parse tag
let canParse = true
// parseMode means that we have found a open parse tag and we have to search the closing tag
let parseMode = false
// selfClosing means that we are searching for a /> that closes the parse tag
let selfClosing = true
// bool to check if we are inside a string
let inString = false
// ===========================================================================

// array of parse substrings
const parseSubstrings = []
// array of the last valid open parse tag index found
const openParseIndex = []
// array where parse index couples will be stored
const parseIndexCouples = []
// array of indexes of <!--# tags
const openCommentIndex = []
// array of parse comments starting and ending indexes in couples ex: [[50,78], [10,22]]
const commentIndexCouples = []
// array of parse comments substrings that need to be validated
const commentSubstrings = []
// counter for ' characters
let apexCounter = 0
// counter for " characters
let quotationCounter = 0

function openFile(filename) {
    try {
        return fs.readFileSync(filename, {
            encoding: "utf-8"
        });
    } catch (error) {
        console.error(`Got an error trying to read the file: ${error.message}`);
    }
}

function parser_V2(htmlString) {
    let i = 0
    let z = 0
    while (i < htmlString.length) {
        canParse = (inHtmlComment || inString || inInvalidTag) ? false : true
        switch (text[i]) {
            case "/" && parseMode && canParse && selfClosing && text[i + 1] == ">":
                if (openParseIndex.length == 1) {
                    parseSubstrings.push(text.substring(openParseIndex[0], i + 2));
                    parseIndexCouples.push([openParseIndex[0], i + 1])
                }
                openParseIndex.pop()
                parseMode = false;
            case ">" && parseMode && canParse:
                console.log("selfClosing off")
                selfClosing = false
            case "-":
                z = checkClosingComment(htmlString, i)
                i = z
            case "/":
                z = matchClosingTags(htmlString, i)
                i = z
            case "<":
                z = matchOpeningTags(htmlString, i)
                i = z
            case "\'":
                // currently this function doesn't work
                // checkApex()
            case "\"":
                // currently this function doesn't work
                // checkQuotation()

        }
        console.log(i)
        i++
    }
}

function matchOpeningTags(text, counter) {
    if (text.substring(counter, counter + 6) === "<parse" && canParse) {
        console.log("parse")
        if (!parseMode) {
            parseMode = true
            selfClosing = true
        }
        openParseIndex.push(counter)
        return counter + 5
    } else if (text.substring(counter, counter + 6) === "<style") {
        console.log("style")
        inInvalidTag = true
        return counter + 5
    } else if ((text.substring(counter, counter + 7) === "<script")) {
        console.log("script")
        inInvalidTag = true
        return counter + 6
    } else if (text.substring(counter, counter + 4) === "<!--") {
        if (text[counter + 4] === "#") {
            console.log("parse comment")
            openCommentIndex.push(counter)
            return counter + 4
        } else {
            console.log("html comment")
            inHtmlComment = true
            return counter + 3
        }
    } else {
        return counter
    }

}

function matchClosingTags(text, counter) {
    if (text.substring(counter, counter + 7) === "/parse>" && canParse && parseMode) {
        console.log("closing parse")
        if (openParseIndex.length == 1) {
            parseMode = false
            parseSubstrings.push(text.substring(openParseIndex[0], counter + 7))
            parseIndexCouples.push([openParseIndex[0], counter + 6])
            openParseIndex.pop()
        }
        openParseIndex.pop()
        return counter + 6

    } else if (text.substring(counter, counter + 7) === "/style>") {
        console.log("closing style")
        inInvalidTag = false
        return counter + 6

    } else if ((text.substring(counter, counter + 8) === "/script>")) {
        console.log("closing script")
        inInvalidTag = false
        return counter + 7

    } else {
        return counter
    }

}

// TODO: this following two functions dont' work properly
function checkApex() {
    if (apexCounter == 0) {
        apexCounter++
        inString = true
    } else {
        apexCounter--
        if (apexCounter == 0 && quotationCounter == 0) {
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


function checkClosingComment(text, counter) {
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

/* this function verifies if a comment string is valid, it means that we can have only parse tags 
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
// THIS PART IS ONLY TO TEST IF CODE WORKS ======================================================
const text = openFile("../files/test.html")
parser_V2(text)
// console.log("parse substrings", parseSubstrings)
// console.log("parse index couples: ", parseIndexCouples)
const parseProps = propExtract.extractParseProp(parseSubstrings)
// console.log("Parse props: ", parseProps)
console.log()
const results = propExtract.resultMaker(parseProps, parseSubstrings, parseIndexCouples)
console.log("results: ", results)
// ==============================================================================================

// TODO:(1) the case where style have a nested script tag or viceversa is not verified / working
// TODO:(2) check if parse comment is valid, see requirements

module.exports = {}