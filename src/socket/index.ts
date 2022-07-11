import {Server} from 'socket.io';
import {MAXIMUM_USERS_FOR_ONE_ROOM, SECONDS_FOR_GAME, SECONDS_TIMER_BEFORE_START_GAME} from "./config";
import {IMember, IRoom} from "./types";

let rooms: IRoom[] = [];

export default (io: Server) => {
    let users: string[] = [];
    io.on('connection', socket => {
        const wrongUsernameHandler = () => {
            username = null;
            socket.emit('error_username', 'error');
        }
        let username: string | null = (socket.handshake.query.username as string);
        !users.includes(username)
            ? users.push(username)
            : wrongUsernameHandler();
        socket.emit('get_rooms', rooms.filter(room => !room.isHidden));
        socket.join('lobby');

        socket.on('add_room', (room: string) => {
            if (rooms.find(item => item.name === room))
                return io.to(socket.id).emit('wrong_name_room');
            rooms.push({
                name: room,
                members: [{username: (username as string), isReady: false, percent: 0}],
                chosedId: false,
                isHidden: false,
                inGame: false
            });
            io.sockets.in('lobby').emit('add_room', {name: room, members: [username]});
            const index: number = rooms.findIndex(item => item.name === room);
            io.to(socket.id).emit('join_room_done', {room: rooms[index]});
            io.to(socket.id).emit('refresh_room_info', {room: rooms[index]});
            socket.join(room);
            socket.leave('lobby');
        })

        socket.on('join_room', (roomName: string) => {
            rooms.forEach(item => item.members = item.members.filter(member => member.username !== username));
            const index: number = rooms.findIndex(room => room.name === roomName);
            if (rooms[index]?.members.length < MAXIMUM_USERS_FOR_ONE_ROOM) { //войти можно только если меньше 5 челов
                rooms[index]?.members.push({username: username as string, isReady: false, percent: 0});
                socket.join(roomName);
                socket.leave('lobby');
                io.to(socket.id).emit('join_room_done', {room: rooms[index]})
                io.emit('refresh_room_info', {room: rooms[index]});
                if (rooms[index]?.members.length === MAXIMUM_USERS_FOR_ONE_ROOM) { // проверка если ты пятый чел то для других скрываю
                    rooms[index].isHidden = true;
                    io.sockets.in('lobby').emit('hide_room', roomName)
                }
            }
        })

        socket.on('change_state', (roomName: string) => {
            const index: number = rooms.findIndex(room => room.name === roomName);
            if (index >= 0) rooms[index].members = rooms[index].members.map(member => member.username !== username ? member : {
                ...member,
                isReady: !member.isReady
            });
            const changedUser: IMember | undefined = rooms[index]?.members?.find(item => item.username === username);
            io.sockets.in(roomName).emit('change_state_done', changedUser);
            if (rooms[index]?.members.filter(item => item.isReady)?.length === rooms[index].members?.length && rooms[index].members?.length >= 2) //если в комнате больше двух и все готовы начинаем игру
                io.sockets.in(roomName).emit('timer_render');
        });

        socket.on('start_timer', (roomName: string) => {
            io.sockets.in('lobby').emit('hide_room', roomName);
            const index: number = rooms.findIndex(room => room.name === roomName);
            rooms[index].winners = []; //нужно для обнуления результатов с прошлых матчей
            rooms[index].chosedId = false;
            rooms[index].isHidden = true;
            rooms[index].inGame = true;
            rooms[index]?.members.forEach(member => member.percent = 0);
            let timer = SECONDS_TIMER_BEFORE_START_GAME;

            function intervalTimer(this: any) {
                io.to(socket.id).emit('start_timer_count', timer--);
                if (timer < 0) {
                    clearInterval(this);
                    return
                }
            }

            setInterval(intervalTimer, 1000);
        })

        socket.on('leave_room', (roomName: string) => {
            const index: number = rooms.findIndex(room => room.name === roomName);
            rooms[index].members = rooms[index]?.members ? rooms[index].members?.filter(member => member.username !== username) : rooms[index].members;
            rooms[index].isHidden = false;
            io.to(socket.id).emit('leave_room_done', {room: rooms[index]});
            socket.leave(roomName);
            socket.join('lobby');
            if (rooms[index].members.length >= 1) {
                io.in(roomName).emit('refresh_room_info', {room: rooms[index]});
                io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden))
            } else { //если ты последний кто ушел то делитаем комнату и оповещаем об этом тех кто в лобби
                rooms = rooms.filter(item => item.members.length > 0);
                io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden))
            }
        })

        socket.on('choose_id', (roomName: string) => {
            const index: number = rooms.findIndex(room => room.name === roomName);
            if (rooms[index].chosedId) //если айдишник текста уже был сгенерирован отправляем
                return io.to(socket.id).emit('generated_id', rooms[index].chosedId);
            const rndInt: number = Math.floor(Math.random() * 7);
            rooms[index].chosedId = rndInt;
            io.to(socket.id).emit('generated_id', rndInt);
        });

        socket.on('pressed_key', ({percentage, roomName}) => {
            const index: number = rooms.findIndex(room => room.name === roomName);
            if (rooms[index]?.members)
                rooms[index].members = rooms[index]?.members.map(item => item.username === username ? {
                    ...item,
                    percent: percentage
                } : item)
            io.sockets.in(roomName).emit('change_progressBar', {username, progress: percentage})
        });

        socket.on('finished_game', (roomName: string) => {
            const index: number = rooms.findIndex(room => room.name === roomName);
            const user: IMember | undefined = rooms[index]?.members?.find(item => item.username === username);
            rooms[index]?.winners?.push({username: username as string, isReady: true, percent: user!.percent});
            if (rooms[index]?.winners?.length === rooms[index]?.members?.length) { //если все закончили гонку досрочку показываем модалку и если комната не скрыта показываем ее
                io.sockets.in(roomName).emit('show_result', rooms[index]?.winners);
                rooms[index].members.forEach(member => member.percent = 0);
                rooms[index].isHidden = rooms[index].members.length >= MAXIMUM_USERS_FOR_ONE_ROOM;
                rooms[index].inGame = false;
                io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
            }
        })

        socket.on('start_game_timer', (roomName: string) => {
            let timer: number = SECONDS_FOR_GAME;
            const index: number = rooms.findIndex(room => room.name === roomName);

            function intervalTimer(this: any) {
                --timer;
                if (timer < 0) {
                    clearInterval(this);
                    io.to(socket.id).emit('time_is_over');
                    rooms[index].winners = rooms[index].members.sort((a, b) => b.percent - a.percent);
                    return;
                }
                if ((rooms[index]?.winners?.length === rooms[index]?.members?.length) || !rooms[index]?.inGame) {  //если уже все победили до окончания таймера перестаем бомбить клиент
                    clearInterval(this);
                    return;
                }
                io.to(socket.id).emit('start_game_timer_count', timer);
            }

            setInterval(intervalTimer, 1000);
        });


        socket.on('check_if_ready', (roomName: string) => {
            const index: number = rooms.findIndex(room => room.name === roomName);
            if (index !== -1)
                if (!rooms[index]?.inGame)
                    rooms[index].winners = [];
            if (index !== -1 && rooms[index]?.members?.filter(item => item.isReady)?.length === rooms[index]?.members?.length && rooms[index].members?.length >= 2 && !rooms[index]?.inGame)
                io.to(socket.id).emit('timer_render');
        });

        socket.on('change_state_false',( roomName: string) => {
            const index: number = rooms.findIndex(room => room.name === roomName);
            if (index >= 0) rooms[index].members = rooms[index].members.map(member => member.username !== username ? member : {
                ...member,
                isReady: false
            });
            const changedUser: IMember | undefined = rooms[index]?.members?.find(item => item.username === username);
            io.sockets.in(roomName).emit('change_state_done', changedUser);
        })

        socket.on('ready_to_show_result', (roomName: string) => {
            const index: number = rooms.findIndex(room => room.name === roomName);
            io.to(socket.id).emit('show_result', rooms[index]?.winners);
            rooms[index].members.forEach(member => member.percent = 0);
            rooms[index].inGame = false;
            rooms[index].isHidden = rooms[index].members.length >= MAXIMUM_USERS_FOR_ONE_ROOM;
            io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
        });

        socket.on('disconnect', () => {
            const potentialRoom: IRoom | undefined = rooms.find(room => room.members.find(item => item.username === username)); //комната в которой мог быть пользователь
            rooms.forEach(item => item.members = item.members.filter(member => member.username !== username));
            rooms.forEach(item => item.winners = item.winners?.filter(member => member.username !== username));
            if (potentialRoom) { //если все же такая комната была то уведомляем пользователей об уходе одного юзера
                io.sockets.to(potentialRoom.name).emit('refresh_room_info', {room: potentialRoom});
                if (!potentialRoom.inGame) //если комната не в игре то даем знать новую инфу и в лобби
                    io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden && room.members.length > 0));
                if (potentialRoom?.members?.length === potentialRoom?.winners?.length) { //если он ушел из играющей комнаты где все кроме него уже закончили
                    const index = rooms.findIndex(room => room.name = potentialRoom.name);
                    io.sockets.in(potentialRoom.name).emit('show_result', potentialRoom!.winners);
                    rooms[index].isHidden = false;
                    rooms[index].inGame = false;
                    rooms[index]?.members?.forEach(member => {
                        member.percent = 0;
                        member.isReady = false;
                    });
                    io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden && room.members.length > 0));
                }
            }
            users = users.filter(item => item !== username);
            rooms = rooms.filter(item => item.members.length > 0); //если он был последний в комнате удаляем
        })
    });
};
