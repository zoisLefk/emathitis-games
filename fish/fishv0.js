function create_canvas(params) {
    const canvas = document.createElement('canvas')
    canvas.id = 'canvas'
    canvas.width = params.width ?? 1920;
    canvas.height = params.height ?? 1080;
    document.getElementById('game').appendChild(canvas)
}

function create_game(params) {
    create_canvas(params);

    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')

    let variables = { 
        game_frame: 0, 
        width: params.width ?? 1920, 
        height: params.height ?? 1080, 
        bg_move: params.bg_move ?? false,
        bg_move_horizontal: params.bg_move_horizontal ?? params.bg_move ?? false,
        bg_move_vertical: params.bg_move_vertical ?? params.bg_move ?? false,
        player_x: params.player_x ?? 0.5,
        player_y: params.player_y ?? 0.5,
        bg_move_speed: params.bg_move_speed ?? 1,
        background_color: params.bg_color ?? 'gray', 
        player_name: params.player ?? 'player', 
        maxX: params.maxX ?? canvas.width/2, 
        minX: params.minx ?? -canvas.width/2,
        maxY: params.maxY ?? canvas.height/2,
        minY: params.minY ?? -canvas.height/2,
        bd_collider: params.bd_collider ?? false,
        fps: params.fps ?? 60,
        is_running: params.is_running ?? params.running ?? false,
        loading: false,
        loading_images: false,
        mouse_is_down: false,
        fish_color: '#34b1bf',
        ...params 
    };
    
    function create_menu(params) {
        if (!params.name) {
            console.error('You have to pass a name for the menu!')
            return
        }

        const found = menus.find(menu => menu.name === params.name);
        if (found) {
            console.error("The name must be unique!")
            return
        }

        const object = new Object()
        
        object.name = params.name
        object.text = params.text ?? params.name
        object.x = params.x ?? 0
        object.y = params.y ?? 0
        object.width = params.width ?? variables.width
        object.height = params.height ?? variables.height
        object.fg_color = params.fg_color ?? '#34b1bf'
        object.bg_color = params.bg_color ?? 'black'
        object.ui_objects = []
        
        menus.push(object)
        return object
    }

    function get_menu(name) {
        return menus.find(menu => menu.name === name)
    }

    function draw_menu(name) {
        const menu = get_menu(name)
        if (menu === undefined) return

        ctx.fillStyle = menu.bg_color;
        ctx.fillRect(menu.x, menu.y, menu.width, menu.height);

        ctx.fillStyle = menu.fg_color;
        ctx.font = 100 + "px Comic Sans MS";
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(menu.text, menu.width/2, 200);

        menu.ui_objects.forEach(object => draw_menu_objects(object))
    }

    function create_menu_objects(params) {
        if (!params.name) return
        
        const menu = get_menu(params.name)
        if (menu === undefined) return;

        let position = params.position ?? 'center'
        
        let menu_height = menu.height-200;
        let object_width = canvas.width * 0.15;
        let object_height = object_width * 0.4;
        let main_color = params.main_color ?? 'white';
        let hovered_color = params.hv_color ?? 'red';
        let disabled_color = params.disabled_color ?? 'gray'
        let fg_color = params.fg_color ?? 'black'
        let padding = params.padding ?? 100

        const ui_types = Object.freeze(['button', 'slider', 'checkbox', 'text'])

        let height = 0
        params.ui_objects.forEach(object => {
            if (object.x || object.y) return
            height += 10 + (object.height ?? object_height)
        })

        let menu_x = canvas.width/2
        if (position === 'center') menu_x = canvas.width/2
        else if (position === 'left') menu_x = padding;
        else if (position === 'right') menu_x = canvas.width-object_width-padding
        let i = menu_height/2 + 200 - height/4;
        params.ui_objects.forEach(object => {
            if (!ui_types.includes(object.type)) return
            
            let ui_object
            switch(object.type) {
                case 'button':
                    ui_object = create_menu_button(object, menu_x, i, object_width, object_height, main_color, hovered_color, disabled_color, fg_color)
                    break;
                case 'text':
                    ui_object = create_menu_text(object, menu_x, i, object_width, object_height, fg_color)
                    break;
                case 'checkbox':
                    break;
                case 'slider':
                    break;
            }
            menu.ui_objects.push({ type: object.type, ...ui_object })

            if (ui_object.x !== menu_x || ui_object.y !== i) return
            i+= 10 + (object.height ?? object_height)
        })
    }

    function create_menu_text(object, x, y, width, height, fg_color) {
        return {
            name: object.name,
            x: object.x ?? x,
            y: object.y ?? y,
            width: object.width ?? width,
            height: object.height ?? height,
            size: object.size ?? object.height ?? height,
            color: object.fg_color ?? fg_color
        }
    }

    function create_menu_button(object, x, y, width, height, main_color, hovered_color, disabled_color, fg_color) {        
        return {
            name: object.name,
            x: object.x ?? x,
            y: object.y ?? y,
            width: object.width ?? width,
            height: object.height ?? height,
            text: object.text ?? object.name,
            main_color: object.color ?? main_color,
            hovered_color: object.hv_color ?? hovered_color,
            disabled_color: object.disabled_color ?? disabled_color,
            fg_color: object.fg_color ?? fg_color,
            color: object.color ?? main_color,
            is_disabled: object.is_disabled ?? false,
        }
    }

    function draw_menu_objects(object) {
        switch(object.type) {
            case 'button':
                draw_menu_button(object)
                break;
            case 'text':
                draw_text(object)
                break;
            case 'checkbox':
                break;
            case 'slider':
                break;
        }
    }

    function draw_menu_button(button) {
        ctx.fillStyle = button.color;
        if (button.is_disabled) ctx.fillStyle = button.disabled_color
        
        ctx.fillRect(button.x-button.width/2, button.y-button.height/2, button.width, button.height);

        ctx.lineWidth = '1'
        ctx.strokeStyle = 'black';
        ctx.strokeRect(button.x-button.width/2, button.y-button.height/2, button.width, button.height);
        
        ctx.fillStyle = button.fg_color
        ctx.font = 70 + "px Comic Sans MS";
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(button.text, button.x, button.y)
    }

    function create_object(params) {
        let name = params.name
        if (!name) return

        let width = params.width ?? 100;
        let height = params.height ?? 100;
        let x = params.x ?? canvas.width/2
        let y = params.y ?? canvas.height/2 
        let color = params.color ?? '#34b1bf'

        return { name, width, height, x, y, color }
    }

    function draw_object(object) {
        ctx.fillRect(object.x - object.width/2, object.y - object.height/2, object.width, object.height);
    }

    function draw_border(object) {
        ctx.strokeRect(object.x - object.width/2, object.y - object.height/2, object.width, object.height);
    }
    
    function create_button(params) {
        let name = params.name
        if (name === undefined) return

        const button = create_object(params);

        button.text = params.text ?? 'New Button'
        button.text_size = params.text_size ?? button.height-20
        ctx.font = button.text_size + "px Comic Sans MS";
        button.width = params.width ?? ctx.measureText(button.text).width+20
        button.hv_color = params.hv_color ?? 'red'
        button.ds_color = params.disabled_color ?? '#1e1f1f'
        button.bg_color = params.bg_color ?? '#34b1bf'
        button.fg_color = params.fg_color ?? 'white'
        button.draw = params.draw ?? true;
        button.is_disabled = params.is_disabled ?? false
        button.border = params.border ?? true;
        button.color = button.bg_color;
        
        return buttons.push(button)
    }

    function get_button(name) {
        return buttons.find(button => button.name === name)
    }
    
    function is_hovered(object, mouse_pos) {        
        if (mouse_pos.x > object.x-object.width/2 && mouse_pos.x < object.x + object.width/2 && mouse_pos.y > object.y - object.height/2 && mouse_pos.y < object.y + object.height/2) return true
        return false
    }

    function draw_button(name) {
        const button = get_button(name)
        if (!button) return
        
        
        ctx.fillStyle = button.color;
        if (button.is_disabled) ctx.fillStyle = button.disabled_color
        
        draw_object(button)

        if (button.border) {
            ctx.strokeStyle = 'black';
            draw_border(button)
        }
        
        ctx.fillStyle = button.fg_color
        ctx.font = button.text_size + "px Comic Sans MS";
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(button.text, button.x, button.y)
    }

    function create_text(params) {
        let name = params.name
        if (name === undefined) {
            console.error('You have to pass a name!')
            return
        }

        let text = params.text ?? 'New Text'

        if (texts.find(text => text.name === name)) {
            console.error('The name must be unique!')
            return
        }
        
        let x = params.x ?? canvas.width/2
        let y = params.y ?? canvas.height/2
        let size = params.size ?? 100
        let color = params.color ?? 'white'
        let draw = params.draw ?? true
        let text_align = params.text_align ?? 'center'
        let text_base_line = params.text_base_line ?? 'middle'

        const text_obj = { name, text, text_align, text_base_line, x, y, size, color, draw }
        texts.push(text_obj)
        game_objects.push(text_obj)
        return text_obj
    }

    function get_text(name) {
        const text = texts.find(text => text.name === name);
        return text
    }

    function set_text(name, text) {
        const object = get_text(name)
        if(!object) return
        object.text = text
    }

    function draw_text(name) {
        const text = get_text(name);
        if (!text) return;

        ctx.fillStyle = text.color;
        ctx.font = text.size + 'px Comic Sans MS'
        ctx.textAlign = text.text_align
        ctx.textBaseline = text.text_base_line
        ctx.fillText(text.text, text.x, text.y)
    }

    function create_slider(params) {
        let name = params.name
        if (name === undefined) return

        const slider = create_object(params)
        slider.width = params.width ?? canvas.width*0.2
        slider.height = params.height ?? slider.width*0.15
        slider.bg_color = params.bg_color ?? '#919191'
        slider.fg_color = params.fg_color ?? '#f7a919'
        slider.draw = params.draw ?? true;
        slider.max_value = params.max_value ?? 100;
        slider.min_value = params.min_value ?? 0;
        slider.current_value = slider.max_value
        slider.circle = params.circle ?? true

        return sliders.push(slider)
    }

    function draw_slider(name) {
        const slider = get_slider(name);
        if (!slider) return

        const fg_width = slider.current_value/slider.max_value*slider.width;
        
        ctx.fillStyle = slider.bg_color;
        draw_object(slider)

        ctx.fillStyle = slider.fg_color;
        ctx.lineWidth = 2
        draw_border(slider)

        draw_object({ x: slider.x-slider.width/2+fg_width/2, y: slider.y, width: fg_width, height: slider.height })

        if (!slider.circle) return
        const circle_y = slider.y
        const circle_x = slider.x - slider.width/2 + fg_width
        const circle_size = slider.height/1.5

        ctx.beginPath()
        ctx.arc(circle_x, circle_y, circle_size, 0, 2 * Math.PI);
        ctx.fillStyle = slider.fg_color;
        ctx.fill();
        ctx.lineWidth = 2
        ctx.strokeStyle = 'black'
        ctx.stroke();
    }

    function get_slider(name) {
        return sliders.find(slider => slider.name === name)
    }

    function slider_set_value(name, value) {
        const slider = get_slider(name);
        if (!slider) return

        if (slider.max_value < value) value = slider.max_value
        if (slider.min_value > value) value = slider.min_value
        slider.current_value = value;
    }

    function create_checkbox(params) {
        let name = params.name
        if (name === undefined) return
        
        const checkbox = create_object(params)

        checkbox.bg_color = params.bg_color ?? 'white'
        checkbox.fg_color = params.bg_color ?? 'black'
        checkbox.hv_color = params.hv_color ?? '#c7c7c7'
        checkbox.checked = params.checked ?? false;
        checkbox.draw = params.draw ?? true;
        checkbox.color = checkbox.bg_color;
        
        const image = new Image(50, 50);
        image.src = '/public/check.png'
        checkbox.image = image;

        return checkboxes.push(checkbox)
    }

    function get_checkbox(name) {
        return checkboxes.find(checkbox => checkbox.name === name)
    }
    
    function draw_checkbox(name) {
        const checkbox = get_checkbox(name)
        
        ctx.fillStyle = checkbox.color;
        ctx.strokeStyle = checkbox.fg_color;
        ctx.lineWidth = 2
        
        draw_object(checkbox)
        draw_border(checkbox)

        if (checkbox.checked)
            ctx.drawImage(checkbox.image, checkbox.x-checkbox.width/2, checkbox.y-checkbox.height/2, checkbox.width, checkbox.height)
    }

    function clear_canvas() {
        ctx.fillStyle = variables.background_color
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    function getMousePos(event) {
        var rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        }
    }

    const menus = []
    const buttons = []
    const texts = []
    const sliders = []
    const checkboxes = []

    function run_stop_game() {
        variables.is_running = !variables.is_running
    }

    function run_game() {
        variables.is_running = true
    }

    function stop_game() {
        variables.is_running = false
    }

    function change_menu(name) {
        setTimeout(() => {
            menu_name = name
        }, 100)
    }

    function set_menu(name) {
        menu_name = name
    }

    let menu_name = 'Main Menu'
    
    const game_objects = [{ name: 'canvas', x: canvas.width/2, y: canvas.height/2, width: canvas.width, height: canvas.height, z_index: -100 }]
    const colliders = []

    let gravity = 0;

    function set_gravity(value) {
        if (value === undefined) value = 0.2
        gravity = value
    }

    let loading_timeout;

    function load_image(src) {
        return new Promise(r => {
            if (loading_timeout !== undefined) clearTimeout(loading_timeout)
            
            variables.loading_images = true
            let img = new Image();
            img.onload = (() => {
                r(img)
                loading_timeout = setTimeout(() => {
                    variables.loading_images = false
                    variables.loading = false
                }, 200)
            })
            img.src = src
        })
    }
    
    async function create_game_object(params) {
        const object = new Object();
        if (!params.name) return
        object.name = params.name
        object.type = params.type ?? 'empty'
        object.parent = params.parent ?? 'canvas';
        object.x = params.x || 0;
        object.y = params.y || 0;
        object.velocity = { x: 0, y: 0 }
        object.gravity = params.gravity ?? false;
        object.angle = params.angle ?? 0;
        object.width = params.width ?? canvas.width*0.1;
        object.height = params.height ?? object.width;
        object.children = [];
        object.collider = params.collider ?? false;
        object.object_collider = params.object_collider ?? false;
        object.object_collider_left = params.object_collider_left ?? object.object_collider
        object.object_collider_right = params.object_collider_right ?? object.object_collider
        object.object_collider_top = params.object_collider_top ?? object.object_collider
        object.object_collider_bottom = params.object_collider_bottom ?? object.object_collider
        object.collider_top = params.collider_top ?? object.collider;
        object.collider_bottom = params.collider_bottom ?? object.collider;
        object.collider_left = params.collider_left ?? object.collider;
        object.collider_right = params.collider_right ?? object.collider;
        object.overlap = params.overlap ?? false;
        object.is_grounded = false;
        object.can_move_left = true;
        object.can_move_right = true;
        object.can_move_up = true;
        object.can_move_down = true;
        
        object.is_enabled = params.is_enabled ?? true;
        
        if (object.collider || object.overlap) colliders.push(object)
        
        object.z_index = params.z_index ?? 0;
        object.border = params.border ?? true;
        object.border_width = params.border_width ?? 5;
        object.bg_color = params.bg_color ?? '#34b1bf'
        object.bd_color = params.bd_color ?? 'black';
        object.draw = params.draw ?? true;

        if (object.type === 'image') {
            object.border = params.border ?? false;
            object.bg_color = params.bg_color ?? 'rgba(0,0,0,0)'
            let img = params.image.charAt(0) === '/' ? params.image : '/' + params/image
            object.image = await load_image("https://bronze-harp-seal-veil.cyclic.app/games/" + img ?? "https://bronze-harp-seal-veil.cyclic.app/games/fish/images/fish.png")
            object.width = params.width ?? object.image.width;
            const aspect_ratio = object.image.height/object.image.width
            object.height = params.height ?? object.width * aspect_ratio;
        }

        if (object.type === 'sprite') {
            object.border = params.border ?? false;
            object.bg_color = params.bg_color ?? 'rgba(0,0,0,0)'
            object.animations = [];
            object.current_animation = undefined;
        }
        
        game_objects.push({ ...object, ...params.variables })
        game_objects.sort(sort)
        return { ...object, ...params.variables }
    }

    function delete_game_object(name) {
        if (name === undefined) return
        const idx = game_objects.indexOf(get_game_object(name))
        if (idx === -1) return
        delete game_objects[idx]
        game_objects.splice(idx, 1)
    }

    function sort(a, b) {
        if (a.z_index < b.z_index) return -1
        else if (a.z_index > b.z_index) return 1
        return 0
    }

    async function add_animation(sprite_name, params) {
        if (sprite_name === undefined) return
        const object = game_objects.find(object => object.name === sprite_name && object.type === 'sprite')
        if (!object) return

        const image = await load_image("https://bronze-harp-seal-veil.cyclic.app/games/" + params.image)
        const max_frames = params.max_frames;
        const animations_num = params.animations.length
        const sprite_width = params.sprite_width ?? image.width/max_frames
        const sprite_height = params.sprite_height ?? image.height/animations_num
        params.animations.forEach((anim, index) => {
            const loc = []

            for(let i=0; i<anim.frames; i++) {
                let positionX = i*sprite_width;
                let positionY = index*sprite_height;
                loc.push({ x: positionX, y: positionY })
            }

            object.animations.push({
                name: anim.name,
                image,
                loc,
                speed: anim.speed,
                sprite_width,
                sprite_height
            })
        })

        if (object.current_animation === undefined) object.current_animation = object.animations[0]
    }

    function set_current_animation(object_name, anim_name) {
        if (object_name === undefined) return
        if (anim_name === undefined) return
        const sprite = game_objects.find(object => object.name === object_name && object.type === 'sprite');
        if (!sprite) return
        sprite.current_animation = sprite.animations.find(animation => animation.name === anim_name)
    }

    const objects_types = Object.freeze(['empty', 'rect', 'ellipse', 'image', 'sprite'])

    function get_game_object(name) {
        return game_objects.find(object => object.name === name)
    }

    function get_game_objects(type) {
        if (type === undefined) type = 'all'
        
        if (!objects_types.includes(type)) return
        
        if (type === 'all') return game_objects

        return game_objects.filter(object => object.type === type)
    }

    function get_collider_by_name(name) {
        return colliders.find(collider => collider.name === name)
    }

    function get_parent_pos(name) {
        let parent = name
        let x = 0
        let y = 0
        while (parent !== 'canvas') {
            const object = get_game_object(parent)
            x += object.x;
            y += object.y;
            parent = object.parent
        }
        x += canvas.width/2;
        y += canvas.height/2
        return { x, y }
    }

    function create_empty_object(params) {
        return create_game_object({ type: 'empty', ...params })
    }

    function create_rect(params) {
        return create_game_object({ type: 'rect', ...params })
    }

    function create_ellipse(params) {
        return create_game_object({ type: 'ellipse', ...params })
    }

    function create_image(params) {
        return create_game_object({ type: 'image', ...params })
    }

    function create_sprite_sheet(params) {
        return create_game_object({ type: 'sprite', ...params })
    }

    function create_collider(params) {
        const object = new Object();
        if (!params.name) return
        object.type = 'collider'
        object.name = params.name
        object.type = params.type ?? 'empty'
        object.parent = params.parent ?? 'canvas';
        object.x = params.x || 0;
        object.y = params.y || 0;
        object.width = params.width ?? canvas.width*0.1;
        object.height = params.height ?? object.width;
        object.children = [];
        object.overlap = params.overlap ?? false;
        object.collider = !object.overlap
        object.collider_top = params.collider_top ?? object.collider
        object.collider_bottom = params.collider_bototm ?? object.collider
        object.collider_right = params.collider_right ?? object.collider
        object.collider_left = params.collider_left ?? object.collider
        object.is_enabled = params.is_enabled ?? true;

        colliders.push(object)
    }

    function is_overlaped(object_name, collider_name) {
        const object = get_game_object(object_name)
        if (!object) return false
        const collider = get_collider_by_name(collider_name)
        if (!collider) return false
        
        if (!collider.overlap) return false

        if (object.x+object.width/2 >= collider.x-collider.width/2 && object.x-object.width/2 <= collider.x+collider.width/2
        && object.y+object.height/2 >= collider.y-collider.height/2 && object.y-object.height/2 <= collider.y+collider.height/2) return true
        return false
    }

    function remove_game_object(name) {
        let index = game_objects.indexOf(get_game_object(name))
        if (index !== -1) game_objects.splice(index, 1)

        index = colliders.indexOf(get_collider_by_name(name))
        if (index !== -1) colliders.splice(index, 1)
    }

    function draw_rect(rect) {
        ctx.fillStyle = rect.bg_color
        ctx.fillRect(get_parent_pos(rect.parent).x + rect.x - rect.width/2, get_parent_pos(rect.parent).y + rect.y-rect.height/2, rect.width, rect.height)


        if (!rect.border) return
        ctx.strokeStyle = rect.bd_color;
        ctx.lineWidth = rect.border_width
        ctx.strokeRect(get_parent_pos(rect.parent).x + rect.x - rect.width/2, get_parent_pos(rect.parent).y + rect.y-rect.height/2, rect.width, rect.height)
    }

    function draw_ellipse(ellipse) {
        ctx.fillStyle = ellipse.bg_color
        ctx.strokeStyle = ellipse.bd_color
        
        ctx.beginPath();
        ctx.ellipse(get_parent_pos(ellipse.parent).x + ellipse.x, get_parent_pos(ellipse.parent).y + ellipse.y, ellipse.width, ellipse.height, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    function draw_image(image) {
        draw_rect(image)
        ctx.drawImage(image.image, get_parent_pos(image.parent).x+image.x-image.width/2, get_parent_pos(image.parent).y+image.y-image.height/2, image.width, image.height)
    }

    function draw_sprite(sprite) {
        draw_rect(sprite)

        if (sprite.current_animation === undefined) return

        let position = Math.floor(variables.game_frame/sprite.current_animation.speed) % sprite.current_animation.loc.length
        let frameX = sprite.current_animation.sprite_width * position
        let frameY = sprite.current_animation.loc[position].y
        ctx.drawImage(sprite.current_animation.image, frameX, frameY, sprite.current_animation.sprite_width, sprite.current_animation.sprite_height, get_parent_pos(sprite.parent).x + sprite.x - sprite.width/2, get_parent_pos(sprite.parent).y + sprite.y-sprite.height/2, sprite.width, sprite.height)
    }

    function set_attr(name, attr, value) {
        get_game_object(name)[attr] = value
    }

    function get_attr(name, attr) {
        return get_game_object(name)[attr]
    }

    function update_objects() {
        game_objects.forEach(object => {
            if (!object.is_enabled) return
            if (variables.is_running)
                move_object(object)
            draw_game_object(object)
        })
    }

    function draw_game_object(object) {
        if (!object.draw) return

        ctx.save()
        const parent_pos = get_parent_pos(object.parent)
        ctx.translate(parent_pos.x, parent_pos.y)
        ctx.rotate(object.angle*Math.PI/180)
        ctx.translate(-parent_pos.x, -parent_pos.y)
        switch(object.type) {
            case 'rect':
                draw_rect(object)
                break;
            case 'ellipse':
                draw_ellipse(object)
                break;
            case 'image':
                draw_image(object)
                break;
            case 'sprite':
                draw_sprite(object)
                break;
        }
        ctx.restore()
    }

    function move_object(object) {
        if (object.name === 'canvas') return

        if (object.object_collider) {
            if (object.x <= object.width/2+variables.minX && object.object_collider_left) object.can_move_left = false
            if (object.x >= variables.maxX-object.width/2 && object.object_collider_right) object.can_move_right = false
            if (object.y >= variables.maxY-object.height/2 && object.object_collider_bottom) object.can_move_down = false
            if (object.y <= object.height/2+variables.minY && object.object_collider_top) {
                object.can_move_up = false
                if (object.velocity.y < 0) object.velocity.y = 0
            }
        }
        
        if (object.can_move_left && object.velocity.x < 0 || object.can_move_right && object.velocity.x > 0)
            object.x += object.velocity.x

        if (object.can_move_up && object.velocity.y < 0 || object.can_move_down && object.velocity.y > 0)
            object.y += object.velocity.y
        
        if (object.gravity) {
            if (object.y + object.height/2 + object.velocity.y <= canvas.height/2) {
                object.velocity.y += gravity
                object.is_grounded = false
            } else if (object.object_collider && object.object_collider_bottom) {
                object.velocity.y = 0
                object.is_grounded = true;
            }
        }
    }

    function rotate(name, angle) {
        const object = get_game_object(name)
        if (!object) return

        object.angle += angle
    }

    function jump(name, speed) {
        const object = game_objects.find(object => object.name === name)
        if (!object) return
        if (!object.gravity) return

        if (speed === undefined) speed = 20

        object.velocity.y -= speed
    }

    function move_to(name, pos) {

    }

    function move_x(name, step) {
        const object = get_game_object(name)
        if (!object) return
        object.velocity.x = step
        const collider = get_collider_by_name(name)
        if (!collider) return
        collider.x = object.x
    }

    function move_y(name, step) {
        const object = get_game_object(name)
        if (!object) return
        object.velocity.y = step
    }

    //sounds
    const sounds = []
    
    function create_sound(params) {
        if (!params.name) return
        
        const object = new Object()
        object.name = params.name
        object.sound = document.createElement('audio')
        let src = params.src[0] === '/' ?  params.src : '/' + params.src
        object.sound.src = "https://bronze-harp-seal-veil.cyclic.app/games" + src
        object.sound.setAttribute("preload", "auto");
        object.sound.setAttribute("controls", "none");
        object.sound.style.display = 'none'
        if (params.loop) {
            object.sound.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }
        sounds.push(object)
    }

    function get_sound(name) {
        return sounds.find(sound => sound.name === name)
    }

    function play_sound(name) {
        const sound = get_sound(name)
        sound.sound.play()
    }

    function stop_sound(name) {
        const sound = get_sound(name)
        sound.sound.pause()
    }

    // listeners    
    const pressed_keys = [];

    function on_key_down(callback) {
        document.addEventListener('keydown', (event) => {
            if (pressed_keys.find(key => event.key.toUpperCase() === key)) return

            pressed_keys.push(event.key.toUpperCase())
            callback(event.key.toUpperCase());
        })
    }

    function on_key_up(callback) {
        document.addEventListener('keyup', (event) => {
            const index = pressed_keys.indexOf(event.key.toUpperCase())
            if (index !== -1) pressed_keys.splice(index, 1)
            
            callback(event.key.toUpperCase())
        })
    }

    function key_is_down(key) {
        return pressed_keys.includes(key.toUpperCase())
    }
    
    function on_mouse_move(callback) {
        document.addEventListener('mousemove', (event) => {
            const mouse_pos = getMousePos(event)
    
            callback(mouse_pos)

            canvas.classList.remove('cursor-pointer')
    
            if (variables.is_running) {
                buttons.forEach(button => {
                    if (is_hovered(button, mouse_pos)) {
                        canvas.classList.add('cursor-pointer')
                        button.color = button.hv_color
                    } else {
                        button.color = button.bg_color
                    }
                })
    
                checkboxes.forEach(checkbox => {
                    if (is_hovered(checkbox, mouse_pos)) {
                        canvas.classList.add('cursor-pointer')
                        checkbox.color = checkbox.hv_color
                    } else {
                        checkbox.color = checkbox.bg_color
                    }
                })
                return;
            }
    
            menus.forEach(menu => {
                menu.ui_objects.forEach(button => {
                    if (menu.name !== menu_name) return
                    if (is_hovered(button, mouse_pos)) {
                        canvas.classList.add('cursor-pointer')
                        button.color = button.hovered_color
                    } else {
                        button.color = button.main_color
                    }
                })
            })
        })
    }

    function on_mouse_down(callback) {
        document.addEventListener('mousedown', (event) => {
            const mouse_pos = getMousePos(event)

            event.preventDefault()
    
            variables.mouse_is_down = true;
            
            callback(mouse_pos)

            if (variables.is_running) {
                buttons.forEach(button => {
                    if (is_hovered(button, mouse_pos) && !button.is_disabled) {
                        buttons_callbacks.find(callback => callback.button_name === button.name).callback()
                    }
                })
    
                checkboxes.forEach(checkbox => {
                    if (checkbox.draw && is_hovered(checkbox, mouse_pos)) {
                        checkbox.checked = !checkbox.checked
                    }
                })
                return;
            }
            
            menus.forEach(menu => {
                menu.ui_objects.forEach(button => {
                    if (!is_hovered(button, mouse_pos)) return;
                    if (menu.name !== menu_name) return
                    menu_buttons_callbacks.find(menu => menu.menu_name === menu_name).callback(button.name)
                })
            })
        })
    }

    function on_mouse_up(callback) {
        document.addEventListener('mouseup', (event) => {
            const mouse_pos = getMousePos(event)
            
            callback(mouse_pos)
            variables.mouse_is_down = false;
        })
    }

    const menu_buttons_callbacks = []
    
    function menu_buttons_onclick(menu_name, callback) {
        if (variables.is_running) return
        if (!menus.find(menu => menu.name === menu_name)) return
        menu_buttons_callbacks.push({ menu_name, callback })
    }

    const buttons_callbacks = []
    
    function button_onclick(button_name, callback) {
        buttons_callbacks.push({ button_name, callback: () => {
            callback()
        } })
    }

    const listeners = []
    const listeners_names = Object.freeze(['onkeydown', 'onkeyup', 'onmousemove', 'onmousedown', 'onmouseup'])

    function add_listener(type, callback) {
        if (!listeners_names.includes(type)) {
            console.error('wrong type');
            return
        }

        if (listeners.find(listener => listener.type === type)) {
            console.error('Listener exist');
            return
        }

        listeners.push({ type, callback })
    }
    
    on_key_down((key) => {
        const listener = listeners.find(listener => listener.type === 'onkeydown')
        if (listener) listener.callback(key)
    })
    
    on_key_up((key) => {
        const listener = listeners.find(listener => listener.type === 'onkeyup')
        if (listener) listener.callback(key)
    })

    on_mouse_move((mouse_pos) => {
        const listener = listeners.find(listener => listener.type === 'onmousemove')
        if (listener) listener.callback(mouse_pos)
    })

    on_mouse_down((mouse_pos) => {
        const listener = listeners.find(listener => listener.type === 'onmousedown')
        if (listener) listener.callback(mouse_pos)
    })

    on_mouse_up((mouse_pos) => {
        const listener = listeners.find(listener => listener.type === 'onmouseup')
        if (listener) listener.callback(mouse_pos)
    })

    function preload() {
        if (!params.start) console.error('No start function')
        variables.loading = true

        params.start(game)
        variables.game_frame = 0
        
        variables.loading = variables.loading_images
        if (menus.length !== 0 && !variables.is_running) {
            menu_name = menus[0].name
            variables.is_running = params.running ?? false
            return
        }
        
        variables.is_running = params.running ?? true
    }

    var fps = variables.fps;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;

    function update_game() {
        if (!params.update) {
            console.error('No update function');
        }

        const gravity_objects = game_objects.filter(object => object.gravity)
        const object_colliders = game_objects.filter(object => object.object_collider && !object.gravity)

        gravity_objects.forEach(object => {
            object.can_move_left = true
            object.can_move_right = true
            object.can_move_down = true
            object.can_move_up = true
            colliders.forEach(collider => {
                if (!collider.overlap && collider.collider && collider.is_enabled) {
                    if (collider.collider_top) {
                        if (object.y + object.height/2 <= collider.y-collider.height/2 && object.y + object.height/2 + object.velocity.y >= collider.y-collider.height/2
                        && object.x + object.width/2 >= collider.x-collider.width/2 && object.x - object.width/2 <= collider.x + collider.width/2) {
                            object.velocity.y = 0
                            object.is_grounded = true;
                            object.can_move_down = false
                        }
                    }
    
                    if (collider.collider_bottom) {
                        if (object.y - object.height/2 <= collider.y+collider.height/2 && object.y - object.height/2 >= collider.y
                        && object.x + object.width/2 > collider.x-collider.width/2 && object.x - object.width/2 < collider.x + collider.width/2) {
                            if (object.velocity.y < 0) object.velocity.y = 0
                            object.velocity.y += gravity
                            object.can_move_up = false
                        }
                    }
                    
                    if (collider.collider_left) {
                        if (object.x + object.width/2 >= collider.x-collider.width/2 && object.x + object.width/2 - object.velocity.x <= collider.x - collider.width/2
                        && object.y + object.height/2 >= collider.y-collider.height/2 && object.y - object.height/2 <= collider.y+collider.height/2) {
                            object.can_move_right = false
                        }
                    }
    
                    if (collider.collider_right) {
                        if (object.x - object.width/2 <= collider.x+collider.width/2 && object.x - object.width/2 - object.velocity.x >= collider.x + collider.width/2
                        && object.y + object.height/2 >= collider.y-collider.height/2 && object.y - object.height/2 <= collider.y+collider.height/2) {
                            object.can_move_left = false
                        }
                    }
                }
            })
        })

        object_colliders.forEach(object => {
            object.can_move_left = true
            object.can_move_right = true
            object.can_move_down = true
            object.can_move_up = true
            colliders.forEach(collider => {
                if (collider.collider_top) {
                    if (object.y+object.height/2 <= collider.y-collider.height/2 && object.y+object.height/2+object.velocity.y >= collider.y-collider.height/2
                    && object.x+object.width/2 >= collider.x-collider.width/2 && object.x-object.width/2 <= collider.x+collider.width/2) {
                        object.can_move_down = false
                        object.y = collider.y-collider.height/2-object.height/2
                    }
                }

                if (collider.collider_bottom) {
                    if (object.y-object.height/2 >= collider.y+collider.height/2 && object.y-object.height/2+object.velocity.y <= collider.y+collider.height/2
                    && object.x+object.width/2 >= collider.x-collider.width/2 && object.x-object.width/2 <= collider.x+collider.width/2) {
                        object.can_move_up = false
                        object.y = collider.y+collider.height/2+object.height/2
                    }
                }

                if (collider.collider_left) {
                    if (object.x+object.width/2 <= collider.x-collider.width/2 && object.x+object.width/2+object.velocity.x >= collider.x-collider.width/2
                    && object.y+object.height/2 >= collider.y-collider.height/2 && object.y-object.height/2 <= collider.y+collider.height/2) {
                        object.can_move_right = false
                        object.x = collider.x-collider.width/2-object.width/2
                    }
                }

                if (collider.collider_right) {
                    if (object.x-object.width/2 >= collider.x + collider.width/2 && object.x-object.width/2+object.velocity.x <= collider.x+collider.width/2
                    && object.y+object.height/2 >= collider.y-collider.height/2 && object.y-object.height/2 <= collider.y+collider.height/2) {
                        object.can_move_left = false
                        object.x = collider.x+collider.width/2+object.width/2
                    }
                }
            })
        })

        params.update(game)
    }

    function loading() {
        ctx.fillStyle = 'black'
        ctx.fillRect(0, 0, variables.width, variables.height)
        ctx.fillStyle = '#34b1bf'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = "70px Comic Sans MS"
        ctx.fillText("Loading...", variables.width/2, variables.height/2)
    }

    function run() {
        requestAnimationFrame(run)

        if (variables.loading) {
            if (params.loading) params.loading(game)
            else loading()
            return
        }

        now = Date.now();
        delta = now - then;

        if (delta < interval) return
        then = now - (delta % interval)

        draw();
        if (variables.is_running) {
            if (params.on_start) {
                params.on_start(game)
                params.on_start = undefined
            }
            update_game()
            variables.game_frame++;
        }
        else {
            draw_menu(menu_name)
        }
    }

    function draw() {
        clear_canvas()

        ctx.save()
        const player = get_game_object(variables.player_name)
        if (variables.bg_move)
            if (variables.bg_move_horizontal) 
                ctx.translate((-player.x+variables.width*(variables.player_x-0.5))*variables.bg_move_speed, 0);
            if (variables.bg_move_vertical)
                ctx.translate(0, (-player.y+variables.height*(variables.player_y-0.5))*variables.bg_move_speed);
        update_objects()
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 5
        if (variables.bd_collider)
            ctx.strokeRect(canvas.width/2+variables.minX, canvas.height/2+variables.minY, canvas.width/2+variables.maxX, canvas.height/2+variables.maxY)
        ctx.restore();

        texts.forEach(text => {
            if (text.draw)
                draw_text(text.name)
        })

        buttons.forEach(button => {
            if (button.draw)
                draw_button(button.name)
        })

        sliders.forEach(slider => {
            if (slider.draw)
                draw_slider(slider.name)
        })

        checkboxes.forEach(checkbox => {
            if (checkbox.draw)
                draw_checkbox(checkbox.name)
        })
    }

    function sleep(milliseconds) {
        const date = Date.now();
        let currentDate = null;
        do {
            currentDate = Date.now();
        } while (currentDate - date < milliseconds);
    }
    
    function random_position(params) {
        if (params === undefined) params = {};
        const maxX = params.maxX ?? variables.maxX
        const minX = params.minX ?? variables.minX
        const maxY = params.maxY ?? variables.maxY
        const minY = params.minY ?? variables.minY
        return { x: Math.floor(Math.random() * (maxX - minX))+minX, y: Math.floor(Math.random() * (maxY - minY))+minY }
    }

    function random_number(min, max) {
        return Math.floor(Math.random() * (max - min)) + min
    }

    function custom_object_is_overlaped(object_name, collider) {
        const object = get_game_object(object_name)
        if (!object) return false

        if (object.x+object.width/2 >= collider.x-collider.width/2 && object.x-object.width/2 <= collider.x+collider.width/2
        && object.y+object.height/2 >= collider.y-collider.height/2 && object.y-object.height/2 <= collider.y+collider.height/2) return true
    }

    function object_is_hovered(object_name, mouse_pos) {
        const object = get_game_object(object_name)
        if (!object) return

        const parent_pos = get_parent_pos(object.parent)
        if (mouse_pos.x > object.x-object.width/2+variables.width/2 && mouse_pos.x < object.x + object.width/2+variables.width/2 && mouse_pos.y > object.y - object.height/2 + variables.height/2 && mouse_pos.y < object.y + object.height/2 + variables.height/2) return true
        return false
    }

    function start_game() {
        game_objects.splice(1, game_objects.length)
        colliders.splice(0, colliders.length)
        listeners.splice(0, listeners.length)
        menus.splice(0, menus.length)
        buttons.splice(0, buttons.length)
        texts.splice(0, texts.length)
        sliders.splice(0, sliders.length)
        checkboxes.splice(0, checkboxes.length)

        variables.game_frame = 0
        
        if (params.on_restart) params.on_restart(game)

        preload();
        
        variables.is_running = true
    }

    const game = new Object({
        variables,
        ctx,
        start_game,
        run_stop_game,
        run_game,
        stop_game,
        create_menu,
        create_menu_objects,
        change_menu,
        set_menu,
        menu_buttons_onclick,
        create_text,
        create_button,
        create_checkbox,
        set_text,
        button_onclick,
        create_rect,
        create_ellipse,
        create_collider,
        create_sprite_sheet,
        delete_game_object,
        get_game_object,
        get_game_objects,
        remove_game_object,
        add_animation,
        set_current_animation,
        create_image,
        get_attr,
        set_attr,
        move_x,
        move_y,
        rotate,
        add_listener,
        key_is_down,
        set_gravity,
        jump,
        is_overlaped,
        sleep,
        random_position,
        custom_object_is_overlaped,
        object_is_hovered,
        create_sound,
        play_sound,
        stop_sound,
        random_number
    })
    
    preload()
    run()
}