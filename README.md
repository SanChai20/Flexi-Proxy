<h1 align="center">FlexiProxy</h1>
<p align="center">
  <strong>一个强大灵活的 OpenAI 兼容 API 代理网关</strong>
  <br/>
  <strong>A powerful and flexible OpenAI-Compatible API Proxy Gateway</strong>
</p>

<div align="center">

[![GitHub](https://img.shields.io/badge/FlexiProxyGateway-0.0.1-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy-Provider)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Website](https://img.shields.io/badge/Website-Active-orange?logo=vercel)](https://flexiproxy.com)

</div>

<p align="center">
  <a href="#-中文">中文</a> •
  <a href="#-english">English</a>
</p>

---

## 🇨🇳 中文

### 📖 概述

FlexiProxy 提供基于 OpenAI-Compatible API 的服务代理，提供可适配超过100+的不同大语言模型（LLM）供应商 的代理服务。它允许用户在使用现有 LLM 客户端（如Claude Code 等）时，灵活地切换后端服务提供商，有效解决特定区域模型服务昂贵或不可用的问题。

**核心价值**：您喜爱的客户端 + 您选择的供应商 = FlexiProxy 

> **重要提示**：FlexiProxy 作为中间转发层，本身不提供 LLM 服务。适配器使用您提供的源平台 API 信息向目标平台发起请求，所有密钥和数据均由您控制。

### ✨ 主要特性

-   **🌍 区域灵活性**: 轻松绕过地域限制，选择更具性价比的模型服务。
-   **📊 使用统计** (可选): 默认禁用的请求跟踪与用量统计功能，帮助您了解消耗情况。
-   **⚙️ 简单配置**: 通过直观的 Web 界面轻松创建和管理代理服务。
-   **🔒 密钥安全**: 您的源 API Key 仅用于服务请求转发，我们会安全处理。目标 API Key 由您自主生成和管理。
-   **🤝 广泛兼容**: 支持任何提供 OpenAI-Compatible API 的服务提供商（如 DeepSeek, DeepInfra, Qwen, xAI Grok 等）。

### 🚀 快速开始

详情请参考网站[说明文档](https://flexiproxy.com/documentation)

### 📞 联系我们

如果您在使用过程中遇到任何问题或有建议，欢迎通过以下方式联系我们：
-   [创建 GitHub Issue](https://github.com/SanChai20/Flexi-Proxy/issues)
-   [网站上联系我们](https://flexiproxy.com/contact)

---

## 🇺🇸 English

### 📖 Overview

FlexiProxy is a service proxy based on the OpenAI-Compatible API, designed to provide a unified compatibility layer for various Large Language Model (LLM) provider platforms. It allows users to flexibly switch backend service providers while using their existing LLM clients (e.g., Claude Code), effectively addressing issues of high cost or unavailability of model services in specific regions.

**Core Value**: Your Favorite Client + Your Chosen Provider = Seamlessly connected by FlexiProxy.

> **Important Note**: FlexiProxy acts as an intermediate forwarding layer and does not provide LLM services itself. Adapters use the API information you provide for the source platform to make requests to the target platform. All keys and data are under your control.

### ✨ Key Features

-   **🌍 Regional Flexibility**: Easily bypass geo-restrictions and choose more cost-effective model services.
-   **📊 Usage Statistics** (Optional): Request tracking and usage statistics disabled by default, helping you understand consumption.
-   **⚙️ Simple Configuration**: Easily create and manage adapters through an intuitive web interface to map client requests to different provider endpoints.
-   **🔒 Key Security**: Your source API Key is only used for request forwarding and is handled securely. The target API Key is generated and managed by you.
-   **🤝 Broad Compatibility**: Supports any service provider offering an OpenAI-Compatible API (e.g., DeepSeek, DeepInfra, Qwen, xAI Grok, etc.).

### 🚀 Quick Start
> See more details, please refer to [website](https://flexiproxy.com/documentation)

### 📞 Contact Us

If you encounter any issues or have suggestions, please feel free to contact us:
-   [Create a GitHub Issue](https://github.com/SanChai20/Flexi-Proxy/issues)
-   [Contact us from website](https://flexiproxy.com/contact)

---

*最后更新 | Last Updated: 2025年9月23日 | September 23, 2025*













