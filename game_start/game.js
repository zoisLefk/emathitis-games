create_game({
    start,
    update,
})

function start(game) {
    const { create_text } = game

    create_text({
        name: 'text',
        text: 'this is a game'
    })
}

function update(game) {
    
}