import $ from 'jquery';

import XLSX from 'xlsx';

class FileReaderOwn {
    constructor(boxSelector) {
        this.effectData = undefined;
        this.effectLine = undefined;
        this.compareLine = undefined;
        try {
            this.inputEl = $(boxSelector).find('#fileInput')[0];
            this.effectDataEl = $(boxSelector).find('#effectData')[0];
            this.effectLineEl = $(boxSelector).find('#effectLine')[0];
            this.compareLineEl = $(boxSelector).find('#compareLine')[0];
            this.headerLineEl = $(boxSelector).find('#headerLine')[0];
            this.fileNameEl = $(boxSelector).find('.file-name')[0];
            this.loaderEl = $(boxSelector).find('.loader')[0];
            this.complitEl = $(boxSelector).find('.complit')[0];
            this.errorEl = $(boxSelector).find('.error')[0];
            this.init();
        } catch (e) {
            console.error('element error from FileReader')
        }
    }

    init() {
        this.inputEl && $(this.inputEl).on('change', () => { this.readFile() });
        this.effectDataEl && $(this.effectDataEl).on('change', () => { this.effectData = this.effectDataEl.value });
        this.effectLineEl && $(this.effectLineEl).on('change', () => { this.effectLine = this.effectLineEl.value });
        this.compareLineEl && $(this.compareLineEl).on('change', () => { this.compareLine = this.compareLineEl.value });
        this.headerLineEl && $(this.headerLineEl).on('change', () => { this.headerLine = this.headerLineEl.value });
    }


    readFile() {
        if (!this.inputEl.value) {
            return;
        }
        $(this.errorEl).css('display', "none");
        $(this.complitEl).css('display', "none");
        $(this.loaderEl).css('display', "inline-block")
        this.fileNameEl.value = this.inputEl.value
        let files = $(this.inputEl).prop("files");
        if (files.length == 0) {
            alert('文件读取错误');
            $(this.loaderEl).css('display', "none");
            $(this.errorEl).css('display', "inline-block");
        } else {
            this.readWorkbookFromLocalFile(files[0], (workbook) => {
                this.fileValue = workbook;
                $(this.loaderEl).css('display', "none");
                $(this.complitEl).css('display', "inline-block");
            })
        }
    }

    readWorkbookFromLocalFile(file, callback) {
        let reader = new FileReader();
        reader.onload = (e) => {
            let data = e.target.result;
            let workbook = XLSX.read(data, { type: 'binary' });
            if (callback) callback(workbook);
        };
        reader.readAsBinaryString(file);
    }
}

export default FileReaderOwn