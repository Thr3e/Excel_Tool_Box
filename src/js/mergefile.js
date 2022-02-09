import $ from 'jquery';

import FileDownload from './fileDownload'
import Tool from './mathTool'

class MergeFile {
  constructor(reader) {
    this.reader = reader;
    $('#mergeBtn').on('click', () => { this.mergeData() })
  }

  mergeData() {
    if (!this.reader.effectData) {
      alert("请输入有效数据起始行数");
      return;
    }
    if (!this.reader.fileValue) {
      alert("请上传文件");
      return;
    }

    const effectData = this.reader.effectData;
    const fileValue = this.reader.fileValue;

    const resSheet = {};
    const lineIdx = effectData * 1;
    let merges = [];
    let lastEndLine = 0;
    try {
      for (const key in fileValue.Sheets) {
        if (Object.hasOwnProperty.call(fileValue.Sheets, key)) {
          const sheet = fileValue.Sheets[key];
          const [line, row] = Tool.getLineAndRow(sheet['!ref'], lineIdx);
          if (!lastEndLine) {
            resSheet['!margins'] = sheet['!margins'];
            resSheet['!rows'] = sheet['!rows'];
            resSheet["!ref"] = line[0] + '0:' + line[line.length - 1];
            line.forEach(l => {
              for (let i = 0; i < lineIdx; i++) {
                resSheet[l + i] = sheet[l + i];
              }
            })
            resSheet['!merges'] = [];
            sheet['!merges'].forEach((obj) => {
              if (obj.e.r < lineIdx) {
                resSheet['!merges'].push(obj);
              }
            })
          }
          merges = merges.concat(this.getMerge(sheet['!merges'], lineIdx, lastEndLine));
          line.forEach(l => {
            row.forEach(r => {
              resSheet[l + (r + lastEndLine)] = sheet[l + r];
            })
          })
          lastEndLine += row[row.length - 1] - lineIdx + 1;
        }
      }
    } catch (e) {
      console.error(e)
    }

    resSheet["!merges"] = resSheet["!merges"].concat(merges)
    resSheet["!ref"] = resSheet["!ref"] + lastEndLine;

    const d = new FileDownload();
    d.sheet2blob(resSheet);
  }

  getMerge(merge, lineIdx, lastEndLine) {
    const res = [];
    merge.forEach(obj => {
      if (obj.e.r >= lineIdx) {
        res.push({
          e: { c: obj.e.c, r: obj.e.r + lastEndLine },
          s: { c: obj.s.c, r: obj.s.r + lastEndLine }
        })
      }
    })
    return res;
  }

}

export default MergeFile;