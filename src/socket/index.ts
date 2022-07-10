import {Server} from 'socket.io';
import {SECONDS_FOR_GAME, SECONDS_TIMER_BEFORE_START_GAME} from "./config";

interface IMember {
	username: string,
	isReady: boolean,
	percent: number,
}


interface IRoom {
	name: string,
	members: IMember[],
	winners?: IMember[],
	chosedId: number | boolean,
	isHidden: boolean
}
let rooms: IRoom[] = [];

export default (io: Server) => {
	let users: string[] = [];
	io.on('connection', socket => {
		const username: string = (socket.handshake.query.username as string);
		!users.includes(username)
			? users.push(username)
			: socket.emit('error_username', 'error');
		socket.emit('get_rooms', rooms.filter(room => !room.isHidden));
		socket.join('lobby');

		socket.on('add_room', (room: string) => {
			if (rooms.find(item => item.name === room)) {
				return;
			}
			rooms.push({name: room, members: [{username, isReady: false, percent: 0}], chosedId: false, isHidden: false});
			io.sockets.in('lobby').emit('add_room', {name: room, members: [username]});
			const index = rooms.findIndex(item => item.name === room);
			io.to(socket.id).emit('join_room_done', { room : rooms[index] });
			io.to(socket.id).emit('refresh_room_info', { room : rooms[index] });
			socket.join(room);
			socket.leave('lobby');
		})

		socket.on('join_room', roomName => {
			rooms.forEach(item => item.members = item.members.filter(member => member.username !== username));
			const index = rooms.findIndex(room => room.name === roomName);
			if (rooms[index].members.length<5) {
				rooms[index].members.push({username, isReady: false, percent: 0});
				socket.join(roomName);
				socket.leave('lobby');
				io.to(socket.id).emit('join_room_done', {room: rooms[index]})
				io.emit('refresh_room_info', {room: rooms[index]});
				if(rooms[index].members.length===5) {
					rooms[index].isHidden = true;
					io.sockets.in('lobby').emit('hide_room', roomName)
				}
			}
		})

		socket.on('change_state', (roomName: string) => {
			const index = rooms.findIndex(room => room.name === roomName);
			if (index>=0) rooms[index].members = rooms[index].members.map(member => member.username !== username ? member : {
				...member,
				isReady : !member.isReady
			});
			const changedUser = rooms[index]?.members?.find(item => item.username === username);
			io.sockets.in(roomName).emit('change_state_done', changedUser);
			if(rooms[index].members.filter(item => item.isReady)?.length === rooms[index].members.length && rooms[index].members.length >= 2) {
				io.sockets.in(roomName).emit('timer_render');
			}
		});

		socket.on('check_if_ready', roomName => {
			const index = rooms.findIndex(room => room.name === roomName);
			if(index!==-1 && rooms[index]?.members?.filter(item => item.isReady)?.length === rooms[index]?.members?.length && rooms[index].members?.length >= 2) {
				io.sockets.in(roomName).emit('timer_render');
			}
		})

		socket.on('start_timer', (roomName: string) => {
			io.sockets.in('lobby').emit('hide_room', roomName);
			const index = rooms.findIndex(room => room.name === roomName);
			rooms[index].winners = [];
			rooms[index].chosedId = false;
			rooms[index].isHidden = true;
			rooms[index]?.members.forEach(member => member.percent = 0);
			let timer = SECONDS_TIMER_BEFORE_START_GAME;
			function intervalTimer (this: any) {
				io.to(socket.id).emit('start_timer_count', timer--);
				if(timer < 0)
					clearInterval(this);
			}
			setInterval(intervalTimer, 1000);
		})

		socket.on('leave_room', roomName => {
			const index = rooms.findIndex(room => room.name === roomName);
			if (rooms[index].members) {
				rooms[index].members = rooms[index].members?.filter(member => member.username !== username)
			}
			rooms[index].isHidden = false;
			io.to(socket.id).emit('leave_room_done', { room : rooms[index] });
			socket.leave(roomName);
			socket.join('lobby');
			if(rooms[index].members.length>=1){
				io.in(roomName).emit('refresh_room_info', { room : rooms[index] });
				io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden))
			}
			else {
				rooms = rooms.filter(item => item.members.length > 0);
				io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden))
			}
		})

		socket.on('choose_id', roomName =>{
			const index = rooms.findIndex(room => room.name === roomName);
			if(rooms[index].chosedId){
				 io.to(socket.id).emit('generated_id', rooms[index].chosedId);
				return
			}
			const rndInt = Math.floor(Math.random() * 7);
			rooms[index].chosedId = rndInt;
			io.to(socket.id).emit('generated_id', rndInt);
			return
		});

		socket.on('pressed_key', (props) => {
			const index = rooms.findIndex(room => room.name === props.roomName);
			if (rooms[index].members) {
				rooms[index].members = rooms[index].members.map(item => item.username === username ? {
					...item,
					percent: props.percentage
				} : item)
			}
			io.sockets.in(props.roomName).emit('change_progressBar', {username, progress: props.percentage})
		});

		socket.on('finished_game', (roomName: string) => {
			const index = rooms.findIndex(room => room.name === roomName);
			if(rooms[index].winners) {
				const user = rooms[index]?.members?.find(item => item.username === username);
				rooms[index]?.winners?.push({username, isReady: true, percent: user!.percent});
			}
			else {
				const user = rooms[index]?.members?.find(item => item.username === username);
				rooms[index].winners = [{username, isReady: true, percent: user!.percent}];
			}
			if (rooms[index]?.winners?.length === rooms[index]?.members?.length) {
				io.sockets.in(roomName).emit('show_result', rooms[index]?.winners);
				rooms[index].members.forEach(member => member.percent = 0);
				if(rooms[index].members.length<5) {
					rooms[index].isHidden = false;
				}
				io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
			}
		})

		socket.on('start_game_timer', (roomName) => {
			let timer = SECONDS_FOR_GAME;
			const index = rooms.findIndex(room => room.name === roomName);
			function intervalTimer (this: any) {
				--timer;
				if (timer < 0) {
					clearInterval(this);
					io.to(socket.id).emit('time_is_over');
					rooms[index].winners =  rooms[index].members.sort((a, b) => b.percent - a.percent)
					return;
				}
				if(rooms[index]?.winners?.length === rooms[index]?.members?.length) {
					clearInterval(this);
					return;
				}
				io.to(socket.id).emit('start_game_timer_count', timer);
			}
			setInterval(intervalTimer, 1000);
		});

		socket.on('ready_to_show_result', roomName => {
			const index = rooms.findIndex(room => room.name === roomName);
			io.to(socket.id).emit('show_result', rooms[index]?.winners);
			rooms[index].members.forEach(member => member.percent = 0);
			if(rooms[index].members.length<5) {
				rooms[index].isHidden = false;
			}
			io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
		})

		socket.on('disconnect', () => {
			const username: string = (socket.handshake.query.username as string);
			const potentialRoom = rooms.find(room => room.members.find(item => item.username === username));
			rooms.forEach(item => item.members = item.members.filter(member => member.username !== username));
			rooms.forEach(item => item.winners = item.winners?.filter(member => member.username !== username));
			if (potentialRoom) {
				if(potentialRoom.members.length<5) {
					potentialRoom.isHidden = false;
				}
				 io.sockets.to(potentialRoom.name).emit('refresh_room_info', {room: potentialRoom});
						if(potentialRoom?.members?.length === potentialRoom?.winners?.length) {
							const index = rooms.findIndex(room => room.name = potentialRoom.name)
							io.sockets.in(potentialRoom.name).emit('show_result', potentialRoom!.winners);
							rooms[index].isHidden = false;
							rooms[index]?.members?.forEach(member => member.percent = 0);
							io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden && room.members.length>0));
						}
					}
			else {
				io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
			}
			users = users.filter(item => item !== username);
			rooms = rooms.filter(item => item.members.length > 0);
		})
	});
};
