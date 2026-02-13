# UI Spec Delta: make-wizard-resizable

## MODIFIED Requirements

### Requirement: Resizable Wizard Dialogs

The storyboard import and export wizard dialogs MUST be resizable by the user.

#### Scenario: Import wizard dialog is resizable
- Given the user opens the storyboard import dialog
- When the dialog renders
- Then the dialog MUST be resizable by dragging the corner
- And the dialog MUST have minimum size constraints

#### Scenario: Export wizard dialog is resizable
- Given the user opens the storyboard export dialog
- When the dialog renders
- Then the dialog MUST be resizable by dragging the corner
- And the dialog MUST have minimum size constraints
