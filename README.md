<p align="center">
  <img src="https://via.placeholder.com/150x50/007bff/ffffff?text=FlexiProxy+Logo" alt="FlexiProxy Logo">
</p>

<h1 align="center">FlexiProxy</h1>
<p align="center">
  <strong>一个强大灵活的 OpenAI 兼容 API 代理网关</strong>
  <br/>
  <strong>A powerful and flexible OpenAI-Compatible API Proxy Gateway</strong>
</p>

<p align="center">
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
\`\`\`cmd
# Windows CMD
setx ANTHROPIC_AUTH_TOKEN "YOUR_TARGET_PROVIDER_API_KEY"
setx ANTHROPIC_BASE_URL "YOUR_TARGET_PROVIDER_BASE_URL"
\`\`\`
*重启终端或 IDE 后配置生效。也可通过配置文件方式设置，详情请参考项目文档或 Anthropic 官方指南。*

### 📋 支持的平台

FlexiProxy 理论上支持所有提供 **OpenAI-Compatible API** 的模型服务平台，包括但不限于：
-   [DeepSeek](https://www.deepseek.com/)
-   [DeepInfra](https://deepinfra.com/)
-   [Alibaba Qwen](https://bailian.console.aliyun.com/)
-   [xAI Grok](https://x.ai/)
-   *更多平台等待您的探索...*

### ❓ 常见问题

**Q: FlexiProxy 会存储我的 API Key 吗？**
A: 您的源 API Key 是安全加密后用于请求转发的。生成的目标 API Key 是访问您个人适配器的凭证，请像保管源 Key 一样保管它。

**Q: 适配器数量有限制吗？**
A: 是的，目前对免费用户有可创建适配器数量的限制。您可以通过删除不再使用的适配器来释放名额。

**Q: 我丢失了生成的目标 API Key 怎么办？**
A: 在管理面板中，点击对应适配器的 ⚙️ 设置图标，选择"获取 API Key"即可重新生成。旧 Key 将立即失效。

### 📞 联系我们

如果您在使用过程中遇到任何问题或有建议，欢迎通过以下方式联系我们：
-   [创建 GitHub Issue](https://github.com/SanChai20/Flexi-Proxy/issues)
-   邮箱: [您的联系邮箱]

---

## 🇺🇸 English

### 📖 Overview

FlexiProxy is a service proxy based on the OpenAI-Compatible API, designed to provide a unified compatibility layer for various Large Language Model (LLM) provider platforms. It allows users to flexibly switch backend service providers while using their existing LLM clients (e.g., VS Code Cline, Claude Code), effectively addressing issues of high cost or unavailability of model services in specific regions.

**Core Value**: Your Favorite Client + Your Chosen Provider = Seamlessly connected by FlexiProxy.

> **Important Note**: FlexiProxy acts as an intermediate forwarding layer and does not provide LLM services itself. Adapters use the API information you provide for the source platform to make requests to the target platform. All keys and data are under your control.

### ✨ Key Features

-   **🌍 Regional Flexibility**: Easily bypass geo-restrictions and choose more cost-effective model services.
-   **📊 Usage Statistics** (Optional): Request tracking and usage statistics disabled by default, helping you understand consumption.
-   **⚙️ Simple Configuration**: Easily create and manage adapters through an intuitive web interface to map client requests to different provider endpoints.
-   **🔒 Key Security**: Your source API Key is only used for request forwarding and is handled securely. The target API Key is generated and managed by you.
-   **🤝 Broad Compatibility**: Supports any service provider offering an OpenAI-Compatible API (e.g., DeepSeek, DeepInfra, Qwen, xAI Grok, etc.).

### 🚀 Quick Start

#### 1. Create an Adapter

1.  Visit the [FlexiProxy Management Panel](https://flexiproxy.com) (or your deployment URL).
2.  Prepare your **source service** information (OpenAI-Compatible Base URL and API Key). Examples of supported platforms:
    -   **DeepSeek**: `https://api.deepseek.com/v1`
    -   **DeepInfra**: `https://api.deepinfra.com/v1/openai`
    -   **Alibaba Qwen**: `https://dashscope.aliyuncs.com/compatible-mode/v1`
    -   **xAI Grok**: `https://api.x.ai/v1`
    -   *...and any other platform compatible with the OpenAI API.*
3.  In the management panel, select the target provider platform (e.g., Anthropic), and fill in the Base URL and API Key of your source service.
4.  Click create. The system will generate a **dedicated API Key and Base URL for the target platform**. Be sure to copy and securely save this API Key.

#### 2. Use in Your Client

Configure your LLM client using the generated **Target Base URL** and **Target API Key**.

**Example A: VS Code Cline Extension**
-   API Provider: Select your target platform (e.g., `Anthropic`)
-   API Key: Enter the **Target API Key** generated by FlexiProxy
-   Custom Base URL: **Enable** and enter the **Target Base URL** provided by FlexiProxy

**Example B: Claude Code (via Environment Variables)**
\`\`\`cmd
# Windows CMD
setx ANTHROPIC_AUTH_TOKEN "YOUR_TARGET_PROVIDER_API_KEY"
setx ANTHROPIC_BASE_URL "YOUR_TARGET_PROVIDER_BASE_URL"
\`\`\`
*Restart your terminal or IDE for the changes to take effect. Configuration via settings file is also possible; refer to project documentation or Anthropic's official guide for details.*

### 📋 Supported Platforms

FlexiProxy theoretically supports all model service platforms that provide an **OpenAI-Compatible API**, including but not limited to:
-   [DeepSeek](https://www.deepseek.com/)
-   [DeepInfra](https://deepinfra.com/)
-   [Alibaba Qwen](https://bailian.console.aliyun.com/)
-   [xAI Grok](https://x.ai/)
-   *More platforms await your exploration...*

### ❓ FAQ

**Q: Does FlexiProxy store my API Key?**
A: Your source API Key is encrypted and used securely for request forwarding. The generated target API Key is the credential for accessing your personal adapter; please guard it as you would your source Key.

**Q: Is there a limit to the number of adapters?**
A: Yes, there are currently limits on the number of adapters free users can create. You can free up slots by deleting unused adapters.

**Q: What if I lose the generated target API Key?**
A: In the management panel, click the ⚙️ settings icon for the corresponding adapter and select "Get API Key" to regenerate it. The old Key will become invalid immediately.

### 📞 Contact Us

If you encounter any issues or have suggestions, please feel free to contact us:
-   [Create a GitHub Issue](https://github.com/SanChai20/Flexi-Proxy/issues)
-   Email: [Your Contact Email]

---

*最后更新 | Last Updated: 2025年9月14日 | September 14, 2025*
