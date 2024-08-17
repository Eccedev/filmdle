
let gameIsActive = true;
let lives = 10;
let correctCategories = [];

let mangaList = [];

// cargar datos json
fetch('./top100film.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return response.json();
  })
  .then(data => {
    mangaList = data;// actualizar mangaList
    initGame();
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });

function initGame() {
  populateDataList();
  resetGame();
}

////  función vista de vidas o partidas   //////
function displayLives() {
  const livesElement = document.getElementById("lives");
  let hearts = '';
  for (let i = 0; i < lives; i++) {
    hearts += '❤️';
  }
  for (let i = 0; i < (10 - lives); i++) {
    hearts += '🤍';
  }
  livesElement.innerHTML = hearts;
}
displayLives();


////  función mostrar opciones de dentro del json  //////
function populateDataList() {
  const dataList = document.getElementById("manga-titles");

  mangaList.forEach(manga => {
    const option = document.createElement("option");
    option.value = manga.title;
    dataList.appendChild(option);
  });
}
populateDataList();


////  función obtener el objeto aleatorio del json  //////
function getRandomManga() {
  const randomIndex = Math.floor(Math.random() * mangaList.length);
  return mangaList[randomIndex];
}
let mangaToGuess = getRandomManga();



////  función reiniciar el juego  //////
function resetGame() {
  gameIsActive = true;
  mangaToGuess = getRandomManga();  // generar un nuevo objeto aleatorio para adivinar

  const input = document.getElementById("guess");
  const guessButton = document.getElementById("guessButton");

  input.disabled = false;
  guessButton.disabled = false;

  lives = 10;  // reinicia vidas
  displayLives();  // actualiza info de vidas mostradas

  // limpia la tabla de info previa del juego
  const tableBody = document.getElementById("infoTable").getElementsByTagName('tbody')[0];
  tableBody.innerHTML = "";

  // Mostrar el botón de hint-pista
  document.getElementById("hintButton").style.display = "inline-block";
}


////  función  dar una pista //////
function giveHint() {
  if (!gameIsActive) return; //  no dar pistas si es game over

  // esconde el boton hint
  document.getElementById("hintButton").style.display = "none";

  // Calcular la lista de categorías que aún no se han adivinado correctamente
  const unguessedCategories = Object.keys(mangaToGuess).filter(category => {
    return !correctCategories.includes(category) && category !== 'image' && category !== 'title' && category !== 'Director' && category !== 'Artists';
  });

  // Elegir una categoría aleatoria no adivinada para proporcionar una pista.
  const randomCategoryIndex = Math.floor(Math.random() * unguessedCategories.length);
  const hintCategory = unguessedCategories[randomCategoryIndex];

  // dar una pista basado en la categoria
  const tableBody = document.getElementById("infoTable").getElementsByTagName('tbody')[0];
  const newRow = tableBody.insertRow();
  const imgCell = newRow.insertCell(0);
  const imgElement = document.createElement("img");
  imgElement.src = "./img/img-hint.JPG"; // Usa la URL de la imagen del hint
  imgElement.alt = "Hint Image";
  imgElement.style.width = "50px"; // Ajusta el tamaño 
  imgElement.style.height = "auto"; // Ajusta el tamaño según sea necesario

  imgCell.appendChild(imgElement);


  Object.keys(mangaToGuess).forEach((key, i) => {
    if (key !== 'image') {
      const cell = newRow.insertCell(i);
      imgCell.style.border = '1px solid blue';
      imgCell.style.borderRadius = '6px';
      imgCell.style.padding = '5px';
      if (key === hintCategory) {
        cell.innerText = mangaToGuess[hintCategory];
        cell.style.backgroundColor = '#00FF00';
        cell.style.padding = '5px 2px 5px 2px';
        cell.style.border = '1px solid blue';
        cell.style.borderRadius = '6px';
      } else {
        cell.innerText = " "; // celdas vacias para resto
        cell.style.backgroundColor = '#FF3728';
      }
    }
  });
}


////  función chequeo de seleccion del usuario  //////
function checkGuess() {
  if (!gameIsActive) return;

  const input = document.getElementById("guess");
  const guessButton = document.getElementById("guessButton");
  const guess = input.value.toLowerCase();

  const validTitles = mangaList.map(manga => manga.title.toLowerCase());
  if (!validTitles.includes(guess)) {
    alert("Please enter a valid title from the list");
    return;
  }

  const guessedManga = mangaList.find(manga => manga.title.toLowerCase() === guess);
  const tableBody = document.getElementById("infoTable").getElementsByTagName('tbody')[0];
  const newRow = tableBody.insertRow();

  // Manejo de cada categoría //
  // Inserta la image en la celda inicial
  const imgCell = newRow.insertCell(0);
  imgCell.style.border = '1px solid blue';
  imgCell.style.borderRadius = '6px';
  imgCell.style.padding = '5px';
  const imgElement = document.createElement("img");
  imgElement.src = guessedManga.image;
  imgElement.alt = guessedManga.title;
  imgElement.style.width = "50px"; // Ajusta el tamaño según sea necesario
  imgElement.style.height = "auto"; // Ajusta el tamaño según sea necesario
  imgCell.appendChild(imgElement);

  Object.keys(mangaToGuess).forEach((key, i) => {
    if (key !== 'image') {
      const cell = newRow.insertCell(i);
      cell.innerText = guessedManga[key];

        // celda 'year'
      if (key === 'year') {
        const currentYear = new Date().getFullYear();
        const correctYear = parseInt(mangaToGuess[key] === "Ongoing" ? currentYear : mangaToGuess[key]);
        const guessedYear = parseInt(guessedManga[key] === "Ongoing" ? currentYear : guessedManga[key]);

        if (guessedYear === correctYear) {
          cell.style.backgroundColor = '#00FF00';
          cell.style.padding = '5px 3px 5px 3px';
          cell.style.border = '1px solid blue';
          cell.style.borderRadius = '6px';
        } else if (typeof guessedYear === "number" && typeof correctYear === "number") {
          const diff = guessedYear - correctYear;
          if (Math.abs(diff) <= 55) {
            cell.style.backgroundColor = 'yellow';
            cell.style.padding = '5px 3px 5px 3px';
            cell.style.border = '1px solid blue';
            cell.style.borderRadius = '6px';
            cell.innerHTML += ` ${diff < 0 ? '&#9650;' : '&#9660;'}`;
          } else {
            cell.style.backgroundColor = '#FF3728';
            cell.style.padding = '5px 3px 5px 3px';
            cell.style.border = '1px solid blue';
            cell.style.borderRadius = '6px';
            cell.innerHTML += ` ${diff < 0 ? '&#9650;' : '&#9660;'}`;
          }
        } else {
          cell.style.backgroundColor = '#FF3728';
          cell.style.padding = '5px 3px 5px 3px';
          cell.style.border = '1px solid blue';
          cell.style.borderRadius = '6px';
        }
        return;  // Salimos de la iteración actual
      }

      // celda 'genre'
      if (key === 'genre') {
        const correctGenres = mangaToGuess.genre.split(', ');
        const guessedGenres = guessedManga.genre.split(', ');

        const intersection = guessedGenres.filter(g => correctGenres.includes(g));

        if (intersection.length === guessedGenres.length && guessedGenres.length === correctGenres.length) {
          cell.style.backgroundColor = '#00FF00';
          cell.style.padding = '5px 3px 5px 3px';
          cell.style.border = '1px solid blue';
          cell.style.borderRadius = '6px';
        } else if (intersection.length > 0) {
          cell.style.backgroundColor = 'yellow';
          cell.style.padding = '5px 3px 5px 3px';
          cell.style.border = '1px solid blue';
          cell.style.borderRadius = '6px';
        } else {
          cell.style.backgroundColor = '#FF3728';
          cell.style.padding = '5px 3px 5px 3px';
          cell.style.border = '1px solid blue';
          cell.style.borderRadius = '6px';
        }
        return;  // Salimos de la iteración actual
      }

      // celda 'serie'
      if (key === 'serie') {
        if (guessedManga[key].toLowerCase() === mangaToGuess[key].toLowerCase()) {
          cell.style.backgroundColor = '#00FF00'; // Verde si coincide
        } else {
          cell.style.backgroundColor = '#FF3728'; // Rojo si no coincide
        }
        cell.style.padding = '5px 3px 5px 3px';
        cell.style.border = '1px solid blue';
        cell.style.borderRadius = '6px';
        return; // Salimos de la iteración actual
      }

      // resto de celdas
      if (guessedManga[key] === mangaToGuess[key]) {
        cell.style.backgroundColor = '#00FF00';
        cell.style.padding = '5px 3px 5px 3px';
        cell.style.border = '1px solid blue';
        cell.style.borderRadius = '6px';
        // Add the category to the list of correct categories if it's not already there
        if (!correctCategories.includes(key)) {
          correctCategories.push(key);
        }
      } else {
        cell.style.backgroundColor = '#FF3728';
        cell.style.padding = '5px 3px 5px 3px';
        cell.style.border = '1px solid blue';
        cell.style.borderRadius = '6px';
      }
    }
  });

  if (guess === mangaToGuess.title.toLowerCase()) {
    setTimeout(function () {
      alert("Felicidades ¡Has adivinado la peli!");
      gameIsActive = false;
      input.disabled = true;
      guessButton.disabled = true;
      // Optionally reset the game or proceed to the next round
    }, 300);
  } else {
    lives--;
    displayLives();

    if (lives <= 0) {
      setTimeout(function () {
        alert("¡Game over! La peli era " + mangaToGuess.title);
        gameIsActive = false;
        input.disabled = true;
        guessButton.disabled = true;
      }, 300);
    }
  }
  input.value = "";
}

window.onload = function () {
  // Esto ahora está vacío porque se llama a initGame después de cargar los datos.
};

resetGame();

// texto explicación desplazamiento
const indicadoresDezplaza = document.querySelector('.move-r-l');
const closex1 = document.querySelector('.close-move');
closex1.addEventListener('click',
  () => { indicadoresDezplaza.style.display = 'none' });

// indicadores significado de colores y flechas
const indicadoresColor = document.getElementById('indicadores');
const closex2 = document.querySelector('.close-colores');
closex2.addEventListener('click',
  () => { indicadoresColor.style.display = 'none' });