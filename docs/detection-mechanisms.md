# 平台自动化检测机制深度解析

> 深入剖析移动应用如何检测和防范自动化行为

## 📋 目录

- [检测概述](#检测概述)
- [设备层检测](#设备层检测)
- [运行时检测](#运行时检测)
- [行为模式检测](#行为模式检测)
- [网络层检测](#网络层检测)
- [平台案例分析](#平台案例分析)
- [检测对抗技术](#检测对抗技术)

---

## 🎯 检测概述

### 为什么要检测自动化？

1. **防止滥用** —— 刷量、作弊、垃圾内容
2. **保护用户体验** —— 防止恶意操作
3. **商业利益** —— 防止数据爬取、API 滥用
4. **合规要求** —— 反欺诈、反洗钱

### 检测层次模型

```
┌─────────────────────────────────┐
│ 应用层检测 │ App内部逻辑检测
├─────────────────────────────────┤
│ 网络层检测 │ 流量分析、API签名
├─────────────────────────────────┤
│ 行为层检测 │ 操作模式、时序分析
├─────────────────────────────────┤
│ 运行时检测 │ Hook、调试器、注入
├─────────────────────────────────┤
│ 设备层检测 │ Root、模拟器、USB
└─────────────────────────────────┘
```

---

## 📱 设备层检测

### 1. USB 调试检测

#### 检测方法

```java
// Android - 检测USB调试状态
boolean isDebugEnabled() {
 return Settings.Global.getInt(
 context.getContentResolver(),
 Settings.Global.ADB_ENABLED, 0
 ) == 1;
}
```

```kotlin
// Kotlin版本
fun isAdbEnabled(context: Context): Boolean {
 return Settings.Global.getInt(
 context.contentResolver,
 Settings.Global.ADB_ENABLED, 0
 ) != 0
}
```

#### 对抗方法

- 使用无线 ADB（不需要 USB）
- Hook 系统 API 返回 false
- 使用 Magisk 模块隐藏

---

### 2. Root/越狱检测

#### 检测方法

**Android Root 检测：**

```java
public class RootDetection {
 
 // 方法1: 检查常见Root文件
 public static boolean checkRootFiles() {
 String[] paths = {
 "/system/app/Superuser.apk",
 "/sbin/su",
 "/system/bin/su",
 "/system/xbin/su",
 "/data/local/xbin/su",
 "/data/local/bin/su",
 "/system/sd/xbin/su",
 "/system/bin/failsafe/su",
 "/data/local/su",
 "/su/bin/su"
 };
 
 for (String path : paths) {
 if (new File(path).exists()) return true;
 }
 return false;
 }
 
 // 方法2: 执行su命令
 public static boolean checkSuCommand() {
 Process process = null;
 try {
 process = Runtime.getRuntime().exec("su");
 return true;
 } catch (Exception e) {
 return false;
 } finally {
 if (process != null) process.destroy();
 }
 }
 
 // 方法3: 检查危险属性
 public static boolean checkBuildTags() {
 String buildTags = android.os.Build.TAGS;
 return buildTags != null && buildTags.contains("test-keys");
 }
 
 // 方法4: 检查已安装的危险应用
 public static boolean checkRootApps(Context context) {
 String[] packages = {
 "com.noshufou.android.su",
 "com.thirdparty.superuser",
 "eu.chainfire.supersu",
 "com.koushikdutta.superuser",
 "com.topjohnwu.magisk"
 };
 
 PackageManager pm = context.getPackageManager();
 for (String pkg : packages) {
 try {
 pm.getPackageInfo(pkg, 0);
 return true;
 } catch (PackageManager.NameNotFoundException e) {
 // 继续检查
 }
 }
 return false;
 }
}
```

**iOS 越狱检测：**

```swift
// Swift - 越狱检测
func isJailbroken() -> Bool {
 // 方法1: 检查越狱文件
 let jailbreakPaths = [
 "/Applications/Cydia.app",
 "/Library/MobileSubstrate/MobileSubstrate.dylib",
 "/bin/bash",
 "/usr/sbin/sshd",
 "/etc/apt",
 "/private/var/lib/apt/"
 ]
 
 for path in jailbreakPaths {
 if FileManager.default.fileExists(atPath: path) {
 return true
 }
 }
 
 // 方法2: 检查是否能写入系统目录
 let testPath = "/private/jailbreak_test.txt"
 do {
 try "test".write(toFile: testPath, atomically: true, encoding: .utf8)
 try FileManager.default.removeItem(atPath: testPath)
 return true
 } catch {
 // 无法写入，可能未越狱
 }
 
 // 方法3: 检查Cydia URL Scheme
 if UIApplication.shared.canOpenURL(URL(string: "cydia://")!) {
 return true
 }
 
 return false
}
```

#### 对抗方法

- **Magisk** - 无系统修改的 Root 方案
- **Liberty/Shadow** - 隐藏越狱环境
- **Frida** - Hook 检测函数
- **虚拟化** - 使用 VirtualXposed

---

### 3. 模拟器检测

#### 检测方法

```java
public class EmulatorDetection {
 
 // 方法1: 检查系统属性
 public static boolean checkBuildProperties() {
 Map<String, String> properties = new HashMap<>();
 properties.put("ro.product.model", "sdk");
 properties.put("ro.product.manufacturer", "Genymotion");
 properties.put("ro.hardware", "goldfish");
 properties.put("ro.kernel.qemu", "1");
 
 for (Map.Entry<String, String> entry : properties.entrySet()) {
 String value = getSystemProperty(entry.getKey());
 if (value != null && value.contains(entry.getValue())) {
 return true;
 }
 }
 return false;
 }
 
 // 方法2: 检查电话号码
 public static boolean checkPhoneNumber(Context context) {
 TelephonyManager tm = (TelephonyManager) 
 context.getSystemService(Context.TELEPHONY_SERVICE);
 String phoneNumber = tm.getLine1Number();
 
 String[] emulatorNumbers = {
 "15555215554", "15555215556", "15555215558",
 "15555215560", "15555215562", "15555215564"
 };
 
 for (String number : emulatorNumbers) {
 if (number.equals(phoneNumber)) return true;
 }
 return false;
 }
 
 // 方法3: 检查传感器
 public static boolean checkSensors(Context context) {
 SensorManager sm = (SensorManager) 
 context.getSystemService(Context.SENSOR_SERVICE);
 
 // 真机通常有陀螺仪
 Sensor gyroscope = sm.getDefaultSensor(Sensor.TYPE_GYROSCOPE);
 return gyroscope == null;
 }
 
 // 方法4: 检查CPU架构
 public static boolean checkCpuInfo() {
 try {
 BufferedReader reader = new BufferedReader(
 new FileReader("/proc/cpuinfo")
 );
 String line;
 while ((line = reader.readLine()) != null) {
 if (line.contains("goldfish") || 
 line.contains("ranchu") ||
 line.contains("vbox")) {
 reader.close();
 return true;
 }
 }
 reader.close();
 } catch (IOException e) {
 e.printStackTrace();
 }
 return false;
 }
}
```

#### 对抗方法

- 使用真机
- 修改模拟器属性（Build.prop）
- 使用高级模拟器（Genymotion + ARM 翻译）

---

### 4. 设备指纹检测

#### 采集维度

```java
public class DeviceFingerprint {
 
 public static String generateFingerprint(Context context) {
 StringBuilder fp = new StringBuilder();
 
 // 1. 硬件信息
 fp.append(Build.MANUFACTURER); // 制造商
 fp.append(Build.MODEL); // 型号
 fp.append(Build.BRAND); // 品牌
 fp.append(Build.HARDWARE); // 硬件名称
 fp.append(Build.PRODUCT); // 产品名称
 fp.append(Build.DEVICE); // 设备名称
 
 // 2. 软件信息
 fp.append(Build.VERSION.SDK_INT); // Android版本
 fp.append(Build.VERSION.RELEASE); // 系统版本号
 fp.append(Build.FINGERPRINT); // 构建指纹
 
 // 3. 屏幕信息
 DisplayMetrics dm = context.getResources().getDisplayMetrics();
 fp.append(dm.widthPixels);
 fp.append(dm.heightPixels);
 fp.append(dm.densityDpi);
 
 // 4. 设备ID
 fp.append(getAndroidId(context));
 
 // 5. MAC地址（Android 6.0以下）
 fp.append(getMacAddress());
 
 // 6. 已安装应用列表（哈希）
 fp.append(getInstalledAppsHash(context));
 
 // 7. 传感器列表
 fp.append(getSensorsList(context));
 
 // 8. 电池信息
 fp.append(getBatteryInfo(context));
 
 // 生成MD5哈希
 return md5(fp.toString());
 }
 
 // 检测设备指纹异常
 public static boolean isAnomalous(String fingerprint) {
 // 检查是否在黑名单中
 if (isInBlacklist(fingerprint)) return true;
 
 // 检查是否短时间内出现多个账号
 int accountCount = getAccountCountByFingerprint(fingerprint, 24);
 if (accountCount > 5) return true;
 
 // 检查设备重置频率
 if (isFrequentlyReset(fingerprint)) return true;
 
 return false;
 }
}
```

---

## ⚙️ 运行时检测

### 1. 无障碍服务检测

#### 检测方法

```java
public class AccessibilityDetection {
 
 // 检测是否开启了无障碍服务
 public static boolean isAccessibilityEnabled(Context context) {
 AccessibilityManager am = (AccessibilityManager) 
 context.getSystemService(Context.ACCESSIBILITY_SERVICE);
 
 List<AccessibilityServiceInfo> services = 
 am.getEnabledAccessibilityServiceList(
 AccessibilityServiceInfo.FEEDBACK_ALL_MASK
 );
 
 return !services.isEmpty();
 }
 
 // 检测特定的可疑服务
 public static List<String> getSuspiciousServices(Context context) {
 List<String> suspicious = new ArrayList<>();
 AccessibilityManager am = (AccessibilityManager) 
 context.getSystemService(Context.ACCESSIBILITY_SERVICE);
 
 List<AccessibilityServiceInfo> services = 
 am.getEnabledAccessibilityServiceList(
 AccessibilityServiceInfo.FEEDBACK_ALL_MASK
 );
 
 String[] blacklist = {
 "autojs", "xposed", "auto.js", "tasker",
 "macrodroid", "automation", "autoinput"
 };
 
 for (AccessibilityServiceInfo service : services) {
 String id = service.getId().toLowerCase();
 for (String keyword : blacklist) {
 if (id.contains(keyword)) {
 suspicious.add(service.getId());
 break;
 }
 }
 }
 
 return suspicious;
 }
 
 // 监控无障碍服务状态变化
 public static void monitorAccessibilityChanges(Context context) {
 ContentResolver resolver = context.getContentResolver();
 resolver.registerContentObserver(
 Settings.Secure.getUriFor(
 Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
 ),
 false,
 new ContentObserver(new Handler()) {
 @Override
 public void onChange(boolean selfChange) {
 // 服务状态发生变化
 if (isAccessibilityEnabled(context)) {
 // 触发安全措施
 handleAccessibilityDetected();
 }
 }
 }
 );
 }
}
```

#### 对抗方法

- Hook 检测函数
- 使用私有无障碍服务（不在系统列表中）
- 使用系统级别的自动化（需要 Root）

---

### 2. Hook 框架检测

#### 检测 Xposed

```java
public class XposedDetection {
 
 // 方法1: 检查Xposed相关类
 public static boolean checkXposedClass() {
 try {
 Class.forName("de.robv.android.xposed.XC_MethodHook");
 return true;
 } catch (ClassNotFoundException e) {
 return false;
 }
 }
 
 // 方法2: 检查堆栈
 public static boolean checkStackTrace() {
 try {
 throw new Exception();
 } catch (Exception e) {
 for (StackTraceElement element : e.getStackTrace()) {
 if (element.getClassName().contains("xposed")) {
 return true;
 }
 }
 }
 return false;
 }
 
 // 方法3: 检查已安装应用
 public static boolean checkXposedInstaller(Context context) {
 String[] packages = {
 "de.robv.android.xposed.installer",
 "io.va.exposed",
 "org.meowcat.edxposed.manager"
 };
 
 PackageManager pm = context.getPackageManager();
 for (String pkg : packages) {
 try {
 pm.getPackageInfo(pkg, 0);
 return true;
 } catch (PackageManager.NameNotFoundException e) {
 // 继续检查
 }
 }
 return false;
 }
 
 // 方法4: 检查系统目录
 public static boolean checkXposedFiles() {
 String[] paths = {
 "/system/lib/libxposed_art.so",
 "/system/lib64/libxposed_art.so",
 "/system/framework/XposedBridge.jar"
 };
 
 for (String path : paths) {
 if (new File(path).exists()) return true;
 }
 return false;
 }
}
```

#### 检测 Frida

```java
public class FridaDetection {
 
 // 方法1: 检查默认端口
 public static boolean checkFridaPort() {
 int[] ports = {27042, 27043};
 for (int port : ports) {
 try {
 Socket socket = new Socket();
 socket.connect(new InetSocketAddress("127.0.0.1", port), 100);
 socket.close();
 return true;
 } catch (IOException e) {
 // 端口未开放
 }
 }
 return false;
 }
 
 // 方法2: 检查进程
 public static boolean checkFridaProcess() {
 try {
 BufferedReader reader = new BufferedReader(
 new InputStreamReader(
 Runtime.getRuntime().exec("ps").getInputStream()
 )
 );
 String line;
 while ((line = reader.readLine()) != null) {
 if (line.contains("frida-server") || 
 line.contains("frida-agent")) {
 reader.close();
 return true;
 }
 }
 reader.close();
 } catch (IOException e) {
 e.printStackTrace();
 }
 return false;
 }
 
 // 方法3: 检查加载的库
 public static boolean checkLoadedLibraries() {
 try {
 BufferedReader reader = new BufferedReader(
 new FileReader("/proc/self/maps")
 );
 String line;
 while ((line = reader.readLine()) != null) {
 if (line.contains("frida") || 
 line.contains("gum-js-loop") ||
 line.contains("frida-agent")) {
 reader.close();
 return true;
 }
 }
 reader.close();
 } catch (IOException e) {
 e.printStackTrace();
 }
 return false;
 }
 
 // 方法4: D-Bus检测
 public static boolean checkDBus() {
 File dbus = new File("/data/local/tmp/frida-server");
 return dbus.exists();
 }
}
```

---

### 3. 调试器检测

```java
public class DebuggerDetection {
 
 // 方法1: 检查Debug标志
 public static boolean isDebuggerConnected() {
 return Debug.isDebuggerConnected() || Debug.waitingForDebugger();
 }
 
 // 方法2: 检查TracerPid
 public static boolean checkTracerPid() {
 try {
 BufferedReader reader = new BufferedReader(
 new FileReader("/proc/self/status")
 );
 String line;
 while ((line = reader.readLine()) != null) {
 if (line.startsWith("TracerPid:")) {
 String[] parts = line.split(":");
 int pid = Integer.parseInt(parts[1].trim());
 reader.close();
 return pid != 0; // 0表示未被调试
 }
 }
 reader.close();
 } catch (IOException e) {
 e.printStackTrace();
 }
 return false;
 }
 
 // 方法3: 时间差检测
 public static boolean checkTimingAttack() {
 long start = System.currentTimeMillis();
 // 执行一些简单操作
 for (int i = 0; i < 1000; i++) {
 Math.sqrt(i);
 }
 long end = System.currentTimeMillis();
 
 // 如果时间差异过大，可能在单步调试
 return (end - start) > 100;
 }
 
 // 方法4: 反调试线程
 public static void startAntiDebugThread() {
 new Thread(() -> {
 while (true) {
 try {
 Thread.sleep(1000);
 if (isDebuggerConnected() || checkTracerPid()) {
 // 触发安全措施
 handleDebuggerDetected();
 }
 } catch (InterruptedException e) {
 break;
 }
 }
 }).start();
 }
}
```

---

## 🎭 行为模式检测

### 1. 操作速度检测

```java
public class BehaviorAnalyzer {
 
 private List<Long> clickTimestamps = new ArrayList<>();
 private List<Long> swipeTimestamps = new ArrayList<>();
 
 // 记录点击事件
 public void recordClick() {
 clickTimestamps.add(System.currentTimeMillis());
 
 // 检测异常快速点击
 if (clickTimestamps.size() >= 2) {
 int size = clickTimestamps.size();
 long interval = clickTimestamps.get(size - 1) - 
 clickTimestamps.get(size - 2);
 
 // 人类点击间隔通常 > 100ms
 if (interval < 100) {
 flagAsSuspicious("点击速度异常");
 }
 }
 
 // 检测规律性
 if (clickTimestamps.size() >= 10) {
 if (isIntervalTooRegular(clickTimestamps)) {
 flagAsSuspicious("点击间隔过于规律");
 }
 }
 }
 
 // 检测间隔规律性
 private boolean isIntervalTooRegular(List<Long> timestamps) {
 if (timestamps.size() < 10) return false;
 
 List<Long> intervals = new ArrayList<>();
 for (int i = 1; i < timestamps.size(); i++) {
 intervals.add(timestamps.get(i) - timestamps.get(i - 1));
 }
 
 // 计算标准差
 double stdDev = calculateStdDev(intervals);
 
 // 如果标准差过小，说明间隔过于规律
 return stdDev < 50; // 阈值可调整
 }
 
 private double calculateStdDev(List<Long> values) {
 double mean = values.stream()
 .mapToLong(Long::longValue)
 .average()
 .orElse(0.0);
 
 double variance = values.stream()
 .mapToDouble(v -> Math.pow(v - mean, 2))
 .average()
 .orElse(0.0);
 
 return Math.sqrt(variance);
 }
}
```

### 2. 轨迹特征分析

```java
public class TouchTrajectoryAnalyzer {
 
 private List<PointF> touchPoints = new ArrayList<>();
 
 public void recordTouchPoint(float x, float y) {
 touchPoints.add(new PointF(x, y));
 }
 
 // 分析滑动轨迹
 public boolean isTrajectoryNatural() {
 if (touchPoints.size() < 10) return true;
 
 // 1. 检查轨迹是否过于直线
 if (isTooStraight()) return false;
 
 // 2. 检查速度变化
 if (isVelocityUnnatural()) return false;
 
 // 3. 检查加速度
 if (isAccelerationUnnatural()) return false;
 
 return true;
 }
 
 // 检测是否过于直线
 private boolean isTooStraight() {
 if (touchPoints.size() < 3) return false;
 
 // 计算点到直线的平均距离
 PointF start = touchPoints.get(0);
 PointF end = touchPoints.get(touchPoints.size() - 1);
 
 double totalDeviation = 0;
 for (int i = 1; i < touchPoints.size() - 1; i++) {
 PointF point = touchPoints.get(i);
 double distance = distanceToLine(point, start, end);
 totalDeviation += distance;
 }
 
 double avgDeviation = totalDeviation / (touchPoints.size() - 2);
 
 // 真实滑动通常有一定偏移
 return avgDeviation < 5.0;
 }
 
 // 点到直线距离
 private double distanceToLine(PointF point, PointF lineStart, PointF lineEnd) {
 double A = point.x - lineStart.x;
 double B = point.y - lineStart.y;
 double C = lineEnd.x - lineStart.x;
 double D = lineEnd.y - lineStart.y;
 
 double dot = A * C + B * D;
 double lenSq = C * C + D * D;
 double param = -1;
 
 if (lenSq != 0) param = dot / lenSq;
 
 double xx, yy;
 
 if (param < 0) {
 xx = lineStart.x;
 yy = lineStart.y;
 } else if (param > 1) {
 xx = lineEnd.x;
 yy = lineEnd.y;
 } else {
 xx = lineStart.x + param * C;
 yy = lineStart.y + param * D;
 }
 
 double dx = point.x - xx;
 double dy = point.y - yy;
 
 return Math.sqrt(dx * dx + dy * dy);
 }
}
```

### 3. 时序模式识别

```python
# Python - 机器学习方式检测异常行为
import numpy as np
from sklearn.ensemble import IsolationForest

class BehaviorDetector:
 def __init__(self):
 self.model = IsolationForest(contamination=0.1, random_state=42)
 self.feature_buffer = []
 
 def extract_features(self, user_actions):
 """提取行为特征"""
 features = []
 
 # 1. 时间间隔统计
 intervals = np.diff([a['timestamp'] for a in user_actions])
 features.extend([
 np.mean(intervals), # 平均间隔
 np.std(intervals), # 标准差
 np.min(intervals), # 最小间隔
 np.max(intervals) # 最大间隔
 ])
 
 # 2. 操作类型分布
 action_types = [a['type'] for a in user_actions]
 type_counts = {
 'click': action_types.count('click'),
 'swipe': action_types.count('swipe'),
 'input': action_types.count('input')
 }
 features.extend(type_counts.values())
 
 # 3. 坐标分布
 coords = [(a.get('x', 0), a.get('y', 0)) for a in user_actions]
 x_coords = [c[0] for c in coords]
 y_coords = [c[1] for c in coords]
 features.extend([
 np.mean(x_coords),
 np.std(x_coords),
 np.mean(y_coords),
 np.std(y_coords)
 ])
 
 # 4. 操作序列熵（随机性）
 entropy = self.calculate_entropy(action_types)
 features.append(entropy)
 
 return np.array(features)
 
 def calculate_entropy(self, sequence):
 """计算序列熵"""
 from collections import Counter
 counts = Counter(sequence)
 probabilities = [count / len(sequence) for count in counts.values()]
 return -sum(p * np.log2(p) for p in probabilities if p > 0)
 
 def is_bot(self, user_actions):
 """判断是否为自动化行为"""
 features = self.extract_features(user_actions)
 prediction = self.model.predict([features])[0]
 return prediction == -1 # -1表示异常
```

---

## 🌐 网络层检测

### 1. API 签名验证

```java
public class ApiSignature {
 
 // 生成请求签名
 public static String generateSignature(Map<String, String> params, 
 String secret, 
 long timestamp) {
 // 1. 参数排序
 TreeMap<String, String> sortedParams = new TreeMap<>(params);
 
 // 2. 拼接字符串
 StringBuilder sb = new StringBuilder();
 for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
 sb.append(entry.getKey())
 .append("=")
 .append(entry.getValue())
 .append("&");
 }
 sb.append("timestamp=").append(timestamp);
 sb.append("&secret=").append(secret);
 
 // 3. 计算哈希
 return sha256(sb.toString());
 }
 
 // 验证签名
 public static boolean verifySignature(HttpServletRequest request, 
 String secret) {
 // 获取客户端签名
 String clientSignature = request.getHeader("X-Signature");
 String timestampStr = request.getHeader("X-Timestamp");
 
 if (clientSignature == null || timestampStr == null) {
 return false;
 }
 
 long timestamp = Long.parseLong(timestampStr);
 long currentTime = System.currentTimeMillis();
 
 // 检查时间戳（防重放攻击）
 if (Math.abs(currentTime - timestamp) > 5 * 60 * 1000) {
 return false; // 超过5分钟
 }
 
 // 重新计算签名
 Map<String, String> params = extractParams(request);
 String serverSignature = generateSignature(params, secret, timestamp);
 
 // 比较签名
 return serverSignature.equals(clientSignature);
 }
 
 // 设备指纹 + 签名
 public static String generateDeviceSignature(Context context, 
 String apiKey) {
 StringBuilder data = new StringBuilder();
 
 // 设备信息
 data.append(Build.MANUFACTURER);
 data.append(Build.MODEL);
 data.append(Settings.Secure.getString(
 context.getContentResolver(),
 Settings.Secure.ANDROID_ID
 ));
 
 // App信息
 data.append(context.getPackageName());
 data.append(getAppVersionCode(context));
 
 // 时间戳
 data.append(System.currentTimeMillis() / 1000);
 
 // API密钥
 data.append(apiKey);
 
 return sha256(data.toString());
 }
}
```

### 2. 请求频率限制

```python
# Python - Redis实现的速率限制
import redis
import time
from functools import wraps

class RateLimiter:
 def __init__(self, redis_client):
 self.redis = redis_client
 
 def check_rate_limit(self, user_id, action, max_requests, time_window):
 """
 检查是否超过速率限制
 :param user_id: 用户ID
 :param action: 操作类型
 :param max_requests: 时间窗口内最大请求数
 :param time_window: 时间窗口（秒）
 :return: (是否允许, 剩余配额, 重置时间)
 """
 key = f"rate_limit:{user_id}:{action}"
 current_time = int(time.time())
 
 # 使用滑动窗口算法
 pipe = self.redis.pipeline()
 pipe.zremrangebyscore(key, 0, current_time - time_window)
 pipe.zadd(key, {str(current_time): current_time})
 pipe.zcount(key, current_time - time_window, current_time)
 pipe.expire(key, time_window)
 
 results = pipe.execute()
 request_count = results[2]
 
 allowed = request_count <= max_requests
 remaining = max(0, max_requests - request_count)
 reset_time = current_time + time_window
 
 return allowed, remaining, reset_time
 
 def rate_limit(self, max_requests=100, time_window=60):
 """装饰器：API速率限制"""
 def decorator(func):
 @wraps(func)
 def wrapper(user_id, *args, **kwargs):
 action = func.__name__
 allowed, remaining, reset_time = self.check_rate_limit(
 user_id, action, max_requests, time_window
 )
 
 if not allowed:
 raise Exception(f"Rate limit exceeded. Reset at {reset_time}")
 
 return func(user_id, *args, **kwargs)
 return wrapper
 return decorator

# 使用示例
redis_client = redis.Redis(host='localhost', port=6379, db=0)
limiter = RateLimiter(redis_client)

@limiter.rate_limit(max_requests=10, time_window=60)
def post_content(user_id, content):
 # 发布内容的逻辑
 pass
```

### 3. TLS 指纹识别

```python
# Python - TLS指纹检测
import ssl
import socket

def get_tls_fingerprint(hostname, port=443):
 """获取TLS指纹"""
 context = ssl.create_default_context()
 
 with socket.create_connection((hostname, port)) as sock:
 with context.wrap_socket(sock, server_hostname=hostname) as ssock:
 # 获取密码套件
 cipher = ssock.cipher()
 
 # 获取证书
 cert = ssock.getpeercert()
 
 # 获取协议版本
 version = ssock.version()
 
 fingerprint = {
 'cipher': cipher,
 'version': version,
 'cert_subject': cert.get('subject'),
 'cert_issuer': cert.get('issuer')
 }
 
 return fingerprint

# 检测常见自动化工具的TLS特征
def detect_automation_client(tls_fingerprint):
 """检测自动化客户端"""
 suspicious_signs = []
 
 # Python requests库特征
 if 'TLS_RSA' in tls_fingerprint.get('cipher', [''])[0]:
 suspicious_signs.append('可能使用Python requests')
 
 # 缺少某些现代浏览器的TLS扩展
 # 这需要更底层的分析（如使用Wireshark）
 
 return len(suspicious_signs) > 0, suspicious_signs
```

---

## 🎯 平台案例分析

### 1. TikTok/抖音

#### 检测策略

```java
// 抖音的多层检测体系
public class DouyinSecurityCheck {
 
 // 1. 设备风控
 public DeviceRiskLevel checkDevice(Context context) {
 int riskScore = 0;
 
 // Root检测
 if (RootDetection.isRooted()) riskScore += 30;
 
 // 模拟器检测
 if (EmulatorDetection.isEmulator(context)) riskScore += 40;
 
 // Xposed检测
 if (XposedDetection.isXposedInstalled(context)) riskScore += 35;
 
 // 设备指纹异常
 if (DeviceFingerprint.isAnomalous(context)) riskScore += 25;
 
 if (riskScore >= 70) return DeviceRiskLevel.HIGH;
 if (riskScore >= 40) return DeviceRiskLevel.MEDIUM;
 return DeviceRiskLevel.LOW;
 }
 
 // 2. 行为风控
 public BehaviorRiskLevel checkBehavior(UserSession session) {
 int riskScore = 0;
 
 // 操作频率异常
 if (session.getActionsPerMinute() > 30) riskScore += 25;
 
 // 视频观看时长过短
 if (session.getAvgWatchTime() < 3000) riskScore += 20;
 
 // 点赞/关注比例异常
 if (session.getLikeFollowRatio() > 0.8) riskScore += 30;
 
 // 滑动轨迹异常
 if (!session.isTrajectoryNatural()) riskScore += 35;
 
 if (riskScore >= 60) return BehaviorRiskLevel.HIGH;
 if (riskScore >= 30) return BehaviorRiskLevel.MEDIUM;
 return BehaviorRiskLevel.LOW;
 }
 
 // 3. 网络风控
 public NetworkRiskLevel checkNetwork(HttpRequest request) {
 int riskScore = 0;
 
 // 代理检测
 if (ProxyDetection.isProxy(request)) riskScore += 40;
 
 // IP信誉
 if (IPReputation.isSuspicious(request.getIP())) riskScore += 30;
 
 // 请求签名验证失败
 if (!ApiSignature.verify(request)) riskScore += 50;
 
 // User-Agent异常
 if (!UserAgentValidator.isValid(request)) riskScore += 20;
 
 if (riskScore >= 70) return NetworkRiskLevel.HIGH;
 if (riskScore >= 40) return NetworkRiskLevel.MEDIUM;
 return NetworkRiskLevel.LOW;
 }
}
```

### 2. Instagram/Facebook

#### 检测特点

- **社交图谱分析** - 检测批量注册、批量关注
- **行为生物识别** - 打字节奏、鼠标移动模式
- **设备关联** - 同一设备多账号
- **IP 归属** - IP 地理位置与账号注册信息不符

### 3. 电商平台（淘宝/京东）

#### 滑块验证码

```javascript
// 前端 - 滑块轨迹记录
class SliderCaptcha {
 constructor() {
 this.trajectory = [];
 this.startTime = 0;
 }
 
 onSliderStart(e) {
 this.startTime = Date.now();
 this.trajectory = [];
 this.recordPoint(e.clientX, e.clientY);
 }
 
 onSliderMove(e) {
 this.recordPoint(e.clientX, e.clientY);
 }
 
 recordPoint(x, y) {
 this.trajectory.push({
 x: x,
 y: y,
 t: Date.now() - this.startTime
 });
 }
 
 verify() {
 return {
 trajectory: this.trajectory,
 duration: Date.now() - this.startTime,
 fingerprint: this.getDeviceFingerprint()
 };
 }
 
 getDeviceFingerprint() {
 return {
 userAgent: navigator.userAgent,
 screenResolution: `${screen.width}x${screen.height}`,
 timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
 language: navigator.language,
 platform: navigator.platform,
 hardwareConcurrency: navigator.hardwareConcurrency,
 deviceMemory: navigator.deviceMemory,
 canvas: this.getCanvasFingerprint(),
 webgl: this.getWebGLFingerprint()
 };
 }
}
```

---

## 🛡️ 检测对抗技术

### 1. Hook 技术

```javascript
// Frida脚本 - Hook Root检测
Java.perform(function() {
 // Hook File.exists()
 var File = Java.use("java.io.File");
 File.exists.implementation = function() {
 var path = this.getAbsolutePath();
 
 // Root相关路径返回false
 if (path.indexOf("/su") >= 0 || 
 path.indexOf("Superuser") >= 0 ||
 path.indexOf("magisk") >= 0) {
 console.log("[*] Blocked Root check: " + path);
 return false;
 }
 
 return this.exists();
 };
 
 // Hook Runtime.exec()
 var Runtime = Java.use("java.lang.Runtime");
 Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
 if (cmd.indexOf("su") >= 0) {
 console.log("[*] Blocked command: " + cmd);
 throw new Error("su: not found");
 }
 return this.exec(cmd);
 };
});
```

### 2. 虚拟化技术

使用 VirtualXposed、太极等工具，在虚拟环境中运行：

- 无需 Root
- 隔离环境
- 降低检测风险

### 3. 模拟真实行为

```python
import random
import time
import numpy as np

class HumanSimulator:
 """模拟真实人类操作"""
 
 def random_delay(self, min_ms=500, max_ms=3000):
 """随机延迟（正态分布）"""
 mean = (min_ms + max_ms) / 2
 std = (max_ms - min_ms) / 6
 delay = np.random.normal(mean, std)
 delay = max(min_ms, min(max_ms, delay))
 time.sleep(delay / 1000)
 
 def generate_natural_trajectory(self, start, end, duration_ms=500):
 """生成自然的滑动轨迹（贝塞尔曲线）"""
 points = []
 steps = int(duration_ms / 16) # 60fps
 
 # 生成控制点
 cp1 = (
 start[0] + random.randint(-50, 50),
 start[1] + random.randint(-50, 50)
 )
 cp2 = (
 end[0] + random.randint(-50, 50),
 end[1] + random.randint(-50, 50)
 )
 
 # 贝塞尔曲线插值
 for i in range(steps):
 t = i / steps
 x = (1-t)**3 * start[0] + \
 3 * (1-t)**2 * t * cp1[0] + \
 3 * (1-t) * t**2 * cp2[0] + \
 t**3 * end[0]
 y = (1-t)**3 * start[1] + \
 3 * (1-t)**2 * t * cp1[1] + \
 3 * (1-t) * t**2 * cp2[1] + \
 t**3 * end[1]
 
 points.append((int(x), int(y)))
 
 return points
 
 def simulate_typing(self, text):
 """模拟打字（包含错误和修正）"""
 result = ""
 for char in text:
 # 5%概率打错
 if random.random() < 0.05:
 wrong_char = random.choice('qwertyuiop')
 result += wrong_char
 time.sleep(random.uniform(0.1, 0.2))
 # 按退格
 result = result[:-1]
 time.sleep(random.uniform(0.05, 0.1))
 
 result += char
 # 打字速度变化
 time.sleep(random.uniform(0.08, 0.25))
 
 return result
 
 def simulate_reading(self, content_length):
 """模拟阅读时间"""
 # 平均阅读速度: 200-300字/分钟
 words_per_second = random.uniform(3, 5)
 reading_time = content_length / words_per_second
 
 # 添加随机性
 actual_time = reading_time * random.uniform(0.8, 1.5)
 time.sleep(actual_time)
```

---

## 📊 检测对抗进化

### 攻防演进

```
第一代：简单特征检测
 - 检测Root、模拟器
 - 检测USB调试
 ↓
 对抗：Magisk、修改build.prop
 ↓

第二代：运行时检测
 - 检测Xposed、Frida
 - 检测无障碍服务
 ↓
 对抗：虚拟化、高级Hook
 ↓

第三代：行为分析
 - 操作速度、轨迹分析
 - 机器学习模型
 ↓
 对抗：模拟真实行为、对抗样本
 ↓

第四代：生物识别
 - 打字节奏、鼠标模式
 - 多维度融合
 ↓
 对抗：深度学习生成行为
 ↓

第五代（未来）：零信任架构
 - 持续验证
 - 风险评分系统
```

---

## ⚖️ 合规建议

1. **优先使用官方 API**
2. **遵守平台服务条款**
3. **透明的用户告知**
4. **合理的请求频率**
5. **保护用户隐私**

---

[← 返回：工具对比](./tools-comparison.md) | [下一章: 最佳实践 →](./best-practices.md)
