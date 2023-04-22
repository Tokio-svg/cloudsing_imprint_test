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
// 座標指定
// -----------------------------------------------
const positionX = document.getElementById('position-x')
const positionY = document.getElementById('position-y')
const cursor = document.getElementById('cursor')
pdfjsTarget.onmousemove = onmousemove;

function clickScreen(e) {
  const clientRect = pdfjsTarget.getBoundingClientRect()
  const cursorWidthHalf = cursor.clientWidth/2
  const cursorHeightHalf = cursor.clientHeight/2
  const cursorX = e.clientX - clientRect.left - cursorWidthHalf
  const cursorY = e.clientY - clientRect.top - cursorHeightHalf
  positionX.innerHTML = parseInt(cursorX)
  positionY.innerHTML = parseInt(cursorY)

  cursor.style.left = parseInt(e.offsetX - cursorWidthHalf) + 'px'
  cursor.style.top = parseInt(e.offsetY - cursorHeightHalf) + 'px'
}

// -----------------------------------------------
// カーソル切り替え
// -----------------------------------------------
function changeMode(num) {
  switch (num) {
    case 0:
      cursor.style.width = 80 + 'px'
      cursor.style.height = 75 + 'px'
      break
    case 1:
      cursor.style.width = 225 + 'px'
      cursor.style.height = 40 + 'px'
      break
  }
  // 位置を初期化
  cursor.style.left = 0
  cursor.style.top = 0
  positionX.innerHTML = 0
  positionY.innerHTML = 0
}