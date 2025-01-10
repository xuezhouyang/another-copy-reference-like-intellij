# Copy Reference

一个类似于 IntelliJ 的 Copy Reference 功能的 VS Code 扩展。

## 功能

- 复制类和方法的完整引用路径
- 支持 Java 和 Kotlin 文件
- 格式：`包名.类名#方法名` 或 `包名.类名`
- 支持内部类和接口

## 使用方法

1. 将光标放在类名或方法名上
2. 使用以下方式之一复制引用：
   - 使用快捷键：
     - Windows/Linux: `Alt+Shift+C`
     - Mac: `Cmd+Shift+C`
   - 或右键菜单选择 "Copy Reference"

## 示例

```java
// 在以下代码中：
package com.example.demo;

public class MyService {
    public void doSomething() {
        // ...
    }
}

// 光标在类名上时复制结果：
com.example.demo.MyService

// 光标在方法名上时复制结果：
com.example.demo.MyService#doSomething
```

## 要求

- VS Code 版本 1.60.0 或更高
- 文件中必须有正确的 package 声明

## 已知问题

- 暂无

## 更新日志

### 0.0.1

- 初始版本
- 实现基本的复制引用功能
- 支持类名和方法名的复制 