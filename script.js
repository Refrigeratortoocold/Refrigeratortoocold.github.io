// Fetch list of anime titles to populate the dropdown
async function fetchAnimeList() {
  const query = `
    query {
      Page(page: 1, perPage: 50) {  <!-- Change perPage to 50 or more -->
        media(type: ANIME) {
          id
          title {
            romaji
          }
        }
      }
    }
  `;

  const url = 'https://graphql.anilist.co';
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const animeList = data.data.Page.media;

    const animeSelect = document.getElementById('anime-select');
    animeList.forEach(anime => {
      const option = document.createElement('option');
      option.value = anime.id;
      option.textContent = anime.title.romaji;
      animeSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching anime list:", error);
  }
}
