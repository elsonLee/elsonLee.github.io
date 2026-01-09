/**
 * 大数定律模拟逻辑
 * Law of Large Numbers Simulation
 */

// 模拟器状态
const simulation = {
    total: 0,          // 总投掷次数
    heads: 0,          // 正面次数
    tails: 0,          // 反面次数
    probability: 0.5,  // 正面概率
    isRunning: false,  // 是否正在运行
    speed: 5,          // 模拟速度（每次/帧）
    animationId: null, // 动画帧ID
    chart: null,       // Chart.js 实例

    // 图表数据
    chartData: {
        labels: [],
        frequency: [],
        theoretical: []
    },

    // 性能优化：最大数据点数
    maxDataPoints: 500,

    // 采样间隔（数据量大时增加）
    sampleInterval: 1
};

/**
 * 初始化图表
 */
function initChart() {
    const ctx = document.getElementById('llnChart').getContext('2d');

    simulation.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: '正面频率',
                    data: [],
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: '理论概率',
                    data: [],
                    borderColor: '#10B981',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    tension: 0,
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        title: function(items) {
                            return '投掷次数: ' + items[0].label;
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toFixed(4);
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: '投掷次数 (n)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        font: {
                            size: 11
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '频率 (P)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 1,
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

/**
 * 更新图表数据
 */
function updateChart() {
    const freq = simulation.total === 0 ? 0 : simulation.heads / simulation.total;

    // 根据数据量动态调整采样策略
    adjustSamplingStrategy();

    // 添加数据点（根据采样间隔）
    if (simulation.total % simulation.sampleInterval === 0) {
        simulation.chart.data.labels.push(simulation.total);
        simulation.chart.data.datasets[0].data.push(freq);
        simulation.chart.data.datasets[1].data.push(simulation.probability);
    }

    // 如果数据点过多，删除旧数据（保持滚动窗口）
    if (simulation.chart.data.labels.length > simulation.maxDataPoints) {
        simulation.chart.data.labels.shift();
        simulation.chart.data.datasets[0].data.shift();
        simulation.chart.data.datasets[1].data.shift();
    }

    simulation.chart.update('none'); // 'none' 模式更高效
}

/**
 * 动态调整采样策略
 */
function adjustSamplingStrategy() {
    if (simulation.total < 100) {
        simulation.sampleInterval = 1;
    } else if (simulation.total < 1000) {
        simulation.sampleInterval = 5;
    } else if (simulation.total < 10000) {
        simulation.sampleInterval = 50;
    } else if (simulation.total < 100000) {
        simulation.sampleInterval = 500;
    } else {
        simulation.sampleInterval = 5000;
    }
}

/**
 * 执行单次抛硬币
 */
function flipCoin() {
    simulation.total++;
    if (Math.random() < simulation.probability) {
        simulation.heads++;
    } else {
        simulation.tails++;
    }
}

/**
 * 批量抛硬币（用于快速模拟）
 */
function flipBatch(count) {
    for (let i = 0; i < count; i++) {
        flipCoin();
    }
    updateUI();
    updateChart();
}

/**
 * 更新界面显示
 */
function updateUI() {
    const freq = simulation.total === 0 ? 0 : simulation.heads / simulation.total;
    const deviation = Math.abs(freq - simulation.probability);

    document.getElementById('totalCount').textContent = utils.formatNumber(simulation.total);
    document.getElementById('headsCount').textContent = utils.formatNumber(simulation.heads);
    document.getElementById('tailsCount').textContent = utils.formatNumber(simulation.tails);
    document.getElementById('frequency').textContent = freq.toFixed(4);
    document.getElementById('deviation').textContent = deviation.toFixed(4);

    // 根据偏差大小改变颜色
    const deviationElement = document.getElementById('deviation');
    if (deviation < 0.01) {
        deviationElement.style.color = '#10B981'; // 绿色 - 收敛很好
    } else if (deviation < 0.05) {
        deviationElement.style.color = '#F59E0B'; // 橙色 - 收敛良好
    } else {
        deviationElement.style.color = '#EF4444'; // 红色 - 还未收敛
    }
}

/**
 * 动画循环
 */
function animate() {
    if (!simulation.isRunning) return;

    // 每帧执行 speed 次抛硬币
    for (let i = 0; i < simulation.speed; i++) {
        flipCoin();
    }

    // 每帧更新一次界面（优化性能）
    updateUI();
    updateChart();

    simulation.animationId = requestAnimationFrame(animate);
}

/**
 * 切换模拟状态（开始/暂停）
 */
function toggleSimulation() {
    const btn = document.getElementById('startBtn');

    if (simulation.isRunning) {
        // 暂停
        simulation.isRunning = false;
        btn.textContent = '▶️ 继续模拟';
        btn.classList.remove('btn-danger');
        cancelAnimationFrame(simulation.animationId);
        utils.showToast('模拟已暂停', 'info');
    } else {
        // 开始
        simulation.isRunning = true;
        btn.textContent = '⏸️ 暂停模拟';
        btn.classList.add('btn-danger');
        animate();
        utils.showToast('模拟开始', 'success');
    }
}

/**
 * 重置模拟
 */
function resetSimulation() {
    // 停止动画
    simulation.isRunning = false;
    if (simulation.animationId) {
        cancelAnimationFrame(simulation.animationId);
    }

    // 重置数据
    simulation.total = 0;
    simulation.heads = 0;
    simulation.tails = 0;

    // 重置图表
    simulation.chart.data.labels = [];
    simulation.chart.data.datasets[0].data = [];
    simulation.chart.data.datasets[1].data = [];
    simulation.chart.update();

    // 重置UI
    document.getElementById('startBtn').textContent = '▶️ 开始模拟';
    document.getElementById('startBtn').classList.remove('btn-danger');
    updateUI();

    utils.showToast('模拟已重置', 'info');
}

/**
 * 更新概率设置
 */
function updateProbability(value) {
    simulation.probability = parseFloat(value);
    document.getElementById('probabilityValue').textContent = simulation.probability.toFixed(2);

    // 更新图表中的理论概率线
    if (simulation.chart.data.datasets[1].data.length > 0) {
        simulation.chart.data.datasets[1].data = simulation.chart.data.datasets[1].data.map(() => simulation.probability);
        simulation.chart.update('none');
    }

    utils.showToast(`概率已设置为 ${simulation.probability.toFixed(2)}`, 'info');
}

/**
 * 更新模拟速度
 */
function updateSpeed(value) {
    simulation.speed = parseInt(value);
    utils.showToast(`速度设置为 ${simulation.speed} 次/帧`, 'info');
}

/**
 * 导出当前数据
 */
function exportCurrentData() {
    const data = {
        labels: simulation.chart.data.labels,
        datasets: [
            {
                label: '正面频率',
                data: simulation.chart.data.datasets[0].data
            },
            {
                label: '理论概率',
                data: simulation.chart.data.datasets[1].data
            }
        ],
        stats: {
            '总投掷次数': simulation.total,
            '正面次数': simulation.heads,
            '反面次数': simulation.tails,
            '正面频率': (simulation.total === 0 ? 0 : simulation.heads / simulation.total).toFixed(6),
            '理论概率': simulation.probability.toFixed(4),
            '绝对偏差': Math.abs((simulation.heads / simulation.total) - simulation.probability).toFixed(6),
            '相对偏差': (Math.abs((simulation.heads / simulation.total) - simulation.probability) / simulation.probability * 100).toFixed(4) + '%'
        }
    };

    return data;
}

/**
 * 初始化页面
 */
function init() {
    // 初始化图表
    initChart();

    // 绑定事件监听器
    document.getElementById('startBtn').addEventListener('click', toggleSimulation);
    document.getElementById('resetBtn').addEventListener('click', resetSimulation);
    document.getElementById('add100Btn').addEventListener('click', () => flipBatch(100));
    document.getElementById('add1000Btn').addEventListener('click', () => flipBatch(1000));
    document.getElementById('add10000Btn').addEventListener('click', () => flipBatch(10000));

    // 概率滑块
    document.getElementById('probabilitySlider').addEventListener('input', (e) => {
        updateProbability(e.target.value);
    });

    // 速度选择
    document.getElementById('speedSelect').addEventListener('change', (e) => {
        updateSpeed(e.target.value);
    });

    // 创建导出按钮
    const exportContainer = document.getElementById('exportButtons');
    const exportButtons = exportTools.createExportButtons(
        simulation.chart,
        exportCurrentData(),
        'law-of-large-numbers'
    );
    exportContainer.appendChild(exportButtons);

    // 初始化UI
    updateUI();

    // 从 localStorage 恢复上次的状态（可选）
    const savedState = utils.storage.get('lln_simulation_state');
    if (savedState && confirm('检测到上次保存的模拟数据，是否恢复？')) {
        restoreState(savedState);
    }
}

/**
 * 保存当前状态
 */
function saveState() {
    const state = {
        total: simulation.total,
        heads: simulation.heads,
        tails: simulation.tails,
        probability: simulation.probability,
        chartData: {
            labels: simulation.chart.data.labels,
            frequency: simulation.chart.data.datasets[0].data,
            theoretical: simulation.chart.data.datasets[1].data
        },
        savedAt: new Date().toISOString()
    };

    utils.storage.set('lln_simulation_state', state);
}

/**
 * 恢复保存的状态
 */
function restoreState(state) {
    simulation.total = state.total;
    simulation.heads = state.heads;
    simulation.tails = state.tails;
    simulation.probability = state.probability;

    // 恢复图表数据
    simulation.chart.data.labels = state.chartData.labels;
    simulation.chart.data.datasets[0].data = state.chartData.frequency;
    simulation.chart.data.datasets[1].data = state.chartData.theoretical;
    simulation.chart.update();

    // 更新UI
    document.getElementById('probabilitySlider').value = simulation.probability;
    document.getElementById('probabilityValue').textContent = simulation.probability.toFixed(2);
    updateUI();

    utils.showToast('已恢复上次的模拟状态', 'success');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 页面卸载前保存状态
window.addEventListener('beforeunload', () => {
    if (simulation.total > 0) {
        saveState();
    }
});
