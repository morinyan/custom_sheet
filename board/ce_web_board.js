class Point {
    constructor(type, x, y, width, height, e) {
      this.type = type
      this.x = x
      this.y = y
      this.width = width   // 画布宽度
      this.height = height // 画布高度
      this._origin = e
      this.datetime = new Date()
    }
  }
  
  class Graph {
    constructor(type) {
      this.type = type
      this.points = []
    }
  }
  
  const eventWraperFn = (cb = () => {}) => e => { cb(e) }
  const GRAPH_TYPE = {
    'RECT': 'RECT',
    'LINE': 'LINE',
    'PENCIL': 'PENCIL',
    'CIRCLE': 'CIRCLE',
  }
  
  const CANVAS_STYLE = {
    width: '100%',
    height: '100%',
  }
  
  export class BoardWebClient {
    constructor(options = {}) {
      this.opts = {
        ...{
          strokeStyle: 'red',
          lintWidth: 1,
          clearBoardTime: 5000,
          frameTime: 16
        },
        ...options
      }
  
      this.GRAPH_TYPE = GRAPH_TYPE
  
      this.el = options.el
      this.ctx = null
  
      const width = this.el.clientWidth
      this.width = width
      this.height = (width / (16 / 9))
  
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
  
    render() {
      const canvas = document.createElement('canvas')
      Object.assign(canvas.style, CANVAS_STYLE)
      canvas.width = this.width
      canvas.height = this.height
      this.canvas = canvas
      this.el.innerHTML = ''
      this.el.appendChild(canvas)
    }
  
    init() {
      this.render()
      this.ctx = this.canvas.getContext('2d')
      this.initEventHandler()
      this.bindBoardEventHandler()
      this.bindHooks()
    }
  
    initEventHandler() {
      this.windowMouseUp = eventWraperFn(this.mouseupHandler.bind(this))
      this.canvasMouseDown = eventWraperFn(this.mousedownHandler.bind(this))
      this.canvasMouseMove = eventWraperFn(this.mousemoveHandler.bind(this))
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
        const s = this.translatePoint(start)
        const l = this.translatePoint(last)
        this.drawLine(s.x, s.y, l.x, l.y)
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
  
      switch(graph.type) {
        case 'RECT':
          this.drawRect(start.x, start.y, last.x - start.x, last.y - start.y)
          break
        case 'LINE':
          this.drawLine(start.x, start.y, last.x, last.y)
          break
        case 'PENCIL':
          this.drawPencil(graph.points)
          break
        case 'CIRCLE':
          this.drawArc(start.x, start.y, last.x, last.y)
          break
        default:
          break
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
  
    reSize() {
      const width = this.canvas.clientWidth
      const height = width / (16 / 9)
      this.updateCanvas({ width, height })
      this.updateLastGraph()
    }
  
    bindBoardEventHandler() {
      const { bindEvent, canvas } = this
  
      bindEvent(canvas,'mousedown', this.canvasMouseDown)
      bindEvent(canvas, 'mousemove', this.canvasMouseMove)
      bindEvent(canvas, 'mouseup', this.windowMouseUp)
  
      window.addEventListener('mouseup', e => {
        if(!this.isDown) {
          return
        }
  
        const prePt = this.currentGraph.points.slice(-1)[0]
        const pt = new Point('up', prePt.x, prePt.y, this.width, this.height, e)
  
        this.currentGraph.points.push(pt)
        this.graphs.push(this.currentGraph)
  
        this.isDown = false
        
        if (this.syncData) {
          this.getHook('mouseup')({ commandType: 'DRAW', graph: this.graphType, pt })
        }
      })
    }
  
    unBindBoardEventHandler() {
      const { unBindEvent, canvas } = this
  
      unBindEvent(canvas,'mousedown', this.canvasMouseDown)
      unBindEvent(canvas, 'mousemove', this.canvasMouseMove)
      unBindEvent(window, 'mouseup', this.windowMouseUp)
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
      this.clearBoard(0, 0, this.width, this.height)
  
      if(this.syncData) {
        this.getHook('mousedown')({ commandType: 'DRAW', graph: this.graphType, pt })
      }
    }
  
    mousemoveHandler(e) {
      // 画板状态
      if (this.destroyed || this.disabled) {
        this.canvas.style.cursor = 'default'
        return
      }
  
      this.canvas.style.cursor = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABzUlEQVRYheXXv49MYRTG8c/6tRJraVAsNtEpRCIUKIgEDdHQKiX+A50KrUYjKATZZvEHkBARCQ3JVEiMlR2NbCKR2MXMKs5cucaMvZucuwpPcqqbvN/nfd9z3nMu/7uGal5/NTZjJb5gGp2amb+0HOfQQBNPcWyp4MO4JHY9X4p3ONk1V6vGMdEDL+IVdtRtALbgAdo9Br7jch3ArTgqjr9s4k4fE9PZ8LW4JpLtdM+34iTKBh5lwsdwA3PdxWdwRpRg2cQEZvES+7Pgw7iNr37fYatroqxxXMVhSVWwAddFUvXL9hlxHeWcGMGyDPiIONJB8CI+4mwWtNAa3PRnZveLNl6IPEnRJtwV7/lC8A6e40AWfB3uVwAXMYW9khJuO55UBLdFqe3OABOPzMOK8Hm8xz5JibdRHHvVO3+LPRlgYoi4VwFcRFPsPEWjoolUhX+SeOejmFwEfApHJI13Qzi/CPgsjmNFBpy4w1ZFeLMLT9MqXMC3CvDPOCh5thvD4wXAHbzBrkxwoZ2ihf7NwGvRz1O7W6FTBj84c3iGQ3XB4coAcAMXsa0OaLl81neBP8SI1cAt0YSmRMmlq/x4nBBz2wcxRLQs4X/cP9NP9OH+rBCEUIwAAAAASUVORK5CYII=) 0 32, auto'
  
      if (this.isDown) {
        const pt = new Point('move', e.offsetX, e.offsetY, this.width, this.height, e)
        this.currentGraph?.points.push(pt)
  
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
  
      if(!this.isDown) {
        return
      }
  
      if(this.isDown) {
        let pt = new Point('up', e.offsetX, e.offsetY, this.width, this.height, e)
        pt = this.checkBoundary(pt)
        this.currentGraph.points.push(pt)
        this.graphs.push(this.currentGraph)
        // this.currentGraph = null  // 全图形渲染
  
        this.isDown = false
        
        if (this.syncData) {
          this.getHook('mouseup')({ commandType: 'DRAW', graph: this.graphType, pt })
        }
  
      }
    }
  
    checkBoundary(pt) {
      const { x, y, width, height } = pt
      return new Point(pt.type, x > width ? width : x, y > height ? height : y, width, height)
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
  
    bindHooks() {
      this.observer({
        'mousedown': args => {
          this.getHook('command')(args)
        },
        'mousemove': args => {
          this.getHook('command')(args)
        },
        'mouseup': args => {
          this.getHook('command')(args)
        },
      })
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
      this.unBindBoardEventHandler()
      this.graphs = null
      this.canvas.remove()
      this.canvas = null
      this.ctx = null
      this.destroyed = true
    }
  }
  
  
  export default BoardWebClient
  
  