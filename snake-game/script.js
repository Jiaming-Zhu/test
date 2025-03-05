// 游戏常量
const GRID_SIZE = 20; // 网格大小
const GAME_SPEED = 100; // 游戏速度（毫秒）

// 游戏变量
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameRunning = false;
let score = 0;
let gameLoop;

// AI控制变量
let aiEnabled = false;
let snakeAI;
let aiControlInterval;
let showPath = true; // 是否显示AI路径

// 优先队列实现（用于A*算法）
class PriorityQueue {
    constructor() {
        this.items = [];
    }
    
    enqueue(element, priority) {
        const queueElement = { element, priority };
        let added = false;
        
        for (let i = 0; i < this.items.length; i++) {
            if (queueElement.priority < this.items[i].priority) {
                this.items.splice(i, 0, queueElement);
                added = true;
                break;
            }
        }
        
        if (!added) {
            this.items.push(queueElement);
        }
    }
    
    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift().element;
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    contains(element) {
        return this.items.some(item => 
            item.element.x === element.x && item.element.y === element.y
        );
    }
}

// 贪吃蛇AI控制器 - 增强版
class SnakeAI {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentPath = null;
    }
    
    // 更新游戏状态
    updateGameState(gameState) {
        this.gameState = gameState;
    }
    
    // 获取下一步最佳移动方向 - 综合评分算法
    getNextMove() {
        const directions = ['up', 'down', 'left', 'right'];
        let bestDirection = this.gameState.direction;
        let bestScore = -Infinity;
        
        // 评估所有可能的方向
        for (const dir of directions) {
            // 确保不会180度转向
            if ((dir === 'up' && this.gameState.direction === 'down') ||
                (dir === 'down' && this.gameState.direction === 'up') ||
                (dir === 'left' && this.gameState.direction === 'right') ||
                (dir === 'right' && this.gameState.direction === 'left')) {
                continue;
            }
            
            const score = this.evaluateDirectionSafety(dir);
            if (score > bestScore) {
                bestScore = score;
                bestDirection = dir;
            }
        }
        
        // 更新可视化路径
        this.calculatePathForVisualization(bestDirection);
        
        return bestDirection;
    }
    
    // 评估移动方向的安全分数
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
        
        // 模拟移动后的可达空间
        const virtualSnake = JSON.parse(JSON.stringify(this.gameState.snake));
        virtualSnake.unshift(nextPos);
        virtualSnake.pop();
        
        // 可达空间越大越好
        const accessibleSpace = this.calculateAccessibleSpace(nextPos, virtualSnake);
        score += accessibleSpace / 10;
        
        // 远离墙壁的奖励
        const gridWidth = this.gameState.gridWidth;
        const gridHeight = this.gameState.gridHeight;
        const borderDistance = Math.min(
            nextPos.x,
            nextPos.y,
            gridWidth - 1 - nextPos.x,
            gridHeight - 1 - nextPos.y
        );
        score += borderDistance / 2;
        
        return score;
    }
    
    // 前瞻检测函数
    lookAheadSafety(initialDirection, steps = 3) {
        // 创建虚拟蛇副本
        const virtualSnake = JSON.parse(JSON.stringify(this.gameState.snake));
        let currentDir = initialDirection;
        let pos = this.getNextPosition(virtualSnake[0], currentDir);
        
        // 检查初始移动是否安全
        if (!this.isValidPosition(pos, virtualSnake)) {
            return false;
        }
        
        // 模拟蛇的移动
        virtualSnake.unshift(pos);
        virtualSnake.pop(); // 移除蛇尾
        
        // 继续模拟接下来的几步
        for (let i = 1; i < steps; i++) {
            // 使用贪婪算法获取下一步方向
            const food = this.gameState.food;
            const dx = food.x - pos.x;
            const dy = food.y - pos.y;
            
            // 决定下一步方向
            if (Math.abs(dx) > Math.abs(dy)) {
                currentDir = dx > 0 ? 'right' : 'left';
            } else {
                currentDir = dy > 0 ? 'down' : 'up';
            }
            
            // 检查该方向是否安全
            pos = this.getNextPosition(pos, currentDir);
            if (!this.isValidPosition(pos, virtualSnake)) {
                return false; // 如果不安全，则认为该路径不良
            }
            
            // 更新虚拟蛇
            virtualSnake.unshift(pos);
            virtualSnake.pop();
        }
        
        return true; // 所有模拟步骤都安全
    }
    
    // 计算从某点开始的可达空间大小
    calculateAccessibleSpace(startPos, virtualSnake = null) {
        const snake = virtualSnake || this.gameState.snake;
        const gridWidth = this.gameState.gridWidth;
        const gridHeight = this.gameState.gridHeight;
        
        // 使用BFS算法填充
        const queue = [startPos];
        const visited = new Set([`${startPos.x},${startPos.y}`]);
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // 检查四个方向
            const directions = ['up', 'down', 'left', 'right'];
            for (const dir of directions) {
                const next = this.getNextPosition(current, dir);
                const key = `${next.x},${next.y}`;
                
                // 如果位置有效且未访问过
                if (this.isValidPosition(next, snake) && !visited.has(key)) {
                    visited.add(key);
                    queue.push(next);
                }
            }
        }
        
        return visited.size; // 返回可达格子数
    }
    
    // 为了保持路径可视化功能，计算一个路径
    calculatePathForVisualization(bestDirection) {
        const path = [];
        let currentPos = {...this.gameState.snake[0]};
        const food = this.gameState.food;
        const maxSteps = 20; // 限制路径长度
        
        // 首先应用最佳方向
        currentPos = this.getNextPosition(currentPos, bestDirection);
        if (!this.isValidPosition(currentPos)) {
            this.currentPath = [];
            return;
        }
        path.push({...currentPos});
        
        // 然后继续使用贪婪算法
        for (let i = 1; i < maxSteps; i++) {
            // 计算当前位置与食物的相对位置
            const dx = food.x - currentPos.x;
            const dy = food.y - currentPos.y;
            
            if (dx === 0 && dy === 0) break; // 到达食物
            
            let moveDir;
            
            // 简单的贪婪策略
            if (Math.abs(dx) > Math.abs(dy)) {
                moveDir = dx > 0 ? 'right' : 'left';
            } else {
                moveDir = dy > 0 ? 'down' : 'up';
            }
            
            // 应用移动
            currentPos = this.getNextPosition(currentPos, moveDir);
            
            // 如果位置不安全，停止计算路径
            if (!this.isValidPosition(currentPos)) break;
            
            path.push({...currentPos});
        }
        
        this.currentPath = path;
    }
    
    // 检查位置是否有效（不是墙壁或蛇身）
    isValidPosition(pos, customSnake = null) {
        const snake = customSnake || this.gameState.snake;
        const gridWidth = this.gameState.gridWidth;
        const gridHeight = this.gameState.gridHeight;
        
        // 检查是否超出边界
        if (pos.x < 0 || pos.x >= gridWidth || pos.y < 0 || pos.y >= gridHeight) {
            return false;
        }
        
        // 检查是否与蛇身重叠
        for (let i = 0; i < snake.length; i++) {
            if (pos.x === snake[i].x && pos.y === snake[i].y) {
                return false;
            }
        }
        
        return true;
    }
    
    // 检查位置是否安全（不是墙壁或蛇身，除了蛇尾）
    isSafePosition(pos) {
        const snake = this.gameState.snake;
        const gridWidth = this.gameState.gridWidth;
        const gridHeight = this.gameState.gridHeight;
        
        // 检查是否超出边界
        if (pos.x < 0 || pos.x >= gridWidth || pos.y < 0 || pos.y >= gridHeight) {
            return false;
        }
        
        // 检查是否与蛇身重叠（除了蛇尾，因为蛇移动时蛇尾会离开）
        for (let i = 0; i < snake.length - 1; i++) {
            if (pos.x === snake[i].x && pos.y === snake[i].y) {
                return false;
            }
        }
        
        return true;
    }
    
    // 根据方向获取下一个位置
    getNextPosition(pos, dir) {
        switch(dir) {
            case 'up': return {x: pos.x, y: pos.y - 1};
            case 'down': return {x: pos.x, y: pos.y + 1};
            case 'left': return {x: pos.x - 1, y: pos.y};
            case 'right': return {x: pos.x + 1, y: pos.y};
            default: return {x: pos.x, y: pos.y};
        }
    }
}

// 初始化游戏
function initGame() {
    // 获取Canvas元素和上下文
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // 初始化蛇
    snake = [
        {x: 5, y: 10},
        {x: 4, y: 10},
        {x: 3, y: 10}
    ];
    
    // 初始化方向
    direction = 'right';
    nextDirection = 'right';
    
    // 初始化分数
    score = 0;
    document.getElementById('score').textContent = score;
    
    // 生成第一个食物
    generateFood();
    
    // 绘制初始游戏状态
    draw();
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        document.getElementById('start-btn').textContent = '重新开始';
        gameLoop = setInterval(updateGame, GAME_SPEED);
    } else {
        // 如果游戏已经在运行，则重置游戏
        resetGame();
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameLoop);
    removeGameOverOverlay();
    initGame();
    gameRunning = false;
    startGame();
}

// 更新游戏状态
function updateGame() {
    // 更新蛇的方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检测碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检测是否吃到食物
    if (snake[0].x === food.x && snake[0].y === food.y) {
        // 增加分数
        score += 10;
        document.getElementById('score').textContent = score;
        
        // 不移除蛇尾，蛇会自动变长
        // 生成新的食物
        generateFood();
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
    
    // 重新绘制游戏
    draw();
}

// 移动蛇
function moveSnake() {
    // 根据当前方向创建新的蛇头
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch(direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 将新蛇头添加到蛇数组的开头
    snake.unshift(head);
}

// 检测碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检测是否碰到墙壁
    if (head.x < 0 || head.x >= canvas.width / GRID_SIZE || 
        head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
        return true;
    }
    
    // 检测是否碰到自身（从第二个身体部分开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    const maxX = canvas.width / GRID_SIZE - 1;
    const maxY = canvas.height / GRID_SIZE - 1;
    
    let newFood;
    let foodOnSnake;
    
    // 确保食物不会生成在蛇身上
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
        };
        
        // 检查食物是否在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (newFood.x === snake[i].x && newFood.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 如果AI启用且有计算出的路径，绘制路径
    if (aiEnabled && snakeAI && snakeAI.currentPath && showPath) {
        ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';
        
        for (const point of snakeAI.currentPath) {
            ctx.fillRect(point.x * GRID_SIZE, point.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
    }
    
    // 绘制蛇
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        // 蛇头用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#388E3C';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        
        // 绘制边框
        ctx.strokeStyle = '#2E7D32';
        ctx.strokeRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });
    
    // 绘制食物
    ctx.fillStyle = '#F44336';
    ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // 绘制食物边框
    ctx.strokeStyle = '#D32F2F';
    ctx.strokeRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    
    // 绘制网格（可选）
    drawGrid();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    ctx.lineWidth = 1;
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    stopAIControl(); // 停止AI控制
    gameRunning = false;
    
    // 显示游戏结束界面
    showGameOverOverlay();
}

// 切换AI控制
function toggleAI() {
    aiEnabled = !aiEnabled;
    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    
    if (aiEnabled) {
        aiToggleBtn.textContent = '禁用AI';
        aiToggleBtn.classList.add('active');
        
        if (gameRunning) {
            startAIControl();
        }
    } else {
        aiToggleBtn.textContent = '启用AI';
        aiToggleBtn.classList.remove('active');
        stopAIControl();
    }
}

// 启动AI控制
function startAIControl() {
    // 清除之前的AI控制间隔
    if (aiControlInterval) {
        clearInterval(aiControlInterval);
    }
    
    // 初始化AI
    snakeAI = new SnakeAI({
        snake: snake,
        food: food,
        gridWidth: canvas.width / GRID_SIZE,
        gridHeight: canvas.height / GRID_SIZE,
        direction: direction
    });
    
    // 设置AI控制间隔
    aiControlInterval = setInterval(() => {
        if (gameRunning && aiEnabled) {
            // 更新AI状态
            snakeAI.updateGameState({
                snake: snake,
                food: food,
                gridWidth: canvas.width / GRID_SIZE,
                gridHeight: canvas.height / GRID_SIZE,
                direction: direction
            });
            
            // 获取AI的下一步移动
            const nextMove = snakeAI.getNextMove();
            
            // 应用AI的移动
            if (nextMove) {
                // 确保移动有效（不会导致180度转向）
                if ((nextMove === 'up' && direction !== 'down') ||
                    (nextMove === 'down' && direction !== 'up') ||
                    (nextMove === 'left' && direction !== 'right') ||
                    (nextMove === 'right' && direction !== 'left')) {
                    nextDirection = nextMove;
                }
            }
        }
    }, GAME_SPEED / 2); // 比游戏更新频率更快，确保AI能及时响应
}

// 停止AI控制
function stopAIControl() {
    if (aiControlInterval) {
        clearInterval(aiControlInterval);
        aiControlInterval = null;
    }
}

// 显示游戏结束界面
function showGameOverOverlay() {
    // 创建游戏结束界面
    const overlay = document.createElement('div');
    overlay.className = 'game-over';
    overlay.id = 'game-over-overlay';
    
    const gameOverTitle = document.createElement('h2');
    gameOverTitle.textContent = '游戏结束';
    
    const finalScore = document.createElement('p');
    finalScore.textContent = `最终分数: ${score}`;
    
    const restartButton = document.createElement('button');
    restartButton.textContent = '再玩一次';
    restartButton.onclick = resetGame;
    
    overlay.appendChild(gameOverTitle);
    overlay.appendChild(finalScore);
    overlay.appendChild(restartButton);
    
    document.querySelector('.game-container').appendChild(overlay);
}

// 移除游戏结束界面
function removeGameOverOverlay() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// 处理键盘输入
function handleKeyDown(e) {
    // 防止方向键滚动页面
    if([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
    
    // 只有在游戏运行时才处理方向键
    if (!gameRunning) return;
    
    switch(e.keyCode) {
        // 上箭头
        case 38:
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        // 下箭头
        case 40:
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        // 左箭头
        case 37:
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        // 右箭头
        case 39:
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
    }
}

// 处理方向按钮点击
function handleDirectionButtonClick(newDirection) {
    // 只有在游戏运行时才处理方向按钮
    if (!gameRunning) return;
    
    switch(newDirection) {
        case 'up':
            if (direction !== 'down') {
                nextDirection = 'up';
            }
            break;
        case 'down':
            if (direction !== 'up') {
                nextDirection = 'down';
            }
            break;
        case 'left':
            if (direction !== 'right') {
                nextDirection = 'left';
            }
            break;
        case 'right':
            if (direction !== 'left') {
                nextDirection = 'right';
            }
            break;
    }
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 初始化游戏
    initGame();
    
    // 添加开始按钮事件监听
    document.getElementById('start-btn').addEventListener('click', startGame);
    
    // 添加AI切换按钮事件监听
    document.getElementById('ai-toggle-btn').addEventListener('click', toggleAI);
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);
    
    // 添加方向按钮事件监听
    document.getElementById('up-btn').addEventListener('click', () => handleDirectionButtonClick('up'));
    document.getElementById('down-btn').addEventListener('click', () => handleDirectionButtonClick('down'));
    document.getElementById('left-btn').addEventListener('click', () => handleDirectionButtonClick('left'));
    document.getElementById('right-btn').addEventListener('click', () => handleDirectionButtonClick('right'));
    
    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // 按A键切换AI
        if (e.key === 'a' || e.key === 'A') {
            toggleAI();
        }
        
        // 按P键切换路径显示
        if (e.key === 'p' || e.key === 'P') {
            showPath = !showPath;
            if (gameRunning) {
                draw();
            }
        }
    });
});
