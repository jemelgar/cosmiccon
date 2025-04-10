const pageFlipSound = new Audio('page-flip.mp3');
pageFlipSound.load();
let scale = 10;

async function loadPDF(url) {
  const pdf = await pdfjsLib.getDocument(url).promise;
  const pages = [];

  let maxWidth = 0;
  let maxHeight = 0;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 3 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
    const imgData = canvas.toDataURL();

    pages.push(imgData);

    // Detectar la página más grande
    maxWidth = Math.max(maxWidth, viewport.width);
    maxHeight = Math.max(maxHeight, viewport.height);
  }

  const aspectRatio = maxWidth / maxHeight;

  let containerWidth = window.innerWidth * 0.7;
  let containerHeight = containerWidth / aspectRatio;

  if (containerHeight > window.innerHeight * 0.8) {
    containerHeight = window.innerHeight * 0.8;
    containerWidth = containerHeight * aspectRatio;
  }

  const flipbookElement = document.getElementById('flipbook');
  flipbookElement.style.width = `${containerWidth}px`;
  flipbookElement.style.height = `${containerHeight}px`;

  const flipbook = new St.PageFlip(flipbookElement, {
    width: containerWidth,
    height: containerHeight,
    size: 'stretch',
    maxShadowOpacity: 0.5,
    showCover: true,
  });

  flipbook.loadFromImages(pages);

  flipbook.on('flip', () => {
    pageFlipSound.play();
  });
}

loadPDF('pdfs/documento.pdf');

window.addEventListener('resize', () => {
  location.reload();
});

function zoomIn() {
  scale += 0.1;
  document.getElementById('flipbook').style.transform = `scale(${scale})`;
}

function zoomOut() {
  scale = Math.max(0.5, scale - 0.1);
  document.getElementById('flipbook').style.transform = `scale(${scale})`;
}

function toggleFullscreen() {
  const elem = document.documentElement;
  if (!document.fullscreenElement) {
    elem.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
