let palettes = [
  {
    author: {
      name: "James Medd",
      slug: "jrmedd",
    },
    name: "The uninteresting grey palette",
    colors: ["#bbbbbb", "#999999", "#666666", "#333333", "#000000"]
  },
];
let randomPalette = 0;
fetch(
  `${location.origin}/palettes/5`)
.then(res=> res.status == 200 && res.json())
.then(data=>{
    palettes = data.palettes;
    randomPalette = Math.floor(Math.random()*palettes.length);
    for (let i = 0; i < 5; i++) {
      root.style.setProperty(`--color-${i+1}`, palettes[randomPalette].colors[i]);
    }
});


let root = document.documentElement;

