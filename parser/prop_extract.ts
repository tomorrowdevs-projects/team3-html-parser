/* Function to extract valid properties from parseSubstrings, will return an array of parseProps =============================
   with property names as keys and prop values as values */
function extractParseProp(parseSubstrings: string[]) {
  const regex = /(?<key>[a-zA-Z]+)=["](?<val>[^"]*)["]/gm;
  const propertiesArr: {}[] = [];

  type propertiesObjectType = {
    [propertyName: string]: string | null;
  };

  parseSubstrings.forEach((str) => {
    const start = str.indexOf("<parse ") + "<parse ".length;
    const end = str.indexOf(">");

    let cleanStr = str.substring(start, end);

    if (cleanStr === "") {
      // cleanStr = null;
      propertiesArr.push(cleanStr);
    } else {
      const propertiesObject: propertiesObjectType = {};
      let match = regex.exec(cleanStr);
      do {
        // TODO: Fix this part to work in typescript
        let propName: string = "";
        let propValue: string = "";
        if (match !== null && match.groups !== null) {
          if (match.groups !== undefined) {
            propName = match.groups.key;
            propValue = match.groups.val;
            propertiesObject[propName] = propValue;
          }
        }
      } while ((match = regex.exec(cleanStr)) !== null);

      propertiesArr.push(propertiesObject);
    }
  });

  return propertiesArr;
}
//======================================================================================================================

// This function is used to generate the results array =================================================================
function resultMaker(
  parseProps: {}[],
  parseSubstrings: string[],
  parseIndexCouples: number[][]
) {
  const results = [];

  // TODO: check if length of the 3 arrays is equal, otherwise something is missing

  if (parseProps.length !== parseSubstrings.length && parseIndexCouples.length !== parseIndexCouples.length){
    return console.error(`Error the arrays are not equal`);
    
  }

  for (let i = 0; i < parseSubstrings.length; i++) {
    results.push({
      raw: parseSubstrings[i],
      properties: parseProps[i] ? parseProps[i] : [],
      from: parseIndexCouples[i][0],
      to: parseIndexCouples[i][1],
    });
  }

  return results;
}
//======================================================================================================================

module.exports = {
  extractParseProp,
  resultMaker,
};
