# Settings Spec Delta

## ADDED Requirements

### Requirement: API Management Page with Tabs
The system SHALL provide an API Management page with separate tabs for Text API, Image API, and Voice API configuration.

#### Scenario: User accesses API management
- Given the user is on the settings page
- When the user navigates to API Management
- Then the page displays three tabs: Text API, Image API, Voice API
- And each tab contains independent configuration options

### Requirement: Multiple API Provider Support
Each API type SHALL support multiple service providers with independent configuration.

#### Scenario: User selects API provider
- Given the user is on an API configuration tab
- When the user selects a provider from the dropdown
- Then the configuration form updates to show provider-specific options
- And the selected provider becomes the active provider for that API type

### Requirement: GLM-Image Resolution Configuration
The Image API configuration SHALL support GLM-Image specific resolution options.

#### Scenario: User configures GLM-Image resolution
- Given the user has selected GLM-Image as the image provider
- When the user accesses resolution settings
- Then the system displays preset resolutions: 1280x1280, 1568x1056, 1056x1568, 1472x1088, 1088x1472, 1728x960, 960x1728
- And the system allows custom resolution input (512-2048px, multiples of 32)

### Requirement: Independent API Configuration Storage
Each API type configuration SHALL be stored independently without affecting others.

#### Scenario: User saves API configuration
- Given the user has modified configuration for one API type
- When the user saves the configuration
- Then only that API type's configuration is updated
- And other API type configurations remain unchanged

### Requirement: Character Image Generation Uses API Config
Character image generation SHALL use the configured Image API settings including resolution.

#### Scenario: User generates character image with custom resolution
- Given the user has configured GLM-Image with resolution 1568x1056
- When the user generates a character view image
- Then the API call includes the configured resolution
- And the generated image matches the specified dimensions
