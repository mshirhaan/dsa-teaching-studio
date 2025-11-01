# GitHub Sync & Auto-README Generation Plan

## Goal
Enable users to submit code solutions to roadmap problems directly to GitHub, with automatic README.md table generation tracking all solved problems.

## Sample Table Format
```markdown
| # | Problem | Difficulty | LeetCode | Solution | Date Solved | Notes |
|---|---------|-----------|----------|----------|-------------|-------|
| 1 | Two Sum | Easy | Link | Code | Oct 12, 2025 | - |
| 2 | Two Sum II - Input Array Is Sorted | Easy | Link | Code | Oct 12, 2025 | 2 pointer |
| 3 | Remove Duplicates from Sorted Array | Easy | Link | Code | Oct 19, 2025 | Two pointers |
| 4 | Product of Array Except Self | Medium | Link | Code | Oct 19, 2025 | Prefix, Suffix |
```

## Phase 1: Core Architecture

### State Additions
```typescript
{
  github: {
    token: string | null,
    repoOwner: string | null,
    repoName: string | null,
    basePath: string, // e.g., "solutions" or ""
    initialized: boolean,
  },
  roadmap: {
    questions: Array<{
      ...,
      gitCommitUrl?: string, // Store GitHub blob/commit URL
      submittedAt?: number,  // Timestamp when submitted
      gitFilePath?: string,  // Path to file in repo
    }>
  }
}
```

### GitHub API Endpoints Needed
- `POST /repos/:owner/:repo/contents/:path` - Create/update file
- `GET /repos/:owner/:repo/contents/:path` - Check if file exists (for updates)
- `GET /repos/:owner/:repo/commits/:sha` - Get commit details
- Authentication: Bearer token in header

## Phase 2: GitHub Integration UI

### Settings/Configuration
**Location:** Settings modal (gear icon in toolbar?)

**Fields:**
1. GitHub Personal Access Token (masked password input)
2. Repository Owner (username/organization)
3. Repository Name
4. Base Path (optional, default: "solutions")
   - Controls folder structure: `solutions/Array/1-two-sum.java`
5. Test Connection button

**Persistence:** Encrypted in Zustand persist (localStorage)

### Per-Question Submission
**UI Addition:**
- GitHub/Upload icon button on each question card
- Opens submission modal/dialog

**Modal Flow:**
1. Select file(s) or paste code
2. Select language (auto-detect from current editor if available)
3. Preview file path generation
4. Confirm submission
5. Show loading state
6. On success: Display commit link, update question
7. On error: Show error message

**Post-Submit:**
- Update roadmap state with `gitCommitUrl` and `submittedAt`
- Trigger README regeneration (auto or manual button)
- Show success toast with link

## Phase 3: Auto-README.md Generation

### Table Generation Logic
```markdown
# DSA Problems Solutions

## Progress
**Solved:** X/145 problems  
**Last Updated:** [Date]

## Solutions

| # | Problem | Difficulty | LeetCode | Solution | Date Solved | Notes |
|---|---------|-----------|----------|----------|-------------|-------|
| 1 | Two Sum | Easy | [Link](url) | [Code](commit_url) | Oct 12, 2025 | - |
```

**Data Flow:**
1. Filter roadmap questions: `solved && gitCommitUrl exists`
2. Sort by `solvedAt` timestamp (ascending)
3. Generate table rows with:
   - Problem number, title, difficulty
   - LeetCode link (if exists)
   - Solution link (gitCommitUrl points to blob)
   - Date formatted nicely (from `solvedAt`)
   - Notes (from roadmap notes field)

### File Organization Options
**Option A: Flat Structure**
```
repo/
  solutions/
    1-two-sum.java
    2-two-sum-ii.py
    60-bst-implementation.cpp
  README.md
```

**Option B: Topic-Based (Recommended)**
```
repo/
  solutions/
    Array/
      1-two-sum.java
      2-two-sum-ii.py
    Trees/
      60-bst-implementation.cpp
  README.md
```

**Option C: Language-Based**
```
repo/
  solutions/
    java/
      1-two-sum.java
    python/
      2-two-sum-ii.py
  README.md
```

## Phase 4: Data Flow

### Submission Flow
```
User clicks Submit on Question 1:
  1. Open modal, user selects/pastes code
  2. Generate filename: "1-two-sum.java" (from id + title + extension)
  3. Call GitHub API: Create/Update file
     POST /repos/:owner/:repo/contents/:path
     - path: "solutions/Array/1-two-sum.java"
     - content: base64 encoded code
     - message: "Add solution: Two Sum"
  4. Get commit SHA/URL from response
  5. Update roadmap state:
     - gitCommitUrl: "https://github.com/user/repo/blob/main/solutions/Array/1-two-sum.java"
     - submittedAt: Date.now()
     - gitFilePath: "solutions/Array/1-two-sum.java"
  6. Trigger README regeneration
  7. Commit updated README.md
```

### README Regeneration Flow
```
Trigger: On each submission OR manual button
1. Query all roadmap questions with gitCommitUrl
2. Generate markdown table
3. Format:
   - Header with progress stats
   - Table with all submitted solutions
   - Sort by solvedAt
4. Call GitHub API:
   POST /repos/:owner/:repo/contents/README.md
   - content: base64 encoded markdown
   - message: "Update README: solutions table"
5. Update last updated timestamp
```

## Phase 5: Security & Error Handling

### Token Storage
- Store in Zustand persist (encrypted)
- Never expose in UI after initial input
- Validate format (GitHub tokens are specific format)
- Test connection on save

### Error Handling
- Invalid token: Show message, disable submission
- Repo not found: Verify owner/repo exists
- File already exists: Use update flow (get SHA)
- Network errors: Retry mechanism
- Rate limiting: Respect GitHub limits

### Validation
- Token format validation
- Repo existence check
- Permissions check (write access)
- Connection test before allowing submissions

## Phase 6: UX Enhancements

### UI Elements
- Inline loading spinner on submit
- Success toast with commit link (clickable)
- Error modals with helpful messages
- Settings accessible via gear icon
- Token masked with show/hide toggle
- Progress indicator: "15 problems submitted to GitHub"

### File Selection
- Drag & drop support
- File upload button
- Paste code option
- Auto-detect language from editor if available
- Preview generated filename

### README Control
- Auto-regenerate on each submission (default)
- Manual regenerate button in settings
- Preview before commit
- Custom template option (future)

## Phase 7: Implementation Order

1. ✅ Design architecture
2. Add GitHub state to Zustand store
3. Build settings modal UI
4. Implement GitHub API wrapper functions
5. File upload/submission flow
6. README.md generator
7. Auto-regeneration trigger
8. Error handling & validation
9. UI polish & testing
10. Documentation

## Questions to Resolve

1. **File Organization:** Topic-based, language-based, or flat?
   - **Recommendation:** Topic-based (matches roadmap structure)

2. **READMEE Regeneration:** Auto on every submit or manual?
   - **Recommendation:** Auto with option to disable

3. **Token Security:** Encrypt in localStorage?
   - **Recommendation:** Store in Zustand persist, browser handles encryption

4. **File Naming Convention:**
   - Format: `{id}-{kebab-case-title}.{ext}`
   - Example: `1-two-sum.java`, `60-bst-implementation.cpp`

5. **GitHub Permissions Required:**
   - `repo` scope (full repository access)
   - Or specific scopes: `public_repo` or `repo` + `contents:write`

6. **Multiple File Support:**
   - Submit multiple files per problem? (e.g., test files)
   - **Recommendation:** Start single, add multi-file later

7. **Code Editor Integration:**
   - Auto-submit from current editor?
   - **Recommendation:** Yes, add "Submit to GitHub" button in editor

## Future Enhancements

- Batch submission (submit multiple solved problems at once)
- Pull requests instead of direct commits
- Code review integration
- Statistics dashboard (problems by topic, difficulty)
- Export to PDF
- Custom README templates
- Multiple repo support
- Team collaboration features

