"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
let rooms = [];
exports.default = (io) => {
    let users = [];
    io.on('connection', socket => {
        const wrongUsernameHandler = () => {
            username = null;
            socket.emit('error_username', 'error');
        };
        let username = socket.handshake.query.username;
        !users.includes(username)
            ? users.push(username)
            : wrongUsernameHandler();
        socket.emit('get_rooms', rooms.filter(room => !room.isHidden));
        socket.join('lobby');
        socket.on('add_room', (room) => {
            if (rooms.find(item => item.name === room))
                return io.to(socket.id).emit('wrong_name_room');
            rooms.push({
                name: room,
                members: [{ username: username, isReady: false, percent: 0 }],
                chosedId: false,
                isHidden: false,
                inGame: false
            });
            io.sockets.in('lobby').emit('add_room', { name: room, members: [username] });
            const index = rooms.findIndex(item => item.name === room);
            io.to(socket.id).emit('join_room_done', { room: rooms[index] });
            io.to(socket.id).emit('refresh_room_info', { room: rooms[index] });
            socket.join(room);
            socket.leave('lobby');
        });
        socket.on('join_room', (roomName) => {
            var _a, _b, _c;
            rooms.forEach(item => item.members = item.members.filter(member => member.username !== username));
            const index = rooms.findIndex(room => room.name === roomName);
            if (((_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.members.length) < config_1.MAXIMUM_USERS_FOR_ONE_ROOM) { //войти можно только если меньше 5 челов
                (_b = rooms[index]) === null || _b === void 0 ? void 0 : _b.members.push({ username: username, isReady: false, percent: 0 });
                socket.join(roomName);
                socket.leave('lobby');
                io.to(socket.id).emit('join_room_done', { room: rooms[index] });
                io.emit('refresh_room_info', { room: rooms[index] });
                if (((_c = rooms[index]) === null || _c === void 0 ? void 0 : _c.members.length) === config_1.MAXIMUM_USERS_FOR_ONE_ROOM) { // проверка если ты пятый чел то для других скрываю
                    rooms[index].isHidden = true;
                    io.sockets.in('lobby').emit('hide_room', roomName);
                }
            }
        });
        socket.on('change_state', (roomName) => {
            var _a, _b, _c, _d, _e, _f;
            const index = rooms.findIndex(room => room.name === roomName);
            if (index >= 0)
                rooms[index].members = rooms[index].members.map(member => member.username !== username ? member : Object.assign(Object.assign({}, member), { isReady: !member.isReady }));
            const changedUser = (_b = (_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.members) === null || _b === void 0 ? void 0 : _b.find(item => item.username === username);
            io.sockets.in(roomName).emit('change_state_done', changedUser);
            if (((_d = (_c = rooms[index]) === null || _c === void 0 ? void 0 : _c.members.filter(item => item.isReady)) === null || _d === void 0 ? void 0 : _d.length) === ((_e = rooms[index].members) === null || _e === void 0 ? void 0 : _e.length) && ((_f = rooms[index].members) === null || _f === void 0 ? void 0 : _f.length) >= 2) //если в комнате больше двух и все готовы начинаем игру
                io.sockets.in(roomName).emit('timer_render');
        });
        socket.on('start_timer', (roomName) => {
            var _a;
            io.sockets.in('lobby').emit('hide_room', roomName);
            const index = rooms.findIndex(room => room.name === roomName);
            rooms[index].winners = []; //нужно для обнуления результатов с прошлых матчей
            rooms[index].chosedId = false;
            rooms[index].isHidden = true;
            rooms[index].inGame = true;
            (_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.members.forEach(member => member.percent = 0);
            let timer = config_1.SECONDS_TIMER_BEFORE_START_GAME;
            function intervalTimer() {
                io.to(socket.id).emit('start_timer_count', timer--);
                if (timer < 0) {
                    clearInterval(this);
                    return;
                }
            }
            setInterval(intervalTimer, 1000);
        });
        socket.on('leave_room', (roomName) => {
            var _a, _b;
            const index = rooms.findIndex(room => room.name === roomName);
            rooms[index].members = ((_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.members) ? (_b = rooms[index].members) === null || _b === void 0 ? void 0 : _b.filter(member => member.username !== username) : rooms[index].members;
            rooms[index].isHidden = false;
            io.to(socket.id).emit('leave_room_done', { room: rooms[index] });
            socket.leave(roomName);
            socket.join('lobby');
            if (rooms[index].members.length >= 1) {
                io.in(roomName).emit('refresh_room_info', { room: rooms[index] });
                io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
            }
            else { //если ты последний кто ушел то делитаем комнату и оповещаем об этом тех кто в лобби
                rooms = rooms.filter(item => item.members.length > 0);
                io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
            }
        });
        socket.on('choose_id', (roomName) => {
            const index = rooms.findIndex(room => room.name === roomName);
            if (rooms[index].chosedId) //если айдишник текста уже был сгенерирован отправляем
                return io.to(socket.id).emit('generated_id', rooms[index].chosedId);
            const rndInt = Math.floor(Math.random() * 7);
            rooms[index].chosedId = rndInt;
            io.to(socket.id).emit('generated_id', rndInt);
        });
        socket.on('pressed_key', ({ percentage, roomName }) => {
            var _a, _b;
            const index = rooms.findIndex(room => room.name === roomName);
            if ((_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.members)
                rooms[index].members = (_b = rooms[index]) === null || _b === void 0 ? void 0 : _b.members.map(item => item.username === username ? Object.assign(Object.assign({}, item), { percent: percentage }) : item);
            io.sockets.in(roomName).emit('change_progressBar', { username, progress: percentage });
        });
        socket.on('finished_game', (roomName) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const index = rooms.findIndex(room => room.name === roomName);
            const user = (_b = (_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.members) === null || _b === void 0 ? void 0 : _b.find(item => item.username === username);
            (_d = (_c = rooms[index]) === null || _c === void 0 ? void 0 : _c.winners) === null || _d === void 0 ? void 0 : _d.push({ username: username, isReady: true, percent: user.percent });
            if (((_f = (_e = rooms[index]) === null || _e === void 0 ? void 0 : _e.winners) === null || _f === void 0 ? void 0 : _f.length) === ((_h = (_g = rooms[index]) === null || _g === void 0 ? void 0 : _g.members) === null || _h === void 0 ? void 0 : _h.length)) { //если все закончили гонку досрочку показываем модалку и если комната не скрыта показываем ее
                io.sockets.in(roomName).emit('show_result', (_j = rooms[index]) === null || _j === void 0 ? void 0 : _j.winners);
                rooms[index].members.forEach(member => member.percent = 0);
                rooms[index].isHidden = rooms[index].members.length >= config_1.MAXIMUM_USERS_FOR_ONE_ROOM;
                rooms[index].inGame = false;
                io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
            }
        });
        socket.on('start_game_timer', (roomName) => {
            let timer = config_1.SECONDS_FOR_GAME;
            const index = rooms.findIndex(room => room.name === roomName);
            function intervalTimer() {
                var _a, _b, _c, _d, _e;
                --timer;
                if (timer < 0) {
                    clearInterval(this);
                    io.to(socket.id).emit('time_is_over');
                    rooms[index].winners = rooms[index].members.sort((a, b) => b.percent - a.percent);
                    return;
                }
                if ((((_b = (_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.winners) === null || _b === void 0 ? void 0 : _b.length) === ((_d = (_c = rooms[index]) === null || _c === void 0 ? void 0 : _c.members) === null || _d === void 0 ? void 0 : _d.length)) || !((_e = rooms[index]) === null || _e === void 0 ? void 0 : _e.inGame)) { //если уже все победили до окончания таймера перестаем бомбить клиент
                    clearInterval(this);
                    return;
                }
                io.to(socket.id).emit('start_game_timer_count', timer);
            }
            setInterval(intervalTimer, 1000);
        });
        socket.on('check_if_ready', (roomName) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const index = rooms.findIndex(room => room.name === roomName);
            if (index !== -1)
                if (!((_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.inGame))
                    rooms[index].winners = [];
            if (index !== -1 && ((_d = (_c = (_b = rooms[index]) === null || _b === void 0 ? void 0 : _b.members) === null || _c === void 0 ? void 0 : _c.filter(item => item.isReady)) === null || _d === void 0 ? void 0 : _d.length) === ((_f = (_e = rooms[index]) === null || _e === void 0 ? void 0 : _e.members) === null || _f === void 0 ? void 0 : _f.length) && ((_g = rooms[index].members) === null || _g === void 0 ? void 0 : _g.length) >= 2 && !((_h = rooms[index]) === null || _h === void 0 ? void 0 : _h.inGame))
                io.to(socket.id).emit('timer_render');
        });
        socket.on('change_state_false', (roomName) => {
            var _a, _b;
            const index = rooms.findIndex(room => room.name === roomName);
            if (index >= 0)
                rooms[index].members = rooms[index].members.map(member => member.username !== username ? member : Object.assign(Object.assign({}, member), { isReady: false }));
            const changedUser = (_b = (_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.members) === null || _b === void 0 ? void 0 : _b.find(item => item.username === username);
            io.sockets.in(roomName).emit('change_state_done', changedUser);
        });
        socket.on('ready_to_show_result', (roomName) => {
            var _a;
            const index = rooms.findIndex(room => room.name === roomName);
            io.to(socket.id).emit('show_result', (_a = rooms[index]) === null || _a === void 0 ? void 0 : _a.winners);
            rooms[index].members.forEach(member => member.percent = 0);
            rooms[index].inGame = false;
            rooms[index].isHidden = rooms[index].members.length >= config_1.MAXIMUM_USERS_FOR_ONE_ROOM;
            io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden));
        });
        socket.on('disconnect', () => {
            var _a, _b, _c, _d;
            const potentialRoom = rooms.find(room => room.members.find(item => item.username === username)); //комната в которой мог быть пользователь
            rooms.forEach(item => item.members = item.members.filter(member => member.username !== username));
            rooms.forEach(item => { var _a; return item.winners = (_a = item.winners) === null || _a === void 0 ? void 0 : _a.filter(member => member.username !== username); });
            if (potentialRoom) { //если все же такая комната была то уведомляем пользователей об уходе одного юзера
                io.sockets.to(potentialRoom.name).emit('refresh_room_info', { room: potentialRoom });
                if (!potentialRoom.inGame) //если комната не в игре то даем знать новую инфу и в лобби
                    io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden && room.members.length > 0));
                if (((_a = potentialRoom === null || potentialRoom === void 0 ? void 0 : potentialRoom.members) === null || _a === void 0 ? void 0 : _a.length) === ((_b = potentialRoom === null || potentialRoom === void 0 ? void 0 : potentialRoom.winners) === null || _b === void 0 ? void 0 : _b.length)) { //если он ушел из играющей комнаты где все кроме него уже закончили
                    const index = rooms.findIndex(room => room.name = potentialRoom.name);
                    io.sockets.in(potentialRoom.name).emit('show_result', potentialRoom.winners);
                    rooms[index].isHidden = false;
                    rooms[index].inGame = false;
                    (_d = (_c = rooms[index]) === null || _c === void 0 ? void 0 : _c.members) === null || _d === void 0 ? void 0 : _d.forEach(member => {
                        member.percent = 0;
                        member.isReady = false;
                    });
                    io.sockets.in('lobby').emit('get_rooms', rooms.filter(room => !room.isHidden && room.members.length > 0));
                }
            }
            users = users.filter(item => item !== username);
            rooms = rooms.filter(item => item.members.length > 0); //если он был последний в комнате удаляем
        });
    });
};
