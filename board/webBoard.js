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
    }

    this.canvas = options.canvas
    this.ctx = null
    this.width = options.width
    this.height = options.height

    this.graphType = 'PENCIL'
    this.currentGraph = null
    this.graphs = []

    this.isDown = false
    this.observerMap = {}
    this.disabled = false
    
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
      this.drawLine(start.x, start.y, last.x, last.y)
      return last
    })
  }

  clearBoard(x, y, w, h) {
    this.ctx.clearRect(x, y, w, h)
  }

  drawTargetGraph(graph) {
    if (graph.type === 'RECT') {
      const len = graph.points.length
      const start = graph.points[0]
      const last = graph.points[len - 1]

      this.drawRect(start.x, start.y, last.x - start.x, last.y - start.y)
    }

    if (graph.type === 'LINE') {
      const len = graph.points.length
      const start = graph.points[0]
      const last = graph.points[len - 1]

      this.drawLine(start.x, start.y, last.x, last.y)
    }

    if (graph.type === 'PENCIL') {
      this.drawPencil(graph.points)
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
    const len = this.graphs.length
    this.drawTargetGraph(this.graphs[len - 1])
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
    this.scale(width / w, height / h)
  }

  scale(xR, yR) {
    console.log('缩放:', { xR, yR })
    this.ctx.scale(xR, yR)
  }

  bindBoardEventHandler() {
    const { bindEvent, canvas } = this

    bindEvent(canvas,'mousedown', e => {
      // 画板状态
      if (this.disabled) {
        return
      }

      this.isDown = true

      this.currentGraph = new Graph(this.graphType)
      const pt = new Point('down', e.offsetX, e.offsetY, this.width, this.height, e)
      this.currentGraph.points.push(pt)

      // 点击清除画布
      // this.clearBoard(0, 0, this.width, this.height)

      this.getHook('mousedown')({ pt })

    })
  
    bindEvent(canvas, 'mousemove', e => {
      // 画板状态
      if (this.disabled) {
        return
      }

      if (this.isDown) {
        const pt = new Point('move', e.offsetX, e.offsetY, this.width, this.height, e)
        this.currentGraph.points.push(pt)

        this.getHook('mousemove')({ pt })

        // first:  clear board
        this.clearBoard(0, 0, this.width, this.height)
        
        // this.drawAllGraph()
        // second: draw graph
        this.realTimeDraw()
      }
    })
  
    bindEvent(window, 'mouseup', e => {
      // 画板状态
      if (this.disabled) {  
        return
      }

      if(this.isDown) {
        const pt = new Point('up', e.offsetX, e.offsetY, this.width, this.height, e)
        this.currentGraph.points.push(pt)
        this.graphs.push(this.currentGraph)
        this.currentGraph = null

        this.isDown = false
        this.getHook('mouseup')({ pt })

      }
    })
  }
  
  bindMessageFromPeer(data, peerId) {
    const pos = data.position

    console.log('远端信息:', { data, pos, peerId })

    // if (data.type === 'RECT') {

    //   this.clearBoard(context, canvasW, canvasH)

    //   const xR = canvasW / pos.width
    //   const yR = canvasH / pos.height

    //   this.drawRect(context, pos.x * xR, pos.y * yR, pos.w *xR, pos.h * yR)
    
    // }

    // if (data.type === 'CLEAR') {
    //   this.clearBoard(context, canvasW, canvasH)
    // }
  }

  disabledBoard(disabled) {
    this.disabled = disabled
  }

  switchGraph(type) {
    this.graphType = type
  }

  observer(map) {
    Object.assign(this.observerMap, map)
  }

  bindEvent(el, event, callback) {
    el.addEventListener(event, callback)
  }

  getHook(name) {
    return this.observerMap[name] || (() => {})
  }
}

// export default BoardWebClient

  