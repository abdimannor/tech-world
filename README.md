# Tech World

An early exercise, from 2023, in classes and an external stylesheet. The page is a short Swedish advert for a technology programme: a heading, two lines of text in different colours, a picture, and a link to the design and product development programme at NTI Gymnasiet in Helsingborg.

## What to look at

- **An external stylesheet.** `index.html` loads `style.css` with `<link rel="stylesheet">` on line 15. All the styling lives in that separate file, which any number of pages could share.
- **Class selectors.** `style.css` has two rules, `.red-text` and `.blue-text`. Lines 19 and 20 of `index.html` opt in with `class="..."`. An element selector like `p` would style every paragraph the same; a class lets two paragraphs that use the same tag look different.
- **Naming.** The class names describe the look (`red-text`) rather than the role of the text. That is fine for practice, but a name like `highlight` would still make sense if the colour changed later.
- **Alt text.** The image has a description (`alt="En bild på teknik"`), which the earlier hello-web page did not have.

A small fix in this version: the `<br>` that used to sit inside the link now comes just before it, so the link holds only its text. The page looks the same.

## Open it locally

No build step or server is needed. Clone the repository and open `index.html` in a browser:

```
git clone https://github.com/abdimannor/tech-world.git
cd tech-world
open index.html
```

On Windows or Linux, double-click the file or drag it into a browser window instead of `open`.

There is no live demo. The repository is private and GitHub Pages is not enabled for it, so the Pages workflow has nothing to publish to.

## License

MIT, see [LICENSE](LICENSE).
