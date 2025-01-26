import { setKey, setURL, setToken } from './config.js'

const token = setToken()
const url = setURL()
const key = setKey()
const global = { currentPage: window.location.pathname }
let moviePage = 1
let showPage = 1

function init() {
	switch (global.currentPage) {
		case '/':
		case '/index.html':
			displayPopularMovies()
			displayPopularShows()
			homePagination()

			// Redirect Router to Movie Details Page
			document
				.querySelector('#popular-movies')
				.addEventListener('click', (event) => {
					if (event.target.tagName === 'IMG') {
						window.location.assign(
							`./movie-details.html?${event.target.dataset.id}`
						)
					}
				})
			break
		case '/movie-details.html':
			getMovieDetails()
			document
				.querySelector('#similar-movies')
				.addEventListener('click', (event) => {
					if (event.target.tagName === 'IMG') {
						window.location.assign(
							`./movie-details.html?${event.target.dataset.id}`
						)
					}
				})
			break
		case '/tv-details.html':
			console.log('Shows')
			break
		case '/search.html':
			console.log('Search')
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
	console.log(results)
	const movieGrid = document.querySelector('#popular-movies')
	const skeletonGrid = document.querySelector('#movie-skeleton')

	for (let i = 0; i < results.length; i++) {
		const card = await generateMovieCard(results, i)
		movieGrid.append(card)

		if (i === results.length - 1) {
			movieGrid.style.display = 'grid'
			skeletonGrid.style.display = 'none'
		}
	}
}

async function displayPopularShows(page = 1) {
	const { results } = await getData('trending/tv/week', page)
	const grid = document.querySelector('#popular-shows')
	const skeletonGrid = document.querySelector('#shows-skeleton')

	for (let i = 0; i < results.length; i++) {
		const card = await generateShowCard(results, i)
		grid.append(card)
		if (i === results.length - 1) {
			grid.style.display = 'grid'
			skeletonGrid.style.display = 'none'
		}
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
	let [card, rating, cover, title, details, year, runtime] =
		generateElementsForCard()

	try {
		cover.setAttribute(
			'src',
			`https://image.tmdb.org/t/p/w500/${results[index].poster_path}`
		)
		cover.setAttribute('alt', `Capa do filme: ${results[index].title}`)
		cover.setAttribute('data-id', `${results[index].id}`)
	} catch (error) {
		cover.setAttribute('src', '../assets/no-image.jpg')
		cover.setAttribute('data-info', `${results[index].id}`)
	}

	// Add Content
	title.textContent = results[index].title
	year.textContent = results[index].release_date.slice(0, 4) // Only interested in the year (first 4 characters)
	rating.textContent =
		Number(results[index].vote_average.toFixed(1)) || 'Sem avaliações'
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
	} else if (results[index].vote_average >= 5) {
		rating.style.backgroundColor = 'var(--yellow)'
	} else if (results[index].vote_average === 0) {
		rating.style.backgroundColor = 'rgb(79, 62, 54)'
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
		cover.setAttribute('alt', `Capa da série: ${results[index].name}`)
		cover.setAttribute('data-info', `${results[index].id}`)
	} catch (error) {
		cover.setAttribute('src', '../assets/no-image.jpg')
		cover.setAttribute('data-info', `${results[index].id}`)
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
	const movieGrid = document.querySelector('#popular-movies')
	const showsGrid = document.querySelector('#popular-shows')
	const movieSkeletonGrid = document.querySelector('#movie-skeleton')
	const showsSkeletonGrid = document.querySelector('#shows-skeleton')

	if (section === 'movie') {
		movieGrid.style.display = 'none'
		movieSkeletonGrid.style.display = 'grid'
		movieGrid.innerHTML = ''
		displayPopularMovies(moviePage)
	} else if (section === 'series') {
		showsGrid.style.display = 'none'
		showsSkeletonGrid.style.display = 'grid'
		showsGrid.innerHTML = ''
		displayPopularShows(showPage)
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

function homePagination() {
	const next = document.querySelector('#forward-movie')
	const previous = document.querySelector('#backward-movie')
	const seriesNext = document.querySelector('#forward-show')
	const seriesPrevious = document.querySelector('#backward-show')

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
}

async function getMovieDetails() {
	const id = window.location.search.slice(1)
	const data = await getData(`/movie/${id}`)
	console.log(data)

	// Set Poster
	const poster = document.createElement('img')
	poster.setAttribute(
		'src',
		`https://image.tmdb.org/t/p/w500/${data.poster_path}`
	)
	document.querySelector('.poster').appendChild(poster)

	// Add Info
	document.querySelector('.content h1').textContent = data.title
	document.querySelector('.content p').textContent =
		data.overview || '[Descrição indisponível]'
	document.querySelector('.main-info .year span').textContent =
		data.release_date.slice(0, 4)
	document.querySelector('.main-info .rating span').textContent =
		data.vote_average.toFixed(1)

	// Convert Runtime to be More Legible
	const runtime = document.querySelector('.main-info .runtime span')
	if (data.runtime < 60) {
		runtime.textContent = `${data.runtime}min`
	} else if (data.runtime % 60 === 0) {
		runtime.textContent = `${data.runtime / 60}h`
	} else {
		runtime.textContent = `${Math.floor(data.runtime / 60)}h ${
			data.runtime % 60
		}min`
	}

	// Add Genres
	data.genres.forEach((genre) => {
		const bubble = document.createElement('div')
		bubble.classList.add('bubble')
		bubble.setAttribute('data-id', genre.id)
		bubble.textContent = genre.name
		document.querySelector('.bubble-group-genres').appendChild(bubble)
	})

	// Add Backdrop
	const overlay = document.createElement('div')
	overlay.classList.add('backdrop')
	overlay.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${data.backdrop_path})`
	document.querySelector('main').appendChild(overlay)

	// Add Cast
	const castObj = await getData(`/movie/${id}/credits`)
	let castArr
	castObj.cast.length ? (castArr = castObj.cast) : (castArr = castObj.crew)
	castArr.slice(0, 4).forEach((actor) => {
		const bubble = document.createElement('div')
		bubble.classList.add('bubble')
		bubble.setAttribute('data-actor', actor.name)
		bubble.textContent = actor.name
		document.querySelector('.bubble-group-actors').appendChild(bubble)
	})

	displaySimilarMovies(id)
}

async function displaySimilarMovies(id) {
	const { results } = await getData(`/movie/${id}/similar`)
	console.log(results)
	const movieGrid = document.querySelector('#similar-movies')
	const skeletonGrid = document.querySelector('#similar-movie-skeleton')
	results.slice(0, 5).forEach(async (movie, index) => {
		const card = await generateMovieCard(results, index)
		movieGrid.append(card)
		if (index === 4) {
			movieGrid.style.display = 'grid'
			skeletonGrid.style.display = 'none'
		}
	})
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init)
