# Tech World

Live: [tech-world-zeta.vercel.app](https://tech-world-zeta.vercel.app/)

Lesson 2 of 4 in a small web course built from my first coursework pages from 2023. Each lesson keeps the original exercise, explains it, and adds something to try; a course bar at the top tracks which lessons you have finished (stored only in your browser) and links to the next one.

Lektion 1: [Hello Web](https://hello-web-kappa.vercel.app/) · Lektion 2: Tech World (this one) · Lektion 3: [Link Lab](https://link-lab-flax.vercel.app/) · Lektion 4: [Dress Code](https://dress-code-bay.vercel.app/)

An early exercise, from 2023, in classes and an external stylesheet. The page is a short Swedish advert for a technology programme: a heading, two lines of text in different colours, a picture, and a link to the design and product development programme at NTI Gymnasiet in Helsingborg.

## The reworked version

The text and the link are unchanged; the page is now a dark card with the photo on top. The original is in the git history.

- **Still one external stylesheet.** `index.html` loads `style.css` with `<link rel="stylesheet">`; there are no inline styles or `<style>` blocks.
- **Element selectors vs class selectors.** `style.css` is split in two commented parts. Element selectors (`body`, `h1`, `p`, `img`, `a`) set the base for every element of that type. Class selectors (`.highlight`, `.slogan`, `.cta`, `.card`) let two paragraphs that share the `<p>` tag look different.
- **Renamed classes.** `.red-text` is now `.highlight` and `.blue-text` is now `.slogan`. The old names described the look; the new ones describe the role, so they stay true if the colours change (as they did here: both are lighter for contrast on the dark background).
- **Smaller fixes.** The `<br>` is gone; the link is a button-style call to action with a visible focus outline. The image has width and height set and a more specific alt text. The layout is responsive.

## On the page now

- **Selector inspector.** Point at any element of the card to see which element and class selectors from `style.css` match it and what colour results. A rename switch swaps the class names so the class rules stop matching.
- **Name the selector.** A quiz frames one element of the card and asks which selector styles it. Finishing it marks the lesson done.

- **Selektorverkstan** (`workbench.html`): the lesson on how a browser *matches* selectors. See below.

The course bar, the next-lesson block and the motion switch come from `course.css` and `course.js`, which are identical in all four repos.

## Selektorverkstan: how a browser matches selectors

The 2023 exercise put `p` next to `.red-text`: one rule hits every paragraph, the other only the paragraph that opts in. The workbench page asks the next question: how does the browser decide what a selector matches, and which rule wins when several do?

- **Type any selector.** It runs through the browser's own `querySelectorAll` against a small sample document (`dokument.html`, built from this page's own content: the card, a menu, a list of topics). Matches are outlined in the rendered document and in an element tree. An invalid selector gets a plain message instead of breaking the page.
- **Parts and specificity.** The selector is split into compound selectors and combinators, and each part shows its (a, b, c). `specificity.js` follows [Selectors Level 4, section 15](https://www.w3.org/TR/selectors-4/#specificity-rules): `:is()`, `:not()` and `:has()` take the most specific argument, `:where()` counts zero, `:nth-child(… of S)` is one pseudo-class plus `S`.
- **Right to left.** Engines test the rightmost compound first and then walk up or back through the tree. The steps list shows how many elements survive as each part to the left is added.
- **Twelve levels.** Each level outlines some elements; write a selector that selects exactly those. The answer is checked by comparing the set of matches with the set of targets, so any equivalent selector is right. The levels go from type and class selectors through the four combinators, attribute selectors, `:not()`, `:nth-child()` and `:has()`. Progress is kept in this site's localStorage.

## Open it locally

No build step or server is needed. Clone the repository and open `index.html` in a browser:

```
git clone https://github.com/abdimannor/tech-world.git
cd tech-world
open index.html
```

On Windows or Linux, double-click the file or drag it into a browser window instead of `open`. The workbench reads the sample document from an iframe, which browsers block on `file://`, so serve the folder for that page:

```
python3 -m http.server 8752
```

## Tests

A Playwright suite (`tests/`) checks that every page loads without errors and has no axe-core violations, that the motion switch starts off under Reduce motion and keeps the choice, and that the workbench matches, rejects invalid selectors, computes specificity for the Selectors 4 examples, and that every level is solvable and saved.

```
npm ci
npx playwright install chromium
npm test
```

CI runs the same suite (`.github/workflows/test.yml`) next to the HTML check.

The site is hosted on Vercel; every push to `master` redeploys it.

## License

MIT, see [LICENSE](LICENSE).
