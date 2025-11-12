/**
 * AutoJs 基础示例
 * 包含常用功能的使用方法
 */

// ================================
// 1. 基础配置
// ================================

"ui";
auto.waitFor(); // 等待无障碍服务

// 保持屏幕常亮
device.keepScreenOn();

// 调整屏幕亮度
device.setBrightness(100);

// ================================
// 2. 元素查找与点击
// ================================

function basicClickExample() {
    // 通过文本查找并点击
    let loginBtn = text("登录").findOne(5000);
    if (loginBtn) {
        loginBtn.click();
        // 或使用坐标点击（更自然）
        click(loginBtn.bounds().centerX(), loginBtn.bounds().centerY());
    }
    
    // 通过ID查找
    let element = id("com.example:id/button").findOne();
    
    // 通过desc查找
    let descElement = desc("description").findOne();
    
    // 通过className查找
    let classElement = className("android.widget.Button").findOne();
    
    // 组合条件
    let combined = text("确定").className("android.widget.Button").findOne();
}

// ================================
// 3. 文本输入
// ================================

function inputExample() {
    // 方法1: 直接设置文本（快速但可能被检测）
    setText(0, "Hello World");
    
    // 方法2: 使用input函数（模拟键盘输入）
    input("Hello World");
    
    // 方法3: 焦点输入（更自然）
    let inputField = className("android.widget.EditText").findOne();
    inputField.click();
    sleep(500);
    setText("Hello World");
}

// ================================
// 4. 滑动操作
// ================================

function swipeExample() {
    let width = device.width;
    let height = device.height;
    
    // 简单滑动：向上滑动
    swipe(width / 2, height * 0.8, width / 2, height * 0.2, 500);
    
    // 向下滑动
    swipe(width / 2, height * 0.2, width / 2, height * 0.8, 500);
    
    // 向左滑动
    swipe(width * 0.8, height / 2, width * 0.2, height / 2, 500);
    
    // 向右滑动
    swipe(width * 0.2, height / 2, width * 0.8, height / 2, 500);
}

// 模拟人类滑动（带曲线）
function humanSwipe(startX, startY, endX, endY, duration) {
    let steps = random(20, 40);
    let points = [];
    
    // 生成贝塞尔曲线点
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        // 添加随机偏移
        let offsetX = random(-10, 10);
        let offsetY = random(-10, 10);
        let x = startX + (endX - startX) * t + offsetX;
        let y = startY + (endY - startY) * t + offsetY;
        points.push([x, y]);
    }
    
    // 执行滑动
    gesture(duration, points);
}

// ================================
// 5. 图像识别
// ================================

function imageRecognitionExample() {
    // 请求截图权限
    if (!requestScreenCapture()) {
        toast("请求截图权限失败");
        exit();
    }
    
    // 截图
    let screen = captureScreen();
    
    // 保存图片
    images.save(screen, "/sdcard/screenshot.png");
    
    // 查找图片
    let template = images.read("/sdcard/template.png");
    let point = findImage(screen, template, {
        threshold: 0.8,
        region: [0, 0, device.width, device.height / 2]
    });
    
    if (point) {
        toast("找到图片，位置: " + point.x + ", " + point.y);
        click(point.x, point.y);
    } else {
        toast("未找到图片");
    }
    
    // 多点查找
    let points = images.findImage(screen, template, {
        threshold: 0.8,
        max: 5  // 最多找5个
    });
    
    // 释放图片资源
    screen.recycle();
    template.recycle();
}

// ================================
// 6. OCR文字识别
// ================================

function ocrExample() {
    if (!requestScreenCapture()) {
        toast("请求截图权限失败");
        exit();
    }
    
    let screen = captureScreen();
    
    // 识别屏幕上的文字
    let results = ocr.detect(screen);
    
    results.forEach(block => {
        log("识别到文字: " + block.text);
        log("位置: " + JSON.stringify(block.bounds));
    });
    
    // 查找包含特定文字的区域
    let target = results.find(block => block.text.includes("确定"));
    if (target) {
        let bounds = target.bounds;
        click(bounds.centerX(), bounds.centerY());
    }
    
    screen.recycle();
}

// ================================
// 7. 文件操作
// ================================

function fileOperationsExample() {
    let path = "/sdcard/autojs/";
    
    // 创建目录
    files.createWithDirs(path);
    
    // 写入文件
    files.write(path + "test.txt", "Hello AutoJs!");
    
    // 追加内容
    files.append(path + "test.txt", "\nNew line");
    
    // 读取文件
    let content = files.read(path + "test.txt");
    log(content);
    
    // 列出目录
    let fileList = files.listDir(path);
    fileList.forEach(file => {
        log("文件: " + file);
    });
    
    // 删除文件
    files.remove(path + "test.txt");
    
    // 复制文件
    files.copy("/sdcard/source.txt", "/sdcard/dest.txt");
}

// ================================
// 8. HTTP请求
// ================================

function httpExample() {
    // GET请求
    let response = http.get("https://api.example.com/data");
    if (response.statusCode == 200) {
        let data = response.body.json();
        log(JSON.stringify(data));
    }
    
    // POST请求
    let postData = {
        username: "user",
        password: "pass"
    };
    let postResponse = http.post("https://api.example.com/login", postData);
    log(postResponse.body.string());
    
    // 带Headers的请求
    let headers = {
        "User-Agent": "AutoJs/6.0",
        "Authorization": "Bearer token123"
    };
    let customResponse = http.get("https://api.example.com/protected", {
        headers: headers
    });
}

// ================================
// 9. 定时任务
// ================================

function scheduledTaskExample() {
    // 延迟执行
    setTimeout(function() {
        toast("3秒后执行");
    }, 3000);
    
    // 定时执行
    let intervalId = setInterval(function() {
        log("每隔2秒执行一次");
    }, 2000);
    
    // 10秒后停止
    setTimeout(function() {
        clearInterval(intervalId);
    }, 10000);
}

// ================================
// 10. 多线程
// ================================

function threadExample() {
    // 创建线程
    threads.start(function() {
        log("线程1开始");
        sleep(2000);
        log("线程1结束");
    });
    
    threads.start(function() {
        log("线程2开始");
        sleep(1000);
        log("线程2结束");
    });
    
    log("主线程继续执行");
}

// ================================
// 11. Shell命令
// ================================

function shellExample() {
    // 执行Shell命令（需要Root）
    let result = shell("ls /sdcard/", true);
    log(result.result);
    
    // 非Root命令
    let nonRootResult = shell("pm list packages", false);
    log(nonRootResult.result);
    
    // 启动应用
    shell("am start -n com.example.app/.MainActivity", true);
}

// ================================
// 12. 日志与调试
// ================================

function loggingExample() {
    // 不同级别的日志
    console.log("普通日志");
    console.info("信息日志");
    console.warn("警告日志");
    console.error("错误日志");
    
    // 显示日志窗口
    console.show();
    
    // 清除日志
    console.clear();
    
    // 隐藏日志窗口
    console.hide();
}

// ================================
// 13. 实用工具函数
// ================================

// 随机延迟
function randomDelay(min, max) {
    min = min || 1000;
    max = max || 3000;
    sleep(random(min, max));
}

// 安全点击（带重试）
function safeClick(selector, maxRetry) {
    maxRetry = maxRetry || 3;
    for (let i = 0; i < maxRetry; i++) {
        let element = selector.findOne(3000);
        if (element) {
            click(element.bounds().centerX(), element.bounds().centerY());
            return true;
        }
        sleep(1000);
    }
    return false;
}

// 等待元素出现
function waitForElement(selector, timeout) {
    timeout = timeout || 10000;
    let startTime = new Date().getTime();
    
    while (new Date().getTime() - startTime < timeout) {
        if (selector.exists()) {
            return selector.findOne();
        }
        sleep(500);
    }
    return null;
}

// 滚动查找元素
function scrollFindElement(targetText, maxScrolls) {
    maxScrolls = maxScrolls || 10;
    
    for (let i = 0; i < maxScrolls; i++) {
        if (text(targetText).exists()) {
            return text(targetText).findOne();
        }
        // 向上滚动
        swipe(device.width / 2, device.height * 0.8, 
              device.width / 2, device.height * 0.2, 500);
        sleep(1000);
    }
    return null;
}

// ================================
// 14. 完整示例：自动化登录
// ================================

function autoLoginExample() {
    // 启动应用
    launchApp("示例应用");
    sleep(2000);
    
    // 点击登录按钮
    if (safeClick(text("登录"))) {
        log("点击登录按钮成功");
    } else {
        log("未找到登录按钮");
        exit();
    }
    
    sleep(1000);
    
    // 输入用户名
    let usernameField = className("EditText").findOne();
    if (usernameField) {
        usernameField.setText("username");
        randomDelay(500, 1500);
    }
    
    // 输入密码
    let passwordField = className("EditText").find()[1];
    if (passwordField) {
        passwordField.setText("password");
        randomDelay(500, 1500);
    }
    
    // 点击登录
    safeClick(text("确定"));
    
    // 等待登录结果
    sleep(3000);
    
    if (text("登录成功").exists()) {
        toast("登录成功！");
    } else {
        toast("登录失败！");
    }
}

// ================================
// 主程序
// ================================

function main() {
    toast("AutoJs示例脚本开始运行");
    
    // 在这里调用你需要的函数
    // basicClickExample();
    // swipeExample();
    // imageRecognitionExample();
    // autoLoginExample();
    
    toast("脚本执行完毕");
}

// 运行主程序
main();
