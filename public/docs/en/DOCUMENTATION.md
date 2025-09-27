[![GitHub](https://img.shields.io/badge/GitHub-0.7.0-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy)

*Last updated: September 27, 2025*

# A. Overview

FlexiProxy is built on LiteLLM to provide an OpenAI-compatible proxy service, enabling access to over 100 large language models (LLMs) through a unified interface. It allows users to seamlessly switch between backend service providers while using existing LLM clients (such as Claude Code), effectively addressing issues where LLM services are costly or unavailable in specific regions.

For users who only hold a single set of OpenAI-compatible API credentials, FlexiProxy also makes it possible to experience different LLM clients via proxy.

# B. Key Features

- [x] **Regional Flexibility**: Overcome regional restrictions and pricing barriers.
- [x] **Simple Configuration**: Easy setup and quick token pass generation.

# C. User Guide

> The proxy backend uses the API information provided by users to perform requests. FlexiProxy itself does not directly provide LLM services; it acts as an intermediary layer to forward requests.

## a. Creating a Token Pass

1. Before creating a token pass, prepare your OpenAI-compatible Base URL and API Key from an existing LLM provider. Examples are listed below (refer to the official documentation for accuracy). Any platform supporting OpenAI-compatible APIs can be used:

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


2. In the sidebar, select the Management Panel icon. If this is your first time, you will be redirected to the Create Token Pass page. Enter the required information based on the provider details above.

- **Important**: Your API Key will be used **only for forwarding service requests**.
- Select the desired proxy gateway server under **Provider**.
- After completing the fields, click **Confirm**.


![](https://flexiproxy.com/screenshots/en/create.PNG)

3. Upon successful creation, a new **Token Pass (API Key)** for the proxy gateway will be generated. You will be redirected to the **Token Management** page, which also displays the **Base URL**. From here, you may add additional token passes.
   
![](https://flexiproxy.com/screenshots/en/manage.PNG)


4. On the right side of each token entry, there is a ⚙ icon. Clicking it will open a dialog with the following options:

- **Edit**: Replace the **source service** API Key and regenerate the token pass.
- **Delete**: Remove the current token pass. Since there is a maximum token limit per user, you may need to delete existing tokens to create new ones.

![](https://flexiproxy.com/screenshots/en/modify.PNG)

## b. Client Usage

After token creation, two fields are essential: **Base URL** and **Token Pass**. Below is an example of how to configure them in a commonly used LLM client:

- **Claude Code**

    We won’t cover installation here, only configuration. Claude Code supports two configuration methods for **Base URL** and **Token Pass**:

    - via system environment variables, or
    - via the Claude Code Settings file.

    For details, refer to Anthropic’s [documentation](https://docs.anthropic.com/en/docs/claude-code/llm-gateway#litellm-configuration)

    **Example (Windows, using environment variables):**
    - Open the **Command Prompt (CMD)** and set the following variables, replacing `YOUR_TARGET_PROVIDER_API_KEY` and `YOUR_TARGET_PROVIDER_BASE_URL` with your generated **Token Pass** and **Base URL**:
        ```cmd
        setx ANTHROPIC_AUTH_TOKEN "YOUR_TARGET_PROVIDER_API_KEY"
        setx ANTHROPIC_BASE_URL "YOUR_TARGET_PROVIDER_BASE_URL"
        ```
    - Open a new CMD window and verify:
        ```cmd
        echo %ANTHROPIC_AUTH_TOKEN%
        echo %ANTHROPIC_BASE_URL%
        ```
    - Start Claude Code as usual.

    **Example (Settings file method):**

    - Create a .claude directory and a **settings.json** file inside it with the following content:
        ```json
        {
            "env": {
                "ANTHROPIC_BASE_URL": "YOUR_TARGET_PROVIDER_BASE_URL",
                "ANTHROPIC_AUTH_TOKEN": "YOUR_TARGET_PROVIDER_API_KEY"
            }
        }
        ```
    - Launch Claude Code with the settings file:
        ```
        claude --settings="./your/path/to/.claude/settings.json"
        ```

Other LLM clients follow similar configuration steps and are not listed here. If you encounter any issues while using the service, please feel free to contact us.