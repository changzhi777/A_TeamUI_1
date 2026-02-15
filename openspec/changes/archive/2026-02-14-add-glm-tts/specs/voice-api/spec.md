# Voice API Specification Delta

## ADDED Requirements

### Requirement: GLM-TTS Model Support
The system SHALL support GLM-TTS as a voice synthesis model option with specific configuration parameters.

#### Scenario: Select GLM-TTS Model
- Given a user is on the API settings page
- When the user selects the "语音 API" tab
- Then the user can select "GLM-TTS" from the model dropdown
- And the system displays GLM-TTS specific voice options

#### Scenario: Configure GLM-TTS Voice
- Given a user has selected GLM-TTS as the voice model
- When the user views voice configuration options
- Then the user can select from predefined voices: 彤彤(default), 小陈, 锤锤, jam, kazi, douji, luodo
- And the user can adjust speed (0.5-2.0, default 1.0)
- And the user can adjust volume (0.1-2.0, default 1.0)
- And the user can select response format (wav/pcm)

### Requirement: GLM-TTS API Integration
The system SHALL correctly call GLM-TTS API with the appropriate parameters.

#### Scenario: Generate Speech with GLM-TTS
- Given the voice model is configured as "glm-tts"
- And a voice style is selected (e.g., "tongtong")
- When the system calls the TTS generation function
- Then the request includes `model: "glm-tts"`
- And the request includes `voice: "tongtong"` (or other selected voice)
- And the request includes `speed` and `volume` parameters
- And the request includes `response_format` parameter

#### Scenario: Fallback to Default Voice
- Given the voice model is configured as "glm-tts"
- And no voice is explicitly selected
- When the system calls the TTS generation function
- Then the request uses "tongtong" as the default voice
