const button = document.getElementById("actionButton");
const title = document.getElementById("title");

const messages = [
  "Hello World",
  "Halo Dunia",
  "こんにちは世界",
  "Hola Mundo",
  "Bonjour le monde",
];

let index = 0;

button.addEventListener("click", () => {
  index = (index + 1) % messages.length;
  title.textContent = messages[index];
});
