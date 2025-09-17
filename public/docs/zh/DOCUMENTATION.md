[![GitHub](https://img.shields.io/badge/GitHub-0.7.0-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy) 

*最后更新：2025年9月14日*

# A. 概述

FlexiProxy 是一个基于 OpenAI-Compatible API 向不同目标供应商平台兼容适配的服务代理。它允许用户在已有LLM客户端下使用不同的后端服务，解决了某些客户端易用但其可用的大语言模型后端服务在某些地区下较为昂贵或无法使用的问题。

# B. 主要特性

- [x] **区域灵活性**：克服区域限制和定价问题
- [x] **数据统计**：可选的使用跟踪和统计（默认禁用）
- [x] **简单配置**：通过适配器将客户端请求映射到提供商端点的简单设置

# C. 用户使用指南

> 适配器使用用户提供的API信息进行后台请求，同时向目标平台API兼容，因此FlexiProxy不会直接提供大语言模型服务，而是作为中间层进行请求转发

## a. 创建适配器

1. 创建适配器前请先准备好现有LLM供应商平台的OpenAI-Compatible Base URL和API Key，以下平台样例可供参考（以官网为准），凡是支持OpenAI-Compatible API的平台都可使用：

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


1. 选择并点击左侧侧边栏中的**管理面板**图标，如果首次创建，会自动跳转至**创建适配器**的页面，根据以上信息可填写**源服务**（**请注意！您提供的 API Key 我们将只用于服务请求**），在**目标服务**处选择目标供应商平台，这里以**Anthropic**为例，填写完毕后点击确认

![](https://flexiproxy.com/screenshots/zh/createadapter.PNG)


3. 创建成功后会生成目标平台可用的**API Key**（将跳转至**API Key**界面），需要用户自行复制和妥善保存，如果后续使用过程中不慎丢失，可以参考**步骤5**

![](https://flexiproxy.com/screenshots/zh/apikey.PNG)


4. 上述步骤完成后点击**返回管理面板**按键，**管理面板**页面中可自行添加新的适配器，同时也会将目标平台可用的**Base URL**展示出来，但是不会显示上一步的**API Key**

![](https://flexiproxy.com/screenshots/zh/management.PNG)


5. 适配器每一行最右方有一个⚙图标，点击后会在弹框中找到如下功能
- **编辑**: 如果**API Key**不慎丢失，可以通过此功能重新生成，重复**步骤3**即可
- **删除**: 删除当前适配器，对于用户创建的适配器存在最大数量限制，如果无法创建新的，请删除原有的


## b. 作为目标平台使用

创建适配器完成后，有两个字段是关键的，一个是**管理面板**中目标平台可用的**Base URL**，另一个是通过**源服务**生成的新的**API Key**，下面以两个常用的LLM客户端为例，举例说明如何使用：

- **Visual Studio Code - Cline插件** (天然支持OpenAI-Compatible API，这里仅用于举例)

    我们继续以**Anthropic**为例，在Cline窗口下方选择**Model/API Provider**，在弹框中按照如下配置:

    - API Provider: **Anthropic**
    - Anthropic API Key: **填写上述步骤生成的API Key** 
    - Use custom base URL: **勾选此选项，然后填写管理面板下的Base URL**

- **Claude Code**

    这里不展开如何安装Claude Code，只说明如何配置。Claude Code通过两种方式来配置**Base URL**和**API Key**，方式一是通过系统环境变量，方式二是通过Claude Code Settings文件配置，详情可以参考Anthropic的[相关文档](https://docs.anthropic.com/en/docs/claude-code/llm-gateway#litellm-configuration)
    
    以Windows系统为例，按照方式一进行配置:

    - 使用Cmd命令行窗口，设置如下变量，并用上述获取到的API Key和Base URL分别代替 YOUR_TARGET_PROVIDER_API_KEY 和 YOUR_TARGET_PROVIDER_BASE_URL
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