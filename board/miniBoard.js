class InstructionQueue {
    constructor(len = 20) {
      this.LEN = len
      this.instructionQueue = []
    }
  
    add(item) {
      this.instructionQueue.push(item)
      this.checkLen()
    }
  
    checkLen() {
      const len = this.instructionQueue.length
      if (len > this.LEN) {
        this.instructionQueue.shift()
      }
    }
  }
  
  export class BoardMiniClient {
    constructor(options = {}) {
      this.queue = new InstructionQueue(20)
      this.context = null
      this.canvasW = 300
      this.canvasH = 150
      this.strokeStyle = 'red'
      this.lintWidth = 2
      this.opts = {}
      Object.assign(this.opts, options)
      this.canvasW = options.canvasW
      this.canvasH = options.canvasH
      this.context = options.context
    }
  
    drawRect(x, y, w, h) {
      const ctx = this.context
      ctx.rect(x, y, w, h)
      ctx.setStrokeStyle(this.strokeStyle)
      ctx.stroke()
      ctx.draw()
    }
  
    clearBoard() {
      const ctx = this.context
      ctx.clearRect(0, 0, this.canvasW, this.canvasH)
      ctx.draw()
    }
  
    /**
     * 监听RTM消息
     * @param {String} message RTM接收的消息内容
     * @param {String} peerId RTM接收的发送消息的userID
     */
    bindMessageFromPeer(data, peerId) {
      const pos = data.position
      const { context, canvasW, canvasH } = this
  
      if (this.checkInstruction(pos)) {
        this.queue.add(pos)
        
        if (data.type === 'RECT') {
          this.clearBoard(context, canvasW, canvasH)
          const xR = canvasW / pos.width
          const yR = canvasH / pos.height
          this.drawRect(pos.x * xR, pos.y * yR, pos.w *xR, pos.h * yR)
        }
  
        if (data.type === 'CLEAR') {
          this.clearBoard(context, canvasW, canvasH)
        }
      }
    }
  
    /**
     * 检测指令
     */
    checkInstruction(pos) {
      const len = this.length - 1
      const lastItem = this.queue[len]
  
      if (lastItem) {
        return new Date(pos.dateTime) > new Date(lastItem.dateTime)
      }
  
      return true
    }
  }
  
  export default BoardMiniClient

const ctx = wx.createCanvasContext('board')
const sysInfo = wx.getSystemInfoSync()
const board = new BoardMiniClient({
    context: ctx,
    canvasW: sysInfo.windowWidth,
    canvasH: sysInfo.windowHeight,
})
gData.rtm._eventBus.on('MessageFromPeer', (message, peerId, isOfflineMessage) => {
    const data = JSON.parse(message.text)
    console.log('P_TO_P MSG:', {message, peerId, isOfflineMessage, data})
    board.bindMessageFromPeer(data, peerId)
})