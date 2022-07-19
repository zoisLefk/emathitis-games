try {
    create_game({
        start,
        update,
    })
} catch {
    window.location.reload()
}

function start(game) {
    const { create_text, create_rect, create_button } = game

    create_button({ name: 'ena', width: 70, height: 70, text: '' })

    create_rect({
        name: 'rect',
        x: 0,
        y: 0,
        angle: 45
    })

}

function update(game) {
    const { rotate, move_x } = game
}