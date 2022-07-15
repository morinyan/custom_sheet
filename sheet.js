class Draw {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext("2d")
    }

    rect(cell) {
        const { x, y, w, h } = cell
        this.ctx.strokeRect(x, y, w, h)
        return this
    }

    clear() {
        const { width,height } = this.canvas
        this.clearRect(0, 0, width, height)
        return this
    }
}

// class Cell {
//     constructor(options = { x: 0, y: 0, w: 80, h: 30 }) {
//         Object.assign(this, options)
//     }
// }

class Column {

}

class Row {

}

class Table {
    constructor(canvas) {
        this.draw = new Draw(canvas)

    }

    render() {
        
    }
}























class Sheet {
    constructor(container, options = {}) {
        let box = container;

        if (typeof container === 'string') {
            box = document.querySelector(container)
        }

        this.render(box)
    }
}