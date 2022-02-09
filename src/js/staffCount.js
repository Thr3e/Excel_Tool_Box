import $ from 'jquery';

import FileDownload from './fileDownload'
import Tool from './mathTool'

const workTypeOrder = ['doc', 'nurse', 'phar', 'worker', 'others'];
const levelsOrder = ["level0", "level1", "level2", "level3", "level4"];
const workType = {
  doc: {
    title: "医生",
    key: "医"
  },
  nurse: {
    title: "护士",
    key: "护"
  },
  phar: {
    title: "药剂人员",
    key: "药"
  },
  worker: {
    title: "医技人员",
    key: "技"
  },
  others: {
    title: "其他技术人员",
    key: ""
  }
}
const levels = {
  level0: {
    labels: ["专业技术一级", "专业技术二级", "专业技术三级", "专业技术四级"],
    title: "正高"
  },
  level1: {
    labels: ["专业技术五级", "专业技术六级", "专业技术七级"],
    title: "副高"
  },
  level2: {
    labels: ["专业技术八级", "专业技术九级", "专业技术十级"],
    title: "中级"
  },
  level3: {
    labels: ["专业技术十一级", "专业技术十二级", "专业技术十三级"],
    title: "初级"
  },
  level4: {
    labels: [],
    title: "见习期"
  },
}

class WorkCount {
  constructor(workType) {
    this.workType = workType;
    for (const key in levels) {
      if (Object.hasOwnProperty.call(levels, key)) {
        this[key] = 0
      }
    }
  }
}

class InOutType {
  constructor(isInner) {
    this.isInner = isInner;
    for (const key in workType) {
      if (Object.hasOwnProperty.call(workType, key)) {
        const element = workType[key];
        this[key] = new WorkCount(element.title);
      }
    }
  }
}


class StaffCount {
  constructor(reader) {
    this.reader = reader;
    $('#countBtn').on('click', () => { this.countData() })
  }

  countData() {
    if (!this.reader.effectData) {
      alert("请输入有效数据起始行数");
      return;
    }
    if (!this.reader.compareLine) {
      alert("请输入关键统计数据列数");
      return;
    }
    if (!this.reader.fileValue) {
      alert("请上传文件");
      return;
    }

    const effectData = this.reader.effectData;
    const fileValue = this.reader.fileValue;
    const [workLine, inoutLine, levelLine] = this.reader.compareLine.match(/\w+/g)

    const lineIdx = effectData * 1;
    const innerStaff = new InOutType(true);
    const outterStaff = new InOutType(false);
    try {
      for (const key in fileValue.Sheets) {
        if (Object.hasOwnProperty.call(fileValue.Sheets, key)) {
          const sheet = fileValue.Sheets[key];
          const [line, row] = Tool.getLineAndRow(sheet['!ref'], lineIdx);
          if (line.indexOf(workLine) < 0 || line.indexOf(inoutLine) < 0 || line.indexOf(levelLine) < 0) {
            alert("关键统计数据列数有误，请重新输入");
            return;
          }
          row.forEach(r => {
            if (!sheet[workLine + r] || !sheet[workLine + r].w) return;
            const staff = sheet[inoutLine + r].w === "编内" ? innerStaff : outterStaff;
            const wkey = this.getWorkTypeKey(sheet[workLine + r].w);
            const lkey = this.getLevelKey(sheet[levelLine + r].w);
            staff[wkey][lkey]++;
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
    this.getCountResBlob(innerStaff, outterStaff);
  }

  getCountResBlob(inner, outter) {
    const titleLines = [
      ["专业技术人员构成"]
    ]
    const innerLines = this.getAOADataByObject(inner);
    const OutterLines = this.getAOADataByObject(outter);

    const AOA = [].concat(titleLines, innerLines, OutterLines);
    debugger
    const d = new FileDownload();
    this.sheet = d.AOA2Sheet(AOA);
    d.sheet2blob(this.sheet);
  }

  getAOADataByObject(obj) {
    const titleLines = [
      [obj.isInner ? "编内" : "编外"],
      [""].concat(levelsOrder.map(l => levels[l].title), ['小计'])
    ];
    const dataLines = [];
    const totalCount = [0, 0, 0, 0, 0];
    workTypeOrder.forEach((wt, i) => {
      if (i === workTypeOrder.length - 1) {
        const skillStaff = JSON.parse(JSON.stringify(totalCount));
        const total = skillStaff.reduce((p, n) => p + n);
        skillStaff.push(total);
        skillStaff.unshift("卫生技术人员");
        dataLines.unshift(skillStaff);
      }
      if (workType[wt].title !== obj[wt].workType) return;
      const line = [workType[wt].title];
      let total = 0;
      levelsOrder.forEach((l, idx) => {
        line.push(obj[wt][l]);
        totalCount[idx] += obj[wt][l];
        total += obj[wt][l];
      })
      line.push(total);
      dataLines.push(line);
    })
    const total = totalCount.reduce((p, n) => p + n);
    totalCount.push(total);
    totalCount.unshift("总计");
    dataLines.push(totalCount);
    return [].concat(titleLines, dataLines);
  }

  getWorkTypeKey(label) {
    for (const wkey in workType) {
      if (Object.hasOwnProperty.call(workType, wkey)) {
        const element = workType[wkey];
        if (element.key && label.indexOf(element.key) >= 0) {
          return wkey;
        }
      }
    }
    return "others";
  }

  getLevelKey(label) {
    for (const lkey in levels) {
      if (Object.hasOwnProperty.call(levels, lkey)) {
        const element = levels[lkey];
        if (element.labels.length && element.labels.indexOf(label) >= 0) {
          return lkey;
        }
      }
    }
    return "level4";
  }
}

export default StaffCount;