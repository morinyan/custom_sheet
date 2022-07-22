const GRAPH_TYPE = {
  'RECT': 'RECT',
  'LINE': 'LINE',
  'PENCIL': 'PENCIL',
  'CIRCLE': 'CIRCLE',
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

class MiniPainter {
  constructor(options = {}) {
    Object.assign(this, {
      ctx: null,
      color: 'red',
      lineWidth: 1,
      lineStyle: 'solid', // solid | dashed
      lineDashConfig: {
        pattern: [10, 20],
        offset: 5,
      },
      lineCap: 'round', // butt | round | square
      lineJoin: 'round', // bevel | round | miter
      miterLimit: 3, // 交线处的锐利度
      shadowConfig: {
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        color: 'black',
      },
      fontConfig: {
        size: '20',
        align: 'center', // center | left | right
        baseLine: 'middle', // top | bottom | middle | normal
      },
      globalAlpha: 1,
    }, options)
  }

  drawRect(x, y, w, h) {
    const { ctx, color } = this
    ctx.setStrokeStyle(color)
    ctx.strokeRect(x, y, w, h)
    ctx.draw()
  }

  drawLine(x1, y1, x2, y2) {
    const { ctx, color, lineWidth, lineStyle } = this
    // line style
    if (lineStyle === 'dashed') {
      const { pattern, offset } = this.lineDashConfig;
      ctx.setLineDash(pattern, offset);
    }
    ctx.beginPath()
    ctx.setLineWidth(lineWidth)
    ctx.setStrokeStyle(color)
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.draw()
  }

  drawArc(x, y, r, deg = 2 * Math.PI) {
    const { ctx, color } = this
    ctx.beginPath()
    ctx.setStrokeStyle(color)
    ctx.arc(x, y, r, 0, deg)
    ctx.stroke()
    ctx.draw()
  }
  

  clearBoard(x, y, w, h) {
    const { ctx } = this
    ctx.clearRect(x, y, w, h)
    ctx.draw()
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

    this.GRAPH_TYPE = this.GRAPH_TYPE

    this.ctx = options.context
    this.width = options.width
    this.height = options.height

    this.graphType = 'RECT'
    this.currentGraph = null
    this.graphs = []
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
      this.checkGraphQueue()
    }

    if (!this.checkPtDateTime(pt)) {
      return
    }
    
    this.currentGraph.points.push(pt)

    if (pt.type !== 'down') {
      this.clearBoard(0, 0, this.width, this.height)
      this.updateCurrentGraph()
    }
  }

  // 校验时间有效性
  checkPtDateTime(pt) {
    const { points } = this.currentGraph
    const len = points.length
    if (!len) {
      return true
    }

    const prePt = points[len - 1]

    return new Date(pt.datetime) > new Date(prePt.datetime)
  }

  checkGraphQueue() {
    const len = this.graphs.length

    if (len > 10) {
      this.graphs.shift()
    }
  }

  destroy() {
    this.graphs = null
    this.ctx = null
  }
}

export default BoardMiniClient

/**
 * <canvas style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh;" canvas-id="board"></canvas>
 // 画板
  createBoard() {
    const ctx = wx.createCanvasContext('board')
    const sysInfo = wx.getSystemInfoSync()
    const board = new BoardMiniClient({
      context: ctx,
      width: sysInfo.windowWidth,
      height: sysInfo.windowHeight,
    })
    console.log('%c 启动画板', 'color:blue;font-size:20px;', board)
    gData.board = board
    gData.boardEventId = gData.rtm._eventBus.on('MessageFromPeer', (message, peerId) => {
      const data = JSON.parse(message.text)
      console.log('<远端指令>', { data, peerId })
      if(data.commandType) {
        board.getRemoteMessage(data, peerId)
      }
    })
  },
 */