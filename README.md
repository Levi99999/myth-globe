:::writing{variant=“standard” id=“73925”}

🌍 Globe Travel Explorer

一个基于 3D 地球的全球国家信息可视化与旅游查询应用
A 3D globe-based web app for exploring countries and travel-related information.

⸻

✨ Features

🌐 3D Globe Interaction
	•	基于 WebGL 的 3D 地球渲染
	•	支持拖拽旋转、缩放
	•	鼠标悬停高亮国家
	•	点击国家自动聚焦（平滑飞行动画）

⸻

🗺 国家信息可视化
	•	全球国家边界数据展示（GeoJSON）
	•	点击国家高亮显示
	•	Tooltip 实时显示国家中文名称

⸻

🇨🇳 国家名称标准化（核心能力）
	•	所有国家统一为简体中文显示
	•	自动处理多数据源名称差异
	•	支持以下复杂情况：
	•	别名（USA → 美国）
	•	官方名称（Viet Nam → 越南）
	•	重音字符（Côte d’Ivoire → 科特迪瓦）
	•	非标准地区（England → 英国）

⸻

🧭 按洲分类导航
	•	亚洲 / 欧洲 / 非洲 / 美洲 / 大洋洲
	•	左侧列表自动分组
	•	点击国家快速定位
	•	列表与地图数据严格一一对应

⸻

📊 国家信息卡片

点击国家后展示：
	•	📖 中文简介（维基百科）
	•	🏳 国旗
	•	💰 货币名称 & 代码
	•	💱 实时汇率（人民币换算）
	•	🏛 文本关键词统计（博物馆出现次数）
	•	🔗 外部链接（维基百科）

⸻

🔍 搜索功能

支持多种输入方式：
	•	中文（中国）
	•	英文（china / usa）
	•	模糊匹配

⸻

❌ UI 交互
	•	信息卡片支持关闭按钮
	•	支持重复点击国家刷新内容
	•	Hover 提示跟随鼠标

⸻

🧱 Tech Stack

技术	用途
globe.gl / Three.js	3D 地球渲染
GeoJSON	国家边界数据
world-countries	国家基础信息
REST APIs	汇率 & 维基百科
Vanilla JavaScript	核心逻辑


⸻

📦 Project Structure

.
├── index.html
├── package.json
├── public/
├── src/
│   ├── main.js        # 核心逻辑（地球渲染 + 数据处理）
│   ├── style.css
│   ├── assets/
│   └── counter.js
└── README.md


⸻

🚀 Getting Started

1. Clone the repo

git clone https://github.com/your-username/globe-travel-explorer.git
cd globe-travel-explorer


⸻

2. Install dependencies

npm install


⸻

3. Run locally

npm run dev

Open in browser:

http://localhost:5173


⸻

🔗 Data Sources

类型	来源
国家边界	GeoJSON
国家信息	world-countries
汇率	Exchange Rate API
简介	Wikipedia REST API


⸻

🧠 Core Implementation

🌍 国家名称标准化流程

GeoJSON Name
   ↓
normalize（去重音 / 小写）
   ↓
aliasMap（别名映射）
   ↓
精确匹配国家数据库
   ↓
输出：
- 中文名称
- 洲（region）
- 标准国家信息


⸻

✅ 解决的关键问题
	•	多数据源国家名称不一致
	•	官方名称 vs 常用名称
	•	特殊字符（重音符）
	•	非标准地区归属问题
	•	列表与地图数据错位问题

⸻

📌 Current Capabilities

✔ 全球国家浏览
✔ 中文信息统一展示
✔ 洲分类导航
✔ 国家信息查询
✔ 汇率计算

⸻

🔮 Future Improvements
	•	🌍 地图直接显示国家中文标签
	•	✈️ 飞线动画（航线可视化）
	•	📊 国家数据对比（GDP / 人口）
	•	🧭 行程推荐系统
	•	❤️ 收藏 & 旅行计划
	•	🌤 天气 & 最佳旅游时间

⸻

📸 Preview

（可在此添加项目截图或 GIF）

⸻

🤝 Contributing

欢迎提交 Issue 或 PR！

# Fork → Create Branch → Commit → Push → Pull Request


⸻

📄 License

MIT License

⸻

🙌 Acknowledgements
	•	globe.gl
	•	three.js
	•	world-countries
	•	Wikipedia API

⸻

⭐️ Star This Project

如果这个项目对你有帮助，欢迎点个 ⭐️ 支持一下！

⸻

:::

如果你下一步想把这个 README 再升级成 GitHub 高赞项目风格（带徽章、动图、部署链接、在线Demo），我也可以帮你再进一版 👍