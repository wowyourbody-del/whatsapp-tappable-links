# תיקון לינקים לחיצים — בוט הוואטסאפ של הסדנה

אם יש לכם את בוט הוואטסאפ מהסדנה
(`claude-whatsapp-bot`),
יש סיכוי טוב שלינקים שאתם שולחים בהודעות ארוכות בעברית **לא נפתחים בלחיצה** בנייד — גם אם הם נראים ירוקים ולחיצים.

זה תיקון של שורה אחת.

## הבעיה

שולחים הודעה ארוכה בעברית עם לינק דרך הבוט.
הלינק נצבע ירוק, אבל בלחיצה בנייד — כלום. בעיקר בטקסט
RTL
ארוך.

## הסיבה

הבוט שולח טקסט גולמי בלי link preview.
בלי preview, וואטסאפ מסמן את הלינק אבל אזור הלחיצה נשבר ב-
RTL
(באג ידוע).
ברגע שמפעילים preview, נוספים להודעה שדות ה-preview
(`matchedText`, `title`)
והלינקים נהיים לחיצים אמין.

> אל תבזבזו זמן על סימני כיוון
> (LRM / LRI),
> שורות ריקות או פיצול ההודעה. שום פורמט טקסטואלי לא מתקן את זה. רק ה-preview.

## התיקון

### צעד 1 — שורה אחת ב-bot.js

חפשו את
`makeWASocket({`
(בערך באמצע הקובץ) והוסיפו שורה אחת:

```js
sock = makeWASocket({
  auth: authState, version,
  browser: Browsers.macOS('Desktop'),
  printQRInTerminal: false,
  markOnlineOnConnect: false,
  syncFullHistory: false,
  generateHighQualityLinkPreview: true,   // ← הוסיפו את השורה הזו
});
```

הדגל ברמת ה-socket חל על **כל** ההודעות שהבוט שולח.

### צעד 2 — ודאו שהחבילה מותקנת

Baileys צריך את
`link-preview-js`
כדי לבנות את ה-preview:

```bash
npm install link-preview-js
```

זהו. הפעילו מחדש את הבוט ובדקו (ראו למטה).

## הפעלה ובדיקה

1. הפעילו מחדש את הבוט.
2. שלחו לעצמכם הודעה ארוכה בעברית עם לינק.
3. בנייד — הלינק נפתח בלחיצה, ומופיעה תצוגה מקדימה מתחתיו.

נבדק על
Node 25.9
וגם
Node 18+:
שני הצעדים האלה מספיקים.

## פתרון תקלות — אם הלינקים עדיין לא לחיצים

אם בלוג מופיע
`url generation failed`
(קורה בחלק מגרסאות
Node 24/25
שבהן הרזולבר לא מוצא את החבילה), הוסיפו את ה-shim הקטן הזה.

צרו את הקובץ
**`scripts/fix-link-preview.cjs`**
(מצורף ב-repo — שימו לב לסיומת
`.cjs`,
היא חשובה אם ה-package.json שלכם הוא
`"type": "module"`):

```js
const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'node_modules', 'link-preview-js', 'index.js');
try {
  if (fs.existsSync(path.dirname(target))) {
    fs.writeFileSync(target, "module.exports = require('./build/index.js');\n");
    console.log('[fix-link-preview] shim written:', target);
  }
} catch (e) {
  console.warn('[fix-link-preview] could not write shim:', e.message);
}
```

הוסיפו ל-
**`package.json`**
(בתוך
`"scripts"`)
כדי שישוחזר אוטומטית אחרי כל
`npm install`:

```json
"postinstall": "node scripts/fix-link-preview.cjs"
```

הריצו
`node scripts/fix-link-preview.cjs`
פעם אחת, הפעילו מחדש את הבוט, ובדקו שוב.

בדיקה מהירה:

```bash
ls node_modules/link-preview-js/index.js   # אמור להתקיים אחרי ה-shim
grep -c "url generation failed" bot.log     # אמור להיות 0 (היכן שהבוט כותב לוג)
```

---

נבנה ע"י WOW YOUR BODY. חופשי לשימוש.
