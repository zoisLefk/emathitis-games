function create_game() {
    const game_div = document.getElementById('game');
    const h1 = document.createElement('h1')
    h1.className = 'score'
    h1.id = 'score'
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    canvas.width = 400;
    canvas.height = 400;
    game_div.appendChild(h1)
    game_div.appendChild(canvas)
}

function start_game() {
    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')
    
    const snake_color = '#fcba03';
    const snake_stroke = '#b39117';
    const backgorund_color = '#03d7fc';
    const stroke_color = '#046d80';
    
    let snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 },
        { x: 140, y: 200 },
    ]
    
    const play_button = {
        x: canvas.width/2 - 50,
        y: canvas.height/2 - 25,
        width: 100,
        height: 50,
        text: 'Play',
        color: '#50f268',
        stroke_color: '#000000',
        text_color: '#606160'
    }
    
    let mouse_pos = { x: 0, y: 0 }
    
    let dx = 20;
    let dy = 0;
    
    let food_x = 0
    let food_y = 0;
    
    let Score = 0;
    
    let timeout;
    
    document.addEventListener('keydown', change_direction)
    document.addEventListener('mousemove', (event) => {
        mouse_pos = getMousePos(event);
    })
    
    document.addEventListener('mousedown', (event) => {
        if (is_hovered(play_button) && has_game_ended()) {
            start();
        }
    })
    
    start();
    
    function start() {
        if (timeout) clearTimeout(timeout);
        
        canvas.classList.remove('cursor-pointer')
        gen_food();
    
        snake = [
            { x: 200, y: 200 },
            { x: 180, y: 200 },
            { x: 160, y: 200 },
            { x: 140, y: 200 },
        ]
    
        dx = 20;
        dy = 0;
        Score = 0;
        document.getElementById('score').innerText = 'Score: ' + Score;
    
        game();
    }
    
    
    function game() {
        if (has_game_ended()) {
            draw_menu();
        } else {
            draw()
            move_snake()
        }
        
        timeout = setTimeout(() => {
            game()
        }, 100)
    }
    
    function draw_menu() {
        is_hovered(play_button)
        
        ctx.fillStyle = play_button.color;
        ctx.strokeStyle = play_button.stroke_color;
        ctx.fillRect(play_button.x, play_button.y, play_button.width, play_button.height);
        ctx.strokeRect(play_button.x, play_button.y, play_button.width, play_button.height);
    
        ctx.fillStyle = play_button.text_color
        ctx.font = '30px Roboto bold';
        ctx.textAlign = 'center'
        ctx.fillText(play_button.text, canvas.width/2, play_button.y + play_button.height - 15)
    }
    
    function draw() {
        clear_canvas();
        draw_snake();
        draw_food();
    }
    
    function clear_canvas() {
        ctx.fillStyle = backgorund_color;
        ctx.strokeStyle = stroke_color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i=0; i<20; i++)
            for (let j=0; j<20; j++)
                ctx.strokeRect(i*20, j*20, 20, 20)
    }
    
    function draw_snake() {
        ctx.fillStyle = '#eb6b09';
        ctx.strokeStyle = '#a14d0d';
        snake.forEach(draw_snake_part)
    }
    
    function draw_snake_part(snakePart) {
        ctx.fillRect(snakePart.x, snakePart.y, 20, 20)
        ctx.strokeRect(snakePart.x, snakePart.y, 20, 20)
        ctx.fillStyle = snake_color;
        ctx.strokeStyle = snake_stroke;
    }
    
    function move_snake() {    
        const snake_head = { x: snake[0].x+dx, y: snake[0].y+dy }
        snake.unshift(snake_head);
    
        const has_eaten_food = snake[0].x === food_x && snake[0].y === food_y;
        
        if (has_eaten_food) {
            Score++;
            document.getElementById('score').innerText = 'Score: ' + Score;
            gen_food()
        } else {
            snake.pop()
        }
    }
    
    function change_direction(event) {
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;
        
        const keyPreesed = event.keyCode;
        const goingUp = dy === -20;
        const goingDown = dy === 20;
        const goingLeft = dx === -20;
        const goingRight = dx === 20;
    
        if (keyPreesed === LEFT_KEY && !goingRight) {
            dx = -20;
            dy = 0;
        } else if (keyPreesed === RIGHT_KEY && !goingLeft) {
            dx = 20;
            dy = 0;
        } else if (keyPreesed === UP_KEY && !goingDown) {
            dx = 0;
            dy = -20;
        } else if (keyPreesed === DOWN_KEY && !goingUp) {
            dx = 0;
            dy = 20;
        }
    }
    
    function has_game_ended() {
        for (let i = 4; i < snake.length; i++){    
            const has_collided = snake[i].x === snake[0].x && snake[i].y === snake[0].y
    
        if (has_collided) 
            return true
        }
    
        const hitLeftWall = snake[0].x < 0;  
        const hitRightWall = snake[0].x > canvas.width - 20;
        const hitToptWall = snake[0].y < 0;
        const hitBottomWall = snake[0].y > canvas.height - 20;
        
        return hitLeftWall ||  hitRightWall || hitToptWall || hitBottomWall
    }
    
    function random_food(min, max) {
        return Math.round((Math.random() * (max-min) + min) / 20)*20;
    }
    
    function gen_food() {
        food_x = random_food(0, canvas.width-20);
        food_y = random_food(0, canvas.height-20);
        snake.forEach(function has_snake_eaten_food(part) {
            const has_eaten = part.x === food_x && part.y === food_y;
            if (has_eaten) gen_food();
        }) 
    }
    
    function draw_food() {
        ctx.fillStyle = 'lightgreen';
        ctx.strokeStyle = 'darkgreen';
        ctx.fillRect(food_x, food_y, 20, 20);
    }
    
    function getMousePos(event) {
        var rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        }
    }
    
    function is_hovered(button) {
        if (mouse_pos.x > button.x && mouse_pos.x < button.x + button.width && mouse_pos.y > button.y && mouse_pos.y < button.y + button.height) {
            button.color = '#c0ebc5'
            button.text_color = 'black'
            canvas.classList.add('cursor-pointer')
            return true;
        }
    
        button.color = '#50f268';
        button.text_color = '#606160'
        canvas.classList.remove('cursor-pointer')
        return false    
    }
}

create_game()
start_game()