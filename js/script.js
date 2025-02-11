import { setKey, setURL, setToken } from './config.js'

const token = setToken()
const url = setURL()
const key = setKey()
const global = { currentPage: window.location.pathname }
let moviePage = 1
let showsPage = 1

async function init() {
	switch (global.currentPage) {
		case '/':
		case '/index.html':
			displayPopularMovies()
			displayPopularShows()
			homePagination()
			insertSkeletonGrid(document.querySelector('section.movies'), 20, 'movies-skeleton')
			insertSkeletonGrid(document.querySelector('section.shows'), 20, 'shows-skeleton')
			break
		case '/movie-details.html':
			getDetails()
			break
		case '/tv-details.html':
			getDetails('tv')
			break
		case '/search.html':
			const query = new URLSearchParams(window.location.search).get('q')
			insertSkeletonGrid(document.querySelector('section.movies'), 20, 'results-skeleton')
			displaySearchResults(1, query)
			break
	}
}

async function getData(endpoint, page = 1, query = '') {
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${token}`,
		},
	}

	const res = await fetch(`${url}/${endpoint}?language=pt-BR&page=${page}&query=${query}`, options)
	const data = await res.json()

	return data
}

async function displayPopularMovies(page = 1) {
	const { results } = await getData('trending/movie/week', page)
	const movieGrid = document.createElement('div')
	movieGrid.classList.add('card-grid')
	movieGrid.id = 'popular-movies'
	const skeletonGrid = document.querySelector('#movies-skeleton')

	for (let i = 0; i < results.length; i++) {
		const card = await generateMovieCard(results, i)
		movieGrid.append(card)

		if (i === results.length - 1) {
			skeletonGrid.replaceWith(movieGrid)
		}
	}
}

async function displayPopularShows(page = 1) {
	const { results } = await getData('trending/tv/week', page)
	const showsGrid = document.createElement('div')
	showsGrid.classList.add('card-grid')
	showsGrid.id = 'popular-shows'
	const skeletonGrid = document.querySelector('#shows-skeleton')

	for (let i = 0; i < results.length; i++) {
		const card = await generateShowCard(results, i)
		showsGrid.append(card)

		if (i === results.length - 1) {
			skeletonGrid.replaceWith(showsGrid)
		}
	}
}

function generateElementsForCard(id, isMovie) {
	// Generate elements
	const card = document.createElement('div')
	const rating = document.createElement('div')
	const cover = document.createElement('img')
	const title = document.createElement('h4')
	const details = document.createElement('p')
	const year = document.createElement('span')
	const runtime = document.createElement('span')
	const link = document.createElement('a')

	// Add Attributes
	year.id = 'release-year'
	runtime.id = 'runtime'
	card.classList.add('card')
	rating.classList.add('rating')
	isMovie
		? link.setAttribute('href', `./movie-details.html?${id}`)
		: link.setAttribute('href', `./tv-details.html?${id}`)

	return [card, rating, cover, title, details, year, runtime, link]
}

async function generateMovieCard(results, index) {
	let [card, rating, cover, title, details, year, runtime, link] = generateElementsForCard(results[index].id, true)

	if (results[index].poster_path) {
		cover.setAttribute('src', `https://image.tmdb.org/t/p/w500/${results[index].poster_path}`)
	} else {
		cover.setAttribute('src', '../assets/no-image.jpg')
	}
	cover.setAttribute('alt', `Capa da série: ${results[index].title}`)

	// Add Content
	title.textContent = results[index].title
	results[index].release_date
		? (year.textContent = results[index].release_date.slice(0, 4))
		: (year.textContent = '????')
	const voteAverage = results[index].vote_average
	if (typeof voteAverage === 'number' && !isNaN(voteAverage)) {
		rating.textContent = Number(voteAverage.toFixed(1))
	} else {
		rating.textContent = 'Sem avaliações'
	}
	let movieData = await getData(`movie/${results[index].id}`)
	if (movieData.runtime < 60) {
		runtime.textContent = `${movieData.runtime}min`
	} else if (movieData.runtime % 60 === 0) {
		runtime.textContent = `${movieData.runtime / 60}h`
	} else {
		runtime.textContent = `${Math.floor(movieData.runtime / 60)}h ${movieData.runtime % 60}min`
	}

	// Check rating for color coding
	if (results[index].vote_average >= 7) {
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
	link.append(rating, cover, title, details)
	card.append(link)

	return card
}

async function generateShowCard(results, index) {
	let [card, rating, cover, title, details, year, runtime, link] = generateElementsForCard(results[index].id, false)

	if (results[index].poster_path) {
		cover.setAttribute('src', `https://image.tmdb.org/t/p/w500/${results[index].poster_path}`)
	} else {
		cover.setAttribute('src', '../assets/no-image.jpg')
	}
	cover.setAttribute('alt', `Capa da série: ${results[index].name}`)

	// Add Content
	title.textContent = results[index].name
	year.textContent = results[index].first_air_date.slice(0, 4) // Only interested in the year (first 4 characters)
	const voteAverage = results[index].vote_average
	if (typeof voteAverage === 'number' && !isNaN(voteAverage)) {
		rating.textContent = Number(voteAverage.toFixed(1))
	} else {
		rating.textContent = 'Sem avaliações'
	}
	let showData = await getData(`tv/${results[index].id}`)
	showData.number_of_seasons === 1
		? (runtime.textContent = `${showData.number_of_seasons} temporada`)
		: (runtime.textContent = `${showData.number_of_seasons} temporadas`)

	// Check rating for color coding
	if (results[index].vote_average >= 7) {
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
	link.append(rating, cover, title, details)
	card.append(link)

	return card
}

function generateSkeletonGrid(size, id) {
	const grid = document.createElement('div')
	const card = document.createElement('div')
	const poster = document.createElement('div')
	const details = document.createElement('div')

	grid.id = id
	grid.classList.add('grid-skeleton')
	card.classList.add('card-skeleton')
	poster.classList.add('poster-skeleton')
	details.classList.add('details-skeleton')

	card.append(poster, details)

	for (let i = 0; i < size; i++) {
		grid.append(card.cloneNode(true))
	}

	return grid
}

function insertSkeletonGrid(appendTo, size, id) {
	const grid = generateSkeletonGrid(size, id)
	appendTo.append(grid)
}

function nextPage(section) {
	section === 'movie' && (moviePage += 1)
	section === 'series' && (showsPage += 1)
	const movieGrid = document.querySelector('#popular-movies')
	const showsGrid = document.querySelector('#popular-shows')

	if (section === 'movie') {
		const skeletonGrid = generateSkeletonGrid(20, 'movies-skeleton')
		movieGrid.replaceWith(skeletonGrid)
		displayPopularMovies(moviePage)
	} else if (section === 'series') {
		const skeletonGrid = generateSkeletonGrid(20, 'shows-skeleton')
		showsGrid.replaceWith(skeletonGrid)
		displayPopularShows(showsPage)
	}
}

function preivousPage(section) {
	section === 'movie' && (moviePage -= 1)
	section === 'series' && (showsPage -= 1)
	const movieGrid = document.querySelector('#popular-movies')
	const showsGrid = document.querySelector('#popular-shows')

	if (section === 'movie') {
		const skeletonGrid = generateSkeletonGrid(20, 'movies-skeleton')
		movieGrid.replaceWith(skeletonGrid)
		displayPopularMovies(moviePage)
	} else if (section === 'series') {
		const skeletonGrid = generateSkeletonGrid(20, 'shows-skeleton')
		showsGrid.replaceWith(skeletonGrid)
		displayPopularShows(showsPage)
	}
}

function homePagination() {
	const next = document.querySelector('#forward-movie')
	const previous = document.querySelector('#backward-movie')
	const seriesNext = document.querySelector('#forward-show')
	const seriesPrevious = document.querySelector('#backward-show')

	next.addEventListener('click', () => nextPage('movie'))
	previous.addEventListener('click', () => {
		if (moviePage === 1) {
			alert('Você já está na primeira página')
		} else {
			preivousPage('movie')
		}
	})
	seriesNext.addEventListener('click', () => nextPage('series'))
	seriesPrevious.addEventListener('click', () => {
		if (showsPage === 1) {
			alert('Você já está na primeira página')
		} else {
			preivousPage('series')
		}
	})
}

async function getDetails(type = 'movie') {
	const id = window.location.search.slice(1)
	const data = await getData(`/${type}/${id}`)
	console.log(data)

	// Set Poster
	const poster = document.createElement('img')
	data.poster_path
		? poster.setAttribute('src', `https://image.tmdb.org/t/p/w500/${data.poster_path}`)
		: poster.setAttribute('src', `../assets/no-image.jpg`)
	document.querySelector('.poster').appendChild(poster)

	// Query DOM
	const title = document.querySelector('.content h1')
	const overview = document.querySelector('.content p')
	const year = document.querySelector('.main-info .year span')
	const runtime = document.querySelector('.main-info .runtime span')

	// Add Info
	title.textContent = data.title || data.name
	overview.textContent = data.overview || '[Descrição indisponível]'
	document.querySelector('.main-info .rating span').textContent =
		Number(data.vote_average.toFixed(1)) || 'Sem avaliações'
	if (type === 'movie') {
		if (data.release_date) year.textContent = data.release_date.slice(0, 4)
		else year.textContent = 'Desconhecido'
	} else {
		year.textContent = yearSpan(data)
	}

	// Convert Runtime to be More Legible
	if (data.runtime) {
		// Places runtime if it is a movie
		if (data.runtime < 60) {
			runtime.textContent = `${data.runtime}min`
		} else if (data.runtime % 60 === 0) {
			runtime.textContent = `${data.runtime / 60}h`
		} else {
			runtime.textContent = `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}min`
		}
	} else if (data.runtime === 0) {
		// Handles case where runtime is unknown
		runtime.textContent = 'Desconhecido'
	} else {
		// Switches to number of seasons if (runtime === undefined)
		data.number_of_seasons > 1
			? (runtime.textContent = `${data.number_of_seasons} temporadas`)
			: (runtime.textContent = `${data.number_of_seasons} temporada`)
	}

	// Add Genres
	if (data.genres.length) {
		data.genres.forEach((genre) => {
			const bubble = document.createElement('div')
			bubble.classList.add('bubble')
			bubble.setAttribute('data-id', genre.id)
			bubble.textContent = genre.name
			document.querySelector('.bubble-group-genres').appendChild(bubble)
		})
	} else {
		const bubble = document.createElement('div')
		bubble.classList.add('bubble')
		bubble.textContent = 'Desconhecido'
		document.querySelector('.bubble-group-genres').appendChild(bubble)
	}

	// Add Backdrop
	const overlay = document.createElement('div')
	overlay.classList.add('backdrop')
	overlay.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${data.backdrop_path})`
	document.querySelector('main').appendChild(overlay)

	// Add Cast
	const castObj = await getData(`/${type}/${id}/credits`)
	let castArr
	castObj.cast.length ? (castArr = castObj.cast) : (castArr = castObj.crew)
	if (castArr.length) {
		castArr.slice(0, 4).forEach((actor) => {
			const bubble = document.createElement('div')
			bubble.classList.add('bubble')
			bubble.setAttribute('data-actor', actor.name)
			bubble.textContent = actor.name
			document.querySelector('.bubble-group-actors').appendChild(bubble)
		})
	} else {
		const bubble = document.createElement('div')
		bubble.classList.add('bubble')
		bubble.textContent = 'Desconhecido'
		document.querySelector('.bubble-group-actors').appendChild(bubble)
	}

	insertSkeletonGrid(document.querySelector('#similar'), 5, 'similar-skeleton')

	displaySimilar(id, type)
}

async function displaySimilar(id, type) {
	let { results } = await getData(`/${type}/${id}/recommendations`)

	// Default to similar movies if there are no recommendations
	if (!results.length) {
		let data = await getData(`/${type}/${id}/similar`)
		results = data['results']
	}

	const movieGrid = document.createElement('div')
	movieGrid.classList.add('card-grid')
	movieGrid.id = 'similar-movies'
	const skeletonGrid = document.querySelector('#similar-skeleton')

	results.slice(0, 5).forEach(async (foo, index) => {
		let card
		type === 'movie'
			? (card = await generateMovieCard(results, index))
			: (card = await generateShowCard(results, index))
		movieGrid.append(card)

		if (index === 4) {
			skeletonGrid.replaceWith(movieGrid)
		}
	})
}

function yearSpan(show) {
	console.log(show)

	const start = Number(show.first_air_date.slice(0, 4))
	const end = Number(show.last_air_date.slice(0, 4))
	console.log(start)
	console.log(end)

	if (start) {
		if (start === end) {
			return start
		} else {
			return `${start} à ${end}`
		}
	} else {
		return 'Desconhecido'
	}
}

async function getSearchResults(query) {
	const { results: movies } = await getData('/search/movie', 1, query)
	const { results: shows } = await getData('/search/tv', 1, query)

	return {
		movies,
		shows,
	}
}

async function generateSearchGrid(query, type) {
	const data = await getSearchResults(query)
	let results
	type === 'movies' ? (results = data['movies']) : (results = data['shows'])

	const cardGrid = document.createElement('div')
	cardGrid.classList.add('card-grid')

	if (type === 'movies') {
		for (let i = 0; i < results.length; i++) {
			const card = await generateMovieCard(results, i)
			cardGrid.append(card)
		}
	} else {
		for (let i = 0; i < results.length; i++) {
			const card = await generateShowCard(results, i)
			cardGrid.append(card)
		}
	}

	return cardGrid
}

async function displaySearchResults(page = 1, query) {
	const moviesTab = document.querySelector('#tab-1')
	moviesTab.checked = true

	const movieGrid = await generateSearchGrid(query, 'movies')
	movieGrid.id = 'movies'
	const showsGrid = await generateSearchGrid(query, 'shows')
	showsGrid.id = 'shows'

	const skeletonGrid = document.querySelector('#results-skeleton')
	if (moviesTab.checked) {
		skeletonGrid.replaceWith(movieGrid)
	} else {
		skeletonGrid.replaceWith(showsGrid)
	}

	let options = document.querySelectorAll('.radio-option')
	options.forEach((option) => {
		option.addEventListener('change', (event) => {
			if (event.target.id === 'tab-1') {
				document.querySelector('#shows').replaceWith(movieGrid)
			} else {
				document.querySelector('#movies').replaceWith(showsGrid)
			}
		})
	})
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init)
