const username = sessionStorage.getItem('username');

const wrondUsernameHandler = () => {
	window.location.replace('/login');
	sessionStorage.removeItem('username');
}

if (!username) {
	window.location.replace('/login');
}

const socket = io('http://localhost:3002/', { query: { username } });

socket.on('error_username', wrondUsernameHandler)
