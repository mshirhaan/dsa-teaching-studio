/**
 * GitHub API utilities for file upload and README generation
 */

interface GitHubConfig {
  token: string;
  repoOwner: string;
  repoName: string;
  basePath: string;
}

interface GitHubFileContent {
  path: string;
  content: string;
  message: string;
  branch?: string;
}

interface GitHubResponse {
  content: {
    sha: string;
    name: string;
    path: string;
    size: number;
    download_url: string;
  };
  commit: {
    sha: string;
    url: string;
    html_url: string;
  };
}

/**
 * Get file SHA if it exists in the repo
 */
export async function getFileSha(config: GitHubConfig, filePath: string): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${config.repoOwner}/${config.repoName}/contents/${filePath}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Upload or update a file to GitHub repository
 */
export async function uploadFile(
  config: GitHubConfig,
  filePath: string,
  content: string,
  message: string
): Promise<{ success: boolean; commitUrl?: string; blobUrl?: string; error?: string }> {
  try {
    const sha = await getFileSha(config, filePath);
    
    const url = `https://api.github.com/repos/${config.repoOwner}/${config.repoName}/contents/${filePath}`;
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const body: any = {
      message,
      content: encodedContent,
    };

    // Only include sha if file exists (for update)
    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data: GitHubResponse = await response.json();
      return {
        success: true,
        commitUrl: data.commit.html_url,
        blobUrl: `${data.content.download_url}?raw=true`,
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'Failed to upload file',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Test GitHub connection
 */
export async function testConnection(config: GitHubConfig): Promise<boolean> {
  try {
    const url = `https://api.github.com/repos/${config.repoOwner}/${config.repoName}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Convert kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Get file extension from language
 */
export function getExtensionFromLanguage(language: string): string {
  const extensions: Record<string, string> = {
    javascript: '.js',
    typescript: '.ts',
    java: '.java',
    python: '.py',
    cpp: '.cpp',
    c: '.c',
    csharp: '.cs',
    go: '.go',
    rust: '.rs',
    php: '.php',
    ruby: '.rb',
    swift: '.swift',
    kotlin: '.kt',
  };
  return extensions[language.toLowerCase()] || '.txt';
}

/**
 * Generate markdown table for README.md
 */
export interface RoadmapQuestion {
  id: string;
  number: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  leetcodeUrl?: string;
  solved: boolean;
  solvedAt?: number;
  notes?: string;
  gitCommitUrl?: string;
  submittedAt?: number;
  gitFilePath?: string;
}

export function generateReadmeContent(questions: RoadmapQuestion[]): string {
  // Show all submitted questions (whether marked as solved or not)
  const solvedQuestions = questions
    .filter(q => q.gitCommitUrl && q.submittedAt)
    .sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0));

  const total = questions.length;
  const solved = questions.filter(q => q.solved).length;
  const progress = Math.round((solved / total) * 100);
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  let markdown = `# DSA Problems Solutions\n\n`;
  markdown += `## Progress\n`;
  markdown += `**Solved:** ${solved}/${total} problems  \n`;
  markdown += `**Last Updated:** ${lastUpdated}\n\n`;
  markdown += `## Solutions\n\n`;

  markdown += `| # | Problem | Difficulty | LeetCode | Solution | Date Solved | Notes |\n`;
  markdown += `|---|---------|-----------|----------|----------|-------------|-------|\n`;

  solvedQuestions.forEach(q => {
    const date = q.submittedAt 
      ? new Date(q.submittedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : '-';

    const leetcodeLink = q.leetcodeUrl 
      ? `[Link](${q.leetcodeUrl})` 
      : '-';

    const solutionLink = q.gitCommitUrl
      ? `[Code](${q.gitCommitUrl})`
      : '-';

    const notes = q.notes ? q.notes : '-';

    markdown += `| ${q.number} | ${q.title} | ${q.difficulty} | ${leetcodeLink} | ${solutionLink} | ${date} | ${notes} |\n`;
  });

  return markdown;
}

/**
 * Generate and upload README.md to GitHub
 */
export async function generateAndUploadReadme(
  config: GitHubConfig,
  questions: RoadmapQuestion[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const markdown = generateReadmeContent(questions);
    const result = await uploadFile(
      config,
      'README.md',
      markdown,
      'Update README: solutions table'
    );
    return result;
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to generate README' };
  }
}
