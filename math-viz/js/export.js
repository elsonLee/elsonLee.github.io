/**
 * 导出功能模块
 * 支持导出图表为图片、导出数据为CSV
 */

/**
 * 导出 Chart.js 图表为 PNG 图片
 * @param {Chart} chartInstance - Chart.js 实例
 * @param {string} filename - 文件名（不含扩展名）
 * @param {number} scale - 图片缩放比例（默认2，更高分辨率）
 */
function exportChartAsImage(chartInstance, filename = 'chart', scale = 2) {
    if (!chartInstance) {
        utils.showToast('图表实例不存在', 'error');
        return false;
    }

    try {
        // 创建一个临时 canvas 用于高分辨率导出
        const originalCanvas = chartInstance.canvas;
        const width = originalCanvas.width * scale;
        const height = originalCanvas.height * scale;

        // 创建临时 canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');

        // 设置白色背景（防止透明背景）
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, width, height);

        // 绘制原图表
        tempCtx.drawImage(originalCanvas, 0, 0, width, height);

        // 转换为图片 URL
        const imageUrl = tempCanvas.toDataURL('image/png', 1.0);

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `${filename}_${utils.formatDateTime(new Date()).replace(/[:\s]/g, '-')}.png`;
        link.href = imageUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        utils.showToast('图表已成功导出为 PNG 图片', 'success');
        return true;
    } catch (error) {
        console.error('导出图表失败:', error);
        utils.showToast('导出图表失败: ' + error.message, 'error');
        return false;
    }
}

/**
 * 导出数据为 CSV 文件
 * @param {Array} data - 数据数组，每个元素是一行数据
 * @param {string} filename - 文件名（不含扩展名）
 * @param {Array} headers - CSV 表头（可选）
 */
function exportDataAsCSV(data, filename = 'data', headers = null) {
    if (!data || data.length === 0) {
        utils.showToast('没有数据可导出', 'error');
        return false;
    }

    try {
        let csvContent = '';

        // 添加表头
        if (headers && headers.length > 0) {
            csvContent += headers.join(',') + '\n';
        }

        // 添加数据行
        data.forEach(row => {
            if (Array.isArray(row)) {
                // 如果是数组，直接用逗号连接
                csvContent += row.join(',') + '\n';
            } else if (typeof row === 'object') {
                // 如果是对象，提取值
                const values = Object.values(row);
                // 处理包含逗号的值，用引号包裹
                const escapedValues = values.map(v =>
                    typeof v === 'string' && v.includes(',') ? `"${v}"` : v
                );
                csvContent += escapedValues.join(',') + '\n';
            } else {
                csvContent += row + '\n';
            }
        });

        // 添加 BOM 以支持中文
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${filename}_${utils.formatDateTime(new Date()).replace(/[:\s]/g, '-')}.csv`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        utils.showToast(`已成功导出 ${data.length} 条数据`, 'success');
        return true;
    } catch (error) {
        console.error('导出 CSV 失败:', error);
        utils.showToast('导出 CSV 失败: ' + error.message, 'error');
        return false;
    }
}

/**
 * 导出模拟数据（专为统计模拟设计）
 * @param {Object} simulationData - 模拟数据对象
 * @param {string} filename - 文件名
 */
function exportSimulationData(simulationData, filename = 'simulation') {
    const { labels, datasets, stats } = simulationData;

    // 构建CSV数据
    const csvData = [];

    // 添加统计信息作为文件头注释
    csvData.push(['# 统计数据摘要']);
    csvData.push(['# 导出时间', utils.formatDateTime(new Date())]);
    if (stats) {
        Object.entries(stats).forEach(([key, value]) => {
            csvData.push(['# ' + key, value]);
        });
    }
    csvData.push([]); // 空行

    // 添加数据表头
    const headers = ['序号', labels[labels.length - 1] || 'X轴'];
    if (datasets) {
        datasets.forEach((dataset, index) => {
            headers.push(dataset.label || `数据集${index + 1}`);
        });
    }
    csvData.push(headers);

    // 添加数据行
    const dataLength = labels.length;
    for (let i = 0; i < dataLength; i++) {
        const row = [i + 1, labels[i]];
        if (datasets) {
            datasets.forEach(dataset => {
                row.push(dataset.data[i] !== undefined ? dataset.data[i] : '');
            });
        }
        csvData.push(row);
    }

    return exportDataAsCSV(csvData, filename);
}

/**
 * 导出图表配置为 JSON
 * @param {Object} config - Chart.js 配置对象
 * @param {string} filename - 文件名
 */
function exportChartConfig(config, filename = 'chart-config') {
    try {
        const jsonContent = JSON.stringify(config, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${filename}_${utils.formatDateTime(new Date()).replace(/[:\s]/g, '-')}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        utils.showToast('图表配置已成功导出', 'success');
        return true;
    } catch (error) {
        console.error('导出配置失败:', error);
        utils.showToast('导出配置失败: ' + error.message, 'error');
        return false;
    }
}

/**
 * 创建导出按钮组
 * @param {Chart} chartInstance - Chart.js 实例
 * @param {Object} data - 模拟数据对象
 * @param {string} basename - 基础文件名
 * @returns {HTMLElement} - 按钮组容器
 */
function createExportButtons(chartInstance, data, basename = 'export') {
    const container = document.createElement('div');
    container.className = 'export-buttons';
    container.style.cssText = `
        display: flex;
        gap: 8px;
        margin-top: 16px;
        flex-wrap: wrap;
    `;

    // 导出图表按钮
    const exportImageBtn = document.createElement('button');
    exportImageBtn.textContent = '📊 导出图表';
    exportImageBtn.className = 'btn btn-secondary';
    exportImageBtn.onclick = () => exportChartAsImage(chartInstance, basename + '-chart');

    // 导出数据按钮
    const exportDataBtn = document.createElement('button');
    exportDataBtn.textContent = '📁 导出数据';
    exportDataBtn.className = 'btn btn-secondary';
    exportDataBtn.onclick = () => exportSimulationData(data, basename + '-data');

    // 导出配置按钮
    const exportConfigBtn = document.createElement('button');
    exportConfigBtn.textContent = '⚙️ 导出配置';
    exportConfigBtn.className = 'btn btn-secondary';
    exportConfigBtn.onclick = () => exportChartConfig(chartInstance.config, basename + '-config');

    container.appendChild(exportImageBtn);
    container.appendChild(exportDataBtn);
    container.appendChild(exportConfigBtn);

    return container;
}

/**
 * 打印页面
 */
function printPage() {
    window.print();
}

/**
 * 生成完整的HTML报告（包含图表和数据）
 * @param {string} title - 报告标题
 * @param {Chart} chartInstance - Chart.js 实例
 * @param {Object} data - 模拟数据
 * @param {Object} stats - 统计信息
 */
function generateHTMLReport(title, chartInstance, data, stats) {
    const chartImage = chartInstance.canvas.toDataURL('image/png');

    let statsHTML = '<table style="border-collapse: collapse; width: 100%;">';
    statsHTML += '<tr style="background: #f3f4f6;"><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">统计项</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">值</th></tr>';
    Object.entries(stats).forEach(([key, value], index) => {
        statsHTML += `<tr style="${index % 2 === 0 ? 'background: #fafafa;' : ''}">
            <td style="border: 1px solid #ddd; padding: 8px;">${key}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${value}</td>
        </tr>`;
    });
    statsHTML += '</table>';

    const reportHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 报告</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
        .report-date { color: #6B7280; margin-bottom: 30px; }
        .chart { text-align: center; margin: 30px 0; }
        .chart img { max-width: 100%; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .stats { margin: 30px 0; }
        table { margin-top: 15px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <p class="report-date">生成时间: ${utils.formatDateTime(new Date())}</p>

    <div class="chart">
        <h2>可视化图表</h2>
        <img src="${chartImage}" alt="图表">
    </div>

    <div class="stats">
        <h2>统计数据</h2>
        ${statsHTML}
    </div>
</body>
</html>
    `;

    const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_报告_${utils.formatDateTime(new Date()).replace(/[:\s]/g, '-')}.html`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    utils.showToast('HTML报告已生成', 'success');
}

// 导出工具对象
window.exportTools = {
    exportChartAsImage,
    exportDataAsCSV,
    exportSimulationData,
    exportChartConfig,
    createExportButtons,
    printPage,
    generateHTMLReport
};
