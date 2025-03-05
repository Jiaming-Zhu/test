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
    gameRunning = false;
    
    // 显示游戏结束界面
    showGameOverOverlay();
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
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);
    
    // 添加方向按钮事件监听
    document.getElementById('up-btn').addEventListener('click', () => handleDirectionButtonClick('up'));
    document.getElementById('down-btn').addEventListener('click', () => handleDirectionButtonClick('down'));
    document.getElementById('left-btn').addEventListener('click', () => handleDirectionButtonClick('left'));
    document.getElementById('right-btn').addEventListener('click', () => handleDirectionButtonClick('right'));
});
