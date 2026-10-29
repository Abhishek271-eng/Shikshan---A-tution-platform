export interface OptionItem {
  id: string;
  label: string;
  description?: string;
  kannadaLabel?: string;
}

export const EDUCATION_LEVELS: OptionItem[] = [
  { id: '10th_completed', label: '10th Standard Completed', kannadaLabel: '10ನೇ ತರಗತಿ ಪೂರ್ಣಗೊಂಡಿದೆ' },
  { id: 'puc_completed', label: 'PUC / 12th Completed', kannadaLabel: 'ಪಿಯುಸಿ / 12ನೇ ತರಗತಿ ಪೂರ್ಣಗೊಂಡಿದೆ' },
  { id: 'college_student', label: 'Current College / University Student', kannadaLabel: 'ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿ' },
  { id: 'graduate', label: 'Graduate (B.Sc / B.A / B.Com / B.E / B.Tech / etc.)', kannadaLabel: 'ಪದವೀಧರರು' },
  { id: 'post_graduate', label: 'Post Graduate (M.Sc / M.A / M.Tech / etc.)', kannadaLabel: 'ಸ್ನಾತಕೋತ್ತರ ಪದವೀಧರರು' },
  { id: 'qualified_teacher', label: 'Professional / Certified Teacher (B.Ed / D.Ed)', kannadaLabel: 'ವೃತ್ತಿಪರ ಶಿಕ್ಷಕರು' },
];

export const SCHOOL_SUBJECTS: OptionItem[] = [
  { id: 'mathematics', label: 'Mathematics', kannadaLabel: 'ಗಣಿತ (Mathematics)' },
  { id: 'science', label: 'Science (General / Physics / Chemistry / Biology)', kannadaLabel: 'ವಿಜ್ಞಾನ (Science)' },
  { id: 'kannada', label: 'Kannada Language & Grammar', kannadaLabel: 'ಕನ್ನಡ ಭಾಷೆ ಮತ್ತು ವ್ಯಾಕರಣ' },
  { id: 'english', label: 'English Language & Communication', kannadaLabel: 'ಇಂಗ್ಲಿಷ್ (English)' },
  { id: 'social_science', label: 'Social Science (History / Civics / Geography)', kannadaLabel: 'ಸಮಾಜ ವಿಜ್ಞಾನ (Social Science)' },
  { id: 'hindi', label: 'Hindi Language', kannadaLabel: 'ಹಿಂದಿ (Hindi)' },
];

export const CLASS_LEVEL_RANGES: OptionItem[] = [
  { id: 'classes_1_5', label: 'Classes 1–5 (Primary)', kannadaLabel: '1 ರಿಂದ 5ನೇ ತರಗತಿ (ಪ್ರಾಥಮಿಕ)' },
  { id: 'classes_6_8', label: 'Classes 6–8 (Higher Primary)', kannadaLabel: '6 ರಿಂದ 8ನೇ ತರಗತಿ (ಹಿರಿಯ ಪ್ರಾಥಮಿಕ)' },
  { id: 'classes_9_10', label: 'Classes 9–10 (High School / SSLC)', kannadaLabel: '9 ಮತ್ತು 10ನೇ ತರಗತಿ (ಪ್ರೌಢಶಾಲೆ / SSLC)' },
];

export const INDIVIDUAL_CLASSES: OptionItem[] = [
  { id: 'class_1', label: 'Class 1' },
  { id: 'class_2', label: 'Class 2' },
  { id: 'class_3', label: 'Class 3' },
  { id: 'class_4', label: 'Class 4' },
  { id: 'class_5', label: 'Class 5' },
  { id: 'class_6', label: 'Class 6' },
  { id: 'class_7', label: 'Class 7' },
  { id: 'class_8', label: 'Class 8' },
  { id: 'class_9', label: 'Class 9' },
  { id: 'class_10', label: 'Class 10 (SSLC)' },
];

export const EDUCATION_BOARDS: OptionItem[] = [
  { id: 'karnataka_state_board', label: 'Karnataka State Board (KSEAB / SSLC)', kannadaLabel: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪಠ್ಯಕ್ರಮ (KSEAB)' },
  { id: 'cbse', label: 'CBSE (Central Board of Secondary Education)', kannadaLabel: 'ಸಿ.ಬಿ.ಎಸ್.ಇ (CBSE)' },
  { id: 'icse', label: 'ICSE (Council for the Indian School Certificate Examinations)', kannadaLabel: 'ಐ.ಸಿ.ಎಸ್.ಇ (ICSE)' },
  { id: 'other', label: 'Other Recognized Board', kannadaLabel: 'ಇತರ' },
];

export const TEACHING_LANGUAGES: OptionItem[] = [
  { id: 'kannada', label: 'Kannada (ಕನ್ನಡ)', kannadaLabel: 'ಕನ್ನಡ' },
  { id: 'english', label: 'English', kannadaLabel: 'ಇಂಗ್ಲಿಷ್' },
  { id: 'bilingual', label: 'Bilingual (Kannada + English)', kannadaLabel: 'ದ್ವಿಭಾಷಾ (ಕನ್ನಡ + ಇಂಗ್ಲಿಷ್)' },
  { id: 'hindi', label: 'Hindi', kannadaLabel: 'ಹಿಂದಿ' },
];

export const FEE_UNITS = [
  { id: 'per_hour', label: 'Per Hour', shortLabel: '/hr' },
  { id: 'per_session', label: 'Per Session', shortLabel: '/session' },
  { id: 'per_month', label: 'Per Month', shortLabel: '/mo' },
];

export const WEEKDAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

export const TIME_WINDOWS = [
  { id: 'morning_early', label: 'Morning (6:00 AM – 9:00 AM)' },
  { id: 'afternoon', label: 'Afternoon (2:00 PM – 5:00 PM)' },
  { id: 'evening_prime', label: 'Prime Evening (5:00 PM – 8:00 PM)' },
  { id: 'night', label: 'Night (8:00 PM – 10:00 PM)' },
  { id: 'weekend_flexible', label: 'Weekends (Flexible Hours)' },
];
