<h1 align="center">FlexiProxy</h1>
<p align="center">
  <strong>一个强大灵活的 OpenAI 兼容 API 代理网关</strong>
  <br/>
  <strong>A powerful and flexible OpenAI-Compatible API Proxy Gateway</strong>
</p>

<p align="center">
  [![GitHub](https://img.shields.io/badge/GitHub-0.7.0-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy)
  [![GitHub](https://img.shields.io/badge/GitHub-0.7.0-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)](https://github.com/SanChai20/Flexi-Proxy)
</p>

<p align="center">
  <a href="#-中文">中文</a> •
  <a href="#-english">English</a>
</p>


---

## 🇨🇳 中文

### 📖 概述

FlexiProxy 是一个基于 OpenAI-Compatible API 的服务代理，旨在为不同的大语言模型（LLM）供应商平台提供统一的兼容适配层。它允许用户在使用现有 LLM 客户端（如 VS Code Cline, Claude Code 等）时，灵活地切换后端服务提供商，有效解决特定区域模型服务昂贵或不可用的问题。

**核心价值**：您喜爱的客户端 + 您选择的供应商 = FlexiProxy 无缝连接。

> **重要提示**：FlexiProxy 作为中间转发层，本身不提供 LLM 服务。适配器使用您提供的源平台 API 信息向目标平台发起请求，所有密钥和数据均由您控制。

### ✨ 主要特性

-   **🌍 区域灵活性**: 轻松绕过地域限制，选择更具性价比的模型服务。
-   **📊 使用统计** (可选): 默认禁用的请求跟踪与用量统计功能，帮助您了解消耗情况。
-   **⚙️ 简单配置**: 通过直观的 Web 界面轻松创建和管理适配器，将客户端请求映射到不同的提供商端点。
-   **🔒 密钥安全**: 您的源 API Key 仅用于服务请求转发，我们会安全处理。目标 API Key 由您自主生成和管理。
-   **🤝 广泛兼容**: 支持任何提供 OpenAI-Compatible API 的服务提供商（如 DeepSeek, DeepInfra, Qwen, xAI Grok 等）。

### 🚀 快速开始

#### 1. 创建适配器

1.  访问 [FlexiProxy 管理面板](https://flexiproxy.com) (或您的部署地址)。
2.  准备好您的**源服务**信息（OpenAI-Compatible Base URL 和 API Key）。支持的平台示例：
    -   **DeepSeek**: `https://api.deepseek.com/v1`
    -   **DeepInfra**: `https://api.deepinfra.com/v1/openai`
    -   **阿里云通义千问**: `https://dashscope.aliyuncs.com/compatible-mode/v1`
    -   **xAI Grok**: `https://api.x.ai/v1`
    -   *...以及其他任何兼容 OpenAI API 的平台*
3.  在管理面板中，选择目标供应商平台（例如 Anthropic），填写源服务的 Base URL 和 API Key。
4.  点击创建，系统将生成一个**目标平台专用的 API Key 和 Base URL**。请务必复制并妥善保存此 API Key。

#### 2. 在客户端中使用

使用生成的 **目标 Base URL** 和 **目标 API Key** 配置您的 LLM 客户端。

**示例 A: VS Code Cline 插件**
-   API Provider: 选择您的目标平台 (如 `Anthropic`)
-   API Key: 填写 FlexiProxy 生成的**目标 API Key**
-   Custom Base URL: **启用**并填写 FlexiProxy 提供的**目标 Base URL**

**示例 B: Claude Code (通过环境变量)**
```cmd
# Windows CMD
setx ANTHROPIC_AUTH_TOKEN "YOUR_TARGET_PROVIDER_API_KEY"
setx ANTHROPIC_BASE_URL "YOUR_TARGET_PROVIDER_BASE_URL"
