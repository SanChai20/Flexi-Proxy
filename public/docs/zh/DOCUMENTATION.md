[![GitHub](https://img.shields.io/badge/GitHub-0.8.2-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy) 

*最后更新：2025年10月21日*

# A. 概述

FlexiProxy 基于 LiteLLM 轻量库提供 LLM 的代理服务，支持通过统一接口调用多种大语言模型。它允许用户在使用现有 LLM 客户端（如Claude Code 等）时，灵活地切换后端服务提供商，有效解决特定区域大模型服务昂贵或不可用的问题。同样对于只持有一套 API 凭证的用户来说可以借此代理服务体验不同的 LLM 客户端。

# B. 主要特性

- [x] **区域灵活性**：克服区域限制和定价问题
- [x] **简单配置**：服务设置简单，轻松获得通行令牌

# C. 用户使用指南

> 代理服务端将使用用户提供的 API 信息进行后台请求，因此FlexiProxy不会直接提供大语言模型服务，而是作为中间层进行请求转发

## a. 创建通行令牌

1. 创建通行令牌前请先准备好现有 LLM 供应商平台的 API Key 以及模型ID，目前提供对以下供应商的支持：

   - [AI/ML API](https://aimlapi.com/)
   - [Anthropic](https://anthropic.com/)
   - [Cerebras](https://cerebras.ai/)
   - [Cohere](https://cohere.com/)
   - [Databricks (Qwen API)](https://databricks.com/)
   - [DeepInfra](https://deepinfra.com/)
   - [Deepgram](https://deepgram.com/)
   - [DeepSeek](https://deepseek.com/)
   - [Fireworks AI](https://fireworks.ai/)
   - [Google AI Studio](https://aistudio.google.com/)
   - [Groq](https://groq.com/)
   - [Jina AI](https://jina.ai/)
   - [Mistral AI](https://mistral.ai/)
   - [OpenRouter](https://openrouter.ai/)
   - [Oracle Cloud Infrastructure (OCI)](https://oracle.com/cloud/)
   - [Perplexity](https://perplexity.ai/)
   - [Sambanova](https://sambanova.ai/)
   - [Together AI](https://together.ai/)
   - [VolcEngine](https://volcengine.com/)
   - [Voyage AI](https://voyageai.com/)
   - [xAI](https://x.ai/)

2. 选择并点击左侧侧边栏中的**通行令牌**图标，如果首次创建，会自动跳转至**创建通行令牌**的页面，在**服务商**处选择代理服务，而后将会自动加载代理服务所支持的供应商和模型，**源服务**处理选择并配置模型信息（**请注意！您提供的 API Key 我们将只用于服务请求**），配置完毕后点击确认，此处以 OpenRouter 供应商为例：

    ![](https://flexiproxy.com/screenshots/zh/create.PNG)

3. 创建成功后会生成代理网关服务商可用的**通行令牌（API Key）**，若创建成功将自动跳转至**令牌管理**界面（同时会展示出 Base URL），此页面下可自行添加新的通行令牌

    ![](https://flexiproxy.com/screenshots/zh/manage.PNG)

4. 通行令牌每一行最右方有一个⚙图标，点击后会在弹框中找到如下功能
   - **编辑**: 如果**源服务** API Key 需要更换，可以通过此功能重新生成通行令牌
   - **删除**: 删除当前通行令牌，对于用户创建的令牌存在最大数量限制，如果无法创建新的，请删除原有的

    ![](https://flexiproxy.com/screenshots/zh/modify.PNG)


## b. 客户端使用

创建令牌完成后，有两个字段是关键的，一个是**Base URL**，另一个是**通行令牌**，下面以 Claude Code 为例，举例说明如何使用：

- **Claude Code**

    > 一些可用于Claude Code的模型：GLM系列、Qwen系列、Gemini系列等

    这里不展开如何安装Claude Code，只说明如何配置。Claude Code通过两种方式来配置**Base URL**和**API Key**，方式一是通过系统环境变量，方式二是通过Claude Code Settings文件配置，详情可以参考Anthropic的[相关文档](https://docs.anthropic.com/en/docs/claude-code/llm-gateway#litellm-configuration)
    
    以Windows系统为例，按照方式一进行配置:

    - 使用Cmd命令行窗口，设置如下变量，并用上述获取到的**通行令牌**和**Base URL**分别代替 YOUR_TARGET_PROVIDER_API_KEY 和 YOUR_TARGET_PROVIDER_BASE_URL
        ```cmd
        setx ANTHROPIC_AUTH_TOKEN "YOUR_TARGET_PROVIDER_API_KEY"
        setx ANTHROPIC_BASE_URL "YOUR_TARGET_PROVIDER_BASE_URL"
        ```
    - 打开一个新的CMD窗口，运行以下命令，检查环境变量是否生效
        ```cmd
        echo %ANTHROPIC_AUTH_TOKEN%
        echo %ANTHROPIC_BASE_URL%
        ```
    - 正常启动Claude Code即可使用

    按照方式二进行配置:

    - 创建.claude目录，并在目录下创建**settings.json**文件，文件内容如下:
        ```json
        {
            "env": {
                "ANTHROPIC_BASE_URL": "YOUR_TARGET_PROVIDER_BASE_URL",
                "ANTHROPIC_AUTH_TOKEN": "YOUR_TARGET_PROVIDER_API_KEY"
            }
        }
        ```
    - 通过**claude**指令启动时，需要指定配置文件
        ```
        claude --settings="./your/path/to/.claude/settings.json"
        ```

其它平台的客户端这里不再列举，如果使用过程中有任何疑问，欢迎联系我们