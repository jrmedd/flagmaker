let root = document.documentElement;

const pixelGrid = document.getElementById('pixelGrid');
let canvasRect;
let scaleX;
let scaleY;
const context = pixelGrid.getContext('2d');
let drawing = false;
let selectedColorIndex = 0;

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
let randomPalette = 0;
const paletteName = document.getElementById("palette-name");
const authorName = document.getElementById("author-name");

fetch(`${location.origin}/palettes/5`)
  .then((res) => res.status == 200 && res.json())
  .then((data) => {
    palettes = data.palettes;
    if (palettes.length > 0) {
      randomPalette = Math.floor(Math.random() * palettes.length);
      paletteName.textContent = palettes[randomPalette].name;
      authorName.textContent = palettes[randomPalette].author.name;
      authorName.href = `https://lospec.com/${palettes[randomPalette].author.slug}`;
      const colorPickers = document.getElementsByClassName("color");
      for (let i = 0; i < 5; i++) {
        colorPickers[i].addEventListener("click",()=>selectedColorIndex=i);
        root.style.setProperty(
          `--color-${i + 1}`,
          palettes[randomPalette].colors[i]
        );
      }
    }
  });


const startDrawing = event => {
    drawPixel(event.pageX, event.pageY, palettes[randomPalette].colors[selectedColorIndex]);
    drawing = true;
};

const stopDrawing = event => drawing = false;

const  draw = event => {
    if (drawing) {
        drawPixel(event.pageX, event.pageY, palettes[randomPalette].colors[selectedColorIndex]);
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
window.addEventListener("load", setDrawingScale);
window.addEventListener("resize", setDrawingScale);
window.addEventListener("mousedown", startDrawing);
window.addEventListener("mouseup", stopDrawing);
window.addEventListener("mousemove", draw);
window.addEventListener("touchdown", startDrawing);
window.addEventListener("touchup", stopDrawing);
window.addEventListener("touchmove", draw);


/*
drawing = new Image();
drawing.src = "draw.png"; // can also be a remote URL e.g. http://
drawing.onload = function() {
   context.drawImage(drawing,0,0);
};
*/
/*
// pull the entire image into an array of pixel data
var imageData = context.getImageData(0, 0, w, h);

// examine every pixel, 
// change any old rgb to the new-rgb
for (var i=0;i<imageData.data.length;i+=4)
  {
      // is this pixel the old rgb?
      if(imageData.data[i]==oldRed &&
         imageData.data[i+1]==oldGreen &&
         imageData.data[i+2]==oldBlue
      ){
          // change to your new rgb
          imageData.data[i]=newRed;
          imageData.data[i+1]=newGreen;
          imageData.data[i+2]=newBlue;
      }
  }
// put the altered data back on the canvas  
context.putImageData(imageData,0,0);
*/