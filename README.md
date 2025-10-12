<h1 align="center">FlexiProxy</h1>
<p align="center">
  <strong>一个简单灵活的大语言模型服务代理网关</strong>
  <br/>
  <strong>A powerful and flexible LLM Proxy Gateway</strong>
</p>

<div align="center">

[![GitHub](https://img.shields.io/badge/FlexiProxyGateway-0.0.1-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy-Gateway)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Website](https://img.shields.io/badge/Website-Active-orange?logo=vercel)](https://flexiproxy.com)

</div>

<p align="center">
  <a href="#-中文">中文</a> •
  <a href="#-english">English</a>
</p>

---

## 中文

### 概述

FlexiProxy 基于 LiteLLM 轻量库提供 LLM 代理服务，支持通过统一接口调用多种大语言模型。它允许用户在使用现有 LLM 客户端（如Claude Code 等）时，灵活地切换后端服务提供商，有效解决特定区域模型服务昂贵或不可用的问题。同样对于只持有一套 API 凭证的用户来说可以借此代理服务体验不同的 LLM 客户端。

### 核心价值

1. 通用服务 - 一个LLM供应商支持多个客户端接入
2. 灵活切换 - 一个客户端可自由选择并切换LLM后端

### 主要特性

-   **🌍 区域灵活性**: 轻松绕过地域限制，选择更具性价比的模型服务
-   **⚙️ 简单配置**: 通过直观的 Web 界面轻松创建和管理代理服务
-   **🔒 密钥安全**: 您的源 API Key 仅用于服务请求转发，我们会安全处理。授权的 API Key 由您自主管理
-   **🤝 广泛兼容**: 支持多个服务提供商（如 DeepInfra, Qwen, xAI Grok 等）

### 快速开始

> **重要提示**：FlexiProxy 作为中间层，本身不提供 LLM 服务。

详情请参考网站[说明文档](https://flexiproxy.com/documentation)

### 联系开发者

如果您在使用过程中遇到任何问题或有建议，欢迎通过以下方式联系开发者：
-   [创建 GitHub Issue](https://github.com/SanChai20/Flexi-Proxy/issues)
-   [网站上联系我们](https://flexiproxy.com/contact)

---

## English

### Overview

FlexiProxy is an LLM proxy service built on the lightweight LiteLLM library, providing a unified interface to access multiple large language models. It allows users to flexibly switch backend providers while using existing LLM clients (such as Claude Code), effectively solving issues like high costs or regional unavailability of certain model services. It also enables users with a single API credential to experience different LLM clients through this proxy service.

### Core Values

1. Universal Service - One LLM provider supports multiple client integrations
2. Flexible Switching - A single client can freely choose and switch between LLM backends

### Key Features

-   **🌍 Regional Flexibility**: Easily bypass regional restrictions and choose more cost-effective model services
-   **⚙️ Simple Configuration**: Intuitive web interface for easy proxy setup and management
-   **🔒 Key Security**: Your original API key is used only for secure request forwarding, and all authorized keys are fully managed by you
-   **🤝 Broad Compatibility**: Supports multiple model providers, such as DeepInfra, Qwen, and xAI Grok

### Quick Start

> Important Note: FlexiProxy acts as an intermediary layer and does not provide LLM services itself.

See more details, please refer to [website](https://flexiproxy.com/documentation)

### Contact the Developer

If you encounter any issues or have suggestions during use, feel free to contact the developer via:
-   [Create a GitHub Issue](https://github.com/SanChai20/Flexi-Proxy/issues)
-   [Contact from website](https://flexiproxy.com/contact)

---

*最后更新 | Last Updated: 2025年10月12日 | Oct. 12, 2025*