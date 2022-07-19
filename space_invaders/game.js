function create_game() {
    const canvas = document.createElement('canvas')
    canvas.id = 'canvas'
    document.getElementById('game').appendChild(canvas)
}

function start_game() {
    class Button {
        constructor(x, y, width, height, text, color='lightgray', text_color='black') {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.text = text;
            this.color = color;
            this.text_color = text_color;
            this.is_hovered = false;
        }
    
        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = this.text_color;
            ctx.font = '50px Roboto bold';
            ctx.textAlign = 'center'
            ctx.fillText(this.text, this.x + this.width/2, this.y + this.height/2 + 15)
        }
    
        isHovered(pos) {
            this.is_hovered = pos.x >= this.x && pos.x <= this.x+this.width && pos.y >= this.y && pos.y <= this.y+this.height
            return this.is_hovered
        }
    
        onclick(callback) {
            callback();
        }
    }

    class Menu {
        constructor(center, width, height, texts) {
            this.buttons = []
            let i = height/2 - (texts.length * width*0.2+20)/2;
            texts.forEach((text) => {
                this.buttons.push(new Button(center - width/2, i, width, width*0.2, text))
                i+=width*0.2+20;
            })
        }
    
        draw(ctx) {
            this.buttons.forEach(button => button.draw(ctx))
        }
    }

    class Bullet {
        constructor(x, y, width, height, color, speed, target_objects) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color
            this.speed = speed;
            this.can_draw = true;
            this.target_objects = target_objects
        }
    
        move() {
            if (this.check_colision()) {
                this.can_draw = false;
                return;
            }
            this.y += this.speed;
        }
    
        check_colision() {
            if (!this.can_draw) return;
    
            this.target_objects.forEach(object => {
                if (object.colision(this)) {
                    object.hit();
                    this.can_draw = false
                    return true;
                }
            })
    
            return this.y < 0 || this.y > canvas.height;
        }
    
        draw(ctx) {
            if (!this.can_draw) return
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Alien {
        static direction = 1;
        static total_width = null;
        
        constructor(x, y, width, height, row, col, speed, bullet_speed) {
            this.row = row
            this.col = col;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.life = 100;
            this.speed = speed;
            this.can_hit = true;
            this.i = 0;
            this.color = '#67c714'
            this.is_dead = false;
            this.life_bar_width = this.width*0.8;
            this.life_bar_height = 10;
            this.life_bar_x = this.x + this.width/2 - this.life_bar_width/2;
            this.life_bar_y = this.y + this.height + 2;
            this.bullet_speed = bullet_speed;
        }
    
        draw(ctx) {
            if (this.is_dead) return;
    
            if (this.can_hit) this.color = '#67c714'
    
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
    
            ctx.fillStyle = '#d6ed07';
            ctx.fillRect(this.life_bar_x, this.life_bar_y, (this.life/100)*this.life_bar_width, this.life_bar_height);
        }
    
        move_life_bar() {
            this.life_bar_x = this.x + this.width/2 - this.life_bar_width/2;
            this.life_bar_y = this.y + this.height + 5;
        }
    
        move() {
            this.x += this.speed * Alien.direction;
            this.move_life_bar();
        }
    
        check_collide_to_right_wall() {
            return this.x > canvas.width - this.width;
        }
    
        check_collide_to_left_wall() {
            return this.x < 0;
        }
    
        hit_animation() {
            this.i++;
            if (this.i >= 5) {
                this.i = 0;
                this.can_hit = true;
                return;
            }
    
            if (this.color === '#67c714') this.color = 'black'
            else this.color = '#67c714'
                    
            setTimeout(() => {
                this.hit_animation();
            }, 150)
        }
    
        die() {
            this.is_dead = true;
            this.can_hit = false;
            game.add_dead_alien(this.row, this.col);
        }
    
        hit() {
            if (!this.can_hit) return;
    
            this.life -= 20;
            this.can_hit = false;
            this.hit_animation();
    
            if (this.life <= 0) this.die();
        }
    
        colision(object) {
            if (this.is_dead) return false;
            return object.x > this.x && object.x + object.width < this.x + this.width && object.y < this.y + object.height && object.y > this.y;
        }
    
        shoot() {
            if (this.is_dead) return;
    
            let targets = []
            if (game.player) targets = [game.player]
            else targets = [game.player1, game.player2]
            
            const bullet = new Bullet(
                this.x + this.width/2-10,
                this.y,
                this.width*0.1,
                this.height,
                '#fc2003',
                this.bullet_speed,
                targets
            );
    
            game.enemy_bullets.push(bullet);
        }
    }

    class Controls {
        constructor(player) {
            this.left = false;
            this.right = false;
            this.canShoot = true;
    
            this.player = player;
        }
    }

    class Player {
        constructor(x, y, width, height, color, pl_num, bullet_list, controls) {
            this.pl_num = pl_num;
            this.bullet_list = bullet_list
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.main_color = color;
            this.color = this.main_color;
            this.center = width/2
            this.controls = controls;
            this.can_shoot = true;
            this.i = 0;
            this.j = 0;
            this.reload_width = this.width*0.9;
            this.reload_height = this.height*0.1;
            this.reload_bar = false;
            this.lifes = 3;
            this.can_hit = true;
            this.heart_img = 'http://localhost:5000/games/space_invaders/images/heart.png';
            this.images = [];
            this.is_dead = false;
            this.rects = []
    
            for (let i=1; i<=this.lifes; i++) {
                let img = new Image();
                img.src = this.heart_img;
                this.images.push(img)
            }        
        }
        
        draw(ctx) {
            if (this.is_dead) {
                this.die_animation(ctx);
                return
            }
    
            if (this.can_hit) this.color = this.main_color;
            
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y+50, this.width, this.height-50);
            ctx.fillRect(this.x+this.width/2-30, this.y, 60, 70);
            this.draw_lifes(ctx);
            if (this.reload_bar) this.draw_load_bar(ctx)
        }
    
        draw_lifes(ctx) {
            for (let i=0; i<this.lifes; i++) {
                let width = this.images[i].width/10
                let height = this.images[i].height/10;
                if (this.pl_num === 2)
                    ctx.drawImage(this.images[i], canvas.width - (i+1)*width-(i+1)*50, canvas.height-height-30, width, height);
                else
                    ctx.drawImage(this.images[i], i*width+(i+1)*50, canvas.height-height-30, width, height);
            }
        }
    
        draw_load_bar(ctx) {
            ctx.fillStyle = 'gray';
            ctx.fillRect(this.x + (this.width-this.reload_width)/2, this.y + this.height + 2, this.i, this.reload_height);
        }
    
        move() {
            if (this.controls.left && this.x >= 0) this.x -= 10;
            else if (this.controls.right && this.x <= canvas.width-this.width) this.x += 10;
        }
    
        reload() {
            this.i++;
            if (this.i >= this.reload_width) {
                this.i = 0;
                this.run_counter = true;
                while (this.bullet_list.length !== 0)
                    this.bullet_list.pop();
                this.can_shoot = true;
                this.reload_bar = false;
                return;
            }
    
            setTimeout(() => {
                this.reload_bar = true;
                this.reload();
            }, 1000/this.reload_width)
        }
    
        shoot() {
            if (!this.controls.canShoot)
                return
    
            if (!this.can_shoot) return;
            
            const bullet = new Bullet(
                this.x + this.width/2-10,
                this.y,
                this.width*0.1,
                this.height,
                '#00ccff',
                -30,
                game.aliens
            );
            this.bullet_list.push(bullet);
    
            if (this.bullet_list.length === 10) {
                this.can_shoot = false;
    
                this.i = 0;
                this.reload();
    
                return; 
            }
        }
    
        colision(object) {
            return object.x >= this.x && object.x < this.x + this.width && object.y + object.height > this.y && object.y < this.y + this.height;
        }
    
        hit_animation() {
            this.j++;
            if (this.j >= 5) {
                this.j = 0;
                this.can_hit = true;
                return;
            }
    
            if (this.color === this.main_color) this.color = 'black'
            else this.color = this.main_color
                    
            setTimeout(() => {
                this.hit_animation();
            }, 150)
        }
    
        hit() {
            if (!this.can_hit) return;
    
            this.lifes--;
            this.can_hit = false;
            this.hit_animation();
    
            if (this.lifes <= 0) this.die();
        }
    
        create_rect() {
            let mx = Math.floor(Math.random()*20)-9
    
            let my = Math.floor(Math.random()*20)-9
            
            return {
                x: Math.floor(Math.random() * (this.width-100)) + this.x,
                y: Math.floor(Math.random() * (this.height-100)) + this.y,
                mx: mx,
                my: my
            }
        }
    
        die_animation(ctx) {
            if (this.rects.length === 0) {
                for (let i=0; i<100; i++)
                    this.rects.push(this.create_rect());
            }
            
            ctx.fillStyle = this.main_color
    
            this.rects.forEach(rect => {
                ctx.fillRect(rect.x, rect.y, 30, 30);
                rect.x += rect.mx;
                rect.y += rect.my;
            })
        }
    
        die() {
            this.is_dead = true;
            setTimeout(() => game.lose(), 500);
        }
    }

    class Game {
        constructor() {
            this.level = 0;
            this.run = false;
        }
    
        start() {
            canvas.className = ''
            if (this.win)
                this.level++;
            else 
                this.level = 1;
            this.run = true;
            this.pause = false;
            this.player_bullets = [];
            this.controls = new Controls(null)
            this.#addKeyboardListener();
            this.player = new Player(canvas.width/2-100, canvas.height*0.9, 150, 100, 'green', 0, this.player_bullets, this.controls);
            this.controls.player = this.player
            this.aliens = [];
            this.aliens_count_row = []
            this.aliens_last_row = 0;
            this.aliens_count_col = []
            this.aliens_first_col = 0;
            this.aliens_last_col = 0;
            this.dead_aliens_count = 0;
            this.win = false;
            this.enemy_bullets = []
            this.alien_shoot_timeout = setTimeout(() => this.alien_shoot(), 4000);
            Alien.direction = 1;
    
            let row_num = 3;
            let col_num = 5;
            
            this.max_col_num = col_num;
            
            this.aliens_last_row = row_num-1;
    
            this.aliens_first_col = 0;
            this.aliens_last_col = col_num-1;
    
            for (let i=0; i<row_num; i++) {
                this.aliens_count_row.push(col_num)
            }
    
            for (let i=0; i<col_num; i++) {
                this.aliens_count_col.push(row_num)
            }
    
            let alien_x= 0;
            let alien_y= 5;
            let alien_width = 150; 
            let alien_height = 75;
            for (let r=0; r<row_num; r++) {
                alien_x  = 0
                for (let c=0; c<col_num; c++) {
                    let alien = new Alien(alien_x, alien_y, alien_width, alien_height, r, c, this.level*1.5, 10);
                    this.aliens.push(alien);
                    alien_x += alien_width + 20
                }
                alien_y += alien_height + 25;
            }
            Alien.total_width = alien_x        
        }
    
        add_dead_alien(row, col) {
            this.dead_aliens_count++;
            this.aliens_count_row[row] -= 1;
            this.aliens_count_col[col] -= 1;
            if (this.dead_aliens_count === this.aliens.length) setTimeout(() => this.win_game(), 100);
    
            while (this.aliens_count_row[this.aliens_last_row] === 0 && this.aliens_last_row > 0) {
                this.aliens_last_row -= 1;
            }
    
            while (this.aliens_count_col[this.aliens_first_col] === 0 && this.aliens_first_col < this.max_col_num) {
                this.aliens_first_col += 1
            }
    
            while (this.aliens_count_col[this.aliens_last_col] === 0 && this.aliens_last_col > 0) {
                this.aliens_last_col -= 1
            }
        }
    
        move() {
            if (!this.run) return;
    
            if (this.pause) return;
            
            this.player.move();
            this.player_bullets.forEach(bullet => bullet.move())
            this.aliens.forEach(alien => alien.move());
            this.enemy_bullets.forEach(bullet => bullet.move());
            
            if (Alien.direction === 1) {
                if (this.aliens[this.aliens_last_col].check_collide_to_right_wall()) {
                    Alien.direction = -1
                    this.aliens.forEach(alien => {
                        alien.y += 75;
                    })
                }
            }
            
            if (Alien.direction === -1) {
                if (this.aliens[this.aliens_first_col].check_collide_to_left_wall()) {
                    Alien.direction = 1
                    this.aliens.forEach(alien => {
                        alien.y += 75;
                    })
                }
            }
    
            let temp_player = this.player || this.player1;
            if (this.aliens[this.aliens_last_row*this.max_col_num].y + this.aliens[this.aliens_last_row*this.max_col_num].height > temp_player.y) {
                this.player.die()
                setTimeout(() => this.lose(), 500);
            }
        }
    
        lose() {
            clearTimeout(this.alien_shoot_timeout);
            this.run = false;
            this.win = false;
        }
    
        win_game() {
            clearTimeout(this.alien_shoot_timeout);
            this.run = false;
            this.win = true;
        }
    
        draw_level_text(ctx) {
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left'
            ctx.font = '50px Roboto bold';
            ctx.fillText('Level: ' + this.level, 0, 50);
        }
    
        draw(ctx) {
            if (!this.run) return
    
            if (this.puase) return
            
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            this.player_bullets.forEach(bullet => bullet.draw(ctx))
            this.enemy_bullets.forEach(bullet => bullet.draw(ctx))
            this.aliens.forEach(alien => alien.draw(ctx));
            this.player.draw(ctx);
            this.draw_level_text(ctx)
        }
    
        alien_shoot() {
            if (!this.run) return
    
            if (this.pause) return
    
            let rand_col = Math.floor(Math.random() * this.max_col_num);
            while (this.aliens_count_col[rand_col] === 0) rand_col = Math.floor(Math.random() * this.max_col_num);
            let alien = this.aliens[(this.aliens_count_col[rand_col]-1)*this.max_col_num + rand_col]
            
            alien.shoot()
    
            this.alien_shoot_timeout = setTimeout(() => this.alien_shoot(), 4000/this.level*1.5);
        }
    
        #addKeyboardListener() {
            document.onkeydown = (event) => {
                switch (event.key) {
                    case "ArrowLeft":
                        this.controls.left = true;
                        break;
                    case "ArrowRight":
                        this.controls.right = true;
                        break;
                    case " ":
                        this.controls.player.shoot();
                        this.controls.canShoot = false;
                        break;
                    case "a":
                        this.controls.left = true;
                        break;
                    case "d":
                        this.controls.right = true;
                        break;
                    case "A":
                        this.controls.left = true;
                        break;
                    case "D":
                        this.controls.right = true;
                        break;
                    case " ":
                        this.controls.player.shoot();
                        this.controls.canShoot = false;
                        break;   
                    case "Escape":
                        this.pause = !this.pause;
                        break;
                }
            }
    
            document.onkeyup = (event) => {
                switch (event.key) {
                    case "ArrowLeft":
                        this.controls.left = false;
                        break;
                    case "ArrowRight":
                        this.controls.right = false;
                        break;
                    case "Control":
                        this.controls.canShoot = true;
                        break;
                    case "a":
                        this.controls.left = false;
                        break;
                    case "d":
                        this.controls.right = false;
                        break;
                    case "A":
                        this.controls.left = false;
                        break;
                    case "D":
                        this.controls.right = false;
                        break;
                    case " ":
                        this.controls.canShoot = true;
                        break;  
                }
            }
        }
    }

    class Game2 {
        constructor() {
            this.level = 1;
            this.run = false;
        }
    
        start() {
            canvas.className = ''
            if (this.win)
                this.level++;
            else 
                this.level = 1;
            this.run = true;
            this.pause = false;
            this.player1_bullets = [];
            this.player2_bullets = [];
            this.p1_controls = new Controls(null);
            this.p2_controls = new Controls(null);
            this.#addKeyboardListener();
            this.player1 = new Player(canvas.width/2-200, canvas.height*0.9, 150, 100, 'green', 1, this.player1_bullets, this.p1_controls);
            this.player2 = new Player(canvas.width/2+100, canvas.height*0.9, 150, 100, 'blue', 2, this.player2_bullets, this.p2_controls);
            this.p1_controls.player = this.player1;
            this.p2_controls.player = this.player2;
            this.aliens = [];
            this.aliens_count_row = []
            this.aliens_last_row = 0;
            this.aliens_count_col = []
            this.aliens_first_col = 0;
            this.aliens_last_col = 0;
            this.win = false;
            this.dead_aliens_count = 0;
            this.enemy_bullets = []
            this.alien_shoot_timeout = setTimeout(() => this.alien_shoot(), 4000);
            this.dead_players = 0;
            Alien.direction = 1;
    
            let row_num = 3;
            let col_num = 5;
            
            this.max_col_num = col_num;
            
            this.aliens_last_row = row_num-1;
    
            this.aliens_first_col = 0;
            this.aliens_last_col = col_num-1;
    
            for (let i=0; i<row_num; i++) {
                this.aliens_count_row.push(col_num)
            }
    
            for (let i=0; i<col_num; i++) {
                this.aliens_count_col.push(row_num)
            }
    
            let alien_x= 0;
            let alien_y= 5;
            let alien_width = 150; 
            let alien_height = 75;
            for (let r=0; r<row_num; r++) {
                alien_x  = 0
                for (let c=0; c<col_num; c++) {
                    let alien = new Alien(alien_x, alien_y, alien_width, alien_height, r, c, this.level*0.7, 7);
                    this.aliens.push(alien);
                    alien_x += alien_width + 20
                }
                alien_y += alien_height + 25;
            }
            Alien.total_width = alien_x
        }
    
        add_dead_alien(row, col) {
            this.dead_aliens_count++;
            this.aliens_count_row[row] -= 1;
            this.aliens_count_col[col] -= 1;
            if (this.dead_aliens_count === this.aliens.length) setTimeout(() => this.win_game(), 100);
    
            while (this.aliens_count_row[this.aliens_last_row] === 0 && this.aliens_last_row > 0) {
                this.aliens_last_row -= 1;
            }
    
            while (this.aliens_count_col[this.aliens_first_col] === 0 && this.aliens_first_col < this.max_col_num) {
                this.aliens_first_col += 1
            }
    
            while (this.aliens_count_col[this.aliens_last_col] === 0 && this.aliens_last_col > 0) {
                this.aliens_last_col -= 1
            }
        }
    
        move() {
            if (!this.run) return;
            
            if (this.pause) return;
            
            this.player1.move();
            this.player2.move();
            this.aliens.forEach(alien => alien.move());
            this.player1_bullets.forEach(bullet => bullet.move())
            this.player2_bullets.forEach(bullet => bullet.move())
            this.enemy_bullets.forEach(bullet => bullet.move());
            this.aliens.forEach(alien => alien.move());
            this.enemy_bullets.forEach(bullet => bullet.move());
            
            if (Alien.direction === 1) {
                if (this.aliens[this.aliens_last_col].check_collide_to_right_wall()) {
                    Alien.direction = -1
                    this.aliens.forEach(alien => {
                        alien.y += 75;
                    })
                }
            }
            
            if (Alien.direction === -1) {
                if (this.aliens[this.aliens_first_col].check_collide_to_left_wall()) {
                    Alien.direction = 1
                    this.aliens.forEach(alien => {
                        alien.y += 75;
                    })
                }
            }
    
            let temp_player = this.player || this.player1;
            if (this.aliens[this.aliens_last_row*this.max_col_num].y + this.aliens[this.aliens_last_row*this.max_col_num].height > temp_player.y) setTimeout(() => this.lose(), 100);
        }
    
        lose() {
            this.dead_players++;
            if (this.dead_players < 2) return
    
            clearTimeout(this.alien_shoot_timeout);
            this.run = false;
            this.win = false;
        }
    
        win_game() {
            clearTimeout(this.alien_shoot_timeout);
            this.run = false;
            this.win = true;
        }
    
        draw_level_text(ctx) {
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left'
            ctx.font = '50px Roboto bold';
            ctx.fillText('Level: ' + this.level, 0, 50);
        }
    
        draw(ctx) {
            if (!this.run) return
    
            if (this.pause) return
            
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            this.player1_bullets.forEach(bullet => bullet.draw(ctx))
            this.player2_bullets.forEach(bullet => bullet.draw(ctx))
            this.enemy_bullets.forEach(bullet => bullet.draw(ctx))
            this.player1.draw(ctx);
            this.player2.draw(ctx);
            this.aliens.forEach(alien => alien.draw(ctx));
            this.draw_level_text(ctx)
        }
    
        alien_shoot() {
            if (!this.run) return
    
            if (this.pause) return
    
            let rand_col = Math.floor(Math.random() * this.max_col_num);
            while (this.aliens_count_col[rand_col] === 0) rand_col = Math.floor(Math.random() * this.max_col_num);
            let alien = this.aliens[(this.aliens_count_col[rand_col]-1)*this.max_col_num + rand_col]
            
            alien.shoot()
    
            this.alien_shoot_timeout = setTimeout(() => this.alien_shoot(), 4000/this.level*1.5);
        }
    
        #addKeyboardListener() {
            document.onkeydown = (event) => {
                switch (event.key) {
                    case "ArrowLeft":
                        this.p1_controls.left = true;
                        break;
                    case "ArrowRight":
                        this.p1_controls.right = true;
                        break;
                    case " ":
                        this.p1_controls.player.shoot();
                        this.p1_controls.canShoot = false;
                        break;
                    case "a":
                        this.p2_controls.left = true;
                        break;
                    case "d":
                        this.p2_controls.right = true;
                        break;
                    case "s":
                        this.p2_controls.player.shoot();
                        this.p2_controls.canShoot = false;
                        break;   
                    case "A":
                        this.p2_controls.left = true;
                        break;
                    case "D":
                        this.p2_controls.right = true;
                        break;
                    case "S":
                        this.p2_controls.player.shoot();
                        this.p2_controls.canShoot = false;
                        break;   
                    case "Escape":
                        this.pause = !this.pauseaaaaa;
                        break;
                }
            }
    
            document.onkeyup = (event) => {
                switch (event.key) {
                    case "ArrowLeft":
                        this.p1_controls.left = false;
                        break;
                    case "ArrowRight":
                        this.p1_controls.right = false;
                        break;
                    case " ":
                        this.p1_controls.canShoot = true;
                        break;
                    case "a":
                        this.p2_controls.left = false;
                        break;
                    case "d":
                        this.p2_controls.right = false;
                        break;
                    case "s":
                        this.p2_controls.canShoot = true;
                        break;  
                    case "A":
                        this.p2_controls.left = false;
                        break;
                    case "D":
                        this.p2_controls.right = false;
                        break;
                    case "S":
                        this.p2_controls.canShoot = true;
                        break;  
                }
            }
        }
    }
    
    const canvas = document.getElementById('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    
    const game1 = new Game();
    const game2 = new Game2();
    
    let game = null;
    
    const main_menu = new Menu(canvas.width/2, 400, canvas.height, ['Play', 'Two Players']);
    const replay_menu = new Menu(canvas.width/2, 400, canvas.height, ['Replay', 'Main Menu']);
    const pause_menu = new Menu(canvas.width/2, 400, canvas.height, ['Continue', 'Start Again', 'Menu']);

    let fps = 60;
    let now;
    let then = Date.now();
    let interval = 1000/fps;
    let delta;
    
    function start() {
        requestAnimationFrame(start)

        now = Date.now();
        delta = now - then
        if (delta < interval) return
        
        then = now - (delta % interval)

        if (game) {
            if (game.pause) {
                pause_menu.draw(ctx);
            }
            else if (game.run) {
                game.move();
                game.draw(ctx);
                canvas.className = ''
            } else {
                if (game.win) replay_menu.buttons[0].text = 'Next Level';
                else replay_menu.buttons[0].text = 'Replay'
                replay_menu.draw(ctx)
            }
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            main_menu.draw(ctx);
        }


        // setTimeout(start, 10)
    }
    
    addMouseListenrs();
    start();
    
    function getMousePos(event) {
        var rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        }
    }
    
    function addMouseListenrs() {
        canvas.addEventListener('click', (e) => {
            if (game && game.run && !game.pause) return
            
            var mousePos = getMousePos(e);
            if (!game) {
                main_menu.buttons.forEach(button => {
                    if (button.isHovered(mousePos)) {
                        switch(button.text) {
                            case 'Play':
                                button.onclick(() => {
                                    game = game1
                                    game.start();
                                });
                                break;
                            case 'Two Players':
                                button.onclick(() => {
                                    game = game2;
                                    game.start()
                                });
                                break;
                        }
                    }
                })
            } else if (!game.run) {
                replay_menu.buttons.forEach(button => {
                    if (button.isHovered(mousePos)) {
                        switch(button.text) {
                            case 'Replay':
                                button.onclick(() => game.start())
                                break;
                            case 'Next Level':
                                button.onclick(() => game.start())
                                break;
                            case 'Main Menu':
                                game = null;
                                break;
                        }
                    }
                })
            } else if (game.pause) {
                pause_menu.buttons.forEach(button => {
                    if (button.isHovered(mousePos)) {
                        switch(button.text) {
                            case 'Start Again':
                                button.onclick(() => game.start())
                                break;
                            case 'Menu':
                                game = null;
                                break;
                            case 'Continue':
                                game.pause = false;
                                break;
                        }
                    }
                })
            }
        })
        
        canvas.addEventListener('mousemove', (e) => {
            if (game && game.run && !game.pause) return
            
            var mousePos = getMousePos(e);
            
            canvas.className = '';
    
            if (!game){
                main_menu.buttons.forEach(button => {
                    if (button.isHovered(mousePos)) {
                        button.color = 'gray';
                        button.text_color = 'white'
                        canvas.className = 'cursor-pointer'
                    } else {
                        button.color = 'lightgray';
                        button.text_color = 'black';
                    }
                })
            } else if (game.pause) {
                pause_menu.buttons.forEach(button => {
                    if (button.isHovered(mousePos)) {
                        button.color = 'gray';
                        button.text_color = 'white'
                        canvas.className = 'cursor-pointer'
                    } else {
                        button.color = 'lightgray';
                        button.text_color = 'black';
                    }
                })
            } else if (!game.run) {
                replay_menu.buttons.forEach(button => {
                    if (button.isHovered(mousePos)) {
                        button.color = 'gray';
                        button.text_color = 'white'
                        canvas.className = 'cursor-pointer'
                    } else {
                        button.color = 'lightgray';
                        button.text_color = 'black';
                    }
                })
            }
        })
    }
}

create_game();
start_game();