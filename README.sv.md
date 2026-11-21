# Tech World

Live: [tech-world-zeta.vercel.app](https://tech-world-zeta.vercel.app/) · [English README](README.md)

Lektion 2 av 4 i en liten webbkurs byggd på mina första kursuppgifter från 2023. Varje lektion behåller den ursprungliga övningen och bygger vidare på den.

## Övningen från 2023

En kort reklamsida för ett teknikprogram: en rubrik, två rader text i olika färger, en bild och en länk till programmet Design och produktutveckling på NTI Gymnasiet i Helsingborg. Poängen var skillnaden mellan två sorters selektorer i en extern stilmall. Typselektorn `p` träffar alla stycken; klasselektorerna `.red-text` och `.blue-text` (i dag `.highlight` och `.slogan`) låter två stycken med samma tagg se olika ut.

## Det som finns på sidan nu

- **Selector inspector** och **quizet** på startsidan: peka på kortet och se vilka regler som träffar, eller gissa vilken selektor som ger ett element dess utseende.
- **Selektorverkstan** (`workbench.html`): lektionen om hur webbläsaren *matchar* selektorer.

## Selektorverkstan

- **Skriv vilken selektor som helst.** Den körs med webbläsarens egen `querySelectorAll` mot ett litet exempeldokument (`dokument.html`) byggt av sidans eget innehåll. Träffarna markeras i dokumentet och i ett elementträd. En ogiltig selektor ger ett tydligt meddelande.
- **Delar och specificitet.** Selektorn delas upp i sammansatta selektorer och kombinatorer, och varje del visar sitt (a, b, c). `specificity.js` följer [Selectors Level 4, avsnitt 15](https://www.w3.org/TR/selectors-4/#specificity-rules): `:is()`, `:not()` och `:has()` tar sitt mest specifika argument, `:where()` räknas som noll och `:nth-child(… of S)` är en pseudoklass plus `S`.
- **Från höger till vänster.** Motorerna prövar den högra delen först och går sedan uppåt eller bakåt i trädet. Stegen visar hur många element som finns kvar när varje del till vänster läggs till.
- **Tolv nivåer.** Varje nivå ramar in några element; skriv en selektor som väljer exakt dem. Svaret kontrolleras genom att jämföra mängden träffar med mängden mål, så alla likvärdiga selektorer godkänns. Nivåerna går från typ och klass via de fyra kombinatorerna och attributselektorer till `:not()`, `:nth-child()` och `:has()`. Framstegen sparas i sajtens localStorage.

## Köra lokalt

Startsidan går att öppna direkt (`open index.html`). Verkstan läser exempeldokumentet i en iframe, vilket webbläsare blockerar från `file://`, så servera mappen:

```
python3 -m http.server 8752
```

## Tester

Playwright-sviten i `tests/` kontrollerar att alla sidor laddar utan fel och utan axe-core-anmärkningar, att rörelsereglaget är av när systemet har Reducera rörelse och minns valet, och att verkstan matchar, avvisar ogiltiga selektorer, räknar specificitet för exemplen i Selectors 4 och att varje nivå går att lösa och sparas.

```
npm ci
npx playwright install chromium
npm test
```

CI kör samma svit (`.github/workflows/test.yml`) bredvid HTML-kontrollen.

## Licens

MIT, se [LICENSE](LICENSE).
