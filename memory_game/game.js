function get_cards_elements() {
    const cards_elements = document.getElementsByClassName('card')

    return cards_elements
}

function createGame() {
    const game_div = document.getElementById('game')
    const game_container = document.createElement('div')
    game_container.id = 'game-container'
    const bar = document.createElement('div')
    bar.id = 'bar'
    const grid_container = document.createElement('div')
    grid_container.className = 'grid-container';

    const cards_elements = []
    
    for (let i=0; i<16; i++) {
        const card = document.createElement('button');
        card.className = 'card';
        grid_container.appendChild(card)
        cards_elements.push(card)
    }
    
    game_container.appendChild(bar)
    game_container.appendChild(grid_container)
    game_div.appendChild(game_container)
}

function start_game() {
    const cards = []
    const cards_elements = get_cards_elements()
    
    class Card {
        static selectedIdx = null;
        static selectedCardImg = null;
        static selectedCards = 0;
        static flag = true;
        static founded_count = 0;
        static click_counter = 0;
        
        constructor(game, card, front_img, idx) {
            this.game = game
            this.card = card;
            this.front_img = front_img;
            this.idx = idx;
            this.is_turned = false;
            this.enabled = true;
    
            this.card.addEventListener('click', () => {
                if (this.enabled && Card.flag) {
                    if (this.is_turned) return
                    
                    Card.click_counter++;
                    this.turn_card();
                    Card.selectedCards += 1;
                    
                    if (Card.selectedCards === 1) {
                        Card.selectedCardImg = this.front_img;
                        Card.selectedIdx = this.idx;
                    } else if (Card.selectedCards === 2 && Card.selectedIdx === this.idx) {
                        Card.selectedCardImg = null;
                        Card.selectedIdx = null;
                        Card.selectedCards = 0;
                    } else {
                        this.check_cards();
                    }
                }
            })
        }
    
        check_cards() {
            if (this.front_img.src !== Card.selectedCardImg.src) {
                Card.flag = false
                setTimeout(() => {
                    this.turn_card();
                    cards[Card.selectedIdx].turn_card();
                    Card.selectedCardImg = null;
                    Card.selectedIdx = null;
                    Card.selectedCards = 0;
                    Card.flag = true;
                }, 1000)
            } else {
                this.enabled = false;
                cards[Card.selectedIdx].enabled = false;
                this.front_img.className = 'finished';
                cards[Card.selectedIdx].front_img.className = 'finished';
                Card.founded_count++;
                if (Card.founded_count === 8) {
                    game.win();
                }
                Card.selectedCardImg = null;
                Card.selectedIdx = null;
                Card.selectedCards = 0;
            }
        }
    
        turn_card() {
            game.setClick();
            this.card.classList.add('turn-card');
            if (!this.is_turned) {
                this.card.classList.add('selected-img');
                const imgs = this.card.querySelectorAll('img');
                for (let i=0; i<imgs.length; i++) {
                    imgs[i].style.display = 'none';
                }
                this.front_img.style.display = 'block';
                this.is_turned = true;
            } else {
                this.card.classList.remove('selected-img');
                this.card.classList.remove('turn-card');
                const imgs = this.card.querySelectorAll('img');
                for (let i=0; i<imgs.length; i++) {
                    imgs[i].style.display = 'block';
                }
                this.front_img.style.display = 'none';
                this.is_turned = false;
            }
        }
    }
    
    class Game {
        static max_time = 50;
        static time = Game.max_time;
        static timer = null;
        
        constructor() {
            const menu = document.createElement('div');
            menu.className = 'menu';
            menu.id = 'menu';
    
            const h2 = document.createElement('h2');
            h2.className = 'text';
            h2.id = 'text';
            menu.appendChild(h2);
    
            const score = document.createElement('h2');
            score.className = 'text';
            score.id = 'score';
            menu.appendChild(score);
    
            const start_btn = document.createElement('button');
            start_btn.className = 'start-btn';
            start_btn.id = 'start'
            start_btn.innerText = 'Start'
            start_btn.addEventListener('click', () => { menu.style.display = 'none'; this.startGame() });
    
            menu.appendChild(start_btn);
            document.getElementById('game').appendChild(menu);
    
            this.createCards();
            const span1 = document.createElement('span');
            span1.id = 'time';
            span1.innerText = "Time: " + Game.time;
    
            const span2 = document.createElement('span');
            span2.id = 'clicks';
            span2.innerText = "Clicks: " + Card.click_counter;
    
            document.getElementById('bar').appendChild(span1);
            document.getElementById('bar').appendChild(span2);
        }
    
        startGame() {
            Game.time = Game.max_time;
            Card.founded_count = 0;
            Card.click_counter = 0;
            this.setClick();
            document.getElementById('time').innerText = "Time: " + Game.time;
            this.refreshCards();
            this.startTimer()
        }
    
        startTimer() {
            Game.timer = setTimeout(() => {
                Game.time -= 1;
                if (Game.time <= 0) {
                    Game.time = 0;
                    game.lose();
                }
                this.startTimer()
            }, 1000)
            try {
                document.getElementById('time').innerText = "Time: " + Game.time;
            } catch {
                clearTimeout(Game.timer)
            }
        }
    
        clearTimer() {
            clearTimeout(Game.timer)
        }
    
        win() {
            const h2 = document.getElementById('text');
            h2.innerText = 'YOU WIN';
            h2.style.color = 'green';
            document.getElementById('start').innerText = 'Replay';
            document.getElementById('score').innerText = this.calc_score();
            this.clearTimer();
            this.showMenu();
        }
    
        lose() {
            const h2 = document.getElementById('text');
            document.getElementById('start').innerText = 'Replay';
            h2.innerText = 'YOU LOSE';
            h2.style.color = 'red';
            clearInterval(Game.time);
            this.showMenu();
        }
    
        calc_score() {
            return Math.round((Game.time * 16/Card.click_counter) * 100)
        }
    
        setClick() {
            document.getElementById('clicks').innerText = "Clicks: " + Card.click_counter;
        }
    
        showMenu() {
            document.getElementById('menu').style.display = 'flex';
        }
    
        refreshCards() {
            const images = []
            const images_names = 'Bat Bones Cauldron Dracula Eye Ghost Pumpkin Skull Bat Bones Cauldron Dracula Eye Ghost Pumpkin Skull';
            shuffle(images_names.split(' ')).forEach(name => {
                images.push(name);
            })
    
            for (let i = 0; i < cards.length; i++) {
                cards[i].front_img.src = 'http://localhost:5000/games/memory_game/images/' + images[i] + '.png';
                cards[i].front_img.className = 'card-img';
                cards[i].enabled = true;
                if (cards[i].is_turned) cards[i].turn_card();
            }
        }
    
        createCards() {
            const images = []
            const images_names = 'Bat Bones Cauldron Dracula Eye Ghost Pumpkin Skull Bat Bones Cauldron Dracula Eye Ghost Pumpkin Skull';
            shuffle(images_names.split(' ')).forEach(name => {
                images.push(name);
            })
            
            for (let i = 0; i < cards_elements.length; i++) {
                let img_class = ['top-left-img', 'top-right-img', 'bottom-left-img', 'bottom-right-img'];
                for (let j = 0; j < 4; j++) {
                    let img = document.createElement('img');
                    img.src = 'http://localhost:5000/games/memory_game/images/web.png';
                    img.className = img_class[j] + " corner-img";
                    cards_elements[i].appendChild(img);
                }
                let img = document.createElement('img');
                img.src = 'http://localhost:5000/games/memory_game/images/Spider.png';
                img.className = 'center-img';
                cards_elements[i].appendChild(img);
                
                img = document.createElement('img');
                img.src = 'http://localhost:5000/games/memory_game/images/' + images[i] + '.png';
                img.className = 'card-img';
                img.style.display = 'none'
            
                cards_elements[i].appendChild(img);
            
                cards.push(new Card(this, cards_elements[i], img, i));
            }
        }
    }
    
    const game = new Game(document.getElementById('score_text'));
    
    function shuffle(array) {
        let currentIndex = array.length,  randomIndex;
    
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
    
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
    
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
    
        return array;
    }
}

createGame()
start_game()
