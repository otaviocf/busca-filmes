import { setKey, setURL, setToken } from './config.js'

async function fetchAPIData() {
	const API_KEY = setKey()
	const API_URL = setURL()
	const API_TOKEN = setToken()
}

fetchAPIData()

function displayPopularMovies() {}
