class Tool {
    constructor() {

        this.refLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    }

    static getLineAndRow(ref, rowStart) {
        const tool = new Tool();
        const line = tool.getLine(ref.match(/[A-Z]+/g));
        const row = tool.getRow(ref.match(/[0-9]+/g), rowStart);
        return [line, row];
    }

    getRow([start, end], rowStart) {
        const res = [];
        start *= 1;
        end *= 1;
        if (rowStart > start) {
            start = rowStart;
        }
        for (let i = start; i < end; i++) {
            res.push(i);
        }
        return res
    }

    getLine([start, end]) {
        const res = [start];
        let idx = this.get26ToNum(start);
        while (this.getNumTo26(idx) !== end) {
            idx++;
            res.push(this.getNumTo26(idx));
        }
        return res;
    }

    get26ToNum(letter) {
        let count = 0;
        const letterIdxs = [];
        letter.split('').forEach((c) => {
            letterIdxs.push(this.refLabels.indexOf(c) + 1);
        })
        letterIdxs.reverse().forEach((num, idx) => {
            count += num * Math.pow(this.refLabels.length, idx);
        })
        return count - 1;
    }

    getNumTo26(num) {
        let count = num % this.refLabels.length;
        if (num === count) {
            return this.refLabels[count];
        } else {
            return this.getNumTo26((num - count) / this.refLabels.length - 1) + this.refLabels[count];
        }
    }
}

export default Tool