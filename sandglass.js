// 🏖️ 砂時計シミュレーター
// Matter.jsを使用した物理演算

// Matter.jsのモジュール
const { Engine, Render, World, Bodies, Body, Events, Mouse, MouseConstraint } = Matter;

class Sandglass {
    constructor() {
        this.canvas = document.getElementById('sandglass-canvas');
        this.width = 400;
        this.height = 600;
        this.particleCount = 500;
        this.particles = [];
        this.startTime = Date.now();
        this.isFlipped = false;
        
        this.init();
    }
    
    init() {
        // 物理エンジン初期化
        this.engine = Engine.create();
        this.engine.world.gravity.y = 1; // 重力設定
        
        // レンダラー設定
        this.render = Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: this.width,
                height: this.height,
                wireframes: false,
                background: '#f0f0f0'
            }
        });
        
        // 砂時計の形状を作成
        this.createHourglassShape();
        
        // 砂粒子を生成
        this.createSandParticles();
        
        // 物理演算開始
        Engine.run(this.engine);
        Render.run(this.render);
        
        // タイマー更新
        this.updateTimer();
        
        // FPS表示
        this.trackFPS();
        
        console.log('⏳ 砂時計シミュレーター起動');
    }
    
    createHourglassShape() {
        // 砂時計の壁を作成（上部）
        const topLeft = Bodies.rectangle(100, 200, 10, 200, {
            isStatic: true,
            angle: Math.PI / 6,
            render: { fillStyle: '#8B4513' }
        });
        
        const topRight = Bodies.rectangle(300, 200, 10, 200, {
            isStatic: true,
            angle: -Math.PI / 6,
            render: { fillStyle: '#8B4513' }
        });
        
        // 砂時計の壁を作成（下部）
        const bottomLeft = Bodies.rectangle(100, 400, 10, 200, {
            isStatic: true,
            angle: -Math.PI / 6,
            render: { fillStyle: '#8B4513' }
        });
        
        const bottomRight = Bodies.rectangle(300, 400, 10, 200, {
            isStatic: true,
            angle: Math.PI / 6,
            render: { fillStyle: '#8B4513' }
        });
        
        // くびれ部分（狭い通路）
        const neckLeft = Bodies.rectangle(180, 300, 10, 50, {
            isStatic: true,
            angle: Math.PI / 4,
            render: { fillStyle: '#8B4513' }
        });
        
        const neckRight = Bodies.rectangle(220, 300, 10, 50, {
            isStatic: true,
            angle: -Math.PI / 4,
            render: { fillStyle: '#8B4513' }
        });
        
        // 底面
        const bottom = Bodies.rectangle(200, 500, 300, 10, {
            isStatic: true,
            render: { fillStyle: '#8B4513' }
        });
        
        // ワールドに追加
        World.add(this.engine.world, [
            topLeft, topRight, bottomLeft, bottomRight,
            neckLeft, neckRight, bottom
        ]);
    }
    
    createSandParticles() {
        // 砂の粒子を生成
        for (let i = 0; i < this.particleCount; i++) {
            const x = 200 + (Math.random() - 0.5) * 100;
            const y = 100 + Math.random() * 100;
            
            const particle = Bodies.circle(x, y, 2, {
                restitution: 0.2,
                friction: 0.5,
                density: 0.001,
                render: {
                    fillStyle: this.getRandomSandColor()
                }
            });
            
            this.particles.push(particle);
        }
        
        World.add(this.engine.world, this.particles);
        document.getElementById('particle-count').textContent = this.particleCount;
    }
    
    getRandomSandColor() {
        // 砂の色をランダムに（黄土色系）
        const colors = ['#F4A460', '#DEB887', '#D2691E', '#BC8F8F', '#F5DEB3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    flip() {
        // 砂時計を180度回転
        this.isFlipped = !this.isFlipped;
        this.engine.world.gravity.y *= -1;
        
        // 回転アニメーション
        this.canvas.style.transform = this.isFlipped ? 'rotate(180deg)' : 'rotate(0deg)';
        this.canvas.style.transition = 'transform 0.5s ease';
        
        console.log('🔄 砂時計を反転');
        
        // フィードバック記録
        if (window.feedbackSystem) {
            window.feedbackSystem.logModification('flip_sandglass', {
                flipped: this.isFlipped,
                particleCount: this.particleCount
            });
        }
    }
    
    reset() {
        // 砂時計をリセット
        World.clear(this.engine.world);
        Engine.clear(this.engine);
        
        this.particles = [];
        this.isFlipped = false;
        this.startTime = Date.now();
        this.canvas.style.transform = 'rotate(0deg)';
        
        this.init();
        
        console.log('🔁 砂時計をリセット');
    }
    
    updateTimer() {
        setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            document.getElementById('timer-display').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    trackFPS() {
        let lastTime = performance.now();
        let fps = 60;
        
        const updateFPS = () => {
            const currentTime = performance.now();
            fps = Math.round(1000 / (currentTime - lastTime));
            lastTime = currentTime;
            
            document.getElementById('fps-display').textContent = fps;
            requestAnimationFrame(updateFPS);
        };
        
        requestAnimationFrame(updateFPS);
    }
}

// グローバル関数
let sandglass;

window.onload = () => {
    sandglass = new Sandglass();
    
    // Firebase設定（フィードバック用）
    const firebaseConfig = {
        apiKey: "AIzaSyA5PXKChizYDCXF_GJ4KL6Ylq9K5hCPXWE",
        authDomain: "shares-b1b97.firebaseapp.com",
        databaseURL: "https://shares-b1b97-default-rtdb.firebaseio.com",
        projectId: "shares-b1b97",
        storageBucket: "shares-b1b97.firebasestorage.app",
        messagingSenderId: "38311063248",
        appId: "1:38311063248:web:0d2d5726d12b305b24b8d5"
    };
    firebase.initializeApp(firebaseConfig);
};

function flipSandglass() {
    sandglass.flip();
}

function resetSandglass() {
    sandglass.reset();
}