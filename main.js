// Develop an Infinite scroll list using vanilla javascript.
//  - Utilize PokeAPI for fetching data (https://pokeapi.co/api/v2/pokemon?offset=0&limit=10).
//  - The list should show 10 Pokémon names initially and it should dynamically load more items when the user scrolls up or down.
//  - Ensure the list maintains only "n" items at any given time (remove old items from DOM which are not in viewport).
//  - display loading indicator
//  - Implement mechanisms to handle api errors and auto retry on network errors.
// optional if time permits:
//  - Add an option to quickly jump to the top or bottom of the list.
//  - Include an option for navigating to a specific item by number.
//  - Introduce an automatic scrolling feature (play button).
//  - Allow users to pause and resume auto-scrolling.

class Result {
  data = [];
  total = 0;
  offset = 0;
  limit = 0;
  error = null;
}

let pageSize = 50;
let currentPage = 0;
let totalPages = 0;
let totalResults = 0;
let canScroll = true;
const resultsDiv = document.getElementById('results');
const infoDiv = document.getElementById('info');
const loadingDiv = document.getElementById('loading');

// Get the data from the API
async function getData(page, limit=10) {
  let result = new Result();

  const url = `https://pokeapi.co/api/v2/pokemon?offset=${page*pageSize}&limit=${limit}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'GET'
    });

    if (response.ok) {
      const jsonData = await response.json();
      result.data = jsonData.results;
      result.total = jsonData.count;
      result.offset = page*pageSize;
      result.limit = limit;
    }
    else {
      result.error = `${response.status} - ${response.statusText}`;
    }
  }
  catch(e) {
    console.log(e);
    result.error = `${response.status} - ${response.statusText}`;
  }

  return result;
}

// console.log(await getData(0, 10));

async function loadDataInResultsDiv() {
  const template = '<a href="[url]">[name]</a>';
  loading(true);

  const results = await getData(currentPage, pageSize);
  const data = results.data;
  totalResults = results.total;
  totalPages = Math.floor(totalResults / pageSize);

  // Results div
  let html = '';
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const itemHtml = '<li>' + template.replace('[url]', item.url).replace('[name]', item.name) + '</li>';
    html += itemHtml;
  }
  resultsDiv.innerHTML += html;

  // Info div
  let infoHtml = `
    Page ${currentPage+1} of ${totalPages}
  `;
  infoDiv.innerHTML = infoHtml;
  
  loading(false);
}

function loading(show) {
  loadingDiv.style.display = show ? 'block' : 'none';
}

async function previousPage() {
  console.log('Previous page called');
  loading();
  currentPage = currentPage <= 0 ? 0 : currentPage - 1;
  await loadDataInResultsDiv();
  canScroll = true;
}

async function nextPage() {
  console.log('Next page called');
  loading();
  currentPage = currentPage >= totalPages ? totalPages : currentPage + 1;
  await loadDataInResultsDiv();
  canScroll = true;
}

function handleScroll() {
  if (canScroll) {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
      canScroll = false;
      nextPage();
    }
  }
}

window.addEventListener('scroll', handleScroll);
await loadDataInResultsDiv();