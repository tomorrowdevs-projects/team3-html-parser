const fs = require('fs');
const {
    extractParseProp,
    resultMaker
} = require("./prop_extract");

// Array of invalid tags where inside parse tags will not be valid
const notAllowed = ['<script', '<style', '<!-- '] // TODO: fix not allowed interval even if comment tag <!-- is followed by \n character
const notAllowedEnd = ['</script>', '</style>', '-->']
//opening and closing tag that we have to match
const matchTag = "<parse"
const matchEndTag = "</parse>"

// Array of starting <parse> tag indexes
let parseStack = []
// Array of closing </parse> tag indexes
let endParseStack = []

// Array of not valid string intervals
let notValid = []
// Array of intervals where tags are not valid
let notValidIndexes = []

// source file path
const file = './files/test.html';
// source file string
const text = openHtmlFile(file)
//copy of the file string
let text_copy = text.slice()

// OpenHtmlFile reads the html file and returns a string
function openHtmlFile(file) {
    try {
        const content = fs.readFileSync(file, {
            encoding: "utf-8"
        });

        // console.log(content.toString());
        return content
    } catch (error) {
        console.error(`Got an error trying to read the 
    file: ${error.message}`);
    }
}

// This function find not allowed tags and populate the notValid array with the complete tag substring
function findNotAllowed(text, startingTag, endingTag) {
    // counters for delimiting start and end of the not valid interval
    let start = 0
    let end = 0
    if (text.indexOf(startingTag) !== -1) {
        start = text.indexOf(startingTag)
        if (text.indexOf(endingTag, start) !== -1) {
            end = text.indexOf(endingTag, start) + endingTag.length
            let toRemove = text.substring(start, end)
            notValid.push(toRemove)
            // console.log(toRemove)
            text = text.replace(toRemove, "")
            return findNotAllowed(text, startingTag, endingTag)
        } else {
            throw Error("closing tag not found")
        }
    }
    return false
}

// This function finds the invalid substring in the original text and will populate the notValidIndexes
// with the invalid intervals of the original text
function findNotAllowedIndexes(text, notValid) {
    notValid.forEach(substr => {
        // console.log(substr)
        let start = text.indexOf(substr)
        let end = start + substr.length
        notValidIndexes.push([start, end])
    });
}

// This function will find valid parse tags
function findParseTag(text, matchTag, start = 0) {
    if (text.indexOf(matchTag, start) !== -1) {
        let startIndex = text.indexOf(matchTag, start)
        parseStack.push(startIndex)
        start = startIndex + matchTag.length
        return findParseTag(text, matchTag, start)
    }
    return false
}

// This function will find valid closing parse tags
function findCloseTag(text, matchEndTag, start = 0) {
    if (text.indexOf(matchEndTag, start) !== -1) {
        let endIndex = text.indexOf(matchEndTag, start) + matchEndTag.length
        endParseStack.push(endIndex)
        return findCloseTag(text, matchEndTag, start = endIndex)
    }
    return false
}

// Function to check if parse tags indexes are included in not allowed intervals
// will return only valid indexes  
function validateParseIndexes(indexes, intervals) {
    let notValids = []
    for (let i in indexes) {
        for (let y in intervals) {
            if (indexes[i] > intervals[y][0] && indexes[i] < intervals[y][1]) {
                notValids.push(indexes[i])
            }
        }
    }
    return indexes.filter(el => !notValids.includes(el))
}

// Function to match parse tags togheter
// this function return a list of couple of numbers, the first number is the index of the start of the tag and the second is the index of the end of the tag
function matchPairs(validIndexes, validClosingIndexes) {
    const pairParse = []
    for (let cdx in validClosingIndexes) {
        for (let opx in validIndexes) {
            //console.log(validIndexes)
            //console.log(validClosingIndexes)
            //console.log(validClosingIndexes[cdx])
            //console.log(validIndexes[opx])
            if (validClosingIndexes[cdx] > validIndexes[opx]) {
                pairParse[cdx] = [validIndexes[opx], validClosingIndexes[cdx]]
            } else {
                validIndexes = validIndexes.filter(el => el !== validIndexes[opx - 1])
                break
            }
        }
    }
    return pairParse
}

// This function gets rid of parse tags nested inside other parse tags
function removeChildren(pairParse) {
    const validParsePairs = []
    for (let i = 0; i < pairParse.length - 1; i++) {
        // console.log(pairParse[i + 1])
        if (pairParse[i][0] < pairParse[i + 1][0]) {
            validParsePairs.push(pairParse[i])
        }
    }
    validParsePairs.push(pairParse[pairParse.length - 1])
    return validParsePairs
}

// this function will search for parsetag intervals in text and return an array of strings of parse tags
function parseStringMaker(text, parseIntervals) {
    let parseStrings = []
    parseIntervals.forEach(elem => parseStrings.push(text.substring(elem[0], elem[1])))
    return parseStrings
}

function main() {
    for (let i = 0; i < notAllowed.length; i++) {
        findNotAllowed(text_copy, notAllowed[i], notAllowedEnd[i])
    }
    findNotAllowedIndexes(text, notValid)
    findParseTag(text, matchTag)
    findCloseTag(text, matchEndTag)
    let validIndexes = validateParseIndexes(indexes = parseStack, intervals = notValidIndexes)
    // console.log("Valid parse tags starting indexes: ", validIndexes)
    let validClosingIndexes = validateParseIndexes(indexes = endParseStack, intervals = notValidIndexes)
    // console.log("Valid parse tags closing indexes: ", validClosingIndexes)
    const pairParse = matchPairs(validIndexes, validClosingIndexes)
    // console.log(pairParse)
    const validParsePairs = removeChildren(pairParse)
    // console.log("Valid parent parse tags intervals:", validParsePairs)
    const parseStrings = parseStringMaker(text, validParsePairs)
    // console.log(parseStrings)
    const parseProps = extractParseProp(parseStrings)
    // console.log("Parse properties: ", parseProps)
    const results = resultMaker(parseProps, parseStrings, validParsePairs)
    console.dir(results, {
        depth: 4
    })
}

main()

// console.log("Invalid intervals where we shouldn't search: ", notValidIndexes)
// console.log("All starting parseTag indexes: ", parseStack)
// console.log("All closing parseTag indexes: ", endParseStack)


// TODO: (1) fix removeChildren function to work with multiple children parseTag
// TODO: (2) currently the code functions only with closing tags of this type </parse> and double quotes for properties. We should fix the rest of the requirements.
// TODO: (3) refactor code for better readability and debug