# 统计数学定理可视化模拟

一个交互式的统计数学定理可视化项目，通过动态模拟帮助理解统计学中的核心概念与定理。

## 项目特点

- ✨ **纯原生技术栈**: HTML + CSS + JavaScript，无需构建工具
- 📊 **专业可视化**: 基于 Chart.js 的高质量图表
- 📱 **响应式设计**: 完美支持桌面、平板和手机
- 🎛️ **参数可调**: 支持自定义模拟参数
- 💾 **数据导出**: 支持导出图表和数据
- 🚀 **性能优化**: 智能采样策略，流畅展示大量数据

## 项目结构

```
math-viz/
├── index.html                      # 主页（定理目录）
├── law-of-large-numbers.html       # 大数定律模拟
├── README.md                       # 项目说明
├── css/
│   ├── variables.css              # CSS 变量定义
│   └── common.css                 # 通用样式
├── js/
│   ├── common.js                  # 工具函数库
│   ├── export.js                  # 导出功能
│   └── law-of-large-numbers.js   # 大数定律逻辑
└── lib/                           # 第三方库（可选）
```

## 已实现的定理

### 🎲 大数定律 (Law of Large Numbers)

**功能特性:**
- 抛硬币模拟实验
- 实时频率收敛可视化
- 可调概率参数（0.1-0.9）
- 多种模拟速度
- 批量添加数据（100/1000/10000次）
- 统计偏差实时显示
- 数据自动保存/恢复

**技术亮点:**
- 动态采样策略（数据量越大采样间隔越大）
- 滚动窗口优化（最多保留500个数据点）
- 使用 `requestAnimationFrame` 实现流畅动画
- Chart.js 高性能配置（禁用动画、优化渲染）

## 即将推出

- 📈 中心极限定理
- 🔔 正态分布
- 🔍 贝叶斯定理
- 🎯 蒙特卡洛模拟
- 📊 二项分布

## 使用方法

### 本地预览

1. 克隆项目
```bash
git clone https://github.com/elsonLee/elsonLee.github.io.git
```

2. 进入项目目录
```bash
cd elsonLee.github.io/math-viz
```

3. 使用本地服务器打开（推荐）

使用 Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

使用 Node.js (http-server):
```bash
npx http-server -p 8000
```

使用 VS Code Live Server 扩展（推荐）

4. 浏览器访问
```
http://localhost:8000
```

### 直接访问

如果已部署到 GitHub Pages:
```
https://elsonlee.github.io/math-viz/
```

## 技术栈

- **HTML5**: 语义化标签
- **CSS3**: Flexbox/Grid 布局、CSS 变量
- **JavaScript (ES6+)**: 模块化、异步编程
- **Chart.js 4.x**: 数据可视化
- **无依赖框架**: 纯原生实现

## 核心功能

### 1. 交互式模拟
- 开始/暂停/重置控制
- 实时参数调整
- 批量数据生成

### 2. 数据可视化
- Chart.js 动态图表
- 多数据集对比
- 交互式工具提示

### 3. 数据导出
- 📊 导出图表为 PNG 图片
- 📁 导出数据为 CSV 文件
- ⚙️ 导出图表配置为 JSON
- 📄 生成完整 HTML 报告

### 4. 状态管理
- LocalStorage 自动保存
- 页面刷新状态恢复
- 手动保存/加载功能

## 代码架构

### 工具函数库 (common.js)

```javascript
// 数字格式化
utils.formatNumber(num)
utils.formatDecimal(num, decimals)

// 随机数生成
utils.randomInt(min, max)
utils.bernoulli(probability)

// 统计函数
utils.mean(arr)
utils.standardDeviation(arr)

// 存储管理
utils.storage.set(key, value)
utils.storage.get(key, defaultValue)

// UI 工具
utils.showToast(message, type)
utils.downloadFile(content, filename)
```

### 导出功能 (export.js)

```javascript
// 导出图表
exportTools.exportChartAsImage(chart, filename)

// 导出数据
exportTools.exportDataAsCSV(data, filename)

// 创建导出按钮组
exportTools.createExportButtons(chart, data, basename)
```

## 性能优化

### 1. 图表优化
- 动态采样策略（根据数据量调整采样间隔）
- 滚动窗口（限制最大数据点数）
- 禁用 Chart.js 动画（`animation: { duration: 0 }`）
- 使用 `'none'` 更新模式

### 2. 渲染优化
- `requestAnimationFrame` 动画循环
- 节流/防抖处理
- 批量 DOM 操作

### 3. 内存优化
- LocalStorage 状态持久化
- 及时清理事件监听器
- 取消未完成的动画帧

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 不支持（建议使用现代浏览器）

## 开发指南

### 添加新的定理模拟

1. 创建 HTML 页面
```html
<!-- new-theorem.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <link rel="stylesheet" href="css/variables.css">
    <link rel="stylesheet" href="css/common.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>
    <!-- 页面内容 -->
    <script src="js/common.js"></script>
    <script src="js/export.js"></script>
    <script src="js/new-theorem.js"></script>
</body>
</html>
```

2. 创建 JavaScript 逻辑
```javascript
// js/new-theorem.js
const simulation = {
    // 状态变量
};

function init() {
    // 初始化逻辑
}

// 其他功能函数
```

3. 更新主页添加新卡片
```javascript
// index.html 中的 theorems 数组
{
    id: 'new-theorem',
    title: '新定理',
    description: '描述...',
    status: 'completed',
    url: 'new-theorem.html'
}
```

## 自定义配置

### 修改颜色主题

编辑 `css/variables.css`:
```css
:root {
    --primary-color: #4F46E5;  /* 主色调 */
    --success-color: #10B981;  /* 成功色 */
    --bg-color: #F3F4F6;       /* 背景色 */
    /* ... */
}
```

### 调整图表样式

在各个定理的 JS 文件中修改 Chart.js 配置:
```javascript
simulation.chart = new Chart(ctx, {
    options: {
        scales: {
            y: {
                min: 0,
                max: 1
            }
        }
    }
});
```

## 常见问题

**Q: 为什么数据量大时图表变慢?**
A: 项目已实现智能采样和滚动窗口优化。如果仍然卡顿，可以调整 `maxDataPoints` 参数。

**Q: 如何恢复初始状态?**
A: 点击"重置"按钮，或清除浏览器 LocalStorage。

**Q: 导出的图表分辨率低?**
A: 在 `export.js` 中调整 `scale` 参数，默认为 2，可以改为 3 或 4。

**Q: 能否离线使用?**
A: 需要将 Chart.js CDN 下载到本地，或使用其他本地库。

## 贡献指南

欢迎贡献代码！请遵循以下步骤:

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 联系方式

- GitHub: [@elsonLee](https://github.com/elsonLee)
- 项目链接: [https://elsonlee.github.io/math-viz/](https://elsonlee.github.io/math-viz/)

## 致谢

- [Chart.js](https://www.chartjs.org/) - 强大的图表库
- [MDN Web Docs](https://developer.mozilla.org/) - 权威的 Web 技术文档
- 统计学经典教材和理论

---

⭐ 如果这个项目对你有帮助，请给个 Star！
