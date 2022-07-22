### #关于自定义鼠标
```bash
# 浏览器允许使用css属性重置鼠标样式
# x 和 y的说明: x，y分别是图标在坐标系中的偏移，为了使图片和原始坐标保持一致
# css自定义鼠标有大小限制，应尽可能小，推荐32 ~ 36个像素的大小
# 语法如下:
# canvas {
#   cursor: pointer;
#   cursor: default;
#   cursor: crosshair;
#   cursor: url(http://cursor.in/assets/copy.svg), auto;
#   cursor: url(./assets/images/cursor.png), auto;
#   cursor: url(base64编码), auto;
#   cursor: url(1.png), url(2.png) x y, auto; // 按照顺序加载三个鼠标样式，如果1.png不可用，则加载2.png, 最后使用默认样式
# }

# 实验案例
# this.canvas.style.cursor = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABzUlEQVRYheXXv49MYRTG8c/6tRJraVAsNtEpRCIUKIgEDdHQKiX+A50KrUYjKATZZvEHkBARCQ3JVEiMlR2NbCKR2MXMKs5cucaMvZucuwpPcqqbvN/nfd9z3nMu/7uGal5/NTZjJb5gGp2amb+0HOfQQBNPcWyp4MO4JHY9X4p3ONk1V6vGMdEDL+IVdtRtALbgAdo9Br7jch3ArTgqjr9s4k4fE9PZ8LW4JpLtdM+34iTKBh5lwsdwA3PdxWdwRpRg2cQEZvES+7Pgw7iNr37fYatroqxxXMVhSVWwAddFUvXL9hlxHeWcGMGyDPiIONJB8CI+4mwWtNAa3PRnZveLNl6IPEnRJtwV7/lC8A6e40AWfB3uVwAXMYW9khJuO55UBLdFqe3OABOPzMOK8Hm8xz5JibdRHHvVO3+LPRlgYoi4VwFcRFPsPEWjoolUhX+SeOejmFwEfApHJI13Qzi/CPgsjmNFBpy4w1ZFeLMLT9MqXMC3CvDPOCh5thvD4wXAHbzBrkxwoZ2ihf7NwGvRz1O7W6FTBj84c3iGQ3XB4coAcAMXsa0OaLl81neBP8SI1cAt0YSmRMmlq/x4nBBz2wcxRLQs4X/cP9NP9OH+rBCEUIwAAAAASUVORK5CYII=) 0 32, auto'

```