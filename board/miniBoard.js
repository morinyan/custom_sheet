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

class BoardMiniClient {
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
    }

    // this.canvas = options.canvas
    this.ctx = options.context
    this.width = options.width
    this.height = options.height

    this.graphType = 'RECT'
    this.currentGraph = null
    this.graphs = []

    this.isDown = false
    this.disabled = false
    this.syncData = true
  }

  drawRect(x, y, w, h) {
    const { ctx, opts } = this
    ctx.rect(x, y, w, h)
    ctx.setStrokeStyle(opts.strokeStyle)
    ctx.stroke()
    ctx.draw()
  }

  clearBoard(x, y, w, h) {
    this.ctx.clearRect(x, y, w, h)
    this.ctx.draw()
  }

  reset() {
    this.clearBoard(0, 0, this.width, this.height)
    this.currentGraph = null
  }

  translatePoint(point) {
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
    
    switch(graph.type) {
      case 'RECT':
        this.drawRect(start.x, start.y, last.x - start.x, last.y - start.y)
        break;
      default:
        break;
    }
  }

  drawAllGraph() {
    for(let graph of this.graphs) {
      this.drawTargetGraph(graph)
    }
  }

  updateCurrentGraph() {
    // 当前图形
    if (this.currentGraph) {
      this.drawTargetGraph(this.currentGraph)
    }
  }

  updateCanvas({ width, height }) {
    this.width = width
    this.height = height
  }

  reSize({ width, height }) {
    this.updateCanvas({ width, height })
    this.updateCurrentGraph()
  }

  getRemoteMessage(data, peerId) {
    switch(data.commandType) {
      case 'DRAW':
        this.drawRemoteGraph(data.graph, data.pt);
        break;
      case 'CLEAR':
        this.reset();
        break;
      default:
        break;
    }
  }

  drawRemoteGraph(graphType, pt) {
    // 创建图形
    if (pt.type === 'down') {
      this.currentGraph = new Graph(graphType)
      this.graphs.push(this.currentGraph)
    }

    this.currentGraph.points.push(pt)

    if (pt.type !== 'down') {
      this.clearBoard(0, 0, this.width, this.height)
      this.updateCurrentGraph()
    }
  }

  destroy() {
    this.graphs = null
    this.ctx = null
  }
}

export default BoardMiniClient

