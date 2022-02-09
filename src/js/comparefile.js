import $ from 'jquery';

import Tool from './mathTool'
import FileDownload from './fileDownload'

class CompareFile {

    constructor(fReader1, fReader2) {
        this.fReader1 = fReader1;
        this.fReader2 = fReader2;
        this.sheet = undefined;
        $('#compareBtn').on('click', () => { this.compareData() })
    }

    compareData() {
        const data1 = this.getDatabyLine(this.fReader1);
        const data2 = this.getDatabyLine(this.fReader2);
        const AOA = this.compare(data1, data2);
        AOA.unshift(['对比项', '第一个文件总数', '第二个文件总数', '第一个文件差异数据信息', '第二个文件差异数据信息'])
        const d = new FileDownload();
        this.sheet = d.AOA2Sheet(AOA);
        d.sheet2blob(this.sheet);
        // this.loadDiffTableHtml(d.AOA2Html(AOA));
    }

    getDatabyLine(reader) {
        if (!reader.effectData) {
            alert("请输入有效数据起始行数");
            return;
        }
        if (!reader.effectLine) {
            alert("请输入对比数据列数");
            return;
        }
        if (!reader.compareLine) {
            alert("请输入其他对比数据列数");
            return;
        }
        if (!reader.fileValue) {
            alert("请上传文件");
            return;
        }
        
        const effectData = reader.effectData;
        const effectLine = reader.effectLine;
        const fileValue = reader.fileValue;
        const compareLine = reader.compareLine.split(" ");

        const res = {};
        const lineIdx = effectData * 1;
        try {
            for (const key in fileValue.Sheets) {
                if (Object.hasOwnProperty.call(fileValue.Sheets, key)) {
                    const sheet = fileValue.Sheets[key];
                    const [line, row] = Tool.getLineAndRow(sheet['!ref'], lineIdx);
                    row.forEach(r => {
                        if (!sheet[effectLine + r]) return;
                        const fileData = sheet[effectLine + r].w;
                        if(!res[fileData]) {
                            res[fileData] = [];
                        }
                        const data = {
                            info: key + ": " + effectLine + r
                        }
                        compareLine.forEach((l, idx) => {
                            if (line.some(c => c === l)) {
                                data['key'] += (sheet[l + r] ? sheet[l + r].w : "").trim();
                            } else {
                                alert('列数读取错误');
                                return;
                            }
                        })
                        res[fileData].push(data);
                    })
                }
            }
        } catch (e) {
            console.error(e)
        }
        return res;
    }

    compare(d1, d2) {
        const diffAOA = [];
        for (const key in d1) {
            if (Object.hasOwnProperty.call(d1, key)) {
                const res = [key];
                const arr1 = d1[key] || [];
                const arr2 = d2[key] || [];
                res.push(arr1.length, arr2.length, ...this.compareArr(arr1, arr2));
                if (Object.hasOwnProperty.call(d2, key)) {
                    delete d2[key];
                }
                diffAOA.push(res);
            }
        }
        for (const key in d2) {
            if (Object.hasOwnProperty.call(d2, key)) {
                const arr2 = d2[key] || [];
                const res = [
                    key,
                    0,
                    arr2.length,
                    '',
                    arr2.map(item => item.info).join(';')
                ];
                diffAOA.push(res)
            }
        }
        return diffAOA;
    }
    compareArr(a1, a2) {
        const res = [[], []];
        a1.forEach(item1 => {
            const a2Idx = a2.findIndex(item2 => item2.key === item1.key);
            if (a2Idx >= 0) {
                a2.splice(a2Idx, 1);
            } else {
                res[0].push(item1.info);
            }
        })
        if (a2.length > 0) {
            a2.forEach(item => {
                res[1].push(item.info);
            })
        }
        return res.map(r => r.join(';'));
    }

    loadDiffTableHtml(html) {
        debugger;
    }

}

export default CompareFile;