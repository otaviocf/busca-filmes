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
			break
	}
}

async function getPopularMovies() {
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	}

	const res = await fetch(`${url}/movie/popular?language=pt-BR&page=1`, options)
	const data = await res.json()

	return data
}

async function displayPopularMovies() {
	const { results } = await getPopularMovies()
	const movieGrid = document.querySelector('.movie-grid')

	for (let i = 0; i <= 19; i++) {
		const card = generateMovieCard(results, i)
		movieGrid.append(card)
	}
}

function generateMovieCard(results, index) {
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
