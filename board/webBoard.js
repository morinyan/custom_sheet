function drawWraper(graph = () => {}, { ctx, type }) {
  ctx.beginPath()

  graph()

  if (type === 'fill') {
    ctx.fill()
  } else {
    ctx.stroke()
  }

  ctx.closePath()
}

function troandle(xa, ya, xb, yb) {
  let FindX1, FindY1, FindX2, FindY2

  if (Math.abs(xa - xb) < 0.0001 && Math.abs(ya - yb) < 0.0001) {
    return false
  }

  let sideLength1 = (xa - xb)
  let sideLength2 = (ya - yb)
  let sideLength = Math.sqrt(sideLength1**2 + sideLength2**2)

  let tempX, tempY
  tempX = (xa + xb) / 2
  tempY = (ya + yb) / 2

  // 垂直状态
  if (Math.abs(xa - xb) < 0.0001) {
    FindY1 = tempY
    FindY2 = tempY

    let temp_len = Math.sqrt(3.0) / 2 * sideLength

    FindX1 = tempX + temp_len
    FindX2 = tempX - temp_len

    return { FindX1: FindX2, FindY1: FindY2 }
  }

  // 水平状态
  if (Math.abs(ya - yb) < 0.0001) {
    FindX1 = tempX
    FindX2 = tempX

    let temp_len = Math.sqrt(3.0) / 2 * sideLength

    FindY1 = tempY + temp_len
    FindY2  = tempY - temp_len

    return { FindX1: FindX2, FindY1: FindY2 }
  }

  // (0-1)的斜率状态
  let k, k1
  let b, b1

  k = (yb - ya) / (xb - xa)
  b = ya - k * xa

  k1 = -1 / k
  b1 = tempY - k1 * tempX

  let db = 2 * k1 * (b1 - tempY) - 2 * tempX
  let da = k1 * k1 + 1
  let dc = tempX * tempX + (b1 - tempY) * (b1 - tempY) - (3.0 / 4) * sideLength * sideLength
  let dx = db * db - 4 * da * dc

  if (dx < 0) {
    return false
  }

  dx = Math.sqrt(db * db - 4 * da * dc)

  let x1, x2, y1, y2
  x1 = (-db + dx) / (2 * da)
  x2 = (-db - dx) / (2 * da)

  y1 = x1 * k1 + b1
  y2 = x2 * k1 + b1

  if (y1 > tempY) {
    FindX1 = x1
    FindY1 = y1
    FindX2 = x2
    FindY2 = y2
  } else {
    FindX1 = x2
    FindY1 = y2
    FindX2 = x1
    FindY2 = y1
  }

  return { FindX1: FindX2, FindY1: FindY2 }

}

class Point {
    constructor(type, x, y, width, height, e) {
      this.type = type
      this.x = x
      this.y = y
      this.width = width   // 画布宽度
      this.height = height // 画布高度
      this._origin = e
    }
}

class Graph {
  constructor(type) {
    this.type = type
    this.points = []
  }
}

class Painter{
  constructor({ brush, board }) {
    this.brush = brush
    this.board = board
  }

  rect(ctx, x, y, w, h, type = 'stroke') {
    drawWraper(() => {
      ctx.rect(x, y, w, h)
    }, { ctx, type })
  }

  line(ctx, x1, y1, x2, y2, type = 'stroke') {
    drawWraper(() => {
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
    }, { ctx, type })
  }

  circle(ctx, x1, y1, x2, y2, type = 'stroke') {
    drawWraper(() => {
      const xDiff = Math.abs(x2 - x1)
      const yDiff = Math.abs(y2 - y1)
      const x = x1 + xDiff / 2
      const y = y1 + yDiff / 2
      const r = Math.sqrt(xDiff**2 + yDiff**2) / 2
      this.arc(ctx, x, y, r, 2 * Math.PI)
    }, { ctx, type })
  }

  arc(ctx, x, y, r, deg) {
    ctx.arc(x, y, r, 0, deg, false)
  }

  triangle(ctx, x1, y1, x2, y2, x3, y3, type = 'stroke') {
    drawWraper(() => {
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y3)
      ctx.lineTo(x1, y1)
    }, { ctx, type })
  }
}

class PaintBrush {
  constructor(lineWidth, lineColor) {
    this.lineWidth = lineWidth
    this.lineColor = lineColor
    this.type = 'pencil' // 画笔类型
  }

  setLineColor(color) {
    this.lineColor = color
  }

  setLintWidth(width) {
    this.lineWidth = width
  }
}

class PaintBoard{
  constructor({ width, height }) {
    this.id = 'UUID' + Date.now()
    this.canvas = this.createCanvas(width, height)
    this.ctx = canvas.getContext('2d')

    // 监听画板尺寸
    this.observerResize()
    this.observerPosition()
  }

  createCanvas(width, height) {
    const canvas = document.createElement('canvas')
    Object.assign(canvas.style, { width: '100%', height: '100%' })
    canvas.width = width
    canvas.height = height
    return canvas
  }

  observerResize() {
    window.addEventListener('resize', () => {
      this.reSize()
    }, false)
  }

  reSize() {
    this.canvas.width = this.canvas.clientWidth
    this.canvas.height = this.canvas.clientHeight
  }

  observerPosition() {
    const { canvas } = this
    canvas.addEventListener('mousedown', e => {
      console.log('%c <mousedown>', 'color: green;', { e })
    })
    canvas.addEventListener('mousemove', e => {
      console.log('%c <mousemove>', 'color: green;', { e })
    })
    canvas.addEventListener('mouseup', e => {
      console.log('%c <mouseup>', 'color: green;', { e })
    })
    canvas.addEventListener('mouseout', e => {
      console.log('%c <mouseout>', 'color: green;', { e })
    })
  }
}

class WhiteBoard {
  constructor(options = {}) {
    const { el } = options
    const width = el.clientWidth
    const height = el.clientHeight

    this.el = el
    this.board = new PaintBoard({ width, height })
    this.brush = new PaintBrush(2, '#FF0000')
    this.painter = new Painter({
      brush: this.brush,
      board: this.board
    })     
    
    this.render(this.board)
  }

  render(board) {
    el.appendChild(board.canvas)
  }
}

class CommandChannel {
  constructor() { }

  remoteListener() {

  }

  localListener() {

  }

  commandListener(command) {
    switch (command) {
      case 'add':
        console.log('add board')
        break
      default:
        break
    }
  }
}

class BoardWebClient {
  constructor(options = {}) {
    this.opts = Object.assign({
      strokeStyle: 'red',
      lintWidth: 1,
      clearBoardTime: 5000,
      frameTime: 16,
    }, options)

    this.GRAPH_TYPE = {
      'RECT': 'RECT',
      'LINE': 'LINE',
      'PENCIL': 'PENCIL',
      'CIRCLE': 'CIRCLE',
      'ARROW': 'ARROW',
      'TRIANGLE': 'TRIANGLE',
    }

    this.canvas = options.canvas
    this.ctx = null
    this.width = options.width
    this.height = options.height

    this.graphType = 'RECT'
    this.currentGraph = null
    this.graphs = []

    this.isDown = false
    this.observerMap = {}
    this.disabled = false
    this.syncData = true
    this.destroyed = false
    
    this.init()
  }

  init() {
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.ctx = this.canvas.getContext('2d')
    this.bindBoardEventHandler()
  }

  drawRect(x, y, w, h) {
    const { ctx, opts } = this
    ctx.beginPath()
    ctx.strokeStyle = opts.strokeStyle
    ctx.lintWidth = opts.lintWidth
    ctx.strokeRect(x, y, w, h)
    ctx.closePath()
  }

  drawLine(x1, y1, x2, y2) {
    const { ctx, opts } = this
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.strokeStyle = opts.strokeStyle
    ctx.lintWidth = opts.lintWidth
    ctx.stroke()
    ctx.closePath()
  }

  drawPencil(points) {
    points.reduce((start, last) => {
      const _s = this.translatePoint(start)
      const _l = this.translatePoint(last)
      this.drawLine(_s.x, _s.y, _l.x, _l.y)
      return last
    })
  }

  drawArc(x1, y1, x2, y2) {
    const { ctx, opts } = this

    const xDiff = Math.abs(x2 - x1)
    const yDiff = Math.abs(y2 - y1)

    const x = x1 + xDiff / 2
    const y = y1 + yDiff / 2

    const r = Math.sqrt(xDiff**2 + yDiff**2) / 2

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2, false)
    ctx.strokeStyle = opts.strokeStyle
    ctx.lintWidth = opts.lintWidth
    ctx.stroke()
    ctx.closePath()
  }

  drawArrowLine(x1, y1, x2, y2) {
    this.drawLine(x1, y1, x2, y2)

    const target = troandle(x1, y1, x2, y2)

    if (!target) {
      return
    }

    this.drawtTriangle(x2, y2, target.FindX1, target.FindY1)
  }

  drawtTriangle(x1, y1, x2, y2, x3, y3) {
    const { ctx, opts } = this
    // const x = bX + [L * (aY - bY)] / sqrt([aX - bX]^2 + [aY - bY]^2)
    // const y = bY - [L * (aX - bX)] / sqrt([aX - bX]^2 + [aY - bY]^2)

    // const x = bX - [L * (aY - bY)] / sqrt([aX - bX]^2 + [aY - bY]^2)
    // const y = bY + [L * (aX - bX)] / sqrt([aX - bX]^2 + [aY - bY]^2)


    // const x = x1 - (10 * (y2 - y1)) / Math.sqrt((x2 - x1)**2 + (y1 - y1)**2)
    // const y = y1 + (10 * (x2 - x1)) / Math.sqrt((x2 - x1)**2 + (y1 - y1)**2)

    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x1, y1)
    ctx.strokeStyle = opts.strokeStyle
    ctx.lintWidth = opts.lintWidth
    ctx.stroke()
    ctx.closePath()
  }

  clearBoard(x, y, w, h) {
    this.ctx.clearRect(x, y, w, h)
  }

  reset() {
    this.clearBoard(0, 0, this.width, this.height)
    this.currentGraph = null
  }

  translatePoint(point) {
    if(!(point instanceof Point)) {
      console.error("point not supported")
      return
    }

    const { width, height } = this
    const xR = width / point.width
    const yR = height / point.height

    return {...point, ...{ x: xR * point.x, y: yR * point.y }}      
  }

  drawTargetGraph(graph) {
    if(!(graph instanceof Graph)) {
      return
    }

    const len = graph.points.length
    const start = this.translatePoint(graph.points[0])
    const last = this.translatePoint(graph.points[len - 1])
    
    if (graph.type === 'RECT') {
      this.drawRect(start.x, start.y, last.x - start.x, last.y - start.y)
    }

    if (graph.type === 'LINE') {
      this.drawLine(start.x, start.y, last.x, last.y)
    }

    if (graph.type === 'PENCIL') {
      this.drawPencil(graph.points)
    }

    if (graph.type === 'CIRCLE') {
      this.drawArc(start.x, start.y, last.x, last.y)
    }

    if (graph.type === 'ARROW') {
      this.drawArrowLine(start.x, start.y, last.x, last.y)
    }

    if (graph.type === 'TRIANGLE') {
      const target = troandle(start.x, start.y, last.x, last.y)

      if (!target) {
        return
      }
      this.drawtTriangle(start.x, start.y, last.x, last.y, target.FindX1, target.FindY1)
    }

  }

  realTimeDraw() {
    const graph = this.currentGraph
    this.drawTargetGraph(graph)
  }

  drawAllGraph() {
    for(let graph of this.graphs) {
      this.drawTargetGraph(graph)
    }
  }

  updateLastGraph() {
    // 队列扫描
    // this.drawAllGraph()

    // 队列索引
    // const len = this.graphs.length
    // this.drawTargetGraph(this.graphs[len - 1])

    // 当前图形
    if (this.currentGraph) {
      this.drawTargetGraph(this.currentGraph)
    }
  }

  updateCanvas({ width, height }) {
    this.width = width
    this.height = height
    this.canvas.width = width
    this.canvas.height = height
  }

  reSize({ width, height }) {
    const w = this.width
    const h = this.height
    this.updateCanvas({ width, height })
    this.updateLastGraph()
  }

  mousedownHandler(e) {
    // 画板状态
    if (this.destroyed || this.disabled) {
      return
    }

    this.isDown = true

    this.currentGraph = new Graph(this.graphType)
    const pt = new Point('down', e.offsetX, e.offsetY, this.width, this.height, e)
    this.currentGraph.points.push(pt)

    // 点击清除画布
    // this.clearBoard(0, 0, this.width, this.height)

    if(this.syncData) {
      this.getHook('mousedown')({ commandType: 'DRAW', graph: this.graphType, pt })
    }
  }

  mousemoveHandler(e) {
    // 画板状态
    if (this.destroyed || this.disabled) {
      return
    }

    if (this.isDown) {
      const pt = new Point('move', e.offsetX, e.offsetY, this.width, this.height, e)
      this.currentGraph.points.push(pt)

      if (this.syncData) {
        this.getHook('mousemove')({ commandType: 'DRAW', graph: this.graphType, pt })
      }

      // first:  clear board
      this.clearBoard(0, 0, this.width, this.height)
      
      // this.drawAllGraph()
      // second: draw graph
      this.realTimeDraw()
    }
  }

  mouseupHandler(e) {
    // 画板状态
    if (this.destroyed || this.disabled) {  
      return
    }

    if(this.isDown) {
      const pt = new Point('up', e.offsetX, e.offsetY, this.width, this.height, e)
      this.currentGraph.points.push(pt)
      this.graphs.push(this.currentGraph)
      // this.currentGraph = null  // 全图形渲染

      this.isDown = false
      
      if (this.syncData) {
        this.getHook('mouseup')({ commandType: 'DRAW', graph: this.graphType, pt })
      }

    }
  }

  bindBoardEventHandler() {
    const { bindEvent, canvas } = this
    bindEvent(canvas,'mousedown', this.mousedownHandler.bind(this))
    bindEvent(canvas, 'mousemove', this.mousemoveHandler.bind(this))
    bindEvent(window, 'mouseup', this.mouseupHandler.bind(this))
  }

  unBindBoardEventHandler() {
  }
  
  getRemoteMessage(data, peerId) {
    console.log('[远端信息]:', { data, peerId })

    if (data.commandType === 'DRAW') {
      this.drawRemoteGraph(data.graph, data.pt)
    }

    if (data.commandType === 'CLEAR') {
      this.clearBoard(0, 0, this.width, this.height)
    }
  }

  drawRemoteGraph(graphType, pt) {
    // 创建图形
    if (pt.type === 'down') {
      this.currentGraph = new Graph(graphType)
    }

    if (pt.type === 'move') {
      // first:  clear board
      this.clearBoard(0, 0, this.width, this.height)
        
      // this.drawAllGraph()
      // second: draw graph
      this.realTimeDraw()
    }

    this.currentGraph.points.push(pt)

    if (pt.type === 'up') {
      this.graphs.push(this.currentGraph)
      // this.currentGraph = null // 全图形渲染
    }
  }

  disabledBoard(disabled) {
    this.disabled = disabled
  }

  switchGraph(type) {
    this.graphType = type
  }

  setSyncData(syncData) {
    this.syncData = syncData
  }

  setStrokeStyle(strokeStyle) {
    this.opts.strokeStyle = strokeStyle
  }

  setLintWidth(lintWidth) {
    this.opts.lintWidth = lintWidth
  }

  observer(map) {
    Object.assign(this.observerMap, map)
  }

  bindEvent(el, event, callback) {
    el.addEventListener(event, callback)
  }

  unBindEvent(el, event, callback) {
    el.removeEventListener(event, callback)
  }

  getHook(name) {
    return this.observerMap[name] || (() => {})
  }

  destroy() {
    // this.unBindBoardEventHandler()
    this.graphs = null
    this.canvas = null
    this.ctx = null
    this.destroyed = true
  }
}

// export default BoardWebClient

  