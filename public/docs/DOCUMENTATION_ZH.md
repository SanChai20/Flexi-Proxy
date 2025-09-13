

# 关于 FlexiProxy

[![GitHub](https://img.shields.io/badge/GitHub-0.5.1-blue?logo=github)](https://github.com/SanChai20/tiny-mcp-host) 

**目录**

- [远程开发](#远程开发)
  - [前置项](#前置项)
  - [远程服务器配置及管理](#远程服务器配置及管理)
    - [A. 通过Remote SSH连接](#a-通过remote-ssh连接)
    - [B. 创建容器](#b-创建容器)
    - [C. 部署Github Repository至Volume](#c-部署github-repository至volume)
    - [D. 打开(附加)容器](#d-打开附加容器)
    - [E. 版本控制](#e-版本控制)
  - [常见问题](#常见问题)
- [本地开发](#本地开发)
  - [方式一. 使用Docker](#方式一-使用docker)
    - [A. 下载Docker Desktop](#a-下载docker-desktop)
    - [B. 安装Docker Desktop](#b-安装docker-desktop)
    - [C. 重启系统](#c-重启系统)
    - [D. 容器中打开工程](#d-容器中打开工程)
    - [E. 版本控制](#e-版本控制-1)
  - [方式二. 使用虚拟环境（推荐）](#方式二-使用虚拟环境推荐)
    - [A. 创建虚拟环境](#a-创建虚拟环境)
    - [B. 激活虚拟环境](#b-激活虚拟环境)
    - [C. Python解释器选择](#c-python解释器选择)
    - [D. 第三方库的安装](#d-第三方库的安装)
    - [E. 同步至requirements.txt](#e-同步至requirementstxt)
    - [F. VS Code推荐插件安装](#f-vs-code推荐插件安装)
    - [G. Ngrok反向代理调试Webhook](#g-ngrok反向代理调试webhook)
- [环境变量的配置与更新](#环境变量的配置与更新)
  - [配置信息](#配置信息)
  - [环境变量的拉取](#环境变量的拉取)
  - [环境变量的更新](#环境变量的更新)
- [其它易用功能](#其它易用功能)
  - [根据依赖文件安装库](#根据依赖文件安装库)
  - [同步本地库至依赖文件](#同步本地库至依赖文件)
  - [启动并查看API文档](#启动并查看api文档)
- [调试相关](#调试相关)
- [开发规范](#开发规范)
  - [REST API](#rest-api)
  - [Python](#python)
- [Vibe Coding](#vibe-coding)
  - [Cline + Qwen](#cline--qwen)
  - [Claude Code + Qwen (推荐)](#claude-code--qwen-推荐)
    - [Windows](#windows)
    - [macOS](#macos)
- [常见问题及解决方法](#常见问题及解决方法)


# 概述



# 目的与用途



# 用户使用说明

## 创建适配器

> 适配器使用用户提供的API信息进行后台请求，同时向目标平台API兼容，因此FlexiProxy不会直接提供大语言模型服务，而是作为中间层进行请求转发

A. 创建适配器前请先准备好现有AI供应商平台的OpenAI-Compatible Base URL和API Key，以下平台样例可供参考（以官网为准），凡是支持OpenAI-Compatible API的平台都可使用：

- [DeepSeek](https://www.deepseek.com/)
    - Base URL: **https://api.deepseek.com/v1**
    - API Key: 前往[此处](https://platform.deepseek.com/)获取
    - 模型 ID: **deepseek-chat**、**deepseek-reasoner**等，详情参考[DeepSeek API文档](https://api-docs.deepseek.com/)

- [DeepInfra](https://deepinfra.com/)
    - Base URL: **https://api.deepinfra.com/v1/openai**
    - API Key: 前往[此处](https://deepinfra.com/dash/api_keys)获取
    - 模型 ID: **openai/gpt-oss-120b**、**zai-org/GLM-4.5**等，详情参考[DeepInfra Models](https://deepinfra.com/models)

- [Alibaba Qwen](https://bailian.console.aliyun.com/)
    - Base URL: **https://dashscope.aliyuncs.com/compatible-mode/v1**
    - API Key: 前往[此处](https://bailian.console.aliyun.com/?tab=model#/api-key)获取
    - 模型 ID: **qwen3-coder-plus**、**qwen-plus**等，详情参考[模型广场](https://bailian.console.aliyun.com/)

- [xAI Grok](https://x.ai/)
    - Base URL: **https://api.x.ai/v1**
    - API Key: 前往[此处](https://console.x.ai/team/default/api-keys)获取
    - 模型 ID: **grok-3**、**grok-4**等，详情参考[xAI 文档](https://docs.x.ai/docs/models)


B. 根据以上信息可填写**源服务**，在**目标服务**处选择目标供应商平台，这里以**Anthropic**为例




C. 






## 获取/复制 API Key

在创建适配器后，




## 作为目标平台使用

创建完成后




# 



# 








## 概述

FlexiProxy 是一个在 OpenAI 兼容客户端和各种 AI 服务提供商之间充当中介的服务。它允许用户在不更改客户端配置的情况下无缝切换不同的 AI 服务提供商，解决了客户端使用方便但服务器端服务在某些地区可能昂贵或不可用的问题。

## 主要特性

- **提供商无关性**：将 OpenAI 兼容的 API 调用转换为可与各种 AI 服务提供商一起使用
- **区域灵活性**：克服区域限制和定价问题
- **数据统计**：可选的使用跟踪和统计（默认禁用）
- **简单配置**：通过适配器将客户端请求映射到提供商端点的简单设置

## 架构

FlexiProxy 由几个核心组件组成：

1. **提供商**：已注册的 AI 服务提供商及其基础 URL
2. **适配器**：客户端配置和提供商配置之间的映射
3. **身份验证**：基于 JWT 的 API 访问身份验证
4. **Redis 存储**：提供商和适配器的持久化存储

## API 端点

### 提供商管理

#### 列出可用提供商
```http
GET /api/providers
```
获取所有已注册提供商的列表。

#### 获取提供商详情
```http
GET /api/providers/{id}
```
通过 ID 获取特定提供商的详细信息。

#### 注册/更新提供商
```http
POST /api/providers/{id}
```
注册新提供商或更新现有提供商。
载荷：
```json
{
  "url": "https://provider-api-endpoint.com"
}
```

#### 删除提供商
```http
DELETE /api/providers/{id}
```
从注册表中删除提供商。

### 适配器管理

#### 创建适配器
```http
POST /api/adapters
```
创建一个新的适配器，将客户端配置映射到提供商。
载荷：
```json
{
  "provider_id": "provider-name",
  "base_url": "https://client-base-url.com",
  "model_id": "model-name"
}
```

#### 列出适配器
```http
GET /api/adapters
```
获取已认证用户的所有适配器。

#### 删除适配器
```http
DELETE /api/adapters
```
删除适配器。
载荷：
```json
{
  "create_time": "timestamp"
}
```

## 工作原理

1. **提供商注册**：管理员使用各自的 API 端点注册 AI 服务提供商
2. **适配器创建**：用户创建适配器，将 OpenAI 兼容的客户端设置映射到特定提供商
3. **请求代理**：当客户端向 FlexiProxy 发出 API 请求时：
   - 验证请求
   - 查找适当的适配器
   - 将请求路由到目标提供商
   - 将提供商的响应返回给客户端

## 身份验证

所有 API 请求都需要在 Authorization 头中使用 Bearer 令牌进行身份验证：
```
Authorization: Bearer <jwt-token>
```

## 配置

FlexiProxy 需要以下环境变量：

- `UPSTASH_REDIS_REST_URL`：用于存储的 Redis 数据库 URL
- `UPSTASH_REDIS_REST_TOKEN`：Redis 身份验证令牌
- 其他 Next.js 和身份验证相关的环境变量

## 数据统计

FlexiProxy 可以选择性地跟踪使用统计信息。此功能默认禁用，可以在设置中启用。启用后，它提供 API 使用模式的见解，并有助于容量规划。

## 使用场景

1. **区域访问**：访问在某些地区可能受限制的 AI 服务
2. **成本优化**：根据定价在提供商之间切换
3. **服务冗余**：当主要服务不可用时故障转移到替代提供商
4. **统一接口**：无论底层提供商如何，都使用一致的 API 接口

## 入门指南

1. 设置所需的环境变量
2. 注册您首选的 AI 服务提供商
3. 为您的客户端配置创建适配器
4. 配置您的 OpenAI 兼容客户端以使用 FlexiProxy 作为其基础 URL
5. 如需要，可在设置中启用数据统计