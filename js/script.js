import { setKey, setURL, setToken } from './config.js'

const token = setToken()
const url = setURL()
const key = setKey()

const options = {
	method: 'GET',
	headers: {
		accept: 'application/json',
		Authorization: `Bearer ${token}`,
	},
}

fetch('https://api.themoviedb.org/3/authentication', options)
	.then((res) => res.json())
	.then((res) => console.log(res))
	.catch((err) => console.error(err))

const global = {
	currentPage: window.location.pathname,
}

function init() {
	switch (global.currentPage) {
		case '/app/':
			console.log('home')
			break
	}
}

document.addEventListener('DOMContentLoaded', init)
