"""
Appium Python 示例 - 完整的自动化测试用例
"""

import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import random


class TestAppAutomation:
    """应用自动化测试示例"""
    
    @pytest.fixture(scope='function')
    def driver(self):
        """初始化驱动"""
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.device_name = "emulator-5554"
        options.app_package = "com.example.app"
        options.app_activity = ".MainActivity"
        options.automation_name = "UiAutomator2"
        options.no_reset = True
        options.new_command_timeout = 300
        
        driver = webdriver.Remote(
            'http://localhost:4723',
            options=options
        )
        
        yield driver
        driver.quit()
    
    def test_login_flow(self, driver):
        """测试登录流程"""
        # 等待登录页面加载
        wait = WebDriverWait(driver, 10)
        
        # 输入用户名
        username_field = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, "com.example:id/username")
            )
        )
        username_field.send_keys("test_user")
        
        # 输入密码
        password_field = driver.find_element(
            AppiumBy.ID, "com.example:id/password"
        )
        password_field.send_keys("test_password")
        
        # 点击登录按钮
        login_button = driver.find_element(
            AppiumBy.ID, "com.example:id/login_button"
        )
        login_button.click()
        
        # 验证登录成功
        success_message = wait.until(
            EC.presence_of_element_located(
                (AppiumBy.ID, "com.example:id/welcome_message")
            )
        )
        assert "欢迎" in success_message.text
    
    def test_swipe_gesture(self, driver):
        """测试滑动操作"""
        # 获取屏幕尺寸
        size = driver.get_window_size()
        width = size['width']
        height = size['height']
        
        # 向上滑动（从下到上）
        driver.swipe(
            start_x=width // 2,
            start_y=height * 0.8,
            end_x=width // 2,
            end_y=height * 0.2,
            duration=500
        )
        
        time.sleep(1)
        
        # 向下滑动（从上到下）
        driver.swipe(
            start_x=width // 2,
            start_y=height * 0.2,
            end_x=width // 2,
            end_y=height * 0.8,
            duration=500
        )
    
    def test_scroll_to_element(self, driver):
        """滚动查找元素"""
        # Android UiAutomator方式
        element = driver.find_element(
            AppiumBy.ANDROID_UIAUTOMATOR,
            'new UiScrollable(new UiSelector().scrollable(true))'
            '.scrollIntoView(new UiSelector().text("目标文本"))'
        )
        element.click()
    
    def test_handle_popup(self, driver):
        """处理弹窗"""
        try:
            # 等待弹窗出现（最多等待3秒）
            popup = WebDriverWait(driver, 3).until(
                EC.presence_of_element_located(
                    (AppiumBy.ID, "com.example:id/popup")
                )
            )
            
            # 点击关闭按钮
            close_button = driver.find_element(
                AppiumBy.ID, "com.example:id/close_button"
            )
            close_button.click()
        except:
            # 没有弹窗，继续执行
            pass
    
    def test_take_screenshot(self, driver):
        """截图示例"""
        # 保存截图
        driver.save_screenshot("screenshot.png")
        
        # 或者获取Base64编码
        screenshot_base64 = driver.get_screenshot_as_base64()
    
    def test_get_app_performance(self, driver):
        """获取应用性能数据"""
        # 获取应用性能数据（需要Appium 2.0+）
        performance_data = driver.get_performance_data(
            package_name='com.example.app',
            data_type='cpuinfo',
            data_read_timeout=1000
        )
        print(f"CPU信息: {performance_data}")
        
        # 获取内存信息
        memory_data = driver.get_performance_data(
            package_name='com.example.app',
            data_type='memoryinfo',
            data_read_timeout=1000
        )
        print(f"内存信息: {memory_data}")
    
    def test_switch_context(self, driver):
        """切换WebView上下文"""
        # 获取所有上下文
        contexts = driver.contexts
        print(f"可用上下文: {contexts}")
        
        # 切换到WebView
        for context in contexts:
            if 'WEBVIEW' in context:
                driver.switch_to.context(context)
                break
        
        # 在WebView中操作
        driver.find_element(AppiumBy.CSS_SELECTOR, "#element").click()
        
        # 切回Native
        driver.switch_to.context('NATIVE_APP')


class TestAdvancedFeatures:
    """高级功能示例"""
    
    @pytest.fixture(scope='function')
    def driver(self):
        """初始化驱动"""
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.device_name = "emulator-5554"
        options.app_package = "com.example.app"
        options.app_activity = ".MainActivity"
        
        driver = webdriver.Remote('http://localhost:4723', options=options)
        yield driver
        driver.quit()
    
    def test_clipboard_operations(self, driver):
        """剪贴板操作"""
        # 设置剪贴板内容
        driver.set_clipboard_text("Hello, World!")
        
        # 获取剪贴板内容
        clipboard_text = driver.get_clipboard_text()
        assert clipboard_text == "Hello, World!"
    
    def test_network_connection(self, driver):
        """网络连接控制"""
        from appium.webdriver.connectiontype import ConnectionType
        
        # 获取当前网络状态
        connection = driver.network_connection
        print(f"当前网络: {connection}")
        
        # 设置为飞行模式
        driver.set_network_connection(ConnectionType.AIRPLANE_MODE)
        
        time.sleep(2)
        
        # 恢复WiFi连接
        driver.set_network_connection(ConnectionType.WIFI_ONLY)
    
    def test_app_management(self, driver):
        """应用管理"""
        # 安装应用
        # driver.install_app('/path/to/app.apk')
        
        # 启动应用
        driver.activate_app('com.example.app')
        
        # 将应用置于后台（3秒）
        driver.background_app(3)
        
        # 检查应用状态
        app_state = driver.query_app_state('com.example.app')
        print(f"应用状态: {app_state}")
        
        # 终止应用
        driver.terminate_app('com.example.app')
        
        # 卸载应用
        # driver.remove_app('com.example.app')
    
    def test_file_operations(self, driver):
        """文件操作"""
        import base64
        
        # 推送文件到设备
        with open('local_file.txt', 'rb') as f:
            file_data = base64.b64encode(f.read()).decode('utf-8')
        
        driver.push_file('/sdcard/remote_file.txt', file_data)
        
        # 从设备拉取文件
        file_data_from_device = driver.pull_file('/sdcard/remote_file.txt')
        decoded_data = base64.b64decode(file_data_from_device)
        
        with open('pulled_file.txt', 'wb') as f:
            f.write(decoded_data)
    
    def test_execute_adb_command(self, driver):
        """执行ADB命令"""
        # 获取设备信息
        result = driver.execute_script('mobile: shell', {
            'command': 'getprop',
            'args': ['ro.product.model']
        })
        print(f"设备型号: {result}")
        
        # 发送广播
        driver.execute_script('mobile: shell', {
            'command': 'am',
            'args': ['broadcast', '-a', 'android.intent.action.BOOT_COMPLETED']
        })


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])
