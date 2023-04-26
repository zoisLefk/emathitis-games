create_game({
    start,
    update,
    coins: 0,
    coin_names: [],
    bg_color: 'blue',
    bg_move: true,
    player_x: 0.3,
    bg_move_speed: 0.7,
    minY: -960,
    maxY: 960,
    fps: 60,
    on_restart,
})

function on_restart(game) {
    const { variables } = game
}

function start(game) {
    const { variables, menu_buttons_onclick, set_menu, create_sound, play_sound, create_rect, set_gravity, add_listener, jump, get_attr, run_stop_game, run_game, stop_game, create_menu, create_menu_objects, create_collider, create_image, set_current_animation, create_text, start_game } = game

    variables.coins = 0;
    variables.coin_names = []
    for(let i=0; i<5; i++) {
        variables.coin_names.push(`coin${i}`)
    }

    create_menu({ name: 'main_menu', text: 'Main Menu' })
    create_menu_objects({
        name: 'main_menu',
        ui_objects: [
            { type: 'button', name: 'Start' }
        ],
    })
    
    menu_buttons_onclick('main_menu', (button_name) => {
        if (button_name === 'Start') run_game()
    })

    create_menu({ name: 'pause_menu', text: 'Pause', bg_color: 'rgba(0,0,0,0.7)' })
    create_menu_objects({
        name: 'pause_menu',
        ui_objects: [
            { type: 'button', name: 'Resume' },
            { type: 'button', name: 'Restart' }
        ],
    })

    menu_buttons_onclick('pause_menu', (button_name) => {
        if (button_name === 'Resume') run_game()
        if (button_name === 'Restart') {
            start_game()
        }
    })

    add_listener('onkeydown', (key) => {
        if (key === 'ESCAPE') {
            run_stop_game()
            set_menu('pause_menu')
        }
        if (key === 'R') start_game()
    })
    
    add_listener('onkeyup', (key) => {
        if (key === 'A') set_current_animation('player', 'idle_left')
        if (key === 'D') set_current_animation('player', 'idle_right')
        if (key === 'W') set_current_animation('player', 'idle_behind')
        if (key === 'S') set_current_animation('player', 'idle_front')
    })
    create_image({ name: 'background', image: '/collect_coins/images/background.jpg', width: 1920, z_index: -1 })
    
    create_text({ name: 'coin_counter', x: 10, y: 10, size: 70, text_align: 'left', text_base_line: 'top', text: `coins: ${variables.coins}` })
    
    create_player(game)
    
    variables.coin_names.forEach(coin => {
        crate_coin(game, coin)
    })

    create_sound({
        name: 'collect_coin',
        src: 'collect_coins/sounds/keyboard.m4a',
        play: true
    })
}

function update(game) {
    const { variables, key_is_down, move_x, move_y, get_attr, is_overlaped, set_current_animation, remove_game_object, set_text, run_stop_game, stop_game, change_menu, play_sound } = game

    if (key_is_down('A')) {
        move_x('player', -5)
        set_current_animation('player', 'move_left')
    } else if (key_is_down('D')) {
        move_x('player', 5)
        set_current_animation('player', 'move_right')
    } else {
        const veloicty = get_attr('player', 'velocity')
        move_x('player', 0)
    }

    if (key_is_down('W')) {
        move_y('player', -5)
        set_current_animation('player', 'move_behind')
    } else if (key_is_down('S')) {
        move_y('player', 5)
        set_current_animation('player', 'move_front')
    } else {
        move_y('player', 0)
    }

    variables.coin_names.forEach(coin => {
        if (is_overlaped('player', coin)) {
            variables.coins++;
            remove_game_object(coin)
            set_text('coin_counter', `coins: ${variables.coins}`)
            play_sound('collect_coin')

            if (variables.coins === 5) {
                stop_game()
            }
        }
    })
}

function crate_coin(game, name) {
    const { variables, create_sprite_sheet, add_animation, random_position, is_overlaped, set_attr, get_attr } = game

    const coin_animation = [
        {
            name: 'flip',
            frames: 6,
            speed: 9
        }
    ]

    const size = 50
    let { x, y } = random_position()
    if (x<0) x+=size/2
    if (x>0) x-=size/2
    if (y<0) y+=size/2
    if (y>0) y-=size/2
    
    create_sprite_sheet({ name, width: size, overlap: true, x: x, y: y })
    add_animation(name, {
        image: '/collect_coins/images/coin.png',
        max_frames: 6,
        animations: coin_animation
    })

    while(is_overlaped('player', name)) {
        let { x, y } = random_position()
        set_attr(name, 'x', x)
        set_attr(name, 'y', y)
    }
}

function create_player(game) {
    const { variables, create_sprite_sheet, add_animation } = game

    const animations = [
        {
            name: 'idle_front',
            frames: 3,
            speed: 10
        },
        {
            name: 'idle_left',
            frames: 3,
            speed: 10
        },
        {
            name: 'idle_behind',
            frames: 1,
            speed: 10
        },
        {
            name: 'idle_right',
            frames: 3,
            speed: 10
        },
        {
            name: 'move_front',
            frames: 10,
            speed: 7
        },
        {
            name: 'move_left',
            frames: 10,
            speed: 7
        },
        {
            name: 'move_behind',
            frames: 10,
            speed: 7
        },
        {
            name: 'move_right',
            frames: 10,
            speed: 7
        },
    ]

    create_sprite_sheet({ name: 'player', width: 100, object_collider: true, z_index: 2 })
    add_animation('player', {
        image: '/collect_coins/images/elf.png',
        max_frames: 10,
        animations,
    })
}