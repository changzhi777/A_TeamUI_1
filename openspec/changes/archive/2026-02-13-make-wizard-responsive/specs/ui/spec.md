# UI Spec Delta: make-wizard-responsive

## MODIFIED Requirements

### Requirement: Responsive Wizard Dialogs

The storyboard import and export wizard dialogs MUST be responsive and adapt to screen size in real-time.

#### Scenario: Import wizard adapts to screen size
- Given the user opens the storyboard import dialog
- When the user resizes the browser window
- Then the dialog MUST automatically adjust its size proportionally
- And the dialog MUST maintain a maximum height of 85% viewport height

#### Scenario: Export wizard adapts to screen size
- Given the user opens the storyboard export dialog
- When the user resizes the browser window
- Then the dialog MUST automatically adjust its size proportionally
- And the dialog MUST maintain a maximum height of 80% viewport height
