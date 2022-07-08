

export default io => {
    let users: string[] = [];
    io.on('connection', socket => {
        const username: string = (socket.handshake.query.username as string);
        !users.includes(username)
            ? users.push(username)
            : socket.emit('error_username', 'error');

        socket.on('disconnect', () => {
            const username: string = (socket.handshake.query.username as string);
            users = users.filter(item => item !== username);
        })
    });
};