import './styles/index.less';

import $ from 'jquery';

import MergeFile from './js/mergefile'
import CompareFile from './js/comparefile'
import StaffCount from './js/staffCount'
import FileReaderOwn from './js/fileReader'

$("#title").on('click', () => {
  $('#title').css("color", "#666")
})

$(document).ready(function () {
  init()
});

function init() {
  const mergeReader = new FileReaderOwn('#mergeBox');
  const com1Reader = new FileReaderOwn('#compare1');
  const com2Reader = new FileReaderOwn('#compare2');
  const countReader = new FileReaderOwn('#countBox');
  new MergeFile(mergeReader);
  new CompareFile(com1Reader, com2Reader);
  new StaffCount(countReader);
}