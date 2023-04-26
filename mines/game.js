create_game({
    start,
    update,
    running: false,
    rect_size: 100,
    row: 8,
    col: 8,
    rects: [],
    env: [],
    positions: [],
    mines_length: 10,
    colors: ['green', 'blue', 'red', 'yellow', 'orange', 'white', 'gray', 'purple'],
    texts: [],
    mines_mark: [],
    flag: false,
    first: true
})

function start(game) {
    load_images(game)
    create_menus(game)
    create_env(game)
    create_ui(game)
    add_listeners(game)
}

function update(game) {
    const { variables } = game;
}

function load_images(game) {
    const { create_image } = game

    create_image({ name: `minepng`, x: -800, y: -400, width: 200, image: '/mines/images/mines.png', draw: true })
}
 
function create_menus(game) {
    const { create_menu, create_menu_objects, menu_buttons_onclick, run_game, start_game, set_menu } = game

    create_menu({ name: 'main_menu', text: 'Main Menu' })
    create_menu_objects({
        name: 'main_menu',
        ui_objects: [
            { type: 'button', name: 'Start' }
        ]
    })
    
    menu_buttons_onclick('main_menu', (button_name) => {
        if (button_name === 'Start') run_game()
    })

    create_menu({ name: 'lose', text: 'Loser', bg_color: 'rgba(0,0,0,0.5)' })
    create_menu_objects({
        name: 'lose',
        ui_objects: [
            { type: 'button', name: 'Restart' },
        ]
    })
    
    menu_buttons_onclick('lose', (button_name) => {
        if (button_name === 'Restart') start_game()
    })

    create_menu({ name: 'win', text: 'You Win', bg_color: 'rgba(0,0,0,0.5)' })
    create_menu_objects({
        name: 'win',
        ui_objects: [
            { type: 'button', name: 'Restart' },
        ]
    })
    
    menu_buttons_onclick('win', (button_name) => {
        if (button_name === 'Restart') start_game()
    })
}

function create_ui(game) {
    const { variables, create_button, button_onclick, create_image } = game
    
    create_image({
        name: 'flag1', x: 550, width: 150, height: 150, image: '/mines/images/flag.png'
    })

    create_image({
        name: 'flag2', x: 550, width: 150, height: 150, image: '/mines/images/flag1.png', draw: false
    })
}

async function create_env(game) {
    const { variables, create_rect } = game

    variables.env = []
    variables.positions = []
    variables.rects = []
    variables.texts = []
    variables.mines_mark = []
    variables.flag = false
    variables.first = true
    
    let y = (-variables.row/2+0.5)*variables.rect_size
    for (let j=0; j<variables.row; j++) {
        let x = (-variables.col/2+0.5)*variables.rect_size
        for (let i=0; i<variables.col; i++) {
            variables.rects.push(await create_rect({ name: `rect${i}-${j}`, width: variables.rect_size, height: variables.rect_size, x, y, variables: { is_disabled: false, main_color: variables.fish_color } }))
            variables.positions.push({ x, y })
            variables.env.push(0)
            x += variables.rect_size
        }
        y+=variables.rect_size
    }
}

async function create_mines(game, idx) {
    const { variables, create_image, create_text } = game

    const rand_positions = []
    const rand_idxs = []

    const idxs = adjacent_tiles(game, idx)

    for (let i=0; i<variables.mines_length; i++) {
        let randidx = Math.floor(Math.random() * variables.positions.length)
        while (variables.env[randidx] === 9 || idxs.includes(randidx) || randidx === idx) randidx = Math.floor(Math.random() * variables.positions.length)
        const rand_pos = variables.positions[randidx]
        rand_idxs.push(randidx)
        rand_positions.push(rand_pos)
        add_numbers(game, randidx)
        variables.env[randidx] = 9
    }

    rand_idxs.sort((a, b) => a-b)

    for (let i=0; i<variables.positions.length; i++) {
        if (variables.env[i] === 9) {
            const rand_pos = variables.positions[rand_idxs[0]]
            rand_idxs.splice(0, 1)
            variables.texts.push(await create_image({ name: `mine${i}`, width: variables.rect_size, image: '/mines/images/mines.png', x: rand_pos.x, y: rand_pos.y, draw: false }))
            continue
        }
        const text = variables.env[i] !== 0 ? `${variables.env[i]}` : ''
        variables.texts.push(create_text({ name: `text${i}`, text, x: variables.positions[i].x+variables.width/2, y: variables.positions[i].y+variables.height/2, size: 50, color: variables.colors[variables.env[i]-1], draw: false }))
    }
}

function add_numbers(game, idx) {
    const { variables } = game;

    const first = 0
    const last = variables.positions.length-1
    const col = variables.col
    const pos = variables.positions[idx]
    const size = variables.rect_size

    adjacent_tiles(game, idx).forEach(i => {
        if (variables.env[i] !== 9) variables.env[i]++
    })
}

function add_listeners(game) {
    const { variables, add_listener, start_game, object_is_hovered, set_attr, get_attr } = game

    add_listener('onkeydown', (key) => {
        if (!variables.is_running) return
        if (key === 'R') start_game()
    })

    add_listener('onmousemove', (mouse_pos) => {
        if (!variables.is_running) return
        variables.rects.forEach(rect => {
            if (get_attr(rect.name, 'is_disabled')) return
            if (object_is_hovered(rect.name, mouse_pos)) set_attr(rect.name, 'bg_color', 'red')
            else set_attr(rect.name, 'bg_color', get_attr(rect.name, 'main_color'))
        })

        if (object_is_hovered('flag1', mouse_pos)) {
            set_attr('flag1', 'bg_color', 'darkgray')
        } else {
            set_attr('flag1', 'bg_color', 'rgba(0,0,0,0)')
        }
    })

    add_listener('onmousedown', (mouse_pos) => {
        if (!variables.is_running) return
        if (object_is_hovered('flag1', mouse_pos)) {
            variables.flag = !variables.flag
            set_attr('flag2', 'draw', variables.flag)
        }
        variables.rects.forEach((rect, idx) => {
            if (object_is_hovered(rect.name, mouse_pos)) {
                if (variables.first) {
                    create_mines(game, idx)
                    variables.first = false
                    setTimeout(() => on_click_rect(game, rect, idx), 100)
                    return
                }
                on_click_rect(game, rect, idx)
            }
        })
    })
}

function on_click_rect(game, rect, idx) {
    const { variables, get_attr, set_attr } = game
    
    if (get_attr(rect.name, 'is_disabled')) return
    if (variables.flag) {
        if (get_attr(rect.name, 'main_color') === 'purple') {
            variables.mines_mark.splice(variables.mines_mark.indexOf(idx), 1)
            set_attr(rect.name, 'main_color', variables.fish_color)
        }
        else {
            variables.mines_mark.push(idx)
            set_attr(rect.name, 'main_color', 'purple')
        }
        set_attr(rect.name, 'bg_color', get_attr(rect.name, 'main_color'))
    }
    else {
        if (variables.env[idx] === 9) {
            lose(game, idx)
            return
        }
        reveal_tile(game, idx)
    }
    if (check_win(game)) win(game)
}

function adjacent_tiles(game, idx) {
    const { variables } = game;
    
    const tiles = []
    const first = 0
    const last = variables.positions.length-1
    const col = variables.col
    const pos = variables.positions[idx]
    const size = variables.rect_size

    if (idx-1>=first && variables.positions[idx-1].x+size === pos.x) tiles.push(idx-1)
    if (idx+1<=last && variables.positions[idx+1].x-size === pos.x) tiles.push(idx+1)
    if (idx-col>=0) tiles.push(idx-col)
    if (idx-col-1>=0 && variables.positions[idx-col-1].x+size === pos.x) tiles.push(idx-col-1)
    if (idx-col+1>=0 && variables.positions[idx-col+1].x-size === pos.x) tiles.push(idx-col+1)
    if (idx+col<=last) tiles.push(idx+col)
    if (idx+col-1<=last && variables.positions[idx+col-1].x+size === pos.x) tiles.push(idx+col-1)
    if (idx+col+1<= last && variables.positions[idx+col+1].x-size === pos.x) tiles.push(idx+col+1)

    return tiles
}

function reveal_tile(game, idx) {
    const { variables, set_attr, get_attr } = game
    
    if (get_attr(variables.texts[idx].name, 'draw') === true) return
    
    set_attr(variables.texts[idx].name, 'draw', true)
    set_attr(variables.rects[idx].name, 'bg_color', 'white')
    set_attr(variables.rects[idx].name, 'is_disabled', true)

    if (variables.env[idx] === 0) {
        adjacent_tiles(game, idx).forEach(tile => reveal_tile(game, tile))
    }
}

function check_win(game) {
    const { variables } = game
    let win = true
    variables.texts.forEach((text, idx) => {
        if (variables.env[idx] === 9) return
        if (!text.draw) {
            win = false
        }
    })

    win = variables.mines_mark.length === variables.mines_length && win

    return win
}

function lose(game, idx) {
    const { variables, stop_game, set_menu, set_attr } = game
    set_menu('lose')
    for(let i=0; i<variables.env.length; i++) {
        reveal_tile(game, i)
    }
    set_attr(variables.rects[idx].name, 'bg_color', 'red')
    stop_game()
}

function win(game) {
    const { variables, stop_game, set_menu } = game
    set_menu('win')
    for(let i=0; i<variables.env.length; i++) {
        reveal_tile(game, i)
    }
    stop_game()
}