const pixelGrid = document.getElementById('pixelGrid');
let canvasRect = pixelGrid.getBoundingClientRect();
let scaleX = pixelGrid.width / canvasRect.width;
let scaleY = pixelGrid.height / canvasRect.height;
const context = pixelGrid.getContext('2d');
let drawing = false;

const startDrawing = event => {
    drawPixel(event.pageX, event.pageY, palettes[0].colors[0]);
    drawing = true;
};

const stopDrawing = event => drawing = false;

const  draw = event => {
    if (drawing) {
        drawPixel(event.pageX, event.pageY, palettes[0].colors[0]);
    }
}
const drawPixel = (x, y, color) => {
    context.fillStyle = color;
    context.fillRect(Math.floor((x - canvasRect.left)*scaleX), Math.floor((y - canvasRect.top)*scaleY), 1, 1);
}
window.addEventListener("resize",()=>{
    canvasRect = pixelGrid.getBoundingClientRect();
    scaleX = pixelGrid.width / canvasRect.width;
    scaleY = pixelGrid.height / canvasRect.height;
})
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