# 贡献指南

感谢你对本项目的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 报告问题

如果你发现了 bug 或有改进建议：

1. 先搜索[Issues](https://github.com/yourusername/mobile-automation-guide/issues)查看是否已有相关讨论
2. 如果没有，创建新的 Issue，并提供：
 - 清晰的标题
 - 详细的描述
 - 复现步骤（如果是 bug）
 - 期望行为
 - 截图或日志（如果适用）

### 提交代码

1. **Fork 项目**
 ```bash
 # 在GitHub上点击Fork按钮
 ```

2. **克隆仓库**
 ```bash
 git clone https://github.com/your-username/mobile-automation-guide.git
 cd mobile-automation-guide
 ```

3. **创建分支**
 ```bash
 git checkout -b feature/your-feature-name
 # 或
 git checkout -b fix/your-bug-fix
 ```

4. **编写代码**
 - 遵循项目的代码风格
 - 添加必要的注释
 - 更新相关文档

5. **测试**
 ```bash
 # 运行测试
 pytest tests/
 
 # 检查代码风格
 flake8 .
 ```

6. **提交更改**
 ```bash
 git add .
 git commit -m "feat: add new feature"
 # 或
 git commit -m "fix: resolve issue #123"
 ```

 **提交信息规范：**
 - `feat:` 新功能
 - `fix:` 修复 bug
 - `docs:` 文档更新
 - `style:` 代码格式调整
 - `refactor:` 重构
 - `test:` 测试相关
 - `chore:` 构建/工具相关

7. **推送分支**
 ```bash
 git push origin feature/your-feature-name
 ```

8. **创建 Pull Request**
 - 在 GitHub 上创建 PR
 - 填写 PR 模板
 - 等待审核

## 📝 代码规范

### Python 代码

```python
# 使用 PEP 8 规范
# 使用类型提示
def find_element(driver: webdriver.Remote, 
 locator: tuple) -> WebElement:
 """
 查找元素
 
 Args:
 driver: Appium驱动
 locator: 定位器元组
 
 Returns:
 找到的元素
 """
 return driver.find_element(*locator)
```

### TypeScript/JavaScript 代码

```typescript
// 优先使用 TypeScript
// 使用 ESLint + Prettier
// 使用 TSDoc 注释
/**
 * 点击元素
 * @param {string} selector - 元素选择器
 * @returns {boolean} 是否成功
 */
function clickElement(selector) {
 // ...
}
```

## 📚 文档规范

- 使用 Markdown 格式
- 添加目录
- 包含代码示例
- 保持简洁清晰
- 检查拼写和语法

## ✅ Pull Request 检查清单

在提交 PR 前，请确认：

- [ ] 代码已测试
- [ ] 添加了必要的注释
- [ ] 更新了相关文档
- [ ] 遵循了代码规范
- [ ] 提交信息清晰
- [ ] 没有合并冲突

## 🎯 优先级

我们特别欢迎以下贡献：

- 🐛 **Bug 修复** - 高优先级
- 📝 **文档改进** - 随时欢迎
- ✨ **新功能** - 请先开 Issue 讨论
- 🎨 **代码优化** - 欢迎
- 🌍 **国际化** - 欢迎添加其他语言

## 📞 联系方式

- GitHub Issues: [创建 Issue](https://github.com/zhaotoday/mobile-automation-guide/issues)
- Discussions: [参与讨论](https://github.com/zhaotoday/mobile-automation-guide/discussions)
- 作者邮箱: [6421664@qq.com](mailto:6421664@qq.com)

## 📄 许可证

贡献的代码将采用 [MIT License](LICENSE) 协议。

---

再次感谢你的贡献！ 🎉
