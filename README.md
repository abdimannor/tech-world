# Tech World

An early exercise, from 2023, in classes and an external stylesheet. The page is a short Swedish advert for a technology programme: a heading, two lines of text in different colours, a picture, and a link to the design and product development programme at NTI Gymnasiet in Helsingborg.

## The reworked version

The text and the link are unchanged; the page is now a dark card with the photo on top. The original is in the git history.

- **Still one external stylesheet.** `index.html` loads `style.css` with `<link rel="stylesheet">`; there are no inline styles or `<style>` blocks.
- **Element selectors vs class selectors.** `style.css` is split in two commented parts. Element selectors (`body`, `h1`, `p`, `img`, `a`) set the base for every element of that type. Class selectors (`.highlight`, `.slogan`, `.cta`, `.card`) let two paragraphs that share the `<p>` tag look different.
- **Renamed classes.** `.red-text` is now `.highlight` and `.blue-text` is now `.slogan`. The old names described the look; the new ones describe the role, so they stay true if the colours change (as they did here: both are lighter for contrast on the dark background).
- **Smaller fixes.** The `<br>` is gone; the link is a button-style call to action with a visible focus outline. The image has width and height set and a more specific alt text. The layout is responsive.

## Open it locally

No build step or server is needed. Clone the repository and open `index.html` in a browser:

```
git clone https://github.com/abdimannor/tech-world.git
cd tech-world
open index.html
```

On Windows or Linux, double-click the file or drag it into a browser window instead of `open`.

Live at [tech-world-zeta.vercel.app](https://tech-world-zeta.vercel.app/), hosted on Vercel and open to everyone. Every push to `master` redeploys it.

## License

MIT, see [LICENSE](LICENSE).
