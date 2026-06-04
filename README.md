# תיקון לינקים לחיצים — בוט הוואטסאפ של הסדנה

אם יש לכם את בוט הוואטסאפ מהסדנה
(`claude-whatsapp-bot`),
יש סיכוי טוב שלינקים שאתם שולחים בהודעות ארוכות בעברית **לא נפתחים בלחיצה** בנייד — גם אם הם נראים ירוקים ולחיצים.

זה תיקון של שורה אחת
(+ עוד שני צעדים קטנים).

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
ברגע שמפעילים preview, ההודעה נשלחת כ-
`extendedTextMessage`
והלינקים נהיים לחיצים אמין.

> אל תבזבזו זמן על סימני כיוון
> (LRM / LRI),
> שורות ריקות או פיצול ההודעה. שום פורמט טקסטואלי לא מתקן את זה. רק ה-preview.

## התיקון — 3 צעדים

### 1. שורה אחת ב-bot.js

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

זהו. הדגל ברמת ה-socket חל על **כל** ההודעות שהבוט שולח.

### 2. התקינו את החבילה

```bash
npm install link-preview-js
```

### 3. (ל-Node 24/25) shim קטן

תחת
Node 25
החבילה לא נפתרת לבד — והלינקים שוב לא לחיצים, עם
`url generation failed`
בלוג.

צרו את הקובץ
**`scripts/fix-link-preview.js`**
(מצורף ב-repo):

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

והוסיפו ל-
**`package.json`**
(בתוך
`"scripts"`):

```json
"postinstall": "node scripts/fix-link-preview.js"
```

ה-shim נמחק בכל
`npm install`,
אבל ה-postinstall משחזר אותו אוטומטית.

## הפעלה מחדש ובדיקה

1. הריצו
   `npm install`
   (כדי להפעיל את ה-postinstall).
2. הפעילו מחדש את הבוט.
3. שלחו לעצמכם הודעה ארוכה בעברית עם לינק — בנייד הלינק נפתח בלחיצה, ומופיעה תצוגה מקדימה מתחתיו.

בדיקה מהירה:

```bash
ls node_modules/link-preview-js/index.js   # צריך להתקיים
grep -c "url generation failed" bot.log     # צריך להיות 0
```

---

נבנה ע"י WOW YOUR BODY. חופשי לשימוש.
