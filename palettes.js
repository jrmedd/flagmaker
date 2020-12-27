const palettes = [
  {
    name: "Oil 6",
    author: "GrafxKid",
    colors: ["#fbf5ef", "#f2d3ab", "#c69fa5", "#8b6d9c", "#494d7e", "#272744"],
  },
]

let root = document.documentElement;

for (let i = 1; i < 6; i ++) {
root.style.setProperty(`--color-${i}`, palettes[0].colors[i]);
}