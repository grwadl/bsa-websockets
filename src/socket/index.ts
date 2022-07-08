import {Server} from 'socket.io';
import login from './namespaces/loginUser'
import rooms from './namespaces/rooms';

export default (io: Server) => {
	login(io.of('/login'));
	rooms(io.of('/rooms'))
};
