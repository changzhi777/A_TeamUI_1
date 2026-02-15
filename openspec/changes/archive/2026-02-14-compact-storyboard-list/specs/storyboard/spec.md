# Storyboard Spec Delta

## ADDED Requirements

### Requirement: Compact List Layout
The shot list table SHALL display in a compact layout with reduced cell padding and row height to maximize information density.

#### Scenario: User views shot list with compact layout
- Given the user is on the shot list page
- When the table renders
- Then the table displays with reduced padding and tighter spacing
- And more rows are visible in the same screen space

### Requirement: Description Column Truncation
The "画面描述" (description) column SHALL truncate long text to a maximum of 8 Chinese characters with ellipsis for overflow.

#### Scenario: User views truncated description
- Given a shot with a description longer than 8 characters
- When the user views the shot list table
- Then the description column displays only the first 8 characters followed by "..."
- And hovering over the cell shows the full description in a tooltip

### Requirement: Sound Column Truncation
The "音效说明" (sound) column SHALL truncate long text to a maximum of 5 Chinese characters with ellipsis for overflow.

#### Scenario: User views truncated sound description
- Given a shot with a sound description longer than 5 characters
- When the user views the shot list table
- Then the sound column displays only the first 5 characters followed by "..."
- And hovering over the cell shows the full sound description in a tooltip

### Requirement: Project Column Hidden by Default
The "项目" (project) column SHALL be hidden by default in the shot list table.

#### Scenario: User views shot list without project column
- Given the user is on the shot list page
- When the table renders initially
- Then the project column is not visible

#### Scenario: User enables project column visibility
- Given the user is on the shot list page
- When the user opens the "显示列" dropdown and enables "项目"
- Then the project column becomes visible
