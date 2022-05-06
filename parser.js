const fs = require('fs'); 

const text =
    `<!DOCTYPE html>
<html lang="en">
<head>
<style>
.style {
background-image: url('<parse property="foo" </parse>');
}
</style>
<script>
const url = '<parse property="foo" />';
</script>
<meta charset="UTF-8">
<parse foo="bar">
    <div>
        <parse baz="hey" </parse>
    </div>
    <div>
        <parse baz="hoy" </parse>
    </div>
</parse>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
<title>HTML 5 Boilerplate</title>
<!--
<parse property="stylesheet" href="style.css"></parse>
-->
</head>
<body>
<parse test></parse>
<script src="index.js"></script>
</body>
</html>`

let text_copy = text.slice()

// Array of invalid tags where inside parse tags will not be valid
const notAllowed = ['<script', '<style', '<!-- ']
const notAllowedEnd = ['</script>', '</style>', '-->']
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

const file = './files/index.html';

// OpenHtmlFile reads the html file and returns a string
function openHtmlFile(file) {
  try {
    const content = fs.readFileSync(file);

    console.log(content.toString());
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
        console.log(pairParse[i + 1])
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

// function to extract valid properties from parseStrings, will return an array of objects
// with property names as keys and prop values as values
function extractProperties(parseStrings) {
    propertiesArr = []
    // TODO: the following part is incomplete
    parseStrings.forEach(str => propertiesArr.push(str))
}

function main() {
    for (let i = 0; i < notAllowed.length; i++) {
        findNotAllowed(text_copy, notAllowed[i], notAllowedEnd[i])
    }
    findNotAllowedIndexes(text, notValid)
    findParseTag(text, matchTag)
    findCloseTag(text, matchEndTag)
    let validIndexes = validateParseIndexes(indexes = parseStack, intervals = notValidIndexes)
    console.log("Valid parse tags starting indexes: ", validIndexes)
    let validClosingIndexes = validateParseIndexes(indexes = endParseStack, intervals = notValidIndexes)
    console.log("Valid parse tags closing indexes: ", validClosingIndexes)
    const pairParse = matchPairs(validIndexes, validClosingIndexes)
    const validParsePairs = removeChildren(pairParse)
    console.log(pairParse)
    console.log("Valid parent parse tags intervals:", validParsePairs)
    const parseStrings = parseStringMaker(text, validParsePairs)
    console.log(parseStrings)
}

// openHtmlFile(file)
main()
console.log("Invalid intervals where we shouldn't search: ", notValidIndexes)
// console.log("All starting parseTag indexes: ", parseStack)
// console.log("All closing parseTag indexes: ", endParseStack)


// TODO: fix removeChildren function to work with multiple children parseTag

