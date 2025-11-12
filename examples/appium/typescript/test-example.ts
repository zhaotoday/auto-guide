/**
 * Appium TypeScript 示例 - 完整的自动化测试用例
 */

import { remote, RemoteOptions } from 'webdriverio';
import type { Browser } from 'webdriverio';

// 测试配置
const capabilities: RemoteOptions = {
  hostname: 'localhost',
  port: 4723,
  path: '/',
  capabilities: {
    platformName: 'Android',
    'appium:deviceName': 'emulator-5554',
    'appium:appPackage': 'com.example.app',
    'appium:appActivity': '.MainActivity',
    'appium:automationName': 'UiAutomator2',
    'appium:noReset': true,
    'appium:newCommandTimeout': 300
  }
};

/**
 * 测试类：应用自动化测试
 */
class TestAppAutomation {
  private driver!: Browser;

  /**
   * 初始化驱动
   */
  async setup(): Promise<void> {
    this.driver = await remote(capabilities);
  }

  /**
   * 清理驱动
   */
  async teardown(): Promise<void> {
    await this.driver.deleteSession();
  }

  /**
   * 测试登录流程
   */
  async testLoginFlow(): Promise<void> {
    console.log('开始测试登录流程...');

    // 等待并输入用户名
    const usernameField = await this.driver.$('~username_field');
    await usernameField.waitForDisplayed({ timeout: 10000 });
    await usernameField.setValue('test_user');

    // 输入密码
    const passwordField = await this.driver.$('~password_field');
    await passwordField.setValue('test_password');

    // 点击登录按钮
    const loginButton = await this.driver.$('~login_button');
    await loginButton.click();

    // 验证登录成功
    const welcomeMessage = await this.driver.$('~welcome_message');
    await welcomeMessage.waitForDisplayed({ timeout: 10000 });
    const text = await welcomeMessage.getText();
    
    if (text.includes('欢迎')) {
      console.log('✅ 登录测试通过');
    } else {
      throw new Error('❌ 登录测试失败');
    }
  }

  /**
   * 测试滑动手势
   */
  async testSwipeGesture(): Promise<void> {
    console.log('测试滑动手势...');

    // 获取屏幕尺寸
    const { width, height } = await this.driver.getWindowSize();

    // 向上滑动
    await this.driver.touchAction([
      { action: 'press', x: width / 2, y: height * 0.8 },
      { action: 'wait', ms: 500 },
      { action: 'moveTo', x: width / 2, y: height * 0.2 },
      { action: 'release' }
    ]);

    await this.driver.pause(1000);

    // 向下滑动
    await this.driver.touchAction([
      { action: 'press', x: width / 2, y: height * 0.2 },
      { action: 'wait', ms: 500 },
      { action: 'moveTo', x: width / 2, y: height * 0.8 },
      { action: 'release' }
    ]);

    console.log('✅ 滑动测试完成');
  }

  /**
   * 滚动查找元素
   */
  async testScrollToElement(): Promise<void> {
    console.log('测试滚动查找元素...');

    // 使用 UiAutomator 滚动查找
    const element = await this.driver.$(
      'android=new UiScrollable(new UiSelector().scrollable(true))' +
      '.scrollIntoView(new UiSelector().text("目标文本"))'
    );
    
    await element.click();
    console.log('✅ 滚动查找元素成功');
  }

  /**
   * 处理弹窗
   */
  async testHandlePopup(): Promise<void> {
    console.log('测试处理弹窗...');

    try {
      const popup = await this.driver.$('~popup');
      const isDisplayed = await popup.isDisplayed();
      
      if (isDisplayed) {
        const closeButton = await this.driver.$('~close_button');
        await closeButton.click();
        console.log('✅ 弹窗已关闭');
      }
    } catch (error) {
      console.log('ℹ️ 没有弹窗');
    }
  }

  /**
   * 截图示例
   */
  async testTakeScreenshot(): Promise<void> {
    console.log('测试截图功能...');

    // 保存截图
    await this.driver.saveScreenshot('./screenshot.png');
    console.log('✅ 截图已保存');
  }

  /**
   * 切换上下文（WebView）
   */
  async testSwitchContext(): Promise<void> {
    console.log('测试切换上下文...');

    // 获取所有上下文
    const contexts = await this.driver.getContexts();
    console.log('可用上下文:', contexts);

    // 查找 WebView 上下文
    const webviewContext = contexts.find(ctx => ctx.includes('WEBVIEW'));
    
    if (webviewContext) {
      // 切换到 WebView
      await this.driver.switchContext(webviewContext);
      console.log(`已切换到: ${webviewContext}`);

      // 在 WebView 中操作
      const element = await this.driver.$('#element');
      await element.click();

      // 切回 Native
      await this.driver.switchContext('NATIVE_APP');
      console.log('已切换回 NATIVE_APP');
    }
  }
}

/**
 * 高级功能测试类
 */
class TestAdvancedFeatures {
  private driver!: Browser;

  async setup(): Promise<void> {
    this.driver = await remote(capabilities);
  }

  async teardown(): Promise<void> {
    await this.driver.deleteSession();
  }

  /**
   * 剪贴板操作
   */
  async testClipboard(): Promise<void> {
    console.log('测试剪贴板操作...');

    // 设置剪贴板内容
    await this.driver.setClipboard('Hello, World!', 'plaintext');

    // 获取剪贴板内容
    const clipboardText = await this.driver.getClipboard();
    
    if (clipboardText === 'Hello, World!') {
      console.log('✅ 剪贴板操作成功');
    } else {
      throw new Error('❌ 剪贴板操作失败');
    }
  }

  /**
   * 应用管理
   */
  async testAppManagement(): Promise<void> {
    console.log('测试应用管理...');

    const appPackage = 'com.example.app';

    // 启动应用
    await this.driver.activateApp(appPackage);
    console.log(`✅ 应用已启动: ${appPackage}`);

    // 将应用置于后台 3 秒
    await this.driver.background(3);
    console.log('✅ 应用已后台运行 3 秒');

    // 检查应用状态
    const appState = await this.driver.queryAppState(appPackage);
    console.log(`应用状态: ${appState}`);

    // 终止应用
    await this.driver.terminateApp(appPackage);
    console.log('✅ 应用已终止');
  }

  /**
   * 执行 Shell 命令
   */
  async testShellCommand(): Promise<void> {
    console.log('测试执行 Shell 命令...');

    // 获取设备型号
    const result = await this.driver.execute('mobile: shell', {
      command: 'getprop',
      args: ['ro.product.model']
    });

    console.log(`设备型号: ${result}`);
  }

  /**
   * 手势操作
   */
  async testGestures(): Promise<void> {
    console.log('测试手势操作...');

    const { width, height } = await this.driver.getWindowSize();

    // 缩放手势
    await this.driver.execute('mobile: pinchClose', {
      x: width / 2,
      y: height / 2,
      percent: 50
    });

    await this.driver.pause(1000);

    // 放大手势
    await this.driver.execute('mobile: pinchOpen', {
      x: width / 2,
      y: height / 2,
      percent: 50
    });

    console.log('✅ 手势操作完成');
  }
}

/**
 * 工具函数
 */
class TestUtils {
  /**
   * 随机延迟
   */
  static async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 重试执行
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        console.log(`尝试 ${attempt}/${maxAttempts} 失败，${delay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Should not reach here');
  }

  /**
   * 安全查找元素
   */
  static async findElementSafe(
    driver: Browser,
    selector: string,
    timeout: number = 5000
  ): Promise<WebdriverIO.Element | null> {
    try {
      const element = await driver.$(selector);
      await element.waitForDisplayed({ timeout });
      return element;
    } catch (error) {
      return null;
    }
  }
}

/**
 * 完整示例：自动化登录
 */
async function autoLoginExample(): Promise<void> {
  const driver = await remote(capabilities);

  try {
    console.log('开始自动化登录示例...');

    // 点击登录按钮
    const loginBtn = await TestUtils.findElementSafe(driver, '~login_button');
    if (loginBtn) {
      await loginBtn.click();
      console.log('✅ 点击登录按钮成功');
    } else {
      throw new Error('未找到登录按钮');
    }

    await TestUtils.randomDelay(500, 1500);

    // 输入用户名
    const usernameField = await driver.$('android.widget.EditText');
    await usernameField.setValue('username');
    await TestUtils.randomDelay(500, 1500);

    // 输入密码
    const fields = await driver.$$('android.widget.EditText');
    if (fields.length > 1) {
      await fields[1].setValue('password');
      await TestUtils.randomDelay(500, 1500);
    }

    // 点击确定
    const confirmBtn = await driver.$('~confirm_button');
    await confirmBtn.click();

    // 等待登录结果
    await driver.pause(3000);

    const successMsg = await TestUtils.findElementSafe(driver, '~success_message');
    if (successMsg) {
      console.log('✅ 登录成功！');
    } else {
      console.log('❌ 登录失败！');
    }
  } finally {
    await driver.deleteSession();
  }
}

/**
 * Page Object 模式示例
 */
class LoginPage {
  private driver: Browser;

  constructor(driver: Browser) {
    this.driver = driver;
  }

  // 定位器
  private get usernameField() {
    return this.driver.$('~username_field');
  }

  private get passwordField() {
    return this.driver.$('~password_field');
  }

  private get loginButton() {
    return this.driver.$('~login_button');
  }

  private get errorMessage() {
    return this.driver.$('~error_message');
  }

  /**
   * 执行登录
   */
  async login(username: string, password: string): Promise<void> {
    await (await this.usernameField).setValue(username);
    await (await this.passwordField).setValue(password);
    await (await this.loginButton).click();
  }

  /**
   * 获取错误信息
   */
  async getErrorMessage(): Promise<string> {
    const element = await this.errorMessage;
    return await element.getText();
  }

  /**
   * 判断是否登录成功
   */
  async isLoginSuccessful(): Promise<boolean> {
    try {
      const button = await this.loginButton;
      return !(await button.isDisplayed());
    } catch {
      return true;
    }
  }
}

/**
 * 使用 Page Object 的测试
 */
async function testWithPageObject(): Promise<void> {
  const driver = await remote(capabilities);

  try {
    const loginPage = new LoginPage(driver);

    // 测试有效登录
    await loginPage.login('valid_user', 'valid_pass');
    const isSuccess = await loginPage.isLoginSuccessful();
    console.log(isSuccess ? '✅ 登录成功' : '❌ 登录失败');

    // 测试无效登录
    await loginPage.login('invalid_user', 'wrong_pass');
    const errorMsg = await loginPage.getErrorMessage();
    console.log(`错误信息: ${errorMsg}`);
  } finally {
    await driver.deleteSession();
  }
}

/**
 * 主函数 - 运行所有测试
 */
async function main(): Promise<void> {
  console.log('🚀 开始运行 Appium TypeScript 测试...\n');

  // 基础测试
  const basicTests = new TestAppAutomation();
  await basicTests.setup();
  
  try {
    await basicTests.testLoginFlow();
    await basicTests.testSwipeGesture();
    await basicTests.testHandlePopup();
    await basicTests.testTakeScreenshot();
  } finally {
    await basicTests.teardown();
  }

  console.log('\n');

  // 高级测试
  const advancedTests = new TestAdvancedFeatures();
  await advancedTests.setup();
  
  try {
    await advancedTests.testClipboard();
    await advancedTests.testAppManagement();
    await advancedTests.testGestures();
  } finally {
    await advancedTests.teardown();
  }

  console.log('\n✅ 所有测试完成！');
}

// 导出供外部使用
export {
  TestAppAutomation,
  TestAdvancedFeatures,
  TestUtils,
  LoginPage,
  autoLoginExample,
  testWithPageObject
};

// 如果直接运行此文件
if (require.main === module) {
  main().catch(console.error);
}
