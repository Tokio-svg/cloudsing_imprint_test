// -----------------------------------------------
// ファイル読み込み
// -----------------------------------------------
window.addEventListener('load', () => {
  const f = document.getElementById('file');
  f.addEventListener('change', evt => {
    let input = evt.target;
    if (input.files.length == 0) {
      console.log('No file selected');
      return;
    }
    const file = input.files[0];
    const fileUri = URL.createObjectURL(file)
    loadPDF(fileUri)
  });
});

// -----------------------------------------------
// PDF描画
// -----------------------------------------------
let PDF = null
let displayPageNum = 0
let page_w = 595;
let scale = 1;
let totalPageNum = 0
const displayPageElement = document.getElementById('page_number')
const pdfjsTarget = document.getElementById('pdfjs_view');

function loadPDF(url) {

  const pdfjsLib = window['pdfjs-dist/build/pdf'];

  pdfjsLib.GlobalWorkerOptions.workerSrc = "js/pdfjs/build/pdf.worker.js";

  const loadingTask = pdfjsLib.getDocument({
    url: url,
    cMapUrl: "https://unpkg.com/pdfjs-dist@2.16.105/cmaps/",
    cMapPacked: true
  });

  loadingTask.promise.then((pdf) => {
    PDF = pdf
    displayPageNum = 1
    totalPageNum = PDF.numPages
    getPdfPage()
  });
}

function changePage(num) {
  if (!displayPageNum) return
  if (num < 0) {
    if (displayPageNum <= 1) return
    displayPageNum--
  } else {
    if (displayPageNum >= PDF._pdfInfo.numPages) return
    displayPageNum++
  }
  getPdfPage()
}

function getPdfPage() {
  PDF.getPage(displayPageNum).then(function (page) {

    //横幅を595pxに調整
    page_w = page._pageInfo.view[2];
    scale = 595 / page_w;

    const viewport = page.getViewport({ scale: scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
        canvasContext: context,
        viewport: viewport,
    };

    const oldCanvas = pdfjsTarget.querySelector('canvas')
    if (oldCanvas) pdfjsTarget.removeChild(oldCanvas)

    pdfjsTarget.appendChild(canvas);
    page.render(renderContext);

    displayPageElement.innerHTML = '表示ページ：' + displayPageNum + '/' + totalPageNum
  });
}

// -----------------------------------------------
// カーソル
// -----------------------------------------------
const position = document.getElementById('position')
const cursor = document.getElementById('cursor')
pdfjsTarget.onmousemove = onmousemove;

clickScreen = function(e) {
  const clientRect = pdfjsTarget.getBoundingClientRect()
  const cursorX = e.clientX - clientRect.left - 40
  const cursorY = e.clientY - clientRect.top - 37.5
  position.innerHTML = 'x:' + cursorX + ' ,' + ' y:' + cursorY;

  cursor.style.left = e.offsetX - 40 + 'px'
  cursor.style.top = e.offsetY - 37.5 + 'px'

}