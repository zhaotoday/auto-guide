# 移动端自动化最佳实践指南

> 合规、高效、稳定的自动化开发指南

## 📋 目录

- [合规自动化原则](#合规自动化原则)
- [开发环境配置](#开发环境配置)
- [代码组织与架构](#代码组织与架构)
- [稳定性保障](#稳定性保障)
- [性能优化](#性能优化)
- [安全与隐私](#安全与隐私)
- [CICD集成](#cicd集成)
- [反检测技术](#反检测技术)

---

## ⚖️ 合规自动化原则

### 黄金法则

```
1. 优先使用官方API
2. 遵守平台服务条款
3. 透明告知用户
4. 保护用户隐私
5. 控制请求频率
6. 模拟真实行为
7. 处理人机验证
8. 避免批量操作
```

### 官方 API 优先

#### ✅ 推荐方案

```python
# TikTok - 使用官方API
import requests

class TikTokOfficialAPI:
 def __init__(self, access_token):
 self.access_token = access_token
 self.base_url = "https://open-api.tiktok.com"
 
 def upload_video(self, video_path, title, description):
 """使用官方API上传视频"""
 url = f"{self.base_url}/share/video/upload/"
 
 headers = {
 "Authorization": f"Bearer {self.access_token}",
 "Content-Type": "application/json"
 }
 
 # 先上传视频文件
 with open(video_path, 'rb') as video_file:
 files = {'video': video_file}
 response = requests.post(
 url,
 headers=headers,
 files=files,
 data={
 'title': title,
 'description': description
 }
 )
 
 return response.json()
 
 def get_video_info(self, video_id):
 """获取视频信息"""
 url = f"{self.base_url}/video/query/"
 params = {'video_id': video_id}
 headers = {"Authorization": f"Bearer {self.access_token}"}
 
 response = requests.get(url, headers=headers, params=params)
 return response.json()
```

#### ❌ 不推荐方案

```python
# 使用自动化工具模拟上传（可能违反ToS）
def upload_via_automation(driver, video_path):
 driver.find_element("id", "upload_btn").click()
 driver.find_element("input[type='file']").send_keys(video_path)
 # ...
```

### 服务条款遵守

#### 常见限制

| 平台 | 主要限制 | 建议做法 |
|------|---------|---------|
| **TikTok/抖音** | 禁止自动化发布、刷量 | 使用官方 API、人工审核 |
| **Instagram** | 禁止批量关注/点赞 | 限制频率、真实互动 |
| **Twitter** | API 速率限制 | 遵守速率限制、使用官方 SDK |
| **YouTube** | 禁止虚假观看 | 使用官方 API 上传 |

---

## 🔧 开发环境配置

### Appium 环境搭建

#### 完整配置脚本

```bash
#!/bin/bash
# setup_appium.sh - Appium环境一键安装

echo "🚀 开始配置Appium环境..."

# 1. 安装Node.js (使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 2. 安装Java
sudo apt-get update
sudo apt-get install -y openjdk-11-jdk

# 3. 配置环境变量
echo 'export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64' >> ~/.bashrc
echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc

# 4. 安装Android SDK
wget https://dl.google.com/android/repository/commandlinetools-linux-latest.zip
unzip commandlinetools-linux-latest.zip -d ~/android-sdk
mkdir -p ~/android-sdk/cmdline-tools/latest
mv ~/android-sdk/cmdline-tools/* ~/android-sdk/cmdline-tools/latest/

echo 'export ANDROID_HOME=~/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# 5. 安装SDK组件
sdkmanager "platform-tools" "platforms;android-30" "build-tools;30.0.3"

# 6. 安装Appium
npm install -g appium@2.0
appium driver install uiautomator2
appium driver install xcuitest # macOS only

# 7. 安装Appium Inspector
npm install -g appium-inspector

# 8. 验证安装
echo "✅ 验证安装..."
node --version
java -version
adb version
appium --version

echo "🎉 Appium环境配置完成！"
```

#### Python 客户端配置

```python
# requirements.txt
Appium-Python-Client==2.11.1
selenium==4.15.2
pytest==7.4.3
pytest-xdist==3.5.0
allure-pytest==2.13.2
Pillow==10.1.0
opencv-python==4.8.1
```

```bash
# 安装依赖
pip install -r requirements.txt
```

### AutoJs 开发环境

```javascript
// autojs_setup.js - AutoJs项目初始化

"ui";

// 项目配置
const PROJECT_CONFIG = {
 name: "自动化项目",
 version: "1.0.0",
 author: "Your Name",
 description: "项目描述",
 packageName: "com.example.automation"
};

// 初始化项目结构
function initProject() {
 const projectRoot = "/sdcard/AutoJs/projects/" + PROJECT_CONFIG.name;
 
 // 创建目录结构
 files.createWithDirs(projectRoot + "/src/utils/");
 files.createWithDirs(projectRoot + "/src/modules/");
 files.createWithDirs(projectRoot + "/src/config/");
 files.createWithDirs(projectRoot + "/assets/images/");
 files.createWithDirs(projectRoot + "/logs/");
 
 // 创建配置文件
 files.write(
 projectRoot + "/src/config/settings.json",
 JSON.stringify({
 delay: {min: 1000, max: 3000},
 retry: {maxAttempts: 3, interval: 2000},
 logging: {enabled: true, level: "INFO"}
 }, null, 2)
 );
 
 // 创建工具类
 files.write(
 projectRoot + "/src/utils/common.js",
 `
module.exports = {
 randomDelay: function(min, max) {
 sleep(random(min || 1000, max || 3000));
 },
 
 safeClick: function(selector, timeout) {
 let element = selector.findOne(timeout || 5000);
 if (element) {
 click(element.bounds().centerX(), element.bounds().centerY());
 return true;
 }
 return false;
 },
 
 log: function(message, level) {
 let timestamp = new Date().toLocaleString();
 console.log(\`[\${timestamp}] [\${level || 'INFO'}] \${message}\`);
 }
};
 `
 );
 
 toast("项目初始化完成: " + projectRoot);
}

initProject();
```

---

## 🏗️ 代码组织与架构

### Page Object 模式

#### Python + Appium 示例

```python
# pages/base_page.py
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage:
 def __init__(self, driver):
 self.driver = driver
 self.wait = WebDriverWait(driver, 10)
 
 def find_element(self, locator, timeout=10):
 return WebDriverWait(self.driver, timeout).until(
 EC.presence_of_element_located(locator)
 )
 
 def click(self, locator):
 self.find_element(locator).click()
 
 def input_text(self, locator, text):
 element = self.find_element(locator)
 element.clear()
 element.send_keys(text)
 
 def get_text(self, locator):
 return self.find_element(locator).text
 
 def is_element_visible(self, locator, timeout=5):
 try:
 WebDriverWait(self.driver, timeout).until(
 EC.visibility_of_element_located(locator)
 )
 return True
 except:
 return False


# pages/login_page.py
class LoginPage(BasePage):
 # 定位器
 USERNAME_INPUT = (AppiumBy.ID, "com.example:id/username")
 PASSWORD_INPUT = (AppiumBy.ID, "com.example:id/password")
 LOGIN_BUTTON = (AppiumBy.ID, "com.example:id/login_btn")
 ERROR_MESSAGE = (AppiumBy.ID, "com.example:id/error_msg")
 
 def login(self, username, password):
 """执行登录"""
 self.input_text(self.USERNAME_INPUT, username)
 self.input_text(self.PASSWORD_INPUT, password)
 self.click(self.LOGIN_BUTTON)
 
 def get_error_message(self):
 """获取错误信息"""
 return self.get_text(self.ERROR_MESSAGE)
 
 def is_login_successful(self):
 """判断是否登录成功"""
 # 检查是否跳转到首页
 return not self.is_element_visible(self.LOGIN_BUTTON, timeout=3)


# tests/test_login.py
import pytest
from pages.login_page import LoginPage

class TestLogin:
 @pytest.fixture
 def login_page(self, driver):
 return LoginPage(driver)
 
 def test_valid_login(self, login_page):
 """测试有效登录"""
 login_page.login("valid_user", "valid_pass")
 assert login_page.is_login_successful()
 
 def test_invalid_login(self, login_page):
 """测试无效登录"""
 login_page.login("invalid_user", "wrong_pass")
 error = login_page.get_error_message()
 assert "用户名或密码错误" in error
 
 @pytest.mark.parametrize("username,password", [
 ("", "password"),
 ("username", ""),
 ("", "")
 ])
 def test_empty_fields(self, login_page, username, password):
 """测试空字段"""
 login_page.login(username, password)
 assert not login_page.is_login_successful()
```

### 配置管理

```python
# config/config.py
import os
import yaml
from dataclasses import dataclass

@dataclass
class AppiumConfig:
 platform_name: str
 device_name: str
 app_package: str
 app_activity: str
 automation_name: str = "UiAutomator2"
 no_reset: bool = True

@dataclass
class TestConfig:
 base_url: str
 timeout: int
 retry_times: int
 screenshot_on_failure: bool

class Config:
 def __init__(self, env='test'):
 self.env = env
 self._load_config()
 
 def _load_config(self):
 config_file = f"config/{self.env}.yaml"
 with open(config_file, 'r', encoding='utf-8') as f:
 config = yaml.safe_load(f)
 
 self.appium = AppiumConfig(**config['appium'])
 self.test = TestConfig(**config['test'])
 
 @property
 def capabilities(self):
 return {
 'platformName': self.appium.platform_name,
 'deviceName': self.appium.device_name,
 'appPackage': self.appium.app_package,
 'appActivity': self.appium.app_activity,
 'automationName': self.appium.automation_name,
 'noReset': self.appium.no_reset
 }

# config/test.yaml
appium:
 platform_name: Android
 device_name: emulator-5554
 app_package: com.example.app
 app_activity: .MainActivity
 automation_name: UiAutomator2
 no_reset: true

test:
 base_url: https://api.example.com
 timeout: 10
 retry_times: 3
 screenshot_on_failure: true
```

---

## 🛡️ 稳定性保障

### 智能等待策略

```python
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

class SmartWait:
 def __init__(self, driver, default_timeout=10):
 self.driver = driver
 self.default_timeout = default_timeout
 
 def wait_for_element(self, locator, timeout=None):
 """等待元素出现"""
 timeout = timeout or self.default_timeout
 return WebDriverWait(self.driver, timeout).until(
 EC.presence_of_element_located(locator)
 )
 
 def wait_for_clickable(self, locator, timeout=None):
 """等待元素可点击"""
 timeout = timeout or self.default_timeout
 return WebDriverWait(self.driver, timeout).until(
 EC.element_to_be_clickable(locator)
 )
 
 def wait_for_text(self, locator, text, timeout=None):
 """等待元素包含特定文本"""
 timeout = timeout or self.default_timeout
 return WebDriverWait(self.driver, timeout).until(
 EC.text_to_be_present_in_element(locator, text)
 )
 
 def wait_for_disappear(self, locator, timeout=None):
 """等待元素消失"""
 timeout = timeout or self.default_timeout
 return WebDriverWait(self.driver, timeout).until(
 EC.invisibility_of_element_located(locator)
 )
 
 def smart_wait(self, condition_func, timeout=None, poll_frequency=0.5):
 """自定义等待条件"""
 timeout = timeout or self.default_timeout
 end_time = time.time() + timeout
 
 while time.time() < end_time:
 try:
 result = condition_func()
 if result:
 return result
 except Exception:
 pass
 time.sleep(poll_frequency)
 
 raise TimeoutException(f"Condition not met within {timeout} seconds")
```

### 异常处理与重试

```python
import functools
import time
import logging
from typing import Callable, Type, Tuple

logger = logging.getLogger(__name__)

def retry(
 max_attempts: int = 3,
 delay: float = 1.0,
 backoff: float = 2.0,
 exceptions: Tuple[Type[Exception], ...] = (Exception,),
 on_failure: Callable = None
):
 """
 重试装饰器
 :param max_attempts: 最大尝试次数
 :param delay: 初始延迟（秒）
 :param backoff: 延迟倍增因子
 :param exceptions: 需要重试的异常类型
 :param on_failure: 失败时的回调函数
 """
 def decorator(func):
 @functools.wraps(func)
 def wrapper(*args, **kwargs):
 attempt = 1
 current_delay = delay
 
 while attempt <= max_attempts:
 try:
 return func(*args, **kwargs)
 except exceptions as e:
 if attempt == max_attempts:
 logger.error(
 f"Function {func.__name__} failed after "
 f"{max_attempts} attempts: {str(e)}"
 )
 if on_failure:
 on_failure(e)
 raise
 
 logger.warning(
 f"Attempt {attempt}/{max_attempts} failed for "
 f"{func.__name__}: {str(e)}. "
 f"Retrying in {current_delay}s..."
 )
 
 time.sleep(current_delay)
 current_delay *= backoff
 attempt += 1
 
 return wrapper
 return decorator

# 使用示例
@retry(max_attempts=3, delay=2, exceptions=(TimeoutException, NoSuchElementException))
def find_and_click(driver, locator):
 element = driver.find_element(*locator)
 element.click()
 return element
```

### 截图与日志

```python
import os
import logging
from datetime import datetime
from pathlib import Path

class TestLogger:
 def __init__(self, name, log_dir='logs'):
 self.logger = logging.getLogger(name)
 self.log_dir = Path(log_dir)
 self.log_dir.mkdir(exist_ok=True)
 
 # 配置日志格式
 formatter = logging.Formatter(
 '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
 )
 
 # 文件处理器
 log_file = self.log_dir / f"{name}_{datetime.now():%Y%m%d}.log"
 file_handler = logging.FileHandler(log_file, encoding='utf-8')
 file_handler.setFormatter(formatter)
 
 # 控制台处理器
 console_handler = logging.StreamHandler()
 console_handler.setFormatter(formatter)
 
 self.logger.addHandler(file_handler)
 self.logger.addHandler(console_handler)
 self.logger.setLevel(logging.INFO)
 
 def screenshot_on_error(self, driver, test_name):
 """错误时截图"""
 screenshot_dir = self.log_dir / 'screenshots'
 screenshot_dir.mkdir(exist_ok=True)
 
 timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
 filename = f"{test_name}_{timestamp}.png"
 filepath = screenshot_dir / filename
 
 driver.save_screenshot(str(filepath))
 self.logger.error(f"Screenshot saved: {filepath}")
 return filepath

# pytest fixture
import pytest

@pytest.fixture
def logger():
 return TestLogger('automation_test')

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
 """在测试失败时自动截图"""
 outcome = yield
 rep = outcome.get_result()
 
 if rep.when == 'call' and rep.failed:
 driver = item.funcargs.get('driver')
 logger = item.funcargs.get('logger')
 
 if driver and logger:
 logger.screenshot_on_error(driver, item.name)
```

---

## ⚡ 性能优化

### 并行测试

```python
# conftest.py
import pytest
from appium import webdriver
import concurrent.futures

@pytest.fixture(scope='session')
def device_pool():
 """设备池管理"""
 return ['emulator-5554', 'emulator-5556', 'emulator-5558']

@pytest.fixture(scope='function')
def driver(device_pool, worker_id):
 """并行测试的driver fixture"""
 # 根据worker_id分配设备
 worker_index = int(worker_id.replace('gw', '')) if worker_id != 'master' else 0
 device = device_pool[worker_index % len(device_pool)]
 
 caps = {
 'platformName': 'Android',
 'deviceName': device,
 'udid': device,
 'appPackage': 'com.example.app',
 'appActivity': '.MainActivity',
 'automationName': 'UiAutomator2'
 }
 
 driver = webdriver.Remote('http://localhost:4723', caps)
 yield driver
 driver.quit()

# pytest.ini
[pytest]
addopts = -n auto --dist loadscope
```

```bash
# 运行并行测试（使用4个进程）
pytest -n 4 tests/
```

### 元素定位优化

```python
class OptimizedLocator:
 """优化的定位策略"""
 
 # ❌ 不推荐：XPath性能差
 BAD_LOCATOR = (AppiumBy.XPATH, "//android.widget.TextView[@text='登录']")
 
 # ✅ 推荐：ID定位最快
 GOOD_LOCATOR = (AppiumBy.ID, "com.example:id/login_btn")
 
 # ✅ 推荐：AccessibilityId
 ACCESSIBILITY_LOCATOR = (AppiumBy.ACCESSIBILITY_ID, "login_button")
 
 # ⚠️ 可接受：Class + Instance（需要时）
 CLASS_LOCATOR = (AppiumBy.CLASS_NAME, "android.widget.Button")
 
 @staticmethod
 def find_by_uiautomator(driver, ui_selector):
 """使用UiAutomator定位（Android专用，性能好）"""
 # 示例: 'new UiSelector().text("登录").className("android.widget.Button")'
 return driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR, ui_selector)

# 性能对比（查找1000次的平均耗时）
# ID定位: 50ms
# AccessibilityId: 60ms
# Class Name: 100ms
# XPath: 300ms ❌
```

### 批量操作优化

```python
def batch_operations(driver, elements):
 """批量操作示例"""
 
 # ❌ 低效：逐个查找和操作
 def slow_way():
 for i in range(10):
 element = driver.find_element(AppiumBy.ID, f"item_{i}")
 element.click()
 time.sleep(1)
 
 # ✅ 高效：一次性查找所有元素
 def fast_way():
 elements = driver.find_elements(AppiumBy.CLASS_NAME, "item")
 for element in elements:
 element.click()
 time.sleep(0.1) # 减少不必要的等待
 
 # ✅ 更高效：使用JavaScript执行（Web上下文）
 def fastest_way():
 driver.execute_script("""
 var elements = document.querySelectorAll('.item');
 elements.forEach(el => el.click());
 """)
```

---

## 🔒 安全与隐私

### 敏感信息管理

```python
# utils/secrets.py
import os
from cryptography.fernet import Fernet
import base64
import json

class SecretsManager:
 def __init__(self, key_file='.secret_key'):
 self.key_file = key_file
 self.key = self._load_or_create_key()
 self.cipher = Fernet(self.key)
 
 def _load_or_create_key(self):
 """加载或创建加密密钥"""
 if os.path.exists(self.key_file):
 with open(self.key_file, 'rb') as f:
 return f.read()
 else:
 key = Fernet.generate_key()
 with open(self.key_file, 'wb') as f:
 f.write(key)
 return key
 
 def encrypt(self, data: dict) -> str:
 """加密数据"""
 json_data = json.dumps(data)
 encrypted = self.cipher.encrypt(json_data.encode())
 return base64.urlsafe_b64encode(encrypted).decode()
 
 def decrypt(self, encrypted_data: str) -> dict:
 """解密数据"""
 encrypted = base64.urlsafe_b64decode(encrypted_data.encode())
 decrypted = self.cipher.decrypt(encrypted)
 return json.loads(decrypted.decode())

# 使用示例
secrets = SecretsManager()

# 加密敏感配置
credentials = {
 'username': 'user@example.com',
 'password': 'secret123',
 'api_key': 'sk-xxx'
}
encrypted = secrets.encrypt(credentials)

# 保存加密后的数据
with open('config/credentials.enc', 'w') as f:
 f.write(encrypted)

# 读取并解密
with open('config/credentials.enc', 'r') as f:
 encrypted_data = f.read()
credentials = secrets.decrypt(encrypted_data)
```

### 环境变量配置

```python
# .env (不要提交到Git)
APPIUM_SERVER=http://localhost:4723
DEVICE_NAME=emulator-5554
APP_PACKAGE=com.example.app
APP_ACTIVITY=.MainActivity

# 测试账号
TEST_USERNAME=test@example.com
TEST_PASSWORD=test123

# API密钥
API_KEY=your_api_key_here

# --------------------------------

# config/env_config.py
from dotenv import load_dotenv
import os

load_dotenv()

class EnvConfig:
 APPIUM_SERVER = os.getenv('APPIUM_SERVER', 'http://localhost:4723')
 DEVICE_NAME = os.getenv('DEVICE_NAME')
 APP_PACKAGE = os.getenv('APP_PACKAGE')
 APP_ACTIVITY = os.getenv('APP_ACTIVITY')
 
 TEST_USERNAME = os.getenv('TEST_USERNAME')
 TEST_PASSWORD = os.getenv('TEST_PASSWORD')
 
 API_KEY = os.getenv('API_KEY')
 
 @classmethod
 def validate(cls):
 """验证必需的环境变量"""
 required = ['DEVICE_NAME', 'APP_PACKAGE', 'APP_ACTIVITY']
 missing = [var for var in required if not getattr(cls, var)]
 
 if missing:
 raise ValueError(f"Missing environment variables: {', '.join(missing)}")

# .gitignore
.env
.secret_key
config/credentials.enc
```

---

## 🔄 CI/CD 集成

### GitHub Actions 配置

```yaml
# .github/workflows/mobile-test.yml
name: Mobile Automation Tests

on:
 push:
 branches: [ main, develop ]
 pull_request:
 branches: [ main ]
 schedule:
 - cron: '0 2 * * *' # 每天凌晨2点运行

jobs:
 test:
 runs-on: ubuntu-latest
 
 steps:
 - name: Checkout code
 uses: actions/checkout@v3
 
 - name: Set up Python
 uses: actions/setup-python@v4
 with:
 python-version: '3.10'
 
 - name: Set up Node.js
 uses: actions/setup-node@v3
 with:
 node-version: '18'
 
 - name: Install Java
 uses: actions/setup-java@v3
 with:
 distribution: 'temurin'
 java-version: '11'
 
 - name: Setup Android SDK
 uses: android-actions/setup-android@v2
 
 - name: Install dependencies
 run: |
 pip install -r requirements.txt
 npm install -g appium@2.0
 appium driver install uiautomator2
 
 - name: Start Appium Server
 run: |
 appium &
 sleep 5
 
 - name: Create AVD
 run: |
 echo "no" | $ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd \
 -n test_avd \
 -k "system-images;android-30;google_apis;x86_64" \
 --force
 
 - name: Start Emulator
 run: |
 $ANDROID_HOME/emulator/emulator -avd test_avd -no-window -no-audio &
 adb wait-for-device
 adb shell input keyevent 82 # 解锁屏幕
 
 - name: Run Tests
 env:
 TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
 TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
 run: |
 pytest tests/ -v --alluredir=allure-results
 
 - name: Generate Allure Report
 if: always()
 uses: simple-elf/allure-report-action@master
 with:
 allure_results: allure-results
 allure_report: allure-report
 
 - name: Upload Test Results
 if: always()
 uses: actions/upload-artifact@v3
 with:
 name: test-results
 path: |
 allure-report
 logs/screenshots
 
 - name: Notify on Failure
 if: failure()
 uses: 8398a7/action-slack@v3
 with:
 status: ${{ job.status }}
 text: 'Mobile tests failed! Check the results.'
 webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Docker 化部署

```dockerfile
# Dockerfile
FROM appium/appium:latest

# 安装Python
RUN apt-get update && apt-get install -y python3 python3-pip

# 复制项目文件
WORKDIR /app
COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .

# 暴露Appium端口
EXPOSE 4723

# 启动脚本
CMD ["sh", "-c", "appium & pytest tests/"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
 appium:
 build: .
 ports:
 - "4723:4723"
 devices:
 - /dev/kvm # Android模拟器需要
 volumes:
 - ./tests:/app/tests
 - ./logs:/app/logs
 environment:
 - DEVICE_NAME=emulator-5554
 - APP_PACKAGE=com.example.app
 - APP_ACTIVITY=.MainActivity
```

---

## 🎭 反检测技术

### 免责声明

⚠️ **以下内容仅供学术研究和安全测试使用。请勿用于违反服务条款的行为。**

### 1. 模拟真实行为

```python
import random
import time
import numpy as np
from scipy.interpolate import interp1d

class HumanBehaviorSimulator:
 """模拟真实人类行为"""
 
 def __init__(self):
 self.action_history = []
 
 def human_delay(self, min_ms=800, max_ms=2500, distribution='normal'):
 """
 模拟人类延迟
 :param distribution: 'normal', 'exponential', 'uniform'
 """
 if distribution == 'normal':
 mean = (min_ms + max_ms) / 2
 std = (max_ms - min_ms) / 6
 delay = np.random.normal(mean, std)
 delay = np.clip(delay, min_ms, max_ms)
 elif distribution == 'exponential':
 delay = np.random.exponential(scale=1000)
 delay = np.clip(delay, min_ms, max_ms)
 else: # uniform
 delay = random.uniform(min_ms, max_ms)
 
 time.sleep(delay / 1000)
 
 def bezier_curve(self, start, end, control_points=2):
 """
 生成贝塞尔曲线轨迹
 :param start: 起始点 (x, y)
 :param end: 结束点 (x, y)
 :param control_points: 控制点数量
 :return: 轨迹点列表
 """
 points = [start]
 
 # 生成控制点
 for _ in range(control_points):
 x = random.uniform(min(start[0], end[0]), max(start[0], end[0]))
 y = random.uniform(min(start[1], end[1]), max(start[1], end[1]))
 points.append((x, y))
 
 points.append(end)
 
 # 贝塞尔曲线插值
 n = len(points) - 1
 steps = random.randint(20, 40) # 随机步数
 trajectory = []
 
 for i in range(steps + 1):
 t = i / steps
 x, y = 0, 0
 
 for j, (px, py) in enumerate(points):
 # 伯恩斯坦多项式
 bernstein = (
 np.math.comb(n, j) * 
 (1 - t) ** (n - j) * 
 t ** j
 )
 x += px * bernstein
 y += py * bernstein
 
 trajectory.append((int(x), int(y)))
 
 return trajectory
 
 def human_swipe(self, driver, start, end, duration_ms=None):
 """
 模拟人类滑动
 :param start: 起始坐标 (x, y)
 :param end: 结束坐标 (x, y)
 :param duration_ms: 持续时间（毫秒）
 """
 # 随机持续时间
 if duration_ms is None:
 duration_ms = random.randint(300, 800)
 
 # 生成自然轨迹
 trajectory = self.bezier_curve(start, end)
 
 # 使用TouchAction执行滑动
 from appium.webdriver.common.touch_action import TouchAction
 
 action = TouchAction(driver)
 action.press(x=trajectory[0][0], y=trajectory[0][1])
 
 for point in trajectory[1:]:
 action.move_to(x=point[0], y=point[1])
 time.sleep(duration_ms / len(trajectory) / 1000)
 
 action.release()
 action.perform()
 
 def simulate_reading(self, content_length, words_per_minute=200):
 """
 模拟阅读时间
 :param content_length: 内容长度（字符数）
 :param words_per_minute: 阅读速度（字/分钟）
 """
 # 计算阅读时间
 reading_time = (content_length / words_per_minute) * 60
 
 # 添加随机波动（80%-120%）
 actual_time = reading_time * random.uniform(0.8, 1.2)
 
 # 模拟滚动浏览
 segments = random.randint(2, 5)
 for _ in range(segments):
 time.sleep(actual_time / segments)
 # 可以在这里添加随机滚动
 
 def random_pause(self):
 """随机暂停（模拟思考）"""
 if random.random() < 0.1: # 10%概率暂停
 time.sleep(random.uniform(2, 5))
```

### 2. 设备伪装

```python
# utils/device_faker.py
import random

class DeviceFaker:
 """设备信息伪装"""
 
 MANUFACTURERS = ['Samsung', 'Xiaomi', 'OPPO', 'Vivo', 'Huawei', 'OnePlus']
 MODELS = {
 'Samsung': ['Galaxy S21', 'Galaxy S20', 'Galaxy Note 20'],
 'Xiaomi': ['Mi 11', 'Mi 10', 'Redmi Note 10'],
 'OPPO': ['Find X3', 'Reno 6', 'A95'],
 'Vivo': ['X70', 'S10', 'Y73'],
 'Huawei': ['P40', 'Mate 40', 'Nova 8'],
 'OnePlus': ['9 Pro', '8T', 'Nord 2']
 }
 
 @classmethod
 def get_random_device(cls):
 """获取随机设备信息"""
 manufacturer = random.choice(cls.MANUFACTURERS)
 model = random.choice(cls.MODELS[manufacturer])
 
 return {
 'manufacturer': manufacturer,
 'model': model,
 'androidVersion': random.choice(['10', '11', '12']),
 'screenDensity': random.choice([320, 420, 480, 560]),
 'screenSize': random.choice(['1080x2400', '1080x2340', '1440x3200'])
 }
 
 @classmethod
 def modify_appium_caps(cls, caps):
 """修改Appium capabilities"""
 device_info = cls.get_random_device()
 
 caps['deviceManufacturer'] = device_info['manufacturer']
 caps['deviceModel'] = device_info['model']
 caps['platformVersion'] = device_info['androidVersion']
 
 return caps
```

### 3. 网络层伪装

```python
import requests
from fake_useragent import UserAgent

class NetworkFaker:
 """网络请求伪装"""
 
 def __init__(self):
 self.ua = UserAgent()
 self.session = requests.Session()
 
 def get_headers(self, mobile=True):
 """获取伪装的请求头"""
 headers = {
 'User-Agent': self.ua.random if not mobile else self.ua.random_mobile,
 'Accept': 'application/json, text/plain, */*',
 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
 'Accept-Encoding': 'gzip, deflate, br',
 'Connection': 'keep-alive',
 'Sec-Fetch-Dest': 'empty',
 'Sec-Fetch-Mode': 'cors',
 'Sec-Fetch-Site': 'same-origin'
 }
 
 # 随机添加一些可选头
 if random.random() < 0.5:
 headers['DNT'] = '1'
 
 if random.random() < 0.3:
 headers['Referer'] = 'https://www.google.com/'
 
 return headers
 
 def request_with_retry(self, url, method='GET', max_retries=3, **kwargs):
 """带重试的请求"""
 headers = self.get_headers()
 kwargs['headers'] = {**headers, **kwargs.get('headers', {})}
 
 for attempt in range(max_retries):
 try:
 response = self.session.request(method, url, **kwargs)
 response.raise_for_status()
 return response
 except requests.RequestException as e:
 if attempt == max_retries - 1:
 raise
 time.sleep(random.uniform(1, 3))
```

---

## 📊 监控与报告

### Allure 报告集成

```python
import allure
import pytest

class TestExample:
 @allure.feature('用户登录')
 @allure.story('正常登录流程')
 @allure.severity(allure.severity_level.CRITICAL)
 def test_login_success(self, driver, logger):
 with allure.step('打开登录页面'):
 # 操作代码
 allure.attach(
 driver.get_screenshot_as_png(),
 name='登录页面',
 attachment_type=allure.attachment_type.PNG
 )
 
 with allure.step('输入用户名和密码'):
 # 操作代码
 pass
 
 with allure.step('点击登录按钮'):
 # 操作代码
 pass
 
 with allure.step('验证登录成功'):
 assert True

# 生成报告
# pytest tests/ --alluredir=allure-results
# allure serve allure-results
```

---

## 📚 总结

### 最佳实践检查清单

- [ ] ✅ 使用官方 API 而非自动化模拟
- [ ] ✅ 遵守平台服务条款
- [ ] ✅ 使用 Page Object 模式组织代码
- [ ] ✅ 实现智能等待和重试机制
- [ ] ✅ 配置完善的日志和截图
- [ ] ✅ 敏感信息加密存储
- [ ] ✅ 集成 CI/CD 自动化测试
- [ ] ✅ 性能优化（并行测试、定位优化）
- [ ] ✅ 模拟真实用户行为
- [ ] ✅ 控制操作频率
- [ ] ✅ 处理异常和边界情况
- [ ] ✅ 生成详细的测试报告

---

[← 返回：检测机制](./detection-mechanisms.md) | [下一章: 代码示例 →](../examples/README.md)
