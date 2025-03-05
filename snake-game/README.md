# 贪吃蛇游戏

一个使用HTML5 Canvas和原生JavaScript实现的经典贪吃蛇游戏。游戏具有响应式设计，支持键盘和触屏操作，提供简洁直观的用户界面。

## 游戏截图

![贪吃蛇游戏截图](snake-game\屏幕截图 2025-03-05 200310.png)

*注：请在项目根目录创建screenshots文件夹并添加游戏截图，然后替换上方的图片路径。*

## 功能特点

- 流畅的游戏体验，基于Canvas渲染
- 响应式设计，适配不同设备
- 支持键盘方向键和屏幕按钮双重控制
- 实时分数显示
- 游戏结束提示和重新开始功能
- 防止蛇反向移动的逻辑控制
- 食物随机生成且不会出现在蛇身上
- 网格化游戏界面，提高视觉清晰度

## 使用技术

- **HTML5**: 使用Canvas元素进行游戏渲染
- **CSS3**: 实现响应式布局和现代化UI设计
- **JavaScript**: 原生JS实现游戏逻辑，无需外部框架
- **Canvas API**: 高效绘制游戏元素和动画

## 实现细节

### 游戏架构

游戏采用模块化设计，主要包含以下核心组件：

1. **初始化模块**: 设置游戏环境、初始蛇位置和食物生成
2. **渲染模块**: 负责绘制蛇、食物和网格
3. **控制模块**: 处理用户输入和方向控制
4. **游戏逻辑模块**: 管理游戏状态、碰撞检测和分数计算
5. **UI交互模块**: 处理开始/结束界面和分数显示

### 核心机制

#### 网格系统

游戏基于20×20的网格系统，简化了碰撞检测和移动逻辑：

```javascript
const GRID_SIZE = 20; // 网格大小
```

#### 蛇的数据结构

蛇被表示为一个对象数组，每个对象包含x和y坐标：

```javascript
snake = [
    {x: 5, y: 10}, // 蛇头
    {x: 4, y: 10},
    {x: 3, y: 10}  // 蛇尾
];
```

#### 移动算法

蛇的移动通过在前端添加新头部并移除尾部实现，吃到食物时保留尾部：

```javascript
function moveSnake() {
    // 创建新的蛇头
    const head = {x: snake[0].x, y: snake[0].y};
    
    // 根据方向更新头部位置
    switch(direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }
    
    // 将新头部添加到数组开头
    snake.unshift(head);
}
```

#### 碰撞检测

游戏实现了两种碰撞检测：墙壁碰撞和自身碰撞：

```javascript
function checkCollision() {
    const head = snake[0];
    
    // 墙壁碰撞
    if (head.x < 0 || head.x >= canvas.width / GRID_SIZE || 
        head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
        return true;
    }
    
    // 自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}
```

#### 食物生成

食物随机生成在网格上，并确保不会出现在蛇身上：

```javascript
function generateFood() {
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
        
        // 检查是否与蛇身重叠
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}
```

### 渲染技术

游戏使用Canvas API进行高效渲染，主要绘制三种元素：

1. **蛇**: 蛇头和蛇身使用不同颜色区分
2. **食物**: 使用红色方块表示
3. **网格**: 使用浅灰色线条提高视觉清晰度

```javascript
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#388E3C' : '#4CAF50';
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        ctx.strokeStyle = '#2E7D32';
        ctx.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
    
    // 绘制食物
    ctx.fillStyle = '#F44336';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // 绘制网格
    drawGrid();
}
```

### 控制系统

游戏支持两种控制方式：

1. **键盘控制**: 使用方向键控制蛇的移动
2. **按钮控制**: 屏幕上的方向按钮，适合触屏设备

控制系统实现了防止蛇180度转向的逻辑，确保游戏体验：

```javascript
// 键盘控制示例
switch(e.keyCode) {
    case 38: // 上箭头
        if (direction !== 'down') {
            nextDirection = 'up';
        }
        break;
    // 其他方向类似
}
```

## 如何游玩

1. 点击"开始游戏"按钮开始
2. 使用键盘方向键或屏幕按钮控制蛇的移动
3. 引导蛇吃到红色食物来增加分数和长度
4. 避免撞到墙壁或蛇自身
5. 游戏结束后可以点击"再玩一次"重新开始

## 安装和运行

1. 克隆仓库到本地
   ```
   git clone https://github.com/yourusername/snake-game.git
   ```

2. 打开项目文件夹
   ```
   cd snake-game
   ```

3. 在浏览器中打开`index.html`文件即可开始游戏

无需安装任何依赖或构建步骤，游戏可以直接在现代浏览器中运行。

## 未来改进计划

- 添加难度级别选择
- 实现游戏暂停功能
- 添加音效和背景音乐
- 保存最高分记录
- 添加特殊食物和能力道具

---

## 作者

[Cline](https://github.com/cline) - 一名热爱Web开发和游戏设计的软件工程师

*2025年3月*
