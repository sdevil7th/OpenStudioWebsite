import { fetchGithubRepoSnapshot } from "../../shared/github-api";

export default async () => {
  try {
    const snapshot = await fetchGithubRepoSnapshot(process.env.GITHUB_TOKEN);

    return new Response(JSON.stringify(snapshot), {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GitHub function error";

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }
};
