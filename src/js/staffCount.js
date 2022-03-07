import $ from 'jquery';

import FileDownload from './fileDownload'
import Tool from './mathTool'


const STAFF_KEY = {
  inner: "四川省人民医院",
  security: "保卫部"
}

class TableHeader {
  constructor() {
    this.inout = undefined;
    this.proLevel = undefined;
    this.sex = undefined;
    this.degree = undefined;
    this.staffName = undefined;
    this.staffLevel = undefined;
    this.proName = undefined;
    this.workerLevel = undefined;
    this.jobName = undefined;
    this.jobLevel = undefined;
    this.department = undefined;
    this.engagedPro = undefined;
    this.identity = undefined;
  }
  hasEmptyValue() {
    for (const key in this) {
      if (Object.hasOwnProperty.call(this, key)) {
        const element = this[key];
        if (!element) {
          return true;
        }
      }
    }
    return false;
  }
}
const tableLineTranslater = {

  // 编制
  "单位": "inout",
  "inout": "单位",
  "性别": "sex",
  "sex": "性别",
  "学位": "degree",
  "degree": "学位",

  // 管理
  "职务名称": "staffName",
  "staffName": "职务名称",
  "职员等级": "staffLevel",
  "staffLevel": "职员等级",

  // 专技
  "聘任专业技术职务名称": "proName",
  "proName": "聘任专业技术职务名称",
  "技术职务级别": "proLevel",
  "proLevel": "技术职务级别",

  // 工勤
  "工人技术等级名称": "workerLevel",
  "workerLevel": "工人技术等级名称",
  "受聘岗位名称": "jobName",
  "jobName": "受聘岗位名称",
  "受聘岗位等级": "jobLevel",
  "jobLevel": "受聘岗位等级",
  "个人身份": "identity",
  "identity": "个人身份",

  // 安保
  "部门": "department",
  "department": "部门",
  "现从事专业": "engagedPro",
  "engagedPro": "现从事专业",
}

const totalCounter = {
  total: 0,
  manager: 0,
  doubleSize: 0,
  professional: 0,
  worker: 0,
  female: 0,
  master: 0,
  phd: 0,

}

const proStaffCount = {
  doc: 0,
  other: 0,
  total: 0
}

const workStaffCount = {
  inner_normal: 0,
  inner_pro: 0,
  outter_normal: 0,
  outter_pro: 0,
  inner_total: 0,
  outter_total: 0
}

const securyStaffCount = {
  "保安": 0,
  "内保": 0,
  "车管员": 0,
  "特勤": 0,
  "收费员": 0,
  "消防监控员": 0,
  "管理人员": 0
}

const workTypeOrder = ['doc', 'nurse', 'phar', 'worker', 'others'];
const levelsOrder = ["level0", "level1", "level2", "level3", "level4"];

const workType = {
  doc: {
    title: "医生",
    key: /医(师|士)/g
  },
  nurse: {
    title: "护士",
    key: /护(师|士|理)/g
  },
  phar: {
    title: "药剂人员",
    key: /药(师|士|剂)/g
  },
  worker: {
    title: "医技人员",
    key: /技(师|士)/g
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

const professionalStaff = {

  innerStaff: new InOutType(true),
  outterStaff: new InOutType(false),
}
class StaffCount {
  constructor(reader) {
    this.reader = reader;
    $('#checkBtn').on('click', () => { this.getDataLine() })
    $('#countBtn').on('click', () => { this.countData() })
  }

  checkFile() {
    if (!this.reader.effectData) {
      alert("请输入有效数据起始行数");
      return false;
    }
    if (!this.reader.headerLine) {
      alert("请输入表头所在行数");
      return false;
    }
    if (!this.reader.fileValue) {
      alert("请上传文件");
      return false;
    }
    return true;
  }

  getDataLine() {
    if (!this.checkFile()) return;
    const headerLine = this.reader.headerLine * 1;
    const fileValue = this.reader.fileValue;
    const tableLine = new TableHeader

    try {
      for (const key in fileValue.Sheets) {
        if (Object.hasOwnProperty.call(fileValue.Sheets, key)) {
          const sheet = fileValue.Sheets[key];
          const [line, row] = Tool.getLineAndRow(sheet['!ref'], 0);
          if (row.indexOf(headerLine) < 0) {
            debugger
            alert("表头所在行有误，请重新输入");
            return;
          }
          line.forEach(l => {
            const tableName = this.translateTableName(sheet[l + headerLine].w);
            tableName && (tableLine[tableName] = l);
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
    this.setTableInfoToHtml(tableLine);
  }

  setTableInfoToHtml(info) {
    if (!info) return;
    const $header = $("#TableHeaderInfo");

    $header.html("");
    for (const key in info) {
      if (Object.hasOwnProperty.call(info, key)) {
        const element = info[key];
        const htmlStr = `
          <div class="line option-line">
            <label for="effect-dataline">${this.translateTableName(key)}   </label>
            <input type="text" name="effect-dataline" data-keyword="${key}" value="${element ? element : ''}" style="width: 2.5rem;">
              行
          </div>
        `
        $header.append(htmlStr)
      }
    }
  }

  countData() {
    if (!this.checkFile()) return;
    const effectData = this.reader.effectData;
    const fileValue = this.reader.fileValue;
    const tableLine = this.getTableLine();

    const lineIdx = effectData * 1;
    try {
      for (const key in fileValue.Sheets) {
        if (Object.hasOwnProperty.call(fileValue.Sheets, key)) {
          const sheet = fileValue.Sheets[key];
          const [line, row] = Tool.getLineAndRow(sheet['!ref'], lineIdx);
          if (this.checkLine(line, tableLine)) return;
          row.forEach(r => {
            const rowInfo = this.getRowInfoByHeader(sheet, tableLine, r);
            if (!rowInfo) return;

            // 总表
            totalCounter.total++;
            if (rowInfo.sex === "女") {
              totalCounter.female++;
            }
            if (rowInfo.degree.indexOf("博士") > -1) {
              totalCounter.phd++;
            }
            if (rowInfo.degree.indexOf("硕士") > -1) {
              totalCounter.master++;
            }

            let isManager = false;
            // 管理人员
            if (rowInfo.staffLevel) {
              totalCounter.manager++;
              isManager = true;
            }

            // 专技人员
            if (rowInfo.proName) {
              totalCounter.professional++
              isManager && totalCounter.doubleSize++;

              const staff = rowInfo.inout === STAFF_KEY.inner ? professionalStaff.innerStaff : professionalStaff.outterStaff;
              const wkey = this.getWorkTypeKey(rowInfo.proName);
              const lkey = this.getLevelKey(rowInfo.proLevel);
              staff[wkey][lkey]++;
            }

            // 工勤人员
            if (
              !rowInfo.staffName && !rowInfo.staffLevel &&
              !rowInfo.proName && !rowInfo.proLevel &&
              rowInfo.identity.indexOf("工") >= 0
            ) {
              totalCounter.worker++
              if (rowInfo.inout === STAFF_KEY.inner) {
                workStaffCount.inner_total++;
                if (rowInfo.workerLevel === "未确定") {
                  workStaffCount.inner_normal++;
                } else {
                  workStaffCount.inner_pro++;
                }
              } else {
                workStaffCount.outter_total++;
                if (rowInfo.identity === "编外聘用普工") {
                  workStaffCount.outter_normal++;
                } else if (rowInfo.identity === "编外聘用技术工人") {
                  workStaffCount.outter_pro++;
                }
              }
            }

            // 保卫部
            if (rowInfo.department === STAFF_KEY.security) {
              if (Object.hasOwnProperty.call(securyStaffCount, rowInfo.engagedPro)) {
                securyStaffCount[rowInfo.engagedPro]++;
              } else {
                securyStaffCount['管理人员']++
              }
            }
          })
        }
      }
    } catch (e) {
      console.error(e)
      return;
    }
    this.getBlob(this.getCountRes());
  }

  isSheetDataErrorInRow(sheet, data, r) {
    if (!sheet[data.sex + r] || typeof (sheet[data.sex + r].w) !== 'string') {
      // 空行
      return "Empty Line"
    }
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const element = sheet[data[key] + r];
        if (!element || typeof (element.w) !== 'string') return (data[key] + r)
      }
    }
    return '';
  }

  getRowInfoByHeader(sheet, tableLine, r) {
    const isErr = this.isSheetDataErrorInRow(sheet, tableLine, r);
    if (isErr) {
      if (isErr === "Empty Line") {
        return;
      }
      alert(isErr + "单元格数据异常，请输入任意字符保存后重试")
      throw (sheet[isErr]);
    };
    const data = new TableHeader();
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        data[key] = sheet[tableLine[key] + r].w;
      }
    }
    return data;
  }

  checkLine(line, tableLine) {
    if (!tableLine.hasEmptyValue || tableLine.hasEmptyValue()) {
      alert("表头信息获取不全，请补全后再试");
      return true;
    }
    for (const key in tableLine) {
      if (Object.hasOwnProperty.call(tableLine, key)) {
        if (line.indexOf(tableLine[key]) < 0) {
          alert("关键统计数据列数有误，请重新输入");
          return true;
        }
      }
    }
    return false
  }

  getTableLine() {

    const tableLine = new TableHeader();
    const $header = $("#TableHeaderInfo");
    $header.find('input').each(function (i, n) {
      let tableName = $(n).attr('data-keyword')
      if (Object.hasOwnProperty.call(tableLine, tableName)) {
        tableLine[tableName] = $(n).val();
      }
    });
    return tableLine;
  }

  getCountRes() {
    const totalInfo = this.getTotalInfo();
    const staffInfo = this.getStaffInfo();
    const proStaffInfo = this.getProStaffInfo();
    const workStaffInfo = this.getWorkStaffInfo();
    const securyStaffInfo = this.getSecuryStaffInfo();
    return [
      ...totalInfo, [], [],
      ...staffInfo, [], [],
      ...proStaffInfo, [], [],
      ...workStaffInfo, [], [],
      ...securyStaffInfo
    ];
  }

  getBlob(AOA) {
    const d = new FileDownload();
    const sheet = d.AOA2Sheet(AOA);
    d.sheet2blob(sheet);
  }

  getTotalInfo() {
    return [
      ["总表"],
      ["", "合计"],
      ["从业人数", totalCounter.total],
      ["其中：专业技术人员数", totalCounter.professional],
      ["管理人员", totalCounter.manager],
      ["工勤人员", totalCounter.worker],
      ["女职工", totalCounter.female],
      ["博士", totalCounter.phd],
      ["硕士", totalCounter.master],
      ["双肩挑", totalCounter.doubleSize]
    ]

  }

  getStaffInfo() {
    const titleLines = [
      ["专业技术人员构成"]
    ]
    const innerLines = this.getAOADataByObject(professionalStaff.innerStaff);
    const OutterLines = this.getAOADataByObject(professionalStaff.outterStaff);
    const staffData = this.mergeInout(innerLines, OutterLines);
    return [].concat(titleLines, staffData);

  }

  getProStaffInfo() {
    return [
      ["专业技术人员总表"],
      ["专业技术人员数", proStaffCount.total],
      ["其中：卫计人员", proStaffCount.doc],
      ["其他技术人员", proStaffCount.other]
    ]

  }
  getWorkStaffInfo() {
    return [
      ["工勤人员构成总表"],
      ["工勤人员", workStaffCount.inner_total, workStaffCount.outter_total],
      ["技术工", workStaffCount.inner_pro, workStaffCount.outter_pro],
      ["普工", workStaffCount.inner_normal, workStaffCount.outter_normal]
    ]
  }

  getSecuryStaffInfo() {
    const res = [
      ["本部保卫部人员统计表"],
    ]
    let total = 0;
    for (const key in securyStaffCount) {
      if (Object.hasOwnProperty.call(securyStaffCount, key)) {
        const element = securyStaffCount[key];
        res.push([key, element])
        total += element * 1;
      }
    }
    res.push(['总计', total])
    return res;
  }

  mergeInout(inner, outter) {
    return inner.map((item, idx) => {
      let total;
      if (idx === 1) {
        total = "总计"
      } else if (idx > 1) {
        total = item[item.length - 1] + outter[idx][outter[idx].length - 1];
        if (idx === 2) {
          proStaffCount.doc = total;
        } else if (idx === 7) {
          proStaffCount.other = total;
        } else if (idx === 8) {
          proStaffCount.total = total;
        }
      }
      outter[idx].shift();
      return [...item, ...outter[idx], total]
    })
  }

  getAOADataByObject(obj) {
    const titleLines = [
      ['', obj.isInner ? "编内" : "编外", '', '', '', '', ''],
      [""].concat(levelsOrder.map(l => levels[l].title), ['小计'])
    ];
    const dataLines = [];
    const totalCount = [0, 0, 0, 0, 0];
    workTypeOrder.forEach((wt, i) => {
      if (i === workTypeOrder.length - 1) {
        const proStaff = JSON.parse(JSON.stringify(totalCount));
        const total = proStaff.reduce((p, n) => p + n);
        proStaff.push(total);
        proStaff.unshift("卫生技术人员");
        dataLines.unshift(proStaff);
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
    totalCount.unshift("合计");
    dataLines.push(totalCount);
    return [].concat(titleLines, dataLines);
  }

  getWorkTypeKey(label) {
    for (const wkey in workType) {
      if (Object.hasOwnProperty.call(workType, wkey)) {
        const element = workType[wkey];
        if (element.key && label.match(element.key)) {
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

  translateTableName(name) {
    return tableLineTranslater[name];
  }
}

export default StaffCount;