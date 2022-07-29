try {
    create_game({
        start,
        on_start,
        update,
        running: true,
        speed: 1,
        max_speed: 20,
        obstacles: [],
        minx: -1400
    })
} catch {
    window.location.reload()
}

function start(game) {
    create_dino(game)
    inputs(game)
}

function on_start(game) {
    create_obstacle(game)
}

function update(game) {
    const { variables } = game
    
    move_obstacles(game)
    chec_lose(game)
}

function chec_lose(game) {
    const { variables, is_overlaped, stop_game } = game

    variables.obstacles.forEach(name => {
        if (is_overlaped('dino', name)) {
            console.log('lose');
            stop_game()
        }
    })
}

function create_obstacle(game) {
    const { variables, create_rect, random_number } = game

    const name = `objstacle${variables.obstacles.length}`
    
    if (variables.is_running) {
        create_rect({
            name: name,
            x: 1200,
            y: 460,
            width: random_number(1, 4)*100,
            height: 175,
            bg_color: 'red',
            overlap: true
        })
        variables.obstacles.push(name)
    }
    
    setTimeout(() => {
        create_obstacle(game)
    }, 4000)
}

function move_obstacles(game) {
    const { variables, move_x, get_attr } = game

    variables.obstacles.forEach(name => {
        move_x(name, -10 * variables.speed)
    })
}

function create_dino(game) {
    const { create_rect, set_gravity, sleep } = game
    
    set_gravity(0.8)

    create_rect({ name: 'dino', x: -800, y: 460, width: 100, height: 150, gravity: true, object_collider: true })
}

function inputs(game) {
    const { add_listener, jump, set_gravity, get_attr, run_stop_game } = game

    add_listener('onkeydown', (key) => {
        if ((key === ' ' || key === 'ARROWUP') && get_attr('dino', 'is_grounded'))
            jump('dino', 25)
        if (key === 'S' || key === 'ARROWDOWN')
            set_gravity(4)
        if (key === 'ESCAPE') run_stop_game()
    })

    add_listener('onkeyup', (key) => {
        if (key === 'S' || key === 'ARROWDOWN') set_gravity(0.6)
    })
}