# UI Spec Delta: convert-wizard-to-vertical

## MODIFIED Requirements

### Requirement: Vertical Wizard Layout Support

The Steps component MUST support vertical orientation for wizard-style dialogs.

#### Scenario: Display vertical steps in import wizard
- Given the user opens the storyboard import dialog
- When the dialog renders
- Then the steps are displayed vertically on the left side
- And each step shows its title and description without truncation
- And the current step is highlighted
- And completed steps show a checkmark

#### Scenario: Display vertical steps in export wizard
- Given the user opens the storyboard export dialog
- When the dialog renders
- Then the steps are displayed vertically on the left side
- And each step shows its title without truncation
- And the current step is highlighted

### Requirement: Responsive Vertical Wizard

The vertical wizard layout MUST adapt to different screen sizes.

#### Scenario: Mobile layout for vertical wizard
- Given the user views the wizard on a mobile device (width < 768px)
- When the dialog renders
- Then the step navigation is simplified
- And the content area takes full width

#### Scenario: Desktop layout for vertical wizard
- Given the user views the wizard on a desktop (width >= 768px)
- When the dialog renders
- Then a two-column layout is used
- And the left column shows the vertical step navigation
- And the right column shows the step content
