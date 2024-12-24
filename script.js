<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pokémon Info</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      background-color: #f4f4f4;
    }
    #pokemon-card {
      margin: 20px auto;
      padding: 20px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 300px;
    }
    img {
      max-width: 100px;
      margin: 10px 0;
    }
    #search-box {
      padding: 10px;
      margin: 20px 0;
      width: 250px;
      border-radius: 5px;
      border: 1px solid #ddd;
    }
    button {
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <h1>Pokémon Information</h1>
  <input id="search-box" type="text" placeholder="Enter Pokémon name (e.g., Pikachu)">
  <button onclick="getPokemon()">Search</button>
  <div id="pokemon-card"></div>

  <script>
    function getPokemon() {
      const pokemonName = document.getElementById('search-box').value.toLowerCase();
      const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Pokémon not found');
          }
          return response.json();
        })
        .then(data => {
          const pokemonCard = document.getElementById('pokemon-card');
          pokemonCard.innerHTML = `
            <h2>${data.name.toUpperCase()}</h2>
            <img src="${data.sprites.front_default}" alt="${data.name}" />
            <p><strong>Type:</strong> ${data.types.map(type => type.type.name).join(', ')}</p>
            <p><strong>Height:</strong> ${data.height / 10} m</p>
            <p><strong>Weight:</strong> ${data.weight / 10} kg</p>
          `;
        })
        .catch(error => {
          const pokemonCard = document.getElementById('pokemon-card');
          pokemonCard.innerHTML = `<p style="color: red;">${error.message}</p>`;
        });
    }
  </script>
</body>
</html>
