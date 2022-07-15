class ContextMenu {
    constructor(menus = [
        {
            name: 'Copy',
        }, {
            name: 'Paste',
        },
        {
            name: 'Cut',
        },
        {
            name: 'Delete'
        }
    ]) {
        this.menusEl = null
        this.menus = menus

        this.init()
    }

    init() {
        this.menusEl = this.createMenuEl()
    }

    createMenuEl() {
        const { createEl } = this
        const wrapper = createEl('div', { class: 'menu-wrapper', style: 'position: absolute;padding: 10px;background: white;box-shadow: 1px 2px 5px 2px rgb(51 51 51 / 15%);' })

        for(let item of this.menus) {
            const el = createEl('div', { class: 'menu-item', style: '' })
            el.innerHTML = item.name
            wrapper.appendChild(el)
        }

        return wrapper
    }

    createEl(tag, attrs = {}) {
        const el = document.createElement(tag);
        for (const [key, value] of Object.entries(attrs)) {
            el.setAttribute(key, value);
        }
        return el;
    }

    updateMenus(menus) {
        this.menus = menus

        this.init()
    }

    render(box, position = { top: 0, left: 0 }) {
        let el = box
        
        if (typeof box === 'string') {
            el = document.querySelector(box)            
        }

        // 定位
        this.menusEl.style.top = `${position.top}px`
        this.menusEl.style.left = `${position.left}px`

        el.appendChild(this.menusEl)
    }

    destroy() {
        this.menusEl.remove()
    }

    bindEvents() {
        this.menusEl.onblur = function(e) {
            this.destroy()
        }
    }
}