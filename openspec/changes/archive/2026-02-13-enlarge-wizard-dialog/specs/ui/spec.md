# UI Spec Delta: enlarge-wizard-dialog

## MODIFIED Requirements

### Requirement: Wizard Dialog Size

The storyboard import and export wizard dialogs MUST have enlarged dimensions for better content visibility.

#### Scenario: Import wizard dialog size
- Given the user opens the storyboard import dialog
- When the dialog renders
- Then the dialog width MUST be approximately 2048px (2x the original size)

#### Scenario: Export wizard dialog size
- Given the user opens the storyboard export dialog
- When the dialog renders
- Then the dialog width MUST be approximately 1152px (2x the original size)
