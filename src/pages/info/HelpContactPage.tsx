import React, { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle2 } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayInput } from '../../components/common/ClayInput';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayIdeaBulb } from '../../components/common/Clay3DIllustrations';

interface FAQItem {
  question: string;
  kannadaQuestion?: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does the continuous mentorship model work?',
    kannadaQuestion: 'ನಿರಂತರ ಮಾರ್ಗದರ್ಶನ ಮಾದರಿ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ?',
    answer: 'Shikshan pairs a student with a verified tutor for continuous, structured learning over an agreed period, rather than isolated 1-hour doubt sessions.',
  },
  {
    question: 'Can students learn and tutors teach in Kannada?',
    kannadaQuestion: 'ವಿದ್ಯಾರ್ಥಿಗಳು ಕನ್ನಡ ಮಾಧ್ಯಮದಲ್ಲಿ ಕಲಿಯಬಹುದೇ?',
    answer: 'Yes! A primary mission of Shikshan is supporting students from Kannada-medium backgrounds and rural areas. Tutors can teach in Kannada, English, or bilingual explanation.',
  },
  {
    question: 'How long does tutor verification take?',
    kannadaQuestion: 'ಶಿಕ್ಷಕರ ಪರಿಶೀಲನೆ ಎಷ್ಟು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತದೆ?',
    answer: 'Our target review period is within 1 day. The founder and trusted educators manually examine qualifications and teaching experience outside the app before granting approval.',
  },
  {
    question: 'How is user data and contact info protected?',
    kannadaQuestion: 'ಬಳಕೆದಾರರ ವಿವರಗಳನ್ನು ಹೇಗೆ ಸುರಕ್ಷಿತವಾಗಿರಿಸಲಾಗುತ್ತದೆ?',
    answer: 'Profiles and contact details are stored in a private, encrypted database. They are never publicly accessible or indexed by search engines.',
  },
  {
    question: 'How can a student or tutor request account deletion?',
    kannadaQuestion: 'ಖಾತೆಯನ್ನು ಅಳಿಸಲು ವಿನಂತಿಸುವುದು ಹೇಗೆ?',
    answer: 'You can email support@shikshan.org at any time. We will completely delete your authentication profile and academic preferences from the database upon request.',
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
    <ClayBackground className="min-h-screen flex flex-col">
      <Header title="Help & Contact" subtitle="Student & Tutor Support" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6 text-left">
        {/* Support Overview */}
        <ClayCard className="p-6 sm:p-8 space-y-3 border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <ClayIdeaBulb size={56} className="flex-shrink-0" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Help & Support Center
              </h2>
              <p className="text-xs text-slate-500 font-kannada mt-0.5">
                ಸಹಾಯ ಕೇಂದ್ರ • We are here to support your learning journey.
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Have questions about student registration, tutor verification, or discovery? Browse the frequently asked questions below or contact our team directly.
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
                  className="p-4 transition-all border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 leading-snug">
                        {faq.question}
                      </h4>
                      {faq.kannadaQuestion && (
                        <p className="text-xs text-slate-500 font-kannada mt-0.5">
                          {faq.kannadaQuestion}
                        </p>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-purple-100 text-xs text-slate-600 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  )}
                </ClayCard>
              );
            })}
          </div>
        </div>

        {/* Contact Form */}
        <ClayCard className="p-6 space-y-4 border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="font-extrabold text-sm text-slate-800">
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
                <label htmlFor="help-contact-message" className="text-xs font-bold text-slate-700 ml-1">
                  Message / Question <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="help-contact-message"
                  required
                  rows={3}
                  placeholder="Tell us what you need help with..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/90 rounded-2xl text-xs text-slate-800 font-medium placeholder-slate-400 border border-purple-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-all resize-none"
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

          <div className="pt-3 border-t border-purple-100 text-center text-xs text-slate-500 font-medium">
            Official Support Email: <strong className="text-[#7C3AED] font-mono">support@shikshan.org</strong>
          </div>
        </ClayCard>
      </main>
    </ClayBackground>
  );
};
