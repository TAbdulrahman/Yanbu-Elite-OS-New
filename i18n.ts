import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "Yanbu Elite OS",
      "dashboard": "Dashboard",
      "scanner": "Smart Scanner",
      "assets": "Assets",
      "compliance": "Compliance",
      "finance": "Finance",
      "settings": "Settings",
      "attendance": "Attendance",
      "movement": "Movement Tracking",
      "emergency": "Silent Call",
      "logout": "Logout",
      "search_placeholder": "Search student, asset...",
      "scan_qr": "Scan QR Code",
      "student_tracking": "Student Tracking",
      "health_alerts": "Health Alerts",
      "financial_status": "Financial Status",
      "late_alert": "Late Return Alert",
      "maintenance": "Maintenance",
      "damage_claim": "Damage Claim",
      "ceo_suite": "CEO Suite",
    }
  },
  ar: {
    translation: {
      "app_name": "نظام ينبع النخبة",
      "dashboard": "لوحة القيادة",
      "scanner": "الماسح الذكي",
      "assets": "الأصول",
      "compliance": "الامتثال",
      "finance": "المالية",
      "settings": "الإعدادات",
      "attendance": "الحضور",
      "movement": "تتبع الحركة",
      "emergency": "نداء صامت",
      "logout": "تسجيل الخروج",
      "search_placeholder": "بحث عن طالب، أصل...",
      "scan_qr": "مسح رمز QR",
      "student_tracking": "تتبع الطلاب",
      "health_alerts": "تنبيهات صحية",
      "financial_status": "الحالة المالية",
      "late_alert": "تنبيه تأخر العودة",
      "maintenance": "الصيانة",
      "damage_claim": "مطالبة بالضرر",
      "ceo_suite": "جناح الرئيس التنفيذي",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
