# FlexiProxy Documentation

## Overview

FlexiProxy is a service that acts as a proxy between OpenAI-compatible clients and various AI service providers. It allows users to seamlessly switch between different AI service providers without changing their client configuration, solving the problem where clients are convenient to use but server-side services may be expensive or unavailable in certain regions.

## Key Features

- **Provider Agnostic**: Convert OpenAI-compatible API calls to work with various AI service providers
- **Regional Flexibility**: Overcome regional restrictions and pricing issues
- **Data Statistics**: Optional usage tracking and statistics (disabled by default)
- **Easy Configuration**: Simple setup with adapters that map client requests to provider endpoints

## Architecture

FlexiProxy consists of several core components:

1. **Providers**: Registered AI service providers with their base URLs
2. **Adapters**: Mappings between client configurations and provider configurations
3. **Authentication**: JWT-based authentication for API access
4. **Redis Storage**: Persistent storage for providers and adapters

## API Endpoints

### Provider Management

#### List Available Providers
```http
GET /api/providers
```
Retrieve a list of all registered providers.

#### Get Provider Details
```http
GET /api/providers/{id}
```
Get details for a specific provider by ID.

#### Register/Update Provider
```http
POST /api/providers/{id}
```
Register a new provider or update an existing one.
Payload:
```json
{
  "url": "https://provider-api-endpoint.com"
}
```

#### Delete Provider
```http
DELETE /api/providers/{id}
```
Remove a provider from the registry.

### Adapter Management

#### Create Adapter
```http
POST /api/adapters
```
Create a new adapter that maps a client configuration to a provider.
Payload:
```json
{
  "provider_id": "provider-name",
  "base_url": "https://client-base-url.com",
  "model_id": "model-name"
}
```

#### List Adapters
```http
GET /api/adapters
```
Retrieve all adapters for the authenticated user.

#### Delete Adapter
```http
DELETE /api/adapters
```
Remove an adapter.
Payload:
```json
{
  "create_time": "timestamp"
}
```

## How It Works

1. **Provider Registration**: Administrators register AI service providers with their respective API endpoints
2. **Adapter Creation**: Users create adapters that map their OpenAI-compatible client settings to specific providers
3. **Request Proxying**: When a client makes an API request to FlexiProxy, it:
   - Authenticates the request
   - Looks up the appropriate adapter
   - Routes the request to the target provider
   - Returns the provider's response to the client

## Authentication

All API requests require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Configuration

FlexiProxy requires the following environment variables:

- `UPSTASH_REDIS_REST_URL`: Redis database URL for storage
- `UPSTASH_REDIS_REST_TOKEN`: Redis authentication token
- Other Next.js and authentication-related environment variables

## Data Statistics

FlexiProxy can optionally track usage statistics. This feature is disabled by default and can be enabled in the settings. When enabled, it provides insights into API usage patterns and helps with capacity planning.

## Use Cases

1. **Regional Access**: Access AI services that may be restricted in certain regions
2. **Cost Optimization**: Switch between providers based on pricing
3. **Service Redundancy**: Failover to alternative providers when primary services are unavailable
4. **Unified Interface**: Use a consistent API interface regardless of the underlying provider

## Getting Started

1. Set up the required environment variables
2. Register your preferred AI service providers
3. Create adapters for your client configurations
4. Configure your OpenAI-compatible clients to use FlexiProxy as their base URL
5. Enable data statistics in settings if needed