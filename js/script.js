import { setKey, setURL, setToken } from './config.js'

const token = setToken()
const url = setURL()
const key = setKey()
const global = { currentPage: window.location.pathname }
const next = document.querySelector('#forward-movie')
const previous = document.querySelector('#backward-movie')
const seriesNext = document.querySelector('#forward-show')
const seriesPrevious = document.querySelector('#backward-show')
let moviePage = 1
let showPage = 1

function init() {
	switch (global.currentPage) {
		case '/':
		case '/index.html':
			displayPopularMovies()
			displayPopularShows()
			break
	}
}

async function getData(endpoint, page = 1) {
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	}

	const res = await fetch(
		`${url}/${endpoint}?language=pt-BR&page=${page}`,
		options
	)
	const data = await res.json()

	return data
}

async function displayPopularMovies(page = 1) {
	const { results } = await getData('trending/movie/week', page)
	const movieGrid = document.querySelector('#popular-movies')

	for (let i = 0; i <= 19; i++) {
		const card = await generateMovieCard(results, i)
		movieGrid.append(card)
	}
}

async function displayPopularShows(page = 1) {
	const { results } = await getData('trending/tv/week', page)
	const grid = document.querySelector('#popular-shows')

	for (let i = 0; i <= 19; i++) {
		const card = await generateShowCard(results, i)
		grid.append(card)
	}
}

function generateElementsForCard() {
	// Generate elements
	const card = document.createElement('div')
	const rating = document.createElement('div')
	const cover = document.createElement('img')
	const title = document.createElement('h4')
	const details = document.createElement('p')
	const year = document.createElement('span')
	const runtime = document.createElement('span')

	// Add classes and IDs
	year.id = 'release-year'
	runtime.id = 'runtime'
	card.classList.add('card')
	rating.classList.add('rating')

	return [card, rating, cover, title, details, year, runtime]
}

async function generateMovieCard(results, index) {
	console.log(results)

	let [card, rating, cover, title, details, year, runtime] =
		generateElementsForCard()

	cover.setAttribute(
		'src',
		`https://image.tmdb.org/t/p/w500/${results[index].poster_path}`
	)
	cover.setAttribute('alt', `Capa do filme: ${results[index].title}`)

	// Add Content
	title.textContent = results[index].title
	year.textContent = results[index].release_date.slice(0, 4) // Only interested in the year (first 4 characters)
	if (results[index].vote_average === 0) {
		rating.textContent = 'Não estreado'
	} else {
		rating.textContent = results[index].vote_average.toFixed(1)
	}
	let movieData = await getData(`movie/${results[index].id}`)
	if (movieData.runtime < 60) {
		runtime.textContent = `${movieData.runtime}min`
	} else if (movieData.runtime % 60 === 0) {
		runtime.textContent = `${movieData.runtime / 60}h`
	} else {
		runtime.textContent = `${Math.floor(movieData.runtime / 60)}h ${
			movieData.runtime % 60
		}min`
	}

	// Check rating for color coding
	if (results[index].vote_average >= 8) {
		rating.style.backgroundColor = 'var(--green)'
	} else if (
		results[index].vote_average >= 5 ||
		results[index].vote_average === 0
	) {
		rating.style.backgroundColor = 'var(--yellow)'
	} else {
		rating.style.backgroundColor = 'var(--red)'
	}

	// Place Items
	details.append(year, runtime)
	card.append(rating, cover, title, details)

	return card
}

async function generateShowCard(results, index) {
	let [card, rating, cover, title, details, year, runtime] =
		generateElementsForCard()

	try {
		cover.setAttribute(
			'src',
			`https://image.tmdb.org/t/p/w500/${results[index].poster_path}`
		)
		cover.setAttribute('alt', `Capa do filme: ${results[index].name}`)
	} catch (error) {
		cover.setAttribute('src', '../assets/no-image.jpg')
	}

	// Add Content
	title.textContent = results[index].name
	year.textContent = results[index].first_air_date.slice(0, 4) // Only interested in the year (first 4 characters)
	rating.textContent = results[index].vote_average.toFixed(1)
	let showData = await getData(`tv/${results[index].id}`)
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

function nextPage(section) {
	section === 'movie' ? (moviePage += 1) : null
	section === 'series' ? (showPage += 1) : null

	if (section === 'movie') {
		document.querySelector('#popular-movies').innerHTML = ''
		displayPopularMovies(moviePage)
		document
			.querySelectorAll('.divider')[0]
			.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
	} else if (section === 'series') {
		document.querySelector('#popular-shows').innerHTML = ''
		displayPopularShows(showPage)
		document
			.querySelectorAll('.divider')[1]
			.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
	}
}

function preivousPage(section) {
	section === 'movie' ? (moviePage -= 1) : null
	section === 'series' ? (showPage -= 1) : null

	if (section === 'movie') {
		document.querySelector('#popular-movies').innerHTML = ''
		displayPopularMovies(moviePage)
	} else if (section === 'series') {
		document.querySelector('#popular-shows').innerHTML = ''
		displayPopularShows(showPage)
	}
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init)
next.addEventListener('click', (event) => nextPage('movie'))
previous.addEventListener('click', (event) => {
	if (moviePage === 1) {
		alert('Você já está na primeira página')
	} else {
		preivousPage('movie')
	}
})
seriesNext.addEventListener('click', (event) => nextPage('series'))
seriesPrevious.addEventListener('click', (event) => {
	if (showPage === 1) {
		alert('Você já está na primeira página')
	} else {
		preivousPage('series')
	}
})
