const storage = localStorage


let root = document.documentElement;

const pixelGrid = document.getElementById("pixel-grid");
const gridOverlay = document.getElementById("grid");
let gridVisible = false;
const gridToggleButton = document.getElementById("toggle-grid");
let canvasRect = pixelGrid.getBoundingClientRect();
let scaleX;
let scaleY;
let drawSize = 1;
const context = pixelGrid.getContext('2d');
let drawing = false;
let saveTimeout;

let clearing = false;
const clearButton = document.getElementById("clear");

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

const setDrawingScale = () => {
  canvasRect = pixelGrid.getBoundingClientRect();
  scaleX = pixelGrid.width / canvasRect.width;
  scaleY = pixelGrid.height / canvasRect.height;
};


const drawPixels = (x, y, size, color) => {
  if (!clearing) {
    context.fillStyle = color;
    context.fillRect(
      Math.floor((x - canvasRect.left) * scaleX),
      Math.floor((y - canvasRect.top) * scaleY),
      size,
      size
    );
  }
  else {
    context.clearRect(
      Math.floor((x - canvasRect.left) * scaleX),
      Math.floor((y - canvasRect.top) * scaleY),
      size,
      size
    );
  }
};

const updatePalette = () => {
  paletteName.textContent = palettes[selectedPalette].name;
  authorName.textContent = palettes[selectedPalette].author ? palettes[selectedPalette].author.name : "Unknown";
  authorName.href = palettes[selectedPalette].author ? `https://lospec.com/${palettes[selectedPalette].author.slug}`: "#";
  const colorPickers = document.getElementsByClassName("color");
  for (let i = 0; i < 5; i++) {
    colorPickers[i].addEventListener("click", () => { clearing=false; selectedColorIndex = i;});
    root.style.setProperty(
      `--color-${i + 1}`,
      palettes[selectedPalette].colors[i]
    );
  }
};

function getPalettes(){
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
}


const startDrawing = event => {
  event.preventDefault();
  if (event.touches) {
    for (let touch of event.touches){
      drawPixels(
        touch.pageX,
        touch.pageY,
        drawSize,
        palettes[selectedPalette].colors[selectedColorIndex]
      );
    }
  }
  else {
    drawPixels(
      event.pageX,
      event.pageY,
      drawSize,
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
          drawPixels(
            touch.pageX,
            touch.pageY,
            drawSize,
            palettes[selectedPalette].colors[selectedColorIndex]
          );
        }
      }
      else {
        drawPixels(
          event.pageX,
          event.pageY,
          drawSize,
          palettes[selectedPalette].colors[selectedColorIndex]
        );
      }
    }
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
      return data.id;
    }
  });
}

clearButton.addEventListener("click", ()=> clearing = true);

gridToggleButton.addEventListener("click", ()=> {
  gridVisible = !gridVisible;
  gridOverlay.style.opacity = gridVisible ? 1 : 0;
  gridToggleButton.textContent = gridVisible ? "Hide grid" : "Show grid";
});

window.addEventListener("load", setDrawingScale);
window.addEventListener("resize", setDrawingScale);
pixelGrid.addEventListener("mousedown", startDrawing);
pixelGrid.addEventListener("mouseup", stopDrawing);
pixelGrid.addEventListener("mousemove", draw);
pixelGrid.addEventListener("touchstart", startDrawing);
pixelGrid.addEventListener("touchend", stopDrawing);
pixelGrid.addEventListener("touchmove", draw);

document.body.addEventListener("mouseup", stopDrawing);

if (storage.getItem("userDesign")) {
  const drawing = new Image();
  drawing.src = storage.getItem("userDesign"); // can also be a remote URL e.g. http://
  drawing.onload = () => context.drawImage(drawing, 0, 0);
}

const swapPalette = direction => {
  let imageData = context.getImageData(0, 0, pixelGrid.width, pixelGrid.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    let colorIndex = palettes[selectedPalette]["colors"].indexOf(
      `#${imageData.data[i].toString(16).padStart(2, "0")}${imageData.data[
        i + 1
      ]
        .toString(16)
        .padStart(2, "0")}${imageData.data[i + 2]
        .toString(16)
        .padStart(2, "0")}`
    );
    if (imageData.data[i + 3] == 255) {
      let rgb = palettes[((selectedPalette + direction)+palettes
        .length) % palettes.length].colors[
        colorIndex
      ]
        .match(/\w{2}/g)
        .map((hex) => parseInt(hex, 16));
      imageData.data[i] = rgb[0];
      imageData.data[i + 1] = rgb[1];
      imageData.data[i + 2] = rgb[2];
    }
  }
  context.putImageData(imageData, 0, 0);
  selectedPalette = ((selectedPalette + direction)+palettes.length) % palettes.length;
  updatePalette();
  storage.setItem("selectedPalette", selectedPalette);
};

document.getElementById("previous-palette").addEventListener("click", ()=>swapPalette(-1));
document.getElementById("next-palette").addEventListener("click", ()=>swapPalette(1));


document.getElementById("plant-flag").addEventListener("click",()=>{
  const plant = confirm("Are you sure you want to plant this flag? You won't be able to make any changes to it if you continue.");
  if (plant) { 
    const flagId = submission();
    initMap();
  }
})

const tourModal = document.getElementById("tour-modal");
const tourContent = document.getElementsByClassName("tour-step");
let tourStep = 0;
const tourControls = document.getElementById("tour-controls");
const advanceTourButton = document.getElementById("advance-tour");
const reverseTourButton = document.getElementById("reverse-tour");

if (!storage.getItem("toured")) {
  tourModal.style.display = "flex";
  tourContent[tourStep].style.display = "block";
  document.body.style.overflow = "hidden";
  reverseTourButton.style.display = "none";
    tourControls.style.justifyContent = "flex-end";
} else {
  document.body.style.overflow = "auto";
  getPalettes();
}

advanceTourButton.addEventListener("click", () => {
  tourContent[tourStep].style.display = "none";
  if (tourStep + 1 == tourContent.length) {
    tourModal.style.display = "none";
    tourStep = 0;
    storage.setItem("toured", 1);
    document.body.style.overflow = "auto";
    getPalettes();
  } else {
    tourStep++;
    advanceTourButton.textContent =
      tourStep + 1 == tourContent.length ? "Get started" : "Next";
    tourContent[tourStep].style.display = "block";
    reverseTourButton.style.display = "block";
    tourControls.style.justifyContent = "space-between";
  }
  
});

reverseTourButton.addEventListener("click", () => {
  tourContent[tourStep].style.display = "none"
  if (tourStep - 1 == 0) {
    reverseTourButton.style.display = "none";
    tourControls.style.justifyContent = "flex-end";
  }
  tourStep--;
  tourContent[tourStep].style.display = "block";
  advanceTourButton.textContent  = tourStep + 1 == tourContent.length ? "Get started" : "Next";
  

})