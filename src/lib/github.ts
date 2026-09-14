import type { GithubRepoSnapshot } from "@/data/marketing";

export const GITHUB_SNAPSHOT_ENDPOINT = "/.netlify/functions/github-repo";

// Refreshed from the live repository on 2026-09-04. Used on localhost and
// whenever the snapshot function is unreachable, so keep it roughly current.
export const githubFallbackSnapshot: GithubRepoSnapshot = {
  fetchedAt: "2026-09-04T00:00:00Z",
  fullName: "sdevil7th/OpenStudio",
  repositoryUrl: "https://github.com/sdevil7th/OpenStudio",
  ownerLogin: "sdevil7th",
  ownerProfileUrl: "https://github.com/sdevil7th",
  ownerAvatarUrl: "https://avatars.githubusercontent.com/u/44551979?v=4",
  description: "DAW and Jam Station for the new era",
  docsUrl: "https://github.com/sdevil7th/OpenStudio/tree/main/docs",
  defaultBranch: "main",
  license: "AGPL-3.0",
  createdAt: "2026-01-23T23:46:39Z",
  updatedAt: "2026-09-01T18:10:31Z",
  pushedAt: "2026-09-02T06:56:43Z",
  primaryLanguage: "C++",
  languages: [
    {
      name: "C++",
      bytes: 8513853,
      percent: 47.4
    },
    {
      name: "TypeScript",
      bytes: 7348330,
      percent: 40.9
    },
    {
      name: "CSS",
      bytes: 770373,
      percent: 4.3
    },
    {
      name: "JavaScript",
      bytes: 558699,
      percent: 3.1
    },
    {
      name: "Python",
      bytes: 392644,
      percent: 2.2
    },
    {
      name: "PowerShell",
      bytes: 263979,
      percent: 1.5
    },
    {
      name: "CMake",
      bytes: 64288,
      percent: 0.4
    },
    {
      name: "Assembly",
      bytes: 27031,
      percent: 0.2
    },
    {
      name: "Shell",
      bytes: 20113,
      percent: 0.1
    },
    {
      name: "HTML",
      bytes: 10067,
      percent: 0.1
    },
    {
      name: "Inno Setup",
      bytes: 8652,
      percent: 0.0
    },
    {
      name: "C",
      bytes: 589,
      percent: 0.0
    }
  ],
  contributors: [
    {
      login: "sdevil7th",
      avatarUrl: "https://avatars.githubusercontent.com/u/44551979?v=4",
      profileUrl: "https://github.com/sdevil7th",
      contributions: 83
    }
  ],
  latestRelease: {
    id: 379356665,
    tagName: "v0.1.01",
    name: "OpenStudio 0.1.01",
    htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.1.01",
    publishedAt: "2026-08-30T17:49:29Z",
    isPrerelease: false,
    assetCount: 12,
    assets: [
      {
        name: "OpenStudio-0.1.01-linux-x86_64.AppImage",
        size: 66492920,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-0.1.01-linux-x86_64.AppImage",
        downloadCount: 6
      },
      {
        name: "OpenStudio-ai-runtime-latest.json",
        size: 9848,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-ai-runtime-latest.json",
        downloadCount: 1
      },
      {
        name: "OpenStudio-ai-runtime-stable-latest.json",
        size: 9848,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-ai-runtime-stable-latest.json",
        downloadCount: 1
      },
      {
        name: "OpenStudio-appcast-linux-stable.xml",
        size: 2221,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-appcast-linux-stable.xml",
        downloadCount: 1
      },
      {
        name: "OpenStudio-appcast-macos-stable.xml",
        size: 2235,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-appcast-macos-stable.xml",
        downloadCount: 1
      },
      {
        name: "OpenStudio-appcast-windows-stable.xml",
        size: 2271,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-appcast-windows-stable.xml",
        downloadCount: 2
      },
      {
        name: "OpenStudio-checksums.txt",
        size: 727,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-checksums.txt",
        downloadCount: 0
      },
      {
        name: "OpenStudio-FFmpeg-8.0.1-complete-corresponding-source.zip",
        size: 15608826,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-FFmpeg-8.0.1-complete-corresponding-source.zip",
        downloadCount: 0
      },
      {
        name: "OpenStudio-macOS.dmg",
        size: 36374947,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-macOS.dmg",
        downloadCount: 6
      },
      {
        name: "OpenStudio-release-latest.json",
        size: 2235,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-release-latest.json",
        downloadCount: 1
      },
      {
        name: "OpenStudio-release-stable-latest.json",
        size: 2235,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-release-stable-latest.json",
        downloadCount: 1
      },
      {
        name: "OpenStudio-Setup-x64.exe",
        size: 307195220,
        downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-Setup-x64.exe",
        downloadCount: 36
      }
    ]
  },
  hasPublishedReleases: true,
  releases: [
    {
      id: 379356665,
      tagName: "v0.1.01",
      name: "OpenStudio 0.1.01",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.1.01",
      publishedAt: "2026-08-30T17:49:29Z",
      isPrerelease: false,
      assetCount: 12,
      assets: [
        {
          name: "OpenStudio-0.1.01-linux-x86_64.AppImage",
          size: 66492920,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-0.1.01-linux-x86_64.AppImage",
          downloadCount: 6
        },
        {
          name: "OpenStudio-ai-runtime-latest.json",
          size: 9848,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-ai-runtime-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-ai-runtime-stable-latest.json",
          size: 9848,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-ai-runtime-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-linux-stable.xml",
          size: 2221,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-appcast-linux-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-macos-stable.xml",
          size: 2235,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-appcast-macos-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-windows-stable.xml",
          size: 2271,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-appcast-windows-stable.xml",
          downloadCount: 2
        },
        {
          name: "OpenStudio-checksums.txt",
          size: 727,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-checksums.txt",
          downloadCount: 0
        },
        {
          name: "OpenStudio-FFmpeg-8.0.1-complete-corresponding-source.zip",
          size: 15608826,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-FFmpeg-8.0.1-complete-corresponding-source.zip",
          downloadCount: 0
        },
        {
          name: "OpenStudio-macOS.dmg",
          size: 36374947,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-macOS.dmg",
          downloadCount: 6
        },
        {
          name: "OpenStudio-release-latest.json",
          size: 2235,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-release-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-release-stable-latest.json",
          size: 2235,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-release-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-Setup-x64.exe",
          size: 307195220,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.1.01/OpenStudio-Setup-x64.exe",
          downloadCount: 36
        }
      ]
    },
    {
      id: 379228134,
      tagName: "ffmpeg-runtime-v8.0.1-openstudio.1",
      name: "OpenStudio FFmpeg Runtime 8.0.1-openstudio.1",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/ffmpeg-runtime-v8.0.1-openstudio.1",
      publishedAt: "2026-08-30T08:56:04Z",
      isPrerelease: false,
      assetCount: 3,
      assets: [
        {
          name: "OpenStudio-FFmpeg-8.0.1-complete-corresponding-source.zip",
          size: 15608826,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ffmpeg-runtime-v8.0.1-openstudio.1/OpenStudio-FFmpeg-8.0.1-complete-corresponding-source.zip",
          downloadCount: 4
        },
        {
          name: "OpenStudio-FFmpeg-8.0.1-windows-x64.zip",
          size: 11858433,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ffmpeg-runtime-v8.0.1-openstudio.1/OpenStudio-FFmpeg-8.0.1-windows-x64.zip",
          downloadCount: 19
        },
        {
          name: "SHA256SUMS.txt",
          size: 350,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ffmpeg-runtime-v8.0.1-openstudio.1/SHA256SUMS.txt",
          downloadCount: 1
        }
      ]
    },
    {
      id: 379200051,
      tagName: "ai-runtime-v0.0.13",
      name: "OpenStudio AI Runtime 0.0.13",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/ai-runtime-v0.0.13",
      publishedAt: "2026-08-30T06:28:36Z",
      isPrerelease: false,
      assetCount: 6,
      assets: [
        {
          name: "linux-cpu-x64-size-report.json",
          size: 387,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.13/linux-cpu-x64-size-report.json",
          downloadCount: 0
        },
        {
          name: "macos-arm64-size-report.json",
          size: 386,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.13/macos-arm64-size-report.json",
          downloadCount: 0
        },
        {
          name: "OpenStudio-AI-Runtime-linux-cpu-x64.zip",
          size: 553408441,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.13/OpenStudio-AI-Runtime-linux-cpu-x64.zip",
          downloadCount: 2
        },
        {
          name: "OpenStudio-AI-Runtime-macos-arm64.zip",
          size: 335171834,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.13/OpenStudio-AI-Runtime-macos-arm64.zip",
          downloadCount: 2
        },
        {
          name: "OpenStudio-AI-Runtime-windows-base-x64.zip",
          size: 38152919,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.13/OpenStudio-AI-Runtime-windows-base-x64.zip",
          downloadCount: 3
        },
        {
          name: "windows-base-size-report.json",
          size: 509,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.13/windows-base-size-report.json",
          downloadCount: 0
        }
      ]
    },
    {
      id: 324987166,
      tagName: "v0.0.40",
      name: "OpenStudio 0.0.40",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.0.40",
      publishedAt: "2026-05-19T12:35:03Z",
      isPrerelease: false,
      assetCount: 11,
      assets: [
        {
          name: "OpenStudio-0.0.40-linux-x86_64.AppImage",
          size: 56416760,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-0.0.40-linux-x86_64.AppImage",
          downloadCount: 33
        },
        {
          name: "OpenStudio-ai-runtime-latest.json",
          size: 15927,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-ai-runtime-latest.json",
          downloadCount: 4
        },
        {
          name: "OpenStudio-ai-runtime-stable-latest.json",
          size: 15927,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-ai-runtime-stable-latest.json",
          downloadCount: 6
        },
        {
          name: "OpenStudio-appcast-linux-stable.xml",
          size: 2221,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-appcast-linux-stable.xml",
          downloadCount: 3
        },
        {
          name: "OpenStudio-appcast-macos-stable.xml",
          size: 2181,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-appcast-macos-stable.xml",
          downloadCount: 3
        },
        {
          name: "OpenStudio-appcast-windows-stable.xml",
          size: 2271,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-appcast-windows-stable.xml",
          downloadCount: 7
        },
        {
          name: "OpenStudio-checksums.txt",
          size: 603,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-checksums.txt",
          downloadCount: 2
        },
        {
          name: "OpenStudio-macOS.dmg",
          size: 9034015,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-macOS.dmg",
          downloadCount: 55
        },
        {
          name: "OpenStudio-release-latest.json",
          size: 2196,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-release-latest.json",
          downloadCount: 4
        },
        {
          name: "OpenStudio-release-stable-latest.json",
          size: 2196,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-release-stable-latest.json",
          downloadCount: 4
        },
        {
          name: "OpenStudio-Setup-x64.exe",
          size: 249028235,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.40/OpenStudio-Setup-x64.exe",
          downloadCount: 303
        }
      ]
    },
    {
      id: 318076130,
      tagName: "v0.0.39",
      name: "OpenStudio 0.0.39",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.0.39",
      publishedAt: "2026-05-05T21:39:46Z",
      isPrerelease: false,
      assetCount: 11,
      assets: [
        {
          name: "OpenStudio-0.0.39-linux-x86_64.AppImage",
          size: 55871992,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-0.0.39-linux-x86_64.AppImage",
          downloadCount: 0
        },
        {
          name: "OpenStudio-ai-runtime-latest.json",
          size: 14120,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-ai-runtime-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-ai-runtime-stable-latest.json",
          size: 14120,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-ai-runtime-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-linux-stable.xml",
          size: 2221,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-appcast-linux-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-macos-stable.xml",
          size: 2181,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-appcast-macos-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-windows-stable.xml",
          size: 2271,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-appcast-windows-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-checksums.txt",
          size: 603,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-checksums.txt",
          downloadCount: 0
        },
        {
          name: "OpenStudio-macOS.dmg",
          size: 8723196,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-macOS.dmg",
          downloadCount: 0
        },
        {
          name: "OpenStudio-release-latest.json",
          size: 2196,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-release-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-release-stable-latest.json",
          size: 2196,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-release-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-Setup-x64.exe",
          size: 245540761,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.39/OpenStudio-Setup-x64.exe",
          downloadCount: 14
        }
      ]
    },
    {
      id: 316713919,
      tagName: "v0.0.38",
      name: "OpenStudio 0.0.38",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.0.38",
      publishedAt: "2026-05-02T15:37:36Z",
      isPrerelease: false,
      assetCount: 11,
      assets: [
        {
          name: "OpenStudio-0.0.38-linux-x86_64.AppImage",
          size: 55867896,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-0.0.38-linux-x86_64.AppImage",
          downloadCount: 0
        },
        {
          name: "OpenStudio-ai-runtime-latest.json",
          size: 14120,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-ai-runtime-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-ai-runtime-stable-latest.json",
          size: 14120,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-ai-runtime-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-linux-stable.xml",
          size: 2221,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-appcast-linux-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-macos-stable.xml",
          size: 2181,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-appcast-macos-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-windows-stable.xml",
          size: 2271,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-appcast-windows-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-checksums.txt",
          size: 603,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-checksums.txt",
          downloadCount: 0
        },
        {
          name: "OpenStudio-macOS.dmg",
          size: 8704114,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-macOS.dmg",
          downloadCount: 0
        },
        {
          name: "OpenStudio-release-latest.json",
          size: 2196,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-release-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-release-stable-latest.json",
          size: 2196,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-release-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-Setup-x64.exe",
          size: 245531743,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.38/OpenStudio-Setup-x64.exe",
          downloadCount: 4
        }
      ]
    },
    {
      id: 316699336,
      tagName: "ai-runtime-v0.0.11",
      name: "OpenStudio AI Runtime 0.0.11",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/ai-runtime-v0.0.11",
      publishedAt: "2026-05-02T13:40:51Z",
      isPrerelease: false,
      assetCount: 6,
      assets: [
        {
          name: "linux-cpu-x64-size-report.json",
          size: 387,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.11/linux-cpu-x64-size-report.json",
          downloadCount: 0
        },
        {
          name: "macos-arm64-size-report.json",
          size: 386,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.11/macos-arm64-size-report.json",
          downloadCount: 0
        },
        {
          name: "OpenStudio-AI-Runtime-linux-cpu-x64.zip",
          size: 846408406,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.11/OpenStudio-AI-Runtime-linux-cpu-x64.zip",
          downloadCount: 3
        },
        {
          name: "OpenStudio-AI-Runtime-macos-arm64.zip",
          size: 551126943,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.11/OpenStudio-AI-Runtime-macos-arm64.zip",
          downloadCount: 5
        },
        {
          name: "OpenStudio-AI-Runtime-windows-base-x64.zip",
          size: 38180858,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.11/OpenStudio-AI-Runtime-windows-base-x64.zip",
          downloadCount: 11
        },
        {
          name: "windows-base-size-report.json",
          size: 509,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.11/windows-base-size-report.json",
          downloadCount: 0
        }
      ]
    },
    {
      id: 306432850,
      tagName: "v0.0.36",
      name: "OpenStudio 0.0.36",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.0.36",
      publishedAt: "2026-04-08T07:12:56Z",
      isPrerelease: false,
      assetCount: 9,
      assets: [
        {
          name: "OpenStudio-ai-runtime-latest.json",
          size: 3515,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-ai-runtime-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-ai-runtime-stable-latest.json",
          size: 3515,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-ai-runtime-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-macos-stable.xml",
          size: 2181,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-appcast-macos-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-windows-stable.xml",
          size: 2271,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-appcast-windows-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-checksums.txt",
          size: 391,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-checksums.txt",
          downloadCount: 0
        },
        {
          name: "OpenStudio-macOS.dmg",
          size: 8302797,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-macOS.dmg",
          downloadCount: 5
        },
        {
          name: "OpenStudio-release-latest.json",
          size: 1884,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-release-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-release-stable-latest.json",
          size: 1884,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-release-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-Setup-x64.exe",
          size: 251474692,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.36/OpenStudio-Setup-x64.exe",
          downloadCount: 7
        }
      ]
    },
    {
      id: 306074699,
      tagName: "v0.0.34",
      name: "OpenStudio 0.0.34",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.0.34",
      publishedAt: "2026-04-07T12:33:29Z",
      isPrerelease: false,
      assetCount: 9,
      assets: [
        {
          name: "OpenStudio-ai-runtime-latest.json",
          size: 2918,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-ai-runtime-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-ai-runtime-stable-latest.json",
          size: 2918,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-ai-runtime-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-macos-stable.xml",
          size: 2181,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-appcast-macos-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-windows-stable.xml",
          size: 2271,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-appcast-windows-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-checksums.txt",
          size: 391,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-checksums.txt",
          downloadCount: 0
        },
        {
          name: "OpenStudio-macOS.dmg",
          size: 8292951,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-macOS.dmg",
          downloadCount: 0
        },
        {
          name: "OpenStudio-release-latest.json",
          size: 1884,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-release-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-release-stable-latest.json",
          size: 1884,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-release-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-Setup-x64.exe",
          size: 251469084,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.34/OpenStudio-Setup-x64.exe",
          downloadCount: 2
        }
      ]
    },
    {
      id: 305969488,
      tagName: "v0.0.33",
      name: "OpenStudio 0.0.33",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.0.33",
      publishedAt: "2026-04-07T07:54:40Z",
      isPrerelease: false,
      assetCount: 9,
      assets: [
        {
          name: "OpenStudio-ai-runtime-latest.json",
          size: 2918,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-ai-runtime-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-ai-runtime-stable-latest.json",
          size: 2918,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-ai-runtime-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-macos-stable.xml",
          size: 2181,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-appcast-macos-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-appcast-windows-stable.xml",
          size: 2271,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-appcast-windows-stable.xml",
          downloadCount: 1
        },
        {
          name: "OpenStudio-checksums.txt",
          size: 391,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-checksums.txt",
          downloadCount: 0
        },
        {
          name: "OpenStudio-macOS.dmg",
          size: 8292353,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-macOS.dmg",
          downloadCount: 1
        },
        {
          name: "OpenStudio-release-latest.json",
          size: 1884,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-release-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-release-stable-latest.json",
          size: 1884,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-release-stable-latest.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-Setup-x64.exe",
          size: 251470150,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.33/OpenStudio-Setup-x64.exe",
          downloadCount: 0
        }
      ]
    },
    {
      id: 305943341,
      tagName: "ai-runtime-v0.0.5",
      name: "OpenStudio AI Runtime 0.0.5",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/ai-runtime-v0.0.5",
      publishedAt: "2026-04-07T06:25:00Z",
      isPrerelease: false,
      assetCount: 4,
      assets: [
        {
          name: "macos-arm64-size-report.json",
          size: 384,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.5/macos-arm64-size-report.json",
          downloadCount: 1
        },
        {
          name: "OpenStudio-AI-Runtime-macos-arm64.zip",
          size: 308659007,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.5/OpenStudio-AI-Runtime-macos-arm64.zip",
          downloadCount: 7
        },
        {
          name: "OpenStudio-AI-Runtime-windows-base-x64.zip",
          size: 36828959,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.5/OpenStudio-AI-Runtime-windows-base-x64.zip",
          downloadCount: 7
        },
        {
          name: "windows-base-size-report.json",
          size: 509,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/ai-runtime-v0.0.5/windows-base-size-report.json",
          downloadCount: 1
        }
      ]
    },
    {
      id: 305747098,
      tagName: "v0.0.29",
      name: "OpenStudio 0.0.29",
      htmlUrl: "https://github.com/sdevil7th/OpenStudio/releases/tag/v0.0.29",
      publishedAt: "2026-04-06T17:17:55Z",
      isPrerelease: false,
      assetCount: 11,
      assets: [
        {
          name: "OpenStudio-ai-runtime-latest.json",
          size: 819,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-ai-runtime-latest.json",
          downloadCount: 2
        },
        {
          name: "OpenStudio-AI-Runtime-macos-arm64.zip",
          size: 308666928,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-AI-Runtime-macos-arm64.zip",
          downloadCount: 6
        },
        {
          name: "OpenStudio-ai-runtime-stable-latest.json",
          size: 819,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-ai-runtime-stable-latest.json",
          downloadCount: 2
        },
        {
          name: "OpenStudio-AI-Runtime-windows-x64.zip",
          size: 380049311,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-AI-Runtime-windows-x64.zip",
          downloadCount: 4
        },
        {
          name: "OpenStudio-appcast-macos-stable.xml",
          size: 2181,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-appcast-macos-stable.xml",
          downloadCount: 2
        },
        {
          name: "OpenStudio-appcast-windows-stable.xml",
          size: 2271,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-appcast-windows-stable.xml",
          downloadCount: 2
        },
        {
          name: "OpenStudio-checksums.txt",
          size: 386,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-checksums.txt",
          downloadCount: 1
        },
        {
          name: "OpenStudio-macOS.dmg",
          size: 8260285,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-macOS.dmg",
          downloadCount: 4
        },
        {
          name: "OpenStudio-release-latest.json",
          size: 1884,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-release-latest.json",
          downloadCount: 2
        },
        {
          name: "OpenStudio-release-stable-latest.json",
          size: 1884,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-release-stable-latest.json",
          downloadCount: 2
        },
        {
          name: "OpenStudio-Setup-x64.exe",
          size: 251419470,
          downloadUrl: "https://github.com/sdevil7th/OpenStudio/releases/download/v0.0.29/OpenStudio-Setup-x64.exe",
          downloadCount: 4
        }
      ]
    }
  ],
  releaseCount: 21,
  stats: {
    stars: 19,
    forks: 3,
    openIssues: 2,
    watchers: 19,
    commitCount: 83,
    contributorCount: 1
  }
};

let snapshotRequest: Promise<GithubRepoSnapshot> | null = null;

const shouldFetchGithubSnapshot = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const { hostname, port } = window.location;
  const localHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

  return !localHost || port === "8080" || port === "8888";
};

const normalizeGithubSnapshot = (snapshot: GithubRepoSnapshot): GithubRepoSnapshot => ({
  ...snapshot,
  languages: snapshot.languages ?? githubFallbackSnapshot.languages,
  contributors: snapshot.contributors ?? githubFallbackSnapshot.contributors,
});

export const getGithubRepoSnapshot = async () => {
  if (!shouldFetchGithubSnapshot()) {
    return githubFallbackSnapshot;
  }

  if (!snapshotRequest) {
    snapshotRequest = fetch(GITHUB_SNAPSHOT_ENDPOINT, {
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`GitHub snapshot request failed with status ${response.status}`);
        }

        return (await response.json()) as GithubRepoSnapshot;
      })
      .then(normalizeGithubSnapshot)
      .catch((error) => {
        snapshotRequest = null;
        throw error;
      });
  }

  return snapshotRequest;
};

export const formatGithubDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const formatGithubNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);

export const formatLanguageMix = (snapshot: GithubRepoSnapshot, count = 3) =>
  snapshot.languages
    .slice(0, count)
    .map((language) => `${language.name} ${language.percent}%`)
    .join("  |  ");
