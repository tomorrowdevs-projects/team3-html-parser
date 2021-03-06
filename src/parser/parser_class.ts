// type of pair of index

const fs = require("fs");
type pair = [number, number];

export class Parser {
    // OBJECT Properties
    canParse: boolean;          // Bool used to check if we can Parse
    inInvalidTag: boolean;      // Bool to check if we are inside an invalid tag
    inString: boolean;          // Bool to check if we are inside a string
    inHtmlComment: boolean;     // Bool to check if we are inside an html comment
    inParseComment: boolean;    // Bool to check if we are inside a parse comment ex: <!--#
    inParse: boolean;           // In parse means that we have found a open parse tag and we have to search the closing tag
    parseSubstrings: string[];  // Array of parse substrings
    openParseIndex: number[];   // Array of the last valid open parse tag index found
    parseIndexCouples: pair[];  // Array where parse index couples will be stored
    propertiesArr: {}[];        // Array where properties/attributes of parse tags will be stored
    results: {}[];              // Array where results will be stored as objects
    apexCounter: number;        // Counter for ' characters
    quotationCounter: number;   // Counter for " characters
    counter: number;
    htmlString: string;

    // OBJECT CONSTRUCTOR
    constructor() {
        this.canParse = true;
        this.inInvalidTag = false;
        this.inString = false;
        this.inHtmlComment = false;
        this.inParseComment = false;
        this.inParse = false;
        this.parseSubstrings = [];
        this.openParseIndex = [];
        this.parseIndexCouples = [];
        this.propertiesArr = [];
        this.results = [];
        this.apexCounter = 0;
        this.quotationCounter = 0;
        this.counter = 0;
        this.htmlString = "";
    };


    openHtmlFile(fileName: string) {
        if (fs.existsSync(fileName))
            this.htmlString = fs.readFileSync(fileName, { encoding: "utf8" }).replace(/\r\n/gm, "\n");
        else
            this.results = [{ raw: "Invalid Filename", properties: [], from: [], to: [] }];
    };


    parserMain(htmlString?: string) {
        if (!this.htmlString && !htmlString) return this.results;
        else if (htmlString) this.htmlString = htmlString;

        while (this.counter < this.htmlString.length) {
            // If true we can parse
            this.canParse = !(this.inHtmlComment || this.inString || this.inInvalidTag);

            switch (this.htmlString[this.counter]) {
                // Open Tag
                case "<":
                    // Counter
                    this.matchOpeningTags();
                    if (this.counter === -1) {
                        return (this.results = [
                            {
                                raw: "Invalid Parse Comment",
                                properties: [],
                                from: [],
                                to: [],
                            },
                        ]);
                    }
                    break;

                case "/":
                    this.matchClosingTags();
                    break;

                case "'":
                    this.apexCounter = this.checkString(this.apexCounter, this.quotationCounter);
                    break;

                case '"':
                    this.quotationCounter = this.checkString(this.quotationCounter, this.apexCounter);
                    break;

                case "-":
                    this.checkClosingComment();
                    break;
            }
            this.counter++;
        }
        this.extractParseProp();
        this.resultMaker();
    };


    matchOpeningTags() {
        // Tag PARSE
        if (this.htmlString.substring(this.counter, this.counter + 6) === "<parse" && this.canParse && !this.inString) {
            if (!this.inParse) this.inParse = true;
            this.openParseIndex.push(this.counter);
            this.counter += 5;
        }
        // Tag STYLE
        else if (this.htmlString.substring(this.counter, this.counter + 6) === "<style" && !this.inString) {
            this.inInvalidTag = true;
            this.counter += 5;
        }
        // Tag SCRIPT
        else if (this.htmlString.substring(this.counter, this.counter + 7) === "<script" && !this.inString) {
            this.inInvalidTag = true;
            this.counter += 6;
        }
        // COMMENT
        else if (this.htmlString.substring(this.counter, this.counter + 4) === "<!--") {
            if (this.htmlString[this.counter + 4] === "#") {
                this.inParseComment = true;
                this.counter += 4;
            }
            else {
                this.inHtmlComment = true;
                this.counter += 3;
            }
        }
        // INVALID TAG IN PARSE COMMENT
        else if (this.inParseComment && !this.inParse) return (this.counter = -1);
    };


    matchClosingTags() {
        // Tag /PARSE
        if (this.htmlString.substring(this.counter, this.counter + 7) === "/parse>" && this.canParse && this.inParse) {
            if (this.openParseIndex.length === 1) {
                this.inParse = false;
                this.parseSubstrings.push(this.htmlString.substring(this.openParseIndex[0], this.counter + 7));
                this.parseIndexCouples.push([this.openParseIndex[0], this.counter + 6]);
            }
            this.openParseIndex.pop();
            this.counter += 6;
        }
        // Tag /STYLE
        else if (this.htmlString.substring(this.counter, this.counter + 7) === "/style>" && !this.inString) {
            this.inInvalidTag = false;
            this.counter += 6;
        }
        // Tag /SCRIPT
        else if (this.htmlString.substring(this.counter, this.counter + 8) === "/script>" && !this.inString) {
            this.inInvalidTag = false;
            this.counter += 7;
        }
        // SELF CLOSING TAG
        if (this.htmlString.substring(this.counter, this.counter + 2) === "/>" && this.canParse && this.inParse) {
            if (this.openParseIndex.length === 1) {
                this.inParse = false;
                this.parseSubstrings.push(this.htmlString.substring(this.openParseIndex[0], this.counter + 2));
                this.parseIndexCouples.push([this.openParseIndex[0], this.counter + 1]);
            }
            this.openParseIndex.pop();
            this.counter += 1;
        }
    };


    checkString(external: number, internal: number) {
        if (external === 0 && internal === 0) {
            external += 1;
            this.inString = true;
        }
        else if (external !== 0 && internal === 0) {
            external -= 1;
            this.inString = false;
        }
        else if (external !== 0 && internal !== 0) external -= 1;
        return external;
    };


    checkClosingComment() {
        if (this.htmlString.substring(this.counter, this.counter + 3) === "-->") {
            if (this.inHtmlComment && !this.inString) this.inHtmlComment = false;
            else if (this.inParseComment && !this.inString) this.inParseComment = false;
            this.counter += 2;
        }
    };


    extractParseProp() {
        /* Function to extract valid properties from parseSubstrings, will return an array of parseProps
           with property names as keys and prop values as values */
        const regex: RegExp = /(?<key>[a-zA-Z]+)=["](?<val>[^"]*)["]/gm;

        type propertiesObjectType = {
            [propertyName: string]: string | null;
        };

        this.parseSubstrings.forEach((str) => {
            const start: number = str.indexOf("<parse ") + "<parse ".length;
            const end: number = str.indexOf(">");

            let cleanStr: string = str.substring(start, end);
            const propertiesObject: propertiesObjectType = {};

            if (cleanStr !== "") {
                let match: RegExpExecArray | null;
                while ((match = regex.exec(cleanStr)) !== null && match.groups !== null && match.groups !== undefined) {
                    let propName: string = match.groups.key;
                    propertiesObject[propName] = match.groups.val;
                }
            }
            this.propertiesArr.push(propertiesObject);
        });
    };


    resultMaker() {
        // This function is used to populate the results array
        if (this.propertiesArr.length !== this.parseSubstrings.length ||
            this.parseIndexCouples.length !== this.parseIndexCouples.length) {
            return (this.results = [{ raw: "Error during the parsing", properties: [], from: 0, to: 0 }]);
        }

        for (let i = 0; i < this.parseSubstrings.length; i++) {
            const properties = [Object.keys(this.propertiesArr[i]).length !== 0 ? this.propertiesArr[i] : {}]
            this.results.push({
                raw: this.parseSubstrings[i],
                properties: properties,
                from: this.parseIndexCouples[i][0],
                to: this.parseIndexCouples[i][1],
            });
        }
    };
}
