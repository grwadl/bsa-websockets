import {Server} from 'socket.io';
interface IRoom {
	name: string,
	members: string[]
}
let rooms: IRoom[] = [];

export default (io: Server) => {
	let users: string[] = [];
	io.on('connection', socket => {
		const username: string = (socket.handshake.query.username as string);
		!users.includes(username)
			? users.push(username)
			: socket.emit('error_username', 'error');
		socket.emit('get_rooms', rooms);
		socket.join('lobby');
		socket.on('add_room', (room: string) => {
			if (rooms.find(item => item.name === room)) {
				return;
			}
			rooms.push({name: room, members: [username]});
			io.sockets.in('lobby').emit('add_room', {name: room, members: [username]});
			const index = rooms.findIndex(item => item.name === room);
			io.to(socket.id).emit('join_room_done', { room : rooms[index] });
			socket.join(room);
			socket.leave('lobby');
		})

		socket.on('join_room', roomName => {
			rooms.forEach(item => item.members = item.members.filter(member => member !== username));
			const index = rooms.findIndex(room => room.name === roomName);
			rooms[index].members.push(username);
			socket.join(roomName);
			socket.leave('lobby');
			io.to(socket.id).emit('join_room_done', { room : rooms[index] })
			io.sockets.in('lobby').emit('refresh_room_info', { room : rooms[index] });
		})

		socket.on('leave_room', roomName => {
			const index = rooms.findIndex(room => room.name === roomName);
			rooms[index].members = rooms[index].members.filter(member => member !== username)
			io.to(socket.id).emit('leave_room_done', { room : rooms[index] });
			socket.leave(roomName);
			socket.join('lobby');
			if(rooms[index].members.length>=1){
				io.sockets.in('lobby').emit('refresh_room_info', { room : rooms[index] });
			}
			else {
				rooms = rooms.filter(item => item.members.length > 0);
				io.sockets.in('lobby').emit('get_rooms', rooms)
			}
			//TODO: сделать дейтсвие для обновки рума отдельно
		})

		socket.on('disconnect', () => {
			const username: string = (socket.handshake.query.username as string);
			rooms.forEach(item => item.members = item.members.filter(member => member !== username));
			rooms = rooms.filter(item => item.members.length > 0);
			users = users.filter(item => item !== username);
			io.sockets.in('lobby').emit('get_rooms', rooms)
		})
	});
};
