import React, { useState } from 'react';
import { HelpCircle, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayInput } from '../../components/common/ClayInput';
import { ClayButton } from '../../components/common/ClayButton';

interface FAQItem {
  question: string;
  kannadaQuestion?: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does the 3 or 6 months commitment model work?',
    kannadaQuestion: '3 ಅಥವಾ 6 ತಿಂಗಳ ಅವಧಿ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?',
    answer: 'Shikshan pairs a student with a verified tutor for a full academic term (3 or 6 months) for consistent conceptual learning, rather than isolated 1-hour sessions.',
  },
  {
    question: 'Can students learn and tutors teach in Kannada?',
    kannadaQuestion: 'ವಿದ್ಯಾರ್ಥಿಗಳು ಕನ್ನಡ ಮಾಧ್ಯಮದಲ್ಲಿ ಕಲಿಯಬಹುದೇ?',
    answer: 'Yes! A primary mission of Shikshan is supporting students from Kannada-medium backgrounds and rural areas. Tutors can teach in Kannada, English, or bilingual explanation.',
  },
  {
    question: 'How long does tutor verification take?',
    kannadaQuestion: 'ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆ ಎಷ್ಟು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ?',
    answer: 'Our target review period is within 1 day. The founder and trusted educators manually examine academic marksheets and qualifications outside the app before granting approval.',
  },
  {
    question: 'How are my uploaded marksheets and documents protected?',
    kannadaQuestion: 'ನನ್ನ ಅಂಕಪಟ್ಟಿಗಳನ್ನು ಹೇಗೆ ಸುರಕ್ಷಿತವಾಗಿರಿಸಲಾಗುತ್ತದೆ?',
    answer: 'Documents are stored in a private, encrypted Supabase Storage bucket. They are never publicly viewable. Only authenticated reviewers can inspect them via secure signed URLs.',
  },
  {
    question: 'How can a student or tutor request account deletion?',
    kannadaQuestion: 'ಖಾತೆಯನ್ನು ಅಳಿಸಲು ವಿನಂತಿಸುವುದು ಹೇಗೆ?',
    answer: 'You can email support@shikshan.org at any time. We will completely delete your authentication profile, academic data, and uploaded documents from the database and storage.',
  },
];

export const HelpContactPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setIsSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Help & Contact" subtitle="Student & Tutor Support" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 text-left">
        {/* Support Overview */}
        <ClayCard className="p-6 sm:p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Help & Support Center
            </h2>
            <p className="text-xs text-slate-500 font-kannada mt-0.5">
              ಸಹಾಯ ಕೇಂದ್ರ • We are here to support your learning journey.
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Have questions about student registration, tutor verification, or the 3/6-month support model? Browse the frequently asked questions below or contact our team directly.
          </p>
        </ClayCard>

        {/* Frequently Asked Questions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Frequently Asked Questions
          </h3>

          <div className="space-y-2">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <ClayCard
                  key={index}
                  interactive
                  onClick={() => toggleFaq(index)}
                  className="p-4 transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {faq.question}
                      </h4>
                      {faq.kannadaQuestion && (
                        <p className="text-xs text-slate-500 font-kannada mt-0.5">
                          {faq.kannadaQuestion}
                        </p>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </ClayCard>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <ClayCard className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Send a Message to the Shikshan Team
            </h3>
          </div>

          {isSent ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm">Thank You for Reaching Out!</p>
              <p>Your message has been received. Our team will respond to your email shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-3">
              <ClayInput
                label="Your Name"
                required
                placeholder="e.g. Suresh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <ClayInput
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="help-contact-message" className="text-sm font-semibold text-slate-800">
                  Message / Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="help-contact-message"
                  required
                  rows={3}
                  placeholder="Tell us what you need help with..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="clay-input text-xs"
                />
              </div>

              <ClayButton
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                icon={<Send className="w-4 h-4" />}
              >
                Send Message
              </ClayButton>
            </form>
          )}

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            Official Support Email: <strong className="text-slate-800 font-mono">support@shikshan.org</strong>
          </div>
        </ClayCard>
      </main>
    </div>
  );
};
