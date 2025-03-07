# 贪吃蛇游戏

一个使用HTML5 Canvas和原生JavaScript实现的经典贪吃蛇游戏。游戏具有响应式设计，支持键盘和触屏操作，提供简洁直观的用户界面。

## 游戏截图

![贪吃蛇游戏截图](屏幕截图%202025-03-05%20200310.png)

## 功能特点

- 流畅的游戏体验，基于Canvas渲染
- 响应式设计，适配不同设备
- 支持键盘方向键和屏幕按钮双重控制
- 实时分数显示
- 游戏结束提示和重新开始功能
- 防止蛇反向移动的逻辑控制
- 食物随机生成且不会出现在蛇身上
- 网格化游戏界面，提高视觉清晰度
- **AI自动控制功能**：实现智能寻路吃食物并避免碰撞

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

## AI自动控制功能

游戏实现了智能AI控制功能，能够自动寻找路径吃到食物并避免碰撞。

### 算法实现

AI控制器使用综合评分算法来确保蛇能够高效地寻找食物并避免碰撞：

1. **方向评分系统**：为每个可能的移动方向分配一个安全分数，综合考虑多种因素。

```javascript
// 评分系统核心实现
evaluateDirectionSafety(direction) {
    const head = this.gameState.snake[0];
    const food = this.gameState.food;
    const nextPos = this.getNextPosition(head, direction);
    
    // 如果不安全，直接返回最低分
    if (!this.isSafePosition(nextPos)) {
        return -1000;
    }
    
    // 基础分 - 接近食物的奖励
    const currentDist = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
    const nextDist = Math.abs(nextPos.x - food.x) + Math.abs(nextPos.y - food.y);
    let score = currentDist - nextDist;
    
    // 前瞻安全加分
    if (this.lookAheadSafety(direction)) {
        score += 5;
    }
    
    // 可达空间评估
    const accessibleSpace = this.calculateAccessibleSpace(nextPos);
    score += accessibleSpace / 10;
    
    // 远离墙壁的奖励
    const borderDistance = Math.min(
        nextPos.x,
        nextPos.y,
        gridWidth - 1 - nextPos.x,
        gridHeight - 1 - nextPos.y
    );
    score += borderDistance / 2;
    
    return score;
}
```

2. **前瞻式安全检查**：模拟蛇未来几步的移动，评估路径安全性。

```javascript
lookAheadSafety(initialDirection, steps = 3) {
    // 创建虚拟蛇副本并模拟移动
    // 检查未来几步是否会导致碰撞
    // 返回路径是否安全
}
```

3. **可达空间分析**：使用洪水填充算法计算每个方向的可达空间大小，避免进入死胡同。

```javascript
calculateAccessibleSpace(startPos) {
    // 使用BFS算法计算从起点可以到达的格子数量
    // 返回可达空间大小
}
```

4. **智能避障策略**：
   - **远离墙壁**：主动避开靠近墙壁的位置，减少被困机会
   - **空间感知**：优先选择可达空间更大的方向，避免进入死胡同
   - **前瞻规划**：通过模拟未来几步移动，避免进入无法逃脱的路径
   - **综合决策**：平衡接近食物和安全性，做出最优决策

### 使用方法

1. 点击界面上的"启用AI"按钮或按键盘上的"A"键来启用/禁用AI控制
2. 按键盘上的"P"键可以切换显示/隐藏AI计算的路径
3. AI启用后，蛇将自动寻找路径吃食物并避免碰撞
4. 蓝色半透明方块显示AI计算的路径

### 性能考虑

- AI会在每一步重新计算路径，以适应动态变化的蛇身
- 使用优先队列优化A*算法性能
- 实现了多层安全策略，确保蛇尽可能避免死亡

## 未来改进计划

- 添加难度级别选择
- 实现游戏暂停功能
- 添加音效和背景音乐
- 保存最高分记录
- 添加特殊食物和能力道具
- 优化AI算法，提高寻路效率
- 添加AI难度设置

---

## 作者

[Cline](https://github.com/cline) - 一名热爱Web开发和游戏设计的软件工程师

*2025年3月*
