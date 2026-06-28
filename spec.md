# Project Allocation System

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full web application for Project Allocation using Bipartite Matching
- Add students with names
- Add projects with names
- Set student preferences (which projects each student prefers)
- Run bipartite matching algorithm (DFS-based maximum matching)
- Display allocation results: matched pairs and unmatched students
- Results visualization with stats dashboard
- Navigation: Dashboard, Students, Projects, Preferences, Run Algorithm, Results

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Store students, projects, preferences; run bipartite matching algorithm
2. Frontend: Multi-page dashboard with nav tabs, forms for input, results display
3. Algorithm: DFS-based maximum bipartite matching implemented in Motoko
