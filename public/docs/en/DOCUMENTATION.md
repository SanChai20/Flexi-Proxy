[![GitHub](https://img.shields.io/badge/GitHub-0.7.0-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy)

*Last updated: September 27, 2025*

# A. Overview

FlexiProxy is a service proxy that provides OpenAI-Compatible API compatibility for different target supplier platforms. It allows users to use different backend services under existing LLM clients, solving the problem of expensive or unavailable large language model backend services in certain regions for clients that are easy to use.

# B. Key Features

- [x] **Regional Flexibility**: Overcome regional restrictions and pricing issues
- [x] **Data Statistics**: Optional usage tracking and statistics (disabled by default)
- [x] **Simple Configuration**: Easy setup for mapping client requests to provider endpoints through adapters

# C. User Guide

> The adapter uses user-provided API information for background requests while maintaining compatibility with target platform APIs. Therefore, FlexiProxy does not directly provide large language model services but acts as an intermediary for request forwarding.

## a. Creating an Adapter

1. Before creating an adapter, prepare the OpenAI-Compatible Base URL and API Key of your existing LLM supplier platform. The following platform examples are for reference (based on official websites). Any platform that supports the OpenAI-Compatible API can be used:

- [DeepSeek](https://www.deepseek.com/)
    - Base URL: **https://api.deepseek.com/v1**
    - API Key: Obtain [here](https://platform.deepseek.com/)
    - Model IDs: **deepseek-chat**, **deepseek-reasoner**, etc. See [DeepSeek API Documentation](https://api-docs.deepseek.com/) for details

- [DeepInfra](https://deepinfra.com/)
    - Base URL: **https://api.deepinfra.com/v1/openai**
    - API Key: Obtain [here](https://deepinfra.com/dash/api_keys)
    - Model IDs: **openai/gpt-oss-120b**, **zai-org/GLM-4.5**, etc. See [DeepInfra Models](https://deepinfra.com/models) for details

- [Alibaba Qwen](https://bailian.console.aliyun.com/)
    - Base URL: **https://dashscope.aliyuncs.com/compatible-mode/v1**
    - API Key: Obtain [here](https://bailian.console.aliyun.com/?tab=model#/api-key)
    - Model IDs: **qwen3-coder-plus**, **qwen-plus**, etc. See [Model Square](https://bailian.console.aliyun.com/) for details

- [xAI Grok](https://x.ai/)
    - Base URL: **https://api.x.ai/v1**
    - API Key: Obtain [here](https://console.x.ai/team/default/api-keys)
    - Model IDs: **grok-3**, **grok-4**, etc. See [xAI Documentation](https://docs.x.ai/docs/models) for details


2. Select and click the **Management** icon in the left sidebar. If creating for the first time, you will be automatically redirected to the **Create Adapter** page. Based on the above information, you can fill in the **SOURCE** (**Note! The API Key you provide only used for service requests**). Select the target supplier platform under **TARGET**. Here we use **Anthropic** as an example. After filling in the information, click confirm.

![](https://flexiproxy.com/screenshots/en/createadapter.PNG)


3. After successful creation, a target platform available **API Key** will be generated (you will be redirected to the **API Key** interface). Users need to copy and properly save it. If accidentally lost during subsequent use, refer to **Step 5**.

![](https://flexiproxy.com/screenshots/en/apikey.PNG)


4. After completing the above steps, click the **Back to Management** button. The **Management** page allows you to add new adapters, and will also display the target platform available **Base URL**, but will not show the **API Key** from the previous step.

![](https://flexiproxy.com/screenshots/en/management.PNG)


5. There is a ⚙ icon at the far right of each adapter row. Clicking it will reveal the following functions in a popup:
- **Edit**: If the **API Key** is accidentally lost, you can regenerate it through this function, repeating **Step 3**
- **Delete**: Delete the current adapter. There is a maximum limit for user-created adapters. If you cannot create new ones, please delete existing ones

## b. Using as Target Platform

After completing adapter creation, two fields are key: one is the target platform available **Base URL** in the **Management**, and the other is the new **API Key** generated through the **SOURCE**. Below are examples using two common LLM clients to illustrate how to use them:

- **Visual Studio Code - Cline Plugin** (naturally supports OpenAI-Compatible API, used here for example purposes)

    Continuing with **Anthropic** as an example, select **Model/API Provider** in the Cline window below, and configure as follows in the popup:

    - API Provider: **Anthropic**
    - Anthropic API Key: **Fill in the API Key generated from the above steps**
    - Use custom base URL: **Check this option, then fill in the Base URL from the management panel**

- **Claude Code**

    We won't elaborate on how to install Claude Code, only explaining how to configure it. Claude Code configures **Base URL** and **API Key** through two methods: Method one is through system environment variables, and method two is through the Claude Code Settings file. For details, refer to Anthropic's [relevant documentation](https://docs.anthropic.com/en/docs/claude-code/llm-gateway#litellm-configuration)

    Using Windows system as an example, configuring via method one:

    - Using Cmd command line window, set the following variables, replacing YOUR_TARGET_PROVIDER_API_KEY and YOUR_TARGET_PROVIDER_BASE_URL with the API Key and Base URL obtained above
        ```cmd
        setx ANTHROPIC_AUTH_TOKEN "YOUR_TARGET_PROVIDER_API_KEY"
        setx ANTHROPIC_BASE_URL "YOUR_TARGET_PROVIDER_BASE_URL"
        ```
    - Open a new CMD window and run the following commands to check if environment variables are effective
        ```cmd
        echo %ANTHROPIC_AUTH_TOKEN%
        echo %ANTHROPIC_BASE_URL%
        ```
    - Start Claude Code normally to use it

    Configuring via method two:

    - Create a .claude directory and create a **settings.json** file in the directory with the following content:
        ```json
        {
            "env": {
                "ANTHROPIC_BASE_URL": "YOUR_TARGET_PROVIDER_BASE_URL",
                "ANTHROPIC_AUTH_TOKEN": "YOUR_TARGET_PROVIDER_API_KEY"
            }
        }
        ```
    - When starting with the **claude** command, you need to specify the configuration file
        ```
        claude --settings="./your/path/to/.claude/settings.json"
        ```

Other platform clients are not listed here. If you have any questions during use, please contact us.