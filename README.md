# Codeforces Randomizer

Pick a random Codeforces problem by topic and difficulty — and optionally skip every problem
your contestants have already solved.

Built with React, TypeScript and styled-components. It talks directly to the public
[Codeforces API](https://codeforces.com/apiHelp) from the browser, so there is no backend,
no sign-in and no API key.

## Why

Two uses, one tool:

- **Practice.** Choose the tags you want to drill and a rating range, then pull a random
  problem instead of scrolling the problemset.
- **Contest preparation.** Paste the handles of everyone who will compete. Any problem that
  at least one of them has already solved is filtered out, so you do not hand your
  participants a problem half the room has seen before.

## Usage

1. **Pick topics.** Click any number of tags from the list. All current Codeforces tags are
   available.
2. **Choose how the tags combine.** See [tag matching modes](#tag-matching-modes) below.
3. **Set the rating range.** The slider covers 800 to 3500 in steps of 100.
4. **Optionally, list handles to exclude.** See [skipping solved problems](#skipping-solved-problems).
5. **Press Randomize.** The result is added to a history list; click any entry to open the
   problem on Codeforces.

If you press Randomize with no topics selected, a random tag is chosen for you (except in
`NOT` mode, where an empty selection correctly means "no exclusions", so the whole problemset
stays in play).

Your history is saved in the browser's local storage, so it survives a reload. Clear it any
time with the Clear button.

### Tag matching modes

The four buttons above the slider decide how your selected tags are interpreted. Codeforces'
API only supports one of these natively, so the rest are applied client-side.

| Mode | Returns problems that... | Example with `dp`, `greedy` |
|---|---|---|
| `AND` | carry **all** selected tags | tagged both `dp` and `greedy`, possibly more |
| `OR` | carry **at least one** selected tag | tagged `dp`, or `greedy`, or both |
| `ONLY` | carry the selected tags **and nothing else** | tagged exactly `dp` + `greedy` |
| `NOT` | carry **none** of the selected tags | anything that is neither `dp` nor `greedy` |

`ONLY` is the strictest and `NOT` scans the entire problemset, so both return fewer results
and take slightly longer.

### Skipping solved problems

Enter Codeforces handles in the text box under the slider, separated by commas, spaces or
newlines. Before a problem is picked, each handle's public submission history is fetched and
every problem with an accepted verdict is removed from the candidate pool.

Details worth knowing:

- **One solver is enough.** If any single handle on the list solved a problem, it is excluded
  for everyone.
- **Only accepted counts.** A wrong answer, time limit exceeded, or abandoned attempt does
  not disqualify a problem — only a green `OK`.
- **Handles are case-insensitive** and duplicates are ignored.
- **The first run is the slow one.** Codeforces permits one API request every two seconds, and
  each handle needs at least one request. Results are cached for the rest of the session, so
  re-rolling is instant.
- **Leave it empty to disable it.** With no handles, no submission requests are made at all.

Mistyped handles are reported back to you by name, and if your filters are so narrow that the
participants have collectively solved everything matching, you get told that specifically
rather than a generic "nothing found".

#### What it cannot see

The filter reads **public submission history only**. It will not catch:

- problems solved in a **Gym** or a **private group**
- problems solved on an account whose activity is hidden in Codeforces privacy settings
- problems solved on a **different account** than the handle you supplied
- a Gym **clone or rewrite** of a problem — Codeforces exposes no clone/original relationship
  through its API, so a rewritten duplicate is indistinguishable from an unseen problem

For a typical university contest this catches the large majority of repeats, but treat it as
a strong filter rather than a guarantee.

## Running locally

Requires [Node.js](https://nodejs.org/) and npm.

```bash
npm install
npm start
```

The app opens at http://localhost:3000.

| Script | Purpose |
|---|---|
| `npm start` | Development server with hot reload |
| `npm run build` | Production build into `build/` |
| `npm test` | Test runner in watch mode |
| `npm run deploy` | Build, then publish `build/` to the `gh-pages` branch |

The `start` and `build` scripts pass OpenSSL's legacy provider flag, which older
`react-scripts` needs to run on modern Node versions.

`homepage` in `package.json` is set to `"."`, so the build uses relative asset paths and works
from any host or subpath without further configuration.

## Project layout

```text
src/
├── components/     UI, one folder per component
├── models/         Problem, ProblemStatistics, LogicalOperator types
└── services/
    ├── problems.ts     fetches the problemset, applies tag/rating/solved filtering
    ├── submissions.ts  fetches handles' accepted problems, API rate limiting, caching
    ├── storage.ts      history in local storage
    └── data.ts         tag list and rating bounds
```

Both Codeforces endpoints used — `problemset.problems` and `user.status` — are public and go
through a shared throttle in `submissions.ts` that keeps requests at least two seconds apart.

## Contributing

Issues and pull requests are welcome. If you are proposing a feature, a short description of
the use case helps.

## Credits

Based on the original project: https://github.com/KarimElghamry/Codeforces-Randomizer
