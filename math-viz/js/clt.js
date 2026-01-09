/**
 * 中心极限定理 (Central Limit Theorem) 模拟器
 *
 * 核心思想：无论原始分布是什么形态，只要样本量足够大，
 * 样本均值的分布都会趋近于正态分布
 */

'use strict';

// === 模拟器配置 ===
const simulation = {
    // 当前参数
    currentDist: 'uniform',
    sampleSize: 30,
    speed: 50,

    // 运行状态
    isRunning: false,
    animationId: null,

    // 数据统计
    totalSimulations: 0,
    sampleMeans: [],
    histogramData: [],

    // 图表实例
    popChart: null,
    cltChart: null,

    // 常量
    BIN_COUNT: 60,
    MIN_VALUE: 0,
    MAX_VALUE: 1,

    /**
     * 初始化模拟器
     */
    init() {
        console.log('🎲 初始化中心极限定理模拟器');

        // 初始化直方图数据
        this.histogramData = new Array(this.BIN_COUNT).fill(0);

        // 生成图表标签
        const labels = Array.from(
            {length: this.BIN_COUNT},
            (_, i) => (i / this.BIN_COUNT).toFixed(2)
        );

        // 初始化总体分布图表
        this.initPopChart(labels);

        // 初始化样本均值分布图表
        this.initCLTChart(labels);

        // 更新总体分布显示
        this.updatePopChart();

        // 加载保存的状态（如果有）
        this.loadState();
    },

    /**
     * 初始化总体分布图表
     */
    initPopChart(labels) {
        const ctx = document.getElementById('popChart').getContext('2d');

        this.popChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '概率密度',
                    data: [],
                    borderColor: '#64748B',
                    backgroundColor: 'rgba(100, 116, 139, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        title: {display: true, text: '数值'},
                        ticks: {maxTicksLimit: 10}
                    },
                    y: {
                        display: false,
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {display: false}
                },
                animation: {duration: 500}
            }
        });
    },

    /**
     * 初始化样本均值分布图表
     */
    initCLTChart(labels) {
        const ctx = document.getElementById('cltChart').getContext('2d');

        this.cltChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '频率',
                    data: this.histogramData,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10B981',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {duration: 0},
                scales: {
                    x: {
                        display: true,
                        title: {display: true, text: '样本均值'},
                        ticks: {maxTicksLimit: 10}
                    },
                    y: {
                        display: false,
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {display: false}
                }
            }
        });
    },

    /**
     * 随机数生成器集合
     */
    generators: {
        /**
         * 均匀分布: 0 到 1
         */
        uniform() {
            return Math.random();
        },

        /**
         * 指数分布: 高度偏斜
         * 使用逆变换采样: -ln(U)/lambda
         */
        exponential() {
            const lambda = 5;
            let val = -Math.log(1 - Math.random()) / lambda;
            return val > 1 ? 1 : val; // 截断到 [0, 1]
        },

        /**
         * 双峰分布: 两极分化
         * 50% 在 0.2 附近，50% 在 0.8 附近
         */
        bimodal() {
            // 使用 Box-Muller 变换生成正态分布
            const randn = () => {
                let u = 0, v = 0;
                while(u === 0) u = Math.random();
                while(v === 0) v = Math.random();
                return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            };

            if (Math.random() < 0.5) {
                return Math.max(0, Math.min(1, 0.2 + randn() * 0.05));
            } else {
                return Math.max(0, Math.min(1, 0.8 + randn() * 0.05));
            }
        }
    },

    /**
     * 更新总体分布图表
     */
    updatePopChart() {
        const data = [];
        const descriptions = {
            uniform: '均匀分布 - 所有值等概率',
            exponential: '指数分布 - 左偏，大部分值接近0',
            bimodal: '双峰分布 - 两个峰值分别在 0.2 和 0.8'
        };

        // 根据数学公式画出理论形状
        for (let i = 0; i < this.BIN_COUNT; i++) {
            const x = i / this.BIN_COUNT;
            let y = 0;

            if (this.currentDist === 'uniform') {
                y = 1; // 平坦
            } else if (this.currentDist === 'exponential') {
                y = Math.exp(-5 * x); // 指数衰减
            } else if (this.currentDist === 'bimodal') {
                // 双高斯叠加
                const g1 = Math.exp(-Math.pow(x - 0.2, 2) / (2 * 0.05 * 0.05));
                const g2 = Math.exp(-Math.pow(x - 0.8, 2) / (2 * 0.05 * 0.05));
                y = g1 + g2;
            }

            data.push(y);
        }

        // 更新图表数据
        this.popChart.data.datasets[0].data = data;
        this.popChart.data.datasets[0].stepped = (this.currentDist === 'uniform');
        this.popChart.update();

        // 更新描述文本
        document.getElementById('distDesc').textContent = descriptions[this.currentDist];
    },

    /**
     * 更改分布类型
     */
    changeDistribution() {
        this.currentDist = document.getElementById('distSelect').value;
        this.reset();
        this.updatePopChart();
        this.saveState();
        utils.showToast(`已切换到${document.getElementById('distDesc').textContent}`);
    },

    /**
     * 更新样本量
     * @param {number} value - 新的样本量
     */
    updateSampleSize(value) {
        this.sampleSize = parseInt(value);
        document.getElementById('sampleSizeValue').textContent = this.sampleSize;
        this.reset();
        this.saveState();
    },

    /**
     * 更新模拟速度
     * @param {number} value - 新的速度值
     */
    updateSpeed(value) {
        this.speed = parseInt(value);
        document.getElementById('speedValue').textContent = this.speed;
        this.saveState();
    },

    /**
     * 执行单次模拟（抽取一个样本并计算均值）
     */
    runSingleSimulation() {
        let sum = 0;

        // 抽取 N 个样本
        for (let i = 0; i < this.sampleSize; i++) {
            let val = this.generators[this.currentDist]();

            // 边界保护
            if (val < this.MIN_VALUE) val = this.MIN_VALUE;
            if (val > this.MAX_VALUE) val = this.MAX_VALUE;

            sum += val;
        }

        // 计算均值
        const mean = sum / this.sampleSize;

        // 放入直方图
        const binIdx = Math.floor(mean * this.BIN_COUNT);
        const safeBinIdx = Math.min(binIdx, this.BIN_COUNT - 1);
        this.histogramData[safeBinIdx]++;

        // 保存样本均值
        this.sampleMeans.push(mean);
        this.totalSimulations++;

        // 更新统计信息
        this.updateStats(mean);
    },

    /**
     * 更新统计数据显示
     * @param {number} currentMean - 最新的样本均值
     */
    updateStats(currentMean) {
        // 模拟次数
        document.getElementById('simCount').textContent =
            this.totalSimulations.toLocaleString();

        // 最新均值
        document.getElementById('currentMean').textContent =
            currentMean.toFixed(4);

        // 计算所有样本均值的统计量
        if (this.sampleMeans.length > 0) {
            const meanOfMeans = utils.calculateMean(this.sampleMeans);
            const stdError = utils.calculateStdDev(this.sampleMeans);

            document.getElementById('meanOfMeans').textContent =
                meanOfMeans.toFixed(4);
            document.getElementById('stdError').textContent =
                stdError.toFixed(4);
        }
    },

    /**
     * 核心模拟循环
     */
    loop() {
        if (!this.isRunning) return;

        // 批量处理以提高速度
        for (let i = 0; i < this.speed; i++) {
            this.runSingleSimulation();
        }

        // 更新图表
        this.cltChart.update();

        // 继续循环
        this.animationId = requestAnimationFrame(() => this.loop());
    },

    /**
     * 开始/暂停模拟
     */
    toggle() {
        const btn = document.getElementById('startBtn');

        if (this.isRunning) {
            // 暂停
            this.isRunning = false;
            btn.textContent = '▶ 继续模拟';
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-primary');
            cancelAnimationFrame(this.animationId);
            utils.showToast('模拟已暂停');
        } else {
            // 开始
            this.isRunning = true;
            btn.textContent = '⏸ 暂停模拟';
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-danger');
            this.loop();
            utils.showToast('模拟开始');
        }

        this.saveState();
    },

    /**
     * 单步执行
     */
    step() {
        if (this.isRunning) {
            this.toggle();
        }

        this.runSingleSimulation();
        this.cltChart.update();
        utils.showToast('执行了一次模拟');
    },

    /**
     * 重置模拟
     */
    reset() {
        // 停止运行
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);

        // 清空数据
        this.histogramData.fill(0);
        this.sampleMeans = [];
        this.totalSimulations = 0;

        // 重置UI
        document.getElementById('simCount').textContent = '0';
        document.getElementById('currentMean').textContent = '-';
        document.getElementById('meanOfMeans').textContent = '-';
        document.getElementById('stdError').textContent = '-';

        const btn = document.getElementById('startBtn');
        btn.textContent = '▶ 开始模拟';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-primary');

        // 更新图表
        this.cltChart.update();

        utils.showToast('模拟已重置');
        this.saveState();
    },

    /**
     * 保存状态到 LocalStorage
     */
    saveState() {
        const state = {
            currentDist: this.currentDist,
            sampleSize: this.sampleSize,
            speed: this.speed,
            totalSimulations: this.totalSimulations,
            histogramData: this.histogramData,
            sampleMeans: this.sampleMeans.slice(-1000) // 只保存最近1000个
        };

        utils.storage.save('clt_state', state);
    },

    /**
     * 从 LocalStorage 加载状态
     */
    loadState() {
        const state = utils.storage.load('clt_state');

        if (!state) return;

        // 恢复参数
        this.currentDist = state.currentDist;
        this.sampleSize = state.sampleSize;
        this.speed = state.speed;
        this.totalSimulations = state.totalSimulations;
        this.histogramData = state.histogramData;
        this.sampleMeans = state.sampleMeans || [];

        // 更新UI
        document.getElementById('distSelect').value = this.currentDist;
        document.getElementById('sampleSize').value = this.sampleSize;
        document.getElementById('sampleSizeValue').textContent = this.sampleSize;
        document.getElementById('speedControl').value = this.speed;
        document.getElementById('speedValue').textContent = this.speed;

        // 恢复统计信息
        if (this.sampleMeans.length > 0) {
            const lastMean = this.sampleMeans[this.sampleMeans.length - 1];
            this.updateStats(lastMean);
        }

        // 更新图表
        this.updatePopChart();
        this.cltChart.data.datasets[0].data = this.histogramData;
        this.cltChart.update();

        // 询问用户是否恢复
        if (this.totalSimulations > 0) {
            utils.confirm(
                `发现上次的模拟数据（${this.totalSimulations.toLocaleString()} 次），是否恢复？`,
                () => {
                    utils.showToast('已恢复上次的模拟状态');
                },
                () => {
                    this.reset();
                }
            );
        }
    },

    /**
     * 获取导出数据
     * @returns {Object} 导出的数据对象
     */
    getExportData() {
        const meanOfMeans = utils.calculateMean(this.sampleMeans);
        const stdError = utils.calculateStdDev(this.sampleMeans);

        return {
            metadata: {
                theorem: '中心极限定理',
                distribution: this.currentDist,
                sampleSize: this.sampleSize,
                totalSimulations: this.totalSimulations,
                meanOfMeans: meanOfMeans.toFixed(6),
                standardError: stdError.toFixed(6)
            },
            histogram: {
                labels: Array.from(
                    {length: this.BIN_COUNT},
                    (_, i) => (i / this.BIN_COUNT).toFixed(3)
                ),
                frequencies: this.histogramData
            },
            sampleMeans: this.sampleMeans
        };
    }
};

// === 页面加载完成后初始化 ===
document.addEventListener('DOMContentLoaded', () => {
    simulation.init();
});
