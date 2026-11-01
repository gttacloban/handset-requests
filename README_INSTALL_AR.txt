طريقة نشر رابط التثبيت على GitHub Pages
======================================

موقعك الحالي:
https://gttacloban.github.io/handset-requests/

رابط التثبيت الجديد (يعمل بعد رفع الملفات):
https://gttacloban.github.io/handset-requests/install.html

1) افتح مستودع GitHub باسم handset-requests.
2) ارفع جميع الملفات السبعة التالية إلى جذر المستودع (المجلد الذي يحتوي index.html):
   index.html
   install.html
   manifest.webmanifest
   sw.js
   icon-192.png
   icon-512.png
   icon-maskable.png
   apple-touch-icon.png
3) استبدل index.html الحالي بالنسخة الجديدة. لا ترفع Code.gs أو تعدله؛ لا حاجة لذلك.
4) انتظر اكتمال GitHub Pages ثم افتح رابط التثبيت أعلاه على هاتفك.
5) Android: افتح install.html واضغط تثبيت. إذا لم يظهر طلب التثبيت، استخدم قائمة Chrome ⋮ > Install app / Add to Home screen.
6) iPhone: من Safari افتح رابط التثبيت، ثم مشاركة > Add to Home Screen > Add.

ملاحظة: لا يوجد رابط يستطيع تثبيت الموقع تلقائياً من دون موافقة المستخدم؛ متصفحات الموبايل تفرض خطوة تثبيت يدوية.
يستخدم هذا التحديث Service Worker يعمل عبر الشبكة فقط (لا يخزّن بيانات الزبائن أو الطلبات)، لذا لا يتيح العمل دون إنترنت.
لتجربة التحديث تأكد أن الرابط المباشر install.html يعمل بعد النشر.
