interface IRoom {
    name: string,
    members: string[]
}
let rooms: IRoom[] = [];


export default io => {
    io.on('connection', socket => {
        const username: string = (socket.handshake.query.username as string);
        socket.emit('get_rooms', rooms);

        socket.on('add_room', (room: string) => {
            if (rooms.find(item => item.name === room)) {
                return;
            }
            rooms.push({name: room, members: [username]});
            io.emit('add_room', {name: room, members: [username]})
        })

        socket.on('join_room', roomName => {
            rooms.forEach(item => item.members = item.members.filter(member => member !== username));
            const index = rooms.findIndex(room => room.name === roomName);
            rooms[index].members.push(username);
            io.emit('join_room_done', { room : rooms[index] })
        })

        socket.on('leave_room', roomName => {
            const index = rooms.findIndex(room => room.name === roomName);
            rooms[index].members = rooms[index].members.filter(member => member !== username)
            io.emit('leave_room_done', { room : rooms[index] })
            //TODO: сделать дейтсвие для обновки рума отдельно
        })
    })
};