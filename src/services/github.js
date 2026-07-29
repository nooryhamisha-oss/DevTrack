const GITHUB_API = "https://api.github.com";

async function githubFetch(path) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (res.status === 404)
    throw new Error("This GitHub username could not be found.");
  if (res.status === 403)
    throw new Error(
      "GitHub rate limit reached. Please try again in a few minutes.",
    );
  if (!res.ok)
    throw new Error(`Unexpected error from GitHub (code ${res.status})`);
  return res.json();
}

export async function fetchGithubUser(username) {
  return githubFetch(`/users/${username}`);
}

export async function fetchUserRepos(username) {
  const repos = await githubFetch(
    `/users/${username}/repos?per_page=100&sort=updated`,
  );
  return repos.filter((r) => !r.fork);
}

export async function fetchRepoReadme(owner, repoName) {
  try {
    const data = await githubFetch(`/repos/${owner}/${repoName}/readme`);
    return atob(data.content.replace(/\n/g, ""));
  } catch {
    return "";
  }
}

export async function fetchRepoLanguages(owner, repoName) {
  return githubFetch(`/repos/${owner}/${repoName}/languages`);
}

export async function fetchRepoTree(owner, repoName) {
  try {
    const root = await githubFetch(`/repos/${owner}/${repoName}/contents`);
    const entries = [];

    for (const item of root) {
      entries.push(item.type === "dir" ? `${item.name}/` : item.name);
    }

    
    const foldersToPeek = root
      .filter(
        (item) =>
          item.type === "dir" &&
          ["src", "app", "lib", "components", "pages"].includes(
            item.name.toLowerCase(),
          ),
      )
      .slice(0, 2);

    for (const folder of foldersToPeek) {
      try {
        const nested = await githubFetch(
          `/repos/${owner}/${repoName}/contents/${folder.name}`,
        );
        for (const item of nested.slice(0, 20)) {
          entries.push(
            `${folder.name}/${item.type === "dir" ? item.name + "/" : item.name}`,
          );
        }
      } catch {
        
      }
    }

    return entries;
  } catch {
    return [];
  }
}
