

class parserClass {
    private fs = require('fs')
    private _htmlString: string = ''

    constructor(filename : string){
        this._htmlString = this.openFile(filename)
    }

    get htmlString(): string {
        return this._htmlString;
    }

    set htmlString(contet: string) {
        this._htmlString = contet;
    }

    private openFile(filename: string): string {
        if (fs.existsSync(filename)) {
            return fs.readFileSync(fileName).toString().replace(/\r\n/gm, "\n");
        } else {
            throw new Error("Invalid Filename");
        }
    }


}