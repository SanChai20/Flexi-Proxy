[![GitHub](https://img.shields.io/badge/GitHub-0.8.2-blue?logo=github)](https://github.com/SanChai20/Flexi-Proxy)

*Last updated: Oct. 21, 2025*

# A. Overview

FlexiProxy is a lightweight LLM proxy service built on top of the LiteLLM library. It enables users to access multiple large language models through a unified interface. With FlexiProxy, users can seamlessly switch between different backend providers while using existing LLM clients (such as Claude Code), effectively addressing issues like high costs or limited model availability in certain regions. It also allows users with a single API credential to experience various LLM clients through the same proxy service.

# B. Key Features

- [x] **Regional Flexibility**: Overcome regional restrictions and pricing barriers.
- [x] **Simple Configuration**: Easy setup and quick token pass generation.

# C. User Guide

> The proxy server uses the API information provided by the user to make backend requests. Therefore, FlexiProxy does not directly provide large language model services; instead, it acts as an intermediary layer that forwards requests between the client and the model provider.

## a. Creating a Token Pass

1. Before creating an access token, please prepare your existing LLM provider’s API key and model ID. FlexiProxy currently supports the following providers:

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


2. Select and click the **Access Token** icon in the left sidebar. If this is your first time creating one, you will be automatically redirected to the **Create Token Pass** page. In the **PROXY SERVER** field, choose a proxy service. The supported vendors and models for the selected proxy service will then be loaded automatically. Configure the **SOURCE** and model information accordingly (**Note: the API Key you provide will only be used for service requests**). Once configuration is complete, click Confirm. Here, we take the OpenRouter vendor as an example:

    ![](https://flexiproxy.com/screenshots/en/create.PNG)

3. Upon successful creation, a new **Token Pass (API Key)** for the proxy gateway will be generated. You will be redirected to the **Token Pass Management** page, which also displays the **Base URL**. From here, you may add additional token passes.
   
    ![](https://flexiproxy.com/screenshots/en/manage.PNG)


4. On the right side of each token entry, there is a ⚙ icon. Clicking it will open a dialog with the following options:

   - **Edit**: Replace the **source service** API Key and regenerate the token pass.
   - **Delete**: Remove the current token pass. Since there is a maximum token limit per user, you may need to delete existing tokens to create new ones.

    ![](https://flexiproxy.com/screenshots/en/modify.PNG)

## b. Client Usage

After creating the token, there are two key fields to note: **Base URL** and **Token Pass**. The following example demonstrates how to use them with Claude Code:

- **Claude Code**

    > Some models usable with Claude Code: GLM series, Qwen series, Gemini series, etc.

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