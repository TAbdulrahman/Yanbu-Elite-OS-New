# Yanbu Elite Governance Intelligence OS - Handover Documentation

## 1. System Overview
The **Yanbu Elite OS** is a consolidated governance platform designed for high-performance school management. Built with a **King Black & Gold** aesthetic, it utilizes React, Supabase, and Web Audio API for a real-time, sensory-driven experience.

### Key Modules:
- **Executive Dashboard (CEO):** Real-time operation heatmap, critical violation tracking, and financial overhead monitoring.
- **Smart Scanner (Teacher):** QR-based student movement recording and instant asset damage linkage.
- **Compliance Hub (Counselor):** Disciplinary audit logs and Ministry of Education (Noor) data synchronization.
- **Financial Escalation:** Automated fee generation for repeated system misuse.

## 2. CEO Quick-Start Guide / دليل التشغيل السريع للمدير التنفيذي
### English
1. **Live Monitoring:** The main dashboard heatmap visualizes classroom traffic flow. Bars represent frequency of movement.
2. **Governance Rules:** The system enforces a "5-Minute Rule." Movements turning **Ruby Red** have exceeded the limit.
3. **Escalations:** Any student reaching 3 breaches automatically triggers an administrative fee and a parent meeting request in the Financial module.

### العربية
1. **المراقبة الحية:** توضح الخريطة الحرارية في لوحة التحكم الرئيسية تدفق حركة الطلاب. تمثل الأعمدة تكرار الحركة.
2. **قواعد الحوكمة:** يطبق النظام "قاعدة الـ 5 دقائق". عندما يتحول لون العداد إلى **الأحمر (Ruby Red)**، فهذا يعني تجاوز الحد المسموح.
3. **التصعيد:** أي طالب يصل إلى 3 مخالفات يقوم النظام تلقائياً بإنشاء رسوم إدارية وطلب اجتماع مع ولي الأمر.

## 3. Teacher's Manual (3 Steps) / دليل المعلم (3 خطوات)
1. **Scan Student:** Select the location (Restroom/Clinic) and scan the student's QR code to initiate the session.
2. **Monitor:** If the timer turns **Gold**, the limit is approaching. Remind students if possible.
3. **Asset Guard:** If damage is found, use the **Search/Investigate** icon on any active card to link the student to the room's assets and report damage instantly.

## 4. Maintenance & Data Management
To add new students, assets, or rooms:
1. Access your **Supabase Project Dashboard**.
2. Navigate to the **Table Editor**.
3. **Students:** Add entries to `profiles` with `role: 'student'`.
4. **Assets:** Add entries to `assets` with the corresponding `location` name.
5. **Rooms:** The scanner room list can be updated in `ScannerModule.tsx`.

## 5. Technical Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion.
- **Backend:** Supabase (Auth, Firestore-style Database, Realtime).
- **Audio:** Custom Web Audio API Oscillator synthesis (No external dependencies).
- **Export:** Noor-compliant CSV Generation.

## 6. Final Production Checklist (Supabase)
Before going live with 1,280 students, complete these 5 steps in your Supabase Console:
1. **Enable Realtime:** Go to **Database > Replication** and ensure `supabase_realtime` is enabled for `student_movement`, `compliance_logs`, and `financial_entries`.
2. **Setup RLS:** Ensure **Row Level Security** is enabled on all tables to prevent public data leaks.
3. **Configure Redirects:** In **Auth > URL Configuration**, add your production domain to the allowlist.
4. **Trigger Deployment:** Run the SQL from `SCHEMA.sql` in the **SQL Editor** to initialize the structural intelligence layer.
5. **Admin Onboarding:** Manually create your executive profile (CEO) in the `profiles` table to gain immediate dashboard access.
