# 铁记 - 技术架构

## 1. 技术栈
- **框架**：React 18 + Vite
- **样式**：Tailwind CSS
- **存储**：IndexedDB（训练记录）+ LocalStorage（用户设置）
- **图标**：Lucide React
- **部署**：PWA（可添加到手机主屏幕，体验接近原生APP）

## 2. 数据模型

```typescript
// 单条训练记录
interface WorkoutItem {
  id: string;
  date: string;        // YYYY-MM-DD
  exercise: string;    // 动作名称，如"臀推"
  equipment: string;   // 器械，如"史密斯机"
  weight: number;      // 重量 kg
  sets: number;        // 组数
  reps: number;        // 次数
}
```

## 3. PWA配置
- 支持离线使用，添加到主屏幕后以全屏模式运行
- 隐藏浏览器地址栏，看起来像原生应用
- 图标和启动屏适配手机

## 4. 导出格式

**JSON（给Trae分析）**
```json
{
  "导出日期": "2026-07-16",
  "记录数": 150,
  "训练记录": [
    {"date":"2026-07-15","exercise":"臀推","equipment":"史密斯机","weight":80,"sets":5,"reps":12}
  ]
}
```

**CSV（Excel查看）**
```csv
日期,动作,器械,重量,组数,次数
2026-07-15,臀推,史密斯机,80,5,12
```
