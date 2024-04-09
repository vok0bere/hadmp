const joinGame = document.getElementById('joinGame')
joinGame.addEventListener('click', () => {
    socket.emit('joinGame')
})