import { setKey, setURL, setToken } from './config.js'

const token = setToken()
const url = setURL()
const key = setKey()
const global = { currentPage: window.location.pathname }
let moviePage = 1
let showsPage = 1

function init() {
	switch (global.currentPage) {
		case '/':
		case '/index.html':
			displayPopularMovies()
			displayPopularShows()
			homePagination()
			insertSkeletonGrid(
				document.querySelector('section.movies'),
				20,
				'movies-skeleton'
			)
			insertSkeletonGrid(
				document.querySelector('section.shows'),
				20,
				'shows-skeleton'
			)
			break
		case '/movie-details.html':
			getMovieDetails()
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
	let [card, rating, cover, title, details, year, runtime, link] =
		generateElementsForCard(results[index].id, true)

	try {
		cover.setAttribute(
			'src',
			`https://image.tmdb.org/t/p/w500/${results[index].poster_path}`
		)
		cover.setAttribute('alt', `Capa do filme: ${results[index].title}`)
	} catch (error) {
		cover.setAttribute('src', '../assets/no-image.jpg')
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
	let [card, rating, cover, title, details, year, runtime, link] =
		generateElementsForCard(results[index].id, false)

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
	if (results[index].vote_average >= 7) {
		rating.style.backgroundColor = 'var(--green)'
	} else if (results[index].vote_average >= 5) {
		rating.style.backgroundColor = 'var(--yellow)'
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

async function getMovieDetails() {
	const id = window.location.search.slice(1)
	const data = await getData(`/movie/${id}`)

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
		Number(data.vote_average.toFixed(1)) || 'Sem avaliações'

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

	insertSkeletonGrid(document.querySelector('#similar'), 5, 'similar-skeleton')

	displaySimilarMovies(id)
}

async function displaySimilarMovies(id) {
	const { results } = await getData(`/movie/${id}/similar`)

	const movieGrid = document.createElement('div')
	movieGrid.classList.add('card-grid')
	movieGrid.id = 'similar-movies'
	const skeletonGrid = document.querySelector('#similar-skeleton')

	results.slice(0, 5).forEach(async (foo, index) => {
		const card = await generateMovieCard(results, index)
		movieGrid.append(card)

		if (index === 4) {
			skeletonGrid.replaceWith(movieGrid)
		}
	})
}

// Event Listeners
document.addEventListener('DOMContentLoaded', init)
