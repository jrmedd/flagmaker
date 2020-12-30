const storage = localStorage

let root = document.documentElement;

const pixelGrid = document.getElementById('pixelGrid');
let canvasRect;
let scaleX;
let scaleY;
const context = pixelGrid.getContext('2d');
let drawing = false;
let saveTimeout;


let palettes = [
  {
    author: {
      name: "James Medd",
      slug: "jrmedd",
    },
    name: "The uninteresting grey palette",
    colors: ["#bbbbbb", "#999999", "#666666", "#333333", "#000000"],
  },
];

let selectedColorIndex = 0;
let selectedPalette = parseInt(storage.getItem("selectedPalette")) || 0;
const paletteName = document.getElementById("palette-name");
const authorName = document.getElementById("author-name");

if (storage.getItem("userDesign")) {
  const drawing = new Image();
  drawing.src = storage.getItem("userDesign"); // can also be a remote URL e.g. http://
  drawing.onload =  () => context.drawImage(drawing, 0, 0);
};

const updatePalette = () => {
  paletteName.textContent = palettes[selectedPalette].name;
  authorName.textContent = palettes[selectedPalette].author ? palettes[selectedPalette].author.name : "Unknown";
  authorName.href = palettes[selectedPalette].author ? `https://lospec.com/${palettes[selectedPalette].author.slug}`: "#";
  const colorPickers = document.getElementsByClassName("color");
  for (let i = 0; i < 5; i++) {
    colorPickers[i].addEventListener("click", () => (selectedColorIndex = i));
    root.style.setProperty(
      `--color-${i + 1}`,
      palettes[selectedPalette].colors[i]
    );
  }
};


if (!storage.getItem("palettes")) {
fetch(`${location.origin}/palettes/5`)
  .then((res) => res.status == 200 && res.json())
  .then((data) => {
    palettes = data.palettes;
    if (palettes.length > 0) {
      storage.setItem("palettes", JSON.stringify(palettes))
      selectedPalette = Math.floor(Math.random() * palettes.length);
      storage.setItem("selectedPalette", selectedPalette);
      updatePalette();
    }
  });
}
else {
  palettes = JSON.parse(storage.getItem("palettes"));
  updatePalette();
}


const startDrawing = event => {
  event.preventDefault();
  if (event.touches) {
    for (let touch of event.touches){
      drawPixel(
        touch.pageX,
        touch.pageY,
        palettes[selectedPalette].colors[selectedColorIndex]
      );
    }
  }
  else {
    drawPixel(
      event.pageX,
      event.pageY,
      palettes[selectedPalette].colors[selectedColorIndex]
    );
  }
  drawing = true;
  clearTimeout(saveTimeout);
};


const stopDrawing = event => {
  event.preventDefault();
  drawing = false;
  saveTimeout = setTimeout(()=>storage.setItem("userDesign", pixelGrid.toDataURL()), 1000);
};

const  draw = event => {
  event.preventDefault();
    if (drawing) {
      if (event.touches) {
        for (let touch of event.touches) {
          drawPixel(
            touch.pageX,
            touch.pageY,
            palettes[selectedPalette].colors[selectedColorIndex]
          );
        }
      }
      else {
        drawPixel(
          event.pageX,
          event.pageY,
          palettes[selectedPalette].colors[selectedColorIndex]
        );
      }
    }
}
const drawPixel = (x, y, color) => {
    context.fillStyle = color;
    context.fillRect(Math.floor((x - canvasRect.left)*scaleX), Math.floor((y - canvasRect.top)*scaleY), 1, 1);
}

const setDrawingScale = () => {
    canvasRect = pixelGrid.getBoundingClientRect();
    scaleX = pixelGrid.width / canvasRect.width;
    scaleY = pixelGrid.height / canvasRect.height;
}



const submission = () => {
  const png = pixelGrid.toDataURL();
  const submission = { png: png };
  fetch(`${location.origin}/submit-flag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  })
  .then(res=>res.status == 200 && res.json())
  .then(data=>{
    if (data.submitted) {
      storage.setItem("userFlagId", data.id);
    }
  });
}

window.addEventListener("load", setDrawingScale);
window.addEventListener("resize", setDrawingScale);
pixelGrid.addEventListener("mousedown", startDrawing);
pixelGrid.addEventListener("mouseup", stopDrawing);
pixelGrid.addEventListener("mousemove", draw);
pixelGrid.addEventListener("touchstart", startDrawing);
pixelGrid.addEventListener("touchend", stopDrawing);
pixelGrid.addEventListener("touchmove", draw);

document.body.addEventListener("mouseup", stopDrawing);



document.getElementById("next-palette").addEventListener("click", () => {
  let imageData = context.getImageData(0, 0, pixelGrid.width, pixelGrid.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    let colorIndex = palettes[selectedPalette]["colors"].indexOf(
      `#${imageData.data[i].toString(16).padStart(2,'0')}${imageData.data[i + 1].toString(16).padStart(2,'0')}${imageData.data[i + 2].toString(16).padStart(2,'0')}`
    );
    console.log(colorIndex);
    let rgb = palettes[(selectedPalette + 1) % palettes.length].colors[
      colorIndex
    ]
      .match(/\w{2}/g)
      .map((hex) => parseInt(hex, 16));
    imageData.data[i] = rgb[0];
    imageData.data[i+1] = rgb[1];
    imageData.data[i+2] = rgb[2];
  }
  context.putImageData(imageData,0,0);
  selectedPalette = (selectedPalette + 1)%palettes.length;
  updatePalette();
  storage.setItem("selectedPalette", selectedPalette);
});


