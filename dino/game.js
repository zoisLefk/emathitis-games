try {
    create_game({
        start,
        update,
        running: true,
        bd_collider: true
    })
} catch {
    window.location.reload()
}

function start(game) {
    create_dino(game)
}

function update(game) {

}

function create_dino(game) {
    const { create_rect, set_gravity } = game

    set_gravity(0.1)

    create_rect({ name: 'dino', y: 460, width: 100, height: 150, gravity: true, object_collider: true })
}