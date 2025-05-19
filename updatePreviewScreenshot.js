import captureWebsite from "capture-website";
import dotenv from "dotenv";
import { Octokit } from "@octokit/core";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GH_TOKEN,
});

const main = async () => {
  const base64image = new Uint8Array(
    await captureWebsite.base64("https://www.leda.dev", { delay: 2 })
  ).toBase64();

  const previewImage = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: "LedaThemis",
      repo: "portfolio",
      path: "preview.png",
    }
  );

  if (previewImage.data.content === base64image) {
    console.log("Nothing to update...");
  } else {
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: "LedaThemis",
      repo: "portfolio",
      path: "preview.png",
      message: "chore: update preview screenshot",
      committer: {
        name: "Website Preview",
        email: "bot@leda.dev",
      },
      content: base64image,
      sha: previewImage.data.sha,
    });
  }
};

(async () => {
  main();
})();
