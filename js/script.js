import { setKey, setURL, setToken } from './config.js'

const token = setToken()
const url = setURL()
const key = setKey()
const global = { currentPage: window.location.pathname }

function init() {
	switch (global.currentPage) {
		case '/':
		case '/index.html':
			displayPopularMovies()
			displayPopularShows()
			break
	}
}

async function fetchAPI(endpoint, page = 'page=1') {
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	}

	const res = await fetch(`${url}/${endpoint}?language=pt-BR&${page}`, options)
	const data = await res.json()

	console.log(data)

	return data
}

async function displayPopularMovies() {
	const { results } = await fetchAPI('trending/movie/week')
	const movieGrid = document.querySelector('#popular-movies')

	for (let i = 0; i <= 19; i++) {
		const card = await generateCard(results, i)
		movieGrid.append(card)
	}
}

async function displayPopularShows() {
	const { results } = await fetchAPI('trending/tv/week')
	const grid = document.querySelector('#popular-shows')

	for (let i = 0; i <= 19; i++) {
		const card = await generateTVShowCard(results, i)
		grid.append(card)
	}
}

async function generateCard(results, index) {
	// Create Elements
	const card = document.createElement('div')
	const rating = document.createElement('div')
	const cover = document.createElement('img')
	const title = document.createElement('h4')
	const details = document.createElement('p')
	const year = document.createElement('span')
	const runtime = document.createElement('span')

	// Add Classes and IDs
	card.classList.add('card')
	rating.classList.add('rating')
	cover.setAttribute(
		'src',
		`https://image.tmdb.org/t/p/w500/${results[index].poster_path}`
	)
	cover.setAttribute('alt', `Capa do filme: ${results[index].title}`)
	year.id = 'release-year'
	runtime.id = 'runtime'

	// Add Content
	title.textContent = results[index].title
	year.textContent = results[index].release_date.slice(0, 4) // Only interested in the year (first 4 characters)
	rating.textContent = results[index].vote_average.toFixed(1)
	let movieData = await fetchAPI(`movie/${results[index].id}`)
	if (movieData.runtime < 60) {
		runtime.textContent = `${movieData.runtime}min`
	} else if (movieData.runtime === 60) {
		runtime.textContent = '1h'
	} else {
		runtime.textContent = `${Math.floor(movieData.runtime / 60)}h ${
			movieData.runtime % 60
		}min`
	}

	// Check rating for color coding
	if (results[index].vote_average >= 8) {
		rating.style.backgroundColor = 'var(--green)'
	} else if (results[index].vote_average >= 5) {
		rating.style.backgroundColor = 'var(--yellow)'
	} else {
		rating.style.backgroundColor = 'var(--red)'
	}

	// Place Items
	details.append(year, runtime)
	card.append(rating, cover, title, details)

	return card
}

async function generateTVShowCard(results, index) {
	// Create Elements
	const card = document.createElement('div')
	const rating = document.createElement('div')
	const cover = document.createElement('img')
	const title = document.createElement('h4')
	const details = document.createElement('p')
	const year = document.createElement('span')
	const runtime = document.createElement('span')

	// Add Classes and IDs
	card.classList.add('card')
	rating.classList.add('rating')
	cover.setAttribute(
		'src',
		`https://image.tmdb.org/t/p/w500/${results[index].poster_path}`
	)
	cover.setAttribute('alt', `Capa do filme: ${results[index].name}`)
	year.id = 'release-year'
	runtime.id = 'runtime'

	// Add Content
	title.textContent = results[index].name
	year.textContent = results[index].first_air_date.slice(0, 4) // Only interested in the year (first 4 characters)
	rating.textContent = results[index].vote_average.toFixed(1)
	let showData = await fetchAPI(`tv/${results[index].id}`)
	showData.number_of_seasons === 1
		? (runtime.textContent = `${showData.number_of_seasons} temporada`)
		: (runtime.textContent = `${showData.number_of_seasons} temporadas`)

	// Check rating for color coding
	if (results[index].vote_average >= 8) {
		rating.style.backgroundColor = 'var(--green)'
	} else if (results[index].vote_average >= 5) {
		rating.style.backgroundColor = 'var(--yellow)'
	} else {
		rating.style.backgroundColor = 'var(--red)'
	}

	// Place Items
	details.append(year, runtime)
	card.append(rating, cover, title, details)

	return card
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init)
