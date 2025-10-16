canvas = document.querySelector("canvas")
ctx = canvas.getContext('2d')

canvas.height = window.innerHeight
canvas.width = window.innerWidth

const mouse = {
    up: { x: 0, y: 0 }, down: { x: 0, y: 0 }, move: { x: 0, y: 0 },
    isPressed: false, isClicked: false
}
function clearScreen(){
    ctx.clearRect(0, 0, canvas.width, canvas.height)
}

var buttons = []

class Button {
    constructor(x, y, size, digit) {
        // Button Coordinates
        this.x = x
        this.y = y

        // Buttons will bw square, so we need only one variable to describe size
        this.size = size

        this.digit = digit

        // Collision Detect Sample
        this.collision = { point: false, click: false, press: false }

        // Register Click
        this.isClicked = false
        this.isPressed = false
        
        // Button Colors
        this.colors = {idle: 'white', pointed: '#d1d1d1', clicked: '#e39236'}
        this.colors.symbol = {idle: '#e39236', clicked:'white'}        
    }

    collisionActivate() {
        // We will introduce tree types of collision
        // First, when mouse only point on button
        this.collision.point = (mouse.move.x != 0 || mouse.move.y != 0) ? (
            mouse.move.x > this.x - this.size / 2 && mouse.move.x < this.x + this.size / 2 &&
            mouse.move.y > this.y - this.size / 2 && mouse.move.y < this.y + this.size / 2
        ) : false

        // Second, when we concretely click on button
        this.collision.click = (mouse.up.x != 0 || mouse.up.y != 0) ? (
            mouse.up.x > this.x - this.size / 2 && mouse.up.x < this.x + this.size / 2 &&
            mouse.up.y > this.y - this.size / 2 && mouse.up.y < this.y + this.size / 2
        ) : false

        // Finally, if mouse is pressed on button
        this.collision.press = (mouse.down.x != 0 || mouse.down.y != 0) ? (
            mouse.down.x > this.x - this.size / 2 && mouse.down.x < this.x + this.size / 2 &&
            mouse.down.y > this.y - this.size / 2 && mouse.down.y < this.y + this.size / 2
        ) : false

        // Register Click
        this.isClicked = this.collision.click && mouse.isClicked
        this.isPressed = this.collision.point && this.collision.press && mouse.isPressed
    }
    drawBox() {
        // Draw Box
        ctx.fillStyle = this.colors.idle
        if (this.collision.point) {
            ctx.fillStyle = this.colors.pointed
        }
        if (this.isPressed) {
            ctx.fillStyle = this.colors.clicked
        }
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
    }
    drawDigit() {
        // Draw Digit

        ctx.font = "bold 50px sans-serif"
        ctx.fillStyle = this.isPressed ? this.colors.symbol.clicked:this.colors.symbol.idle

        // Get Text Metrics (width, height)
        let metrics = ctx.measureText(this.digit.toString())
        let w = metrics.width
        let h = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent

        ctx.fillText(this.digit.toString(), this.x - w/2, this.y+h/2)
    }
    draw() {
        // Button Visualization
        this.drawBox()
        this.drawDigit()
    }
    update() {
        // Concatenate all processes
        this.collisionActivate()
        this.draw()
    }
}

class Calculator {
    constructor(x,y){
        // Calculator Coordinates
        this.x = x
        this.y = y

        // Storage of all Buttons
        this.buttons = []
        this.generateButtons()

        // Memory for full information aboout expression
        // Screen for showing necessary information and estetics needs
        this.memory = ''
        this.screen = ''
    }
    generateButtons() {
        // Generate Storage for Buttons
        let gap = 15
        let size = 100

        let index = 0
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                this.buttons.push(new Button(this.x + gap * j + size * j,
                                             this.y + gap * i + size * i, 
                                             100, i + j*4 + 1))
                this.buttons[index].local = {x: gap * j + size * j, y: gap * i + size * i}

                index++
            }
        }
        this.buttons[0].digit = '1'
        this.buttons[1].digit = '2'
        this.buttons[2].digit = '3'
        this.buttons[3].digit = '*'
        this.buttons[4].digit = '4'
        this.buttons[5].digit = '5'
        this.buttons[6].digit = '6'
        this.buttons[7].digit = '/'
        this.buttons[8].digit = '7'
        this.buttons[9].digit = '8'
        this.buttons[10].digit = '9'
        this.buttons[11].digit = '-'
        this.buttons[12].digit = '0'
        this.buttons[13].digit = '.'
        this.buttons[14].digit = '='
        this.buttons[14].colors.idle = '#e39236'
        this.buttons[14].colors.pointed = '#d68b36'
        this.buttons[14].colors.clicked = '#c48033'
        this.buttons[14].colors.symbol.idle = 'white'
        this.buttons[14].colors.symbol.clicked = '#c7c7c7'
        this.buttons[15].digit = '+'
    }
    buttonListener() {
        // Button Listener to detect interactions
        let signs = ['+', '-', '*', '/']

        for (let btn in this.buttons) {
            btn = this.buttons[btn]
            if (btn.isClicked) {
                let p1 = false
                let p2 = false
                for (let s in signs) {
                    s = signs[s]
                    if (s == btn.digit.toString()) {
                        p1 = true
                    }
                    if (s == this.memory[this.memory.length - 1]) {
                        p2 = true
                    }
                }
                if (p1 && p2) {continue}
                if (btn.digit != '=') {
                    this.memory += btn.digit.toString()
                }
                else {
                    let stop = false
                    for (let s in signs) {
                        s = signs[s]
                        for (let m in this.memory) {
                            m = this.memory[m]
                            if (m == s) {
                                stop = true
                                break
                            }
                        }
                        if (stop) {
                            break
                        }
                    }
                    if (!stop) { this.memory = '' }
                    else {try {this.memory = eval(this.memory).toString()} 
                          catch (SyntaxError) {this.memory = this.memory}}
                    
                }
            }
        }
    }
    updateButtonPosition(){
        // Update Position of Buttons if Calculator coordinates chanched
        for(let btn in this.buttons){
            btn = this.buttons[btn]
            btn.x = this.x + btn.local.x
            btn.y = this.y + btn.local.y
        }
    }
    drawGraphSpace() {
        // Draw Space to show results of expressions
        let gap = 15
        let size = 100

        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.strokeRect(this.x - size / 2, this.y - size * 1.5 - gap, size * 4 + gap * 3, size)

        let border = 15
        this.screen = this.memory.length>border ? this.memory.toString().slice(this.memory.length-border,this.memory.length):this.memory
        ctx.fillStyle = 'white'
        ctx.fillText(this.screen, this.x - size / 2 + gap, this.y - size)
    }
    draw() {
        // Module to collect all draw processes
        this.drawGraphSpace()
    }
    update() {
        // Module to collect every process
        for (let btn in this.buttons){
            btn = this.buttons[btn]
            btn.update()
        }
        this.buttonListener()

        this.draw()
    }
}

let gap = 15
let size = 100
calculator = new Calculator(canvas.width/2-size*2-gap*3/2,canvas.height/2+size-size*5/2) 

let fps = 60
function main() {
    setTimeout(() => {
        window.requestAnimationFrame(main)
    }, 1000 / fps)
    clearScreen()
    
    calculator.update()

    mouse.isClicked = false
}

main()


onmouseup = function (event) {
    mouse.up.x = event.clientX - canvas.offsetLeft
    mouse.up.y = event.clientY - canvas.offsetTop

    mouse.isClicked = true
    mouse.isPressed = false

    console.log(calculator.memory.length, calculator.screen.length)
}
onmousedown = function (event) {
    mouse.down.x = event.clientX - canvas.offsetLeft
    mouse.down.y = event.clientY - canvas.offsetTop

    mouse.isPressed = true
}
onmousemove = function (event) {
    mouse.move.x = event.clientX - canvas.offsetLeft
    mouse.move.y = event.clientY - canvas.offsetTop
}
onresize = function(event){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    calculator.x = canvas.width/2-size*2-gap*3/2
    calculator.y = canvas.height/2+size-size*5/2
    calculator.updateButtonPosition()
}