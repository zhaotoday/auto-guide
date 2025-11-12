# Appium TypeScript 示例

使用 TypeScript 和 WebdriverIO 进行移动端自动化测试的完整示例。

## 📦 安装依赖

```bash
npm install
```

## 🚀 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时使用）
npm run test:watch
```

## 📋 前置条件

1. **启动 Appium Server**
   ```bash
   appium
   ```

2. **连接设备或启动模拟器**
   ```bash
   # 查看设备
   adb devices
   
   # 启动模拟器
   emulator -avd <AVD_NAME>
   ```

3. **确认应用已安装**
   ```bash
   adb install /path/to/app.apk
   ```

## 📁 文件说明

- `test-example.ts` - 完整的测试示例代码
- `package.json` - 项目依赖配置
- `tsconfig.json` - TypeScript 配置

## 🎯 示例功能

### 基础测试
- ✅ 登录流程测试
- ✅ 滑动手势测试
- ✅ 元素查找与点击
- ✅ 截图功能
- ✅ 上下文切换

### 高级功能
- ✅ 剪贴板操作
- ✅ 应用管理（启动/停止/后台）
- ✅ Shell 命令执行
- ✅ 手势操作（缩放/放大）

### Page Object 模式
- ✅ 登录页面封装
- ✅ 可复用的测试代码
- ✅ 更好的可维护性

## 🔧 配置说明

在 `test-example.ts` 中修改以下配置：

```typescript
const capabilities: RemoteOptions = {
  hostname: 'localhost',
  port: 4723,
  capabilities: {
    platformName: 'Android',
    'appium:deviceName': 'emulator-5554',      // 你的设备名称
    'appium:appPackage': 'com.example.app',    // 应用包名
    'appium:appActivity': '.MainActivity'      // 启动 Activity
  }
};
```

## 📚 更多资源

- [WebdriverIO 官方文档](https://webdriver.io/)
- [Appium 官方文档](https://appium.io/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
