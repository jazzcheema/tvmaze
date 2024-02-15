"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const TV_URL = 'https://api.tvmaze.com/';

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {

  const params = new URLSearchParams({ q: searchTerm });
  const response = await fetch(`${TV_URL}search/shows?${params}`);
  const showData = await response.json();

  const neededShowData = showData.map(({ show }) => ({
    name: show.name,
    id: show.id,
    summary: show.summary,
    image: show.image === null ? 'https://tinyurl.com/tv-missing'
      : show.image.medium
  }));

  return neededShowData;
}

/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();
  for (const show of shows) {

    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
              <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($show);

  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
//CONDUCTOR FUNCTION
async function searchShowsAndDisplay() {

  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);


  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
  $("#episodesList").empty();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */


//this is used to input our unique show ID to retrieve data about that
//specific show, and returns an array ob objects
async function getEpisodesOfShow(id) {

  const response = await fetch(`${TV_URL}shows/${id}/episodes`);
  const returnedEpisodeInfo = await response.json();

  return returnedEpisodeInfo;
}


/** this is taking our array list of objects, looping through them and
 * returning info of the episodes--> appends to episodelist area
*/

function displayEpisodes(episodes) {

  for (const episode of episodes) {
    console.log(episode.name);
    const $episodeSection = $(`<li class=""> Title: ${episode.name},
    Season: ${episode.season},
    Episode Number: ${episode.number} </li> `);

    $('#episodesList').append($episodeSection);
  }
  $("#episodesArea").show();

}


//our new/latest controller function ! This grabs episode data, specific to
//that show with ID obtained from the event listener --> returns an array of
//objects to be looped over, returned and appended to the dom. This is called
//in a separate event listener from grabbing show ID.
//
async function getEpisodesInfoAndDisplay() {

  const episodes = await getEpisodesOfShow(episodeButtonId);
  const episodeDomInfo = displayEpisodes(episodes);

  return episodeDomInfo;
}

//button below each card 'episodes' needs an event listener
let episodeButtonId;

//button below each card 'episodes' needs an event listener
$showsList.on('click', '.Show-getEpisodes', function (event) {
  const showId = $(event.target).closest(".Show").data("showId");
  episodeButtonId = showId;
  toggleUnsafe();
});


//this is just adding a class to our episode list to remove it once it's clicked
//again-- so in a sense we are acting like it is toggling on/off--> but it never
//turns back on..
function toggleUnsafe() {
  $('li').addClass('unsafe');
}

//on click --> return our new controller func.
$showsList.on("click", getEpisodesInfoAndDisplay)





