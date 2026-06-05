# TaskFlow — מדריך העלאה ל-Vercel

## מה בפרויקט
- React + Vite
- PWA מלא (אייקון על מסך הבית, עבודה אופליין)
- localStorage לשמירת משימות בין סשנים
- סוכן AI עם קול וטקסט

---

## שלב 1 — GitHub (2 דקות)

1. כנס ל-[github.com](https://github.com) → **New repository**
2. שם: `taskflow` | Public | **Create**
3. העלה את כל הקבצים (drag & drop לממשק GitHub)
   - או דרך terminal:
   ```bash
   cd taskflow
   git init
   git add .
   git commit -m "init"
   git remote add origin https://github.com/YOUR_USER/taskflow.git
   git push -u origin main
   ```

---

## שלב 2 — Vercel (3 דקות)

1. כנס ל-[vercel.com](https://vercel.com) → **Sign in with GitHub**
2. לחץ **Add New → Project**
3. בחר את ה-repo `taskflow`
4. הגדרות Build (Vercel יזהה אוטומטית):
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables** — חשוב!
   - שם: `VITE_ANTHROPIC_API_KEY`
   - ערך: `sk-ant-...` (המפתח שלך מ-console.anthropic.com)
6. לחץ **Deploy** ✅

---

## שלב 3 — התקנה על הטלפון (1 דקה)

### אנדרואיד (Chrome):
1. פתח את ה-URL שקיבלת מ-Vercel בכרום
2. תפריט (3 נקודות) → **"הוסף למסך הבית"**
3. אשר → האפליקציה מותקנת! 🎉

### iOS (Safari):
1. פתח ב-Safari → כפתור **שתף** ↑
2. **"הוסף למסך הבית"**

---

## עדכונים עתידיים

כשתרצה לעדכן:
1. שנה את הקוד / קבל קוד חדש מ-Claude
2. החלף את `src/App.jsx`
3. `git add . && git commit -m "update" && git push`
4. Vercel יבנה ויפרוס אוטומטית תוך ~60 שניות
5. רענן את האפליקציה בטלפון → העדכון חי ✅

---

## מפתח API

המפתח נמצא ב: [console.anthropic.com](https://console.anthropic.com)
→ API Keys → Create Key

⚠️ **חשוב:** אל תעלה את המפתח ל-GitHub. הוא נשמר רק ב-Vercel Environment Variables.

