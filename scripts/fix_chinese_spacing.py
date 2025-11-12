#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
中文排版优化脚本
自动在中英文之间添加空格
"""

import re
import os
from pathlib import Path


def fix_spacing(text):
    """
    在中英文之间添加空格
    规则：
    1. 中文字符和英文字母/数字之间加空格
    2. 中文字符和英文标点之间不加空格
    3. 保留代码块和链接中的原始格式
    """
    
    # 保护代码块
    code_blocks = []
    def save_code_block(match):
        code_blocks.append(match.group(0))
        return f"___CODE_BLOCK_{len(code_blocks)-1}___"
    
    # 保存代码块（```包裹的）
    text = re.sub(r'```[\s\S]*?```', save_code_block, text)
    # 保存行内代码（`包裹的）
    text = re.sub(r'`[^`]+`', save_code_block, text)
    # 保存链接
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', save_code_block, text)
    # 保存URL
    text = re.sub(r'https?://[^\s\)]+', save_code_block, text)
    
    # 中文字符范围
    chinese_pattern = r'[\u4e00-\u9fff]'
    # 英文字母和数字
    english_pattern = r'[a-zA-Z0-9]'
    
    # 中文后面跟英文/数字，添加空格
    text = re.sub(
        f'({chinese_pattern})({english_pattern})',
        r'\1 \2',
        text
    )
    
    # 英文/数字后面跟中文，添加空格
    text = re.sub(
        f'({english_pattern})({chinese_pattern})',
        r'\1 \2',
        text
    )
    
    # 中文和左括号之间
    text = re.sub(
        f'({chinese_pattern})([\(\[])',
        r'\1 \2',
        text
    )
    
    # 右括号和中文之间
    text = re.sub(
        f'([\)\]])({chinese_pattern})',
        r'\1 \2',
        text
    )
    
    # 恢复代码块
    for i, code in enumerate(code_blocks):
        text = text.replace(f"___CODE_BLOCK_{i}___", code)
    
    # 清理多余空格
    text = re.sub(r' +', ' ', text)
    
    return text


def process_file(file_path):
    """处理单个文件"""
    print(f"Processing: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 应用空格修复
    fixed_content = fix_spacing(content)
    
    # 如果内容有变化，写回文件
    if fixed_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"  ✓ Updated")
    else:
        print(f"  - No changes needed")


def main():
    """主函数"""
    # 项目根目录
    root_dir = Path(__file__).parent.parent
    
    # 要处理的文件
    files_to_process = [
        root_dir / "README.md",
        root_dir / "CONTRIBUTING.md",
        root_dir / "docs" / "tools-comparison.md",
        root_dir / "docs" / "detection-mechanisms.md",
        root_dir / "docs" / "best-practices.md",
        root_dir / "docs" / "faq.md",
        root_dir / "examples" / "README.md",
    ]
    
    print("🚀 开始优化中文排版...\n")
    
    for file_path in files_to_process:
        if file_path.exists():
            process_file(file_path)
        else:
            print(f"⚠️  文件不存在: {file_path}")
    
    print("\n✅ 所有文件处理完成！")


if __name__ == "__main__":
    main()
