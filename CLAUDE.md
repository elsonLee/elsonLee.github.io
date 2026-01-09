# Claude Code - 项目配置

本文件配置 Claude Code 的工作目录和项目上下文。

## 工作目录配置

**主项目路径**: `/home/llxmedici/Project/git_repo/elsonLee.github.io`

**主要工作目录**: `math-viz/`

## 项目说明

这是一个 GitHub Pages 项目，包含个人博客和统计数学定理可视化模块。

主要关注:
- `math-viz/` - 统计数学定理可视化模拟项目（核心工作目录）
- 其他目录为现有的 Hexo 博客系统

## 快速开始

当使用 `claude -c` 启动时，Claude 会：
1. 自动读取本文件
2. 认识到这是一个 GitHub Pages 项目
3. 优先在 `math-viz/` 目录下工作
4. 遵循 `math-viz/CLAUDE.md` 中定义的开发规范

## 开发规范

详细的开发规范请参阅: `math-viz/CLAUDE.md`

核心原则:
- 纯原生 HTML/CSS/JavaScript（无框架）
- 使用 Chart.js 进行数据可视化
- 模块化、响应式设计
- 完整的导出功能

## 项目结构

```
elsonLee.github.io/
├── math-viz/              # 📊 统计数学定理可视化（核心）
│   ├── CLAUDE.md          # 详细的开发规范 ⭐
│   ├── index.html         # 主页
│   ├── law-of-large-numbers.html
│   ├── css/               # 样式系统
│   └── js/                # 逻辑代码
├── 2018/, 2019/, 2020/    # 现有博客内容
├── archives/              # 博客归档
├── css/                   # 博客样式
├── index.html             # 博客主页
└── ...                    # 其他博客文件
```

## 常用命令

### 启动本地服务器
```bash
cd math-viz
./start-server.sh
```

### Git 操作
```bash
# 查看状态
git status

# 提交 math-viz 更改
git add math-viz/
git commit -m "feat(math-viz): 描述"
git push origin master
```

## 开发新功能

当需要在 `math-viz/` 中添加新定理时:
1. 参考 `math-viz/CLAUDE.md` 中的流程
2. 复制现有的 HTML/JS 模板
3. 遵循代码风格规范
4. 测试并更新文档

## 注意事项

- ⚠️ 不要修改博客系统的文件（2018/, 2019/, 2020/, css/, index.html 等）
- ✅ 所有新功能都在 `math-viz/` 目录下开发
- ✅ 遵循现有的代码风格和架构
- ✅ 更新相关文档（README.md, CLAUDE.md）

## 联系方式

- GitHub: @elsonLee
- 项目: https://elsonlee.github.io/math-viz/

---

**更新日期**: 2025-01-10
**版本**: 1.0.0
