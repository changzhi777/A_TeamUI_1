# UI Spec Delta: revert-wizard-to-horizontal

## MODIFIED Requirements

### Requirement: Horizontal Wizard Layout

The storyboard import and export wizards MUST display with horizontal step navigation.

#### Scenario: Display horizontal steps in import wizard
- Given the user opens the storyboard import dialog
- When the dialog renders
- Then the steps are displayed horizontally at the top
- And the dialog width is larger than height (landscape orientation)

#### Scenario: Display horizontal steps in export wizard
- Given the user opens the storyboard export dialog
- When the dialog renders
- Then the steps are displayed horizontally at the top
- And the dialog width is larger than height (landscape orientation)
