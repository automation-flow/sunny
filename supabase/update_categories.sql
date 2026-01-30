-- Sunny ERP: Update Categories for Israeli Tax Law 2026
-- Run this in Supabase SQL Editor

-- Step 1: Add 'Mixed' to the parent_category enum
ALTER TYPE parent_category ADD VALUE IF NOT EXISTS 'Mixed';

-- Step 2: Delete all existing categories
DELETE FROM categories;

-- Step 3: Insert new categories with Hebrew descriptions

-- COGS (Cost of Goods Sold)
INSERT INTO categories (name, parent_category, tax_recognition_percent, description) VALUES
('Software Licenses (Production)', 'COGS', 1.0, 'תשתיות ייצור שמשמשות ישירות ללקוחות (OpenAI, n8n, Pinecone).'),
('Subcontractors / Freelancers', 'COGS', 1.0, 'מפתחים, אנשי QA או מטמיעים חיצוניים לפרויקט ספציפי.'),
('Servers & Cloud Infra', 'COGS', 1.0, 'שרתים ואחסון (AWS, GCP, Azure, VPS).');

-- OPEX (Operational Expenses)
INSERT INTO categories (name, parent_category, tax_recognition_percent, description) VALUES
('Marketing & Advertising', 'OPEX', 1.0, 'פייסבוק, גוגל, לינקדאין, טיקטוק (חובה חשבונית מס ערוכה כדין).'),
('SaaS Tools (Internal)', 'OPEX', 1.0, 'כלי ניהול פנימיים: Notion, Slack, Google Workspace, CRM.'),
('Professional Services', 'OPEX', 1.0, 'רואה חשבון, עורך דין, ייעוץ עסקי/אסטרטגי.'),
('Office Supplies & Hardware', 'OPEX', 1.0, 'ציוד משרדי מתכלה. חומרה יקרה (מחשבים) נרשמת כ-100% תזרימית אך מוכרת לפי פחת.'),
('Refreshments (Office)', 'OPEX', 0.8, 'כיבוד קל במשרד (קפה, חלב, עוגיות). לא כולל ארוחות צהריים אישיות.'),
('Business Gifts', 'OPEX', 1.0, 'מתנות ללקוחות/ספקים. מוכר עד תקרה שנתית (כ-230 שח לאדם).'),
('Professional Training', 'OPEX', 1.0, 'קורסים והשתלמויות לשמירה על הקיים (עדכוני AI, קורסים מקצועיים).'),
('Business Meals (Foreign Guests)', 'OPEX', 1.0, 'אירוח תושבי חוץ בלבד (חובה לתעד: שם האורח, מדינה, סיבת ביקור).'),
('Business Meals (Local)', 'OPEX', 0.0, 'מסעדות בארץ עם לקוחות ישראלים - לא מוכר במס (0%).');

-- Mixed Expenses (Requires Partner/Business Logic)
INSERT INTO categories (name, parent_category, tax_recognition_percent, description) VALUES
('Home Office - Arnona', 'Mixed', 0.25, 'הוצאה מעורבת: בדכ מוכר 25% (חדר אחד מתוך 4).'),
('Home Office - Electricity/Water', 'Mixed', 0.25, 'הוצאה מעורבת: בדכ מוכר 25% (חלק יחסי).'),
('Communication (Phone/Net)', 'Mixed', 1.0, 'מוגדר כ-100% כברירת מחדל, הרוח יבצע התאמות בסוף שנה אם יש שימוש פרטי מהותי.'),
('Vehicle Expenses (Fuel/Maint)', 'Mixed', 0.45, 'לפי תקנות מס הכנסה לעסקים ללא יומן רכב (45% מוכר).'),
('Travel Abroad (Business)', 'Mixed', 1.0, 'טיסות ולינה (בכפוף לתקרות). אש״ל מוכר לפי תעריף יומי.');

-- Financial
INSERT INTO categories (name, parent_category, tax_recognition_percent, description) VALUES
('Bank Fees & Commissions', 'Financial', 1.0, 'עמלות בנק, דמי כרטיס, המרות מטח.'),
('Fines & Penalties', 'Financial', 0.0, 'קנסות (חניה, תעבורה, איחור בדיווח) - לא מוכר במס כלל.');

-- Verify the results
SELECT name, parent_category, tax_recognition_percent, description FROM categories ORDER BY parent_category, name;
