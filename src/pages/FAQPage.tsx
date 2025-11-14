import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { navigateTo } from '../lib/router';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <Card className="mb-4 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
      >
        <span className="text-lg font-semibold text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-8 pb-6 text-slate-300 leading-relaxed">
          {answer}
        </div>
      )}
    </Card>
  );
}

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Getting Started',
      questions: [
        {
          question: 'What is Clear Course Studio?',
          answer: 'Clear Course Studio is a modern learning management platform that helps educators and organizations create, manage, and deliver online courses. We provide all the tools you need to build engaging learning experiences, from course creation to analytics and reporting.'
        },
        {
          question: 'How do I get started?',
          answer: 'Getting started is easy! Sign up for a free 14-day trial, create your organization, and start building your first course right away. No credit card required for the trial. Our intuitive course builder will guide you through the process.'
        },
        {
          question: 'Do I need technical skills to use Clear Course Studio?',
          answer: 'No technical skills required! Our platform is designed to be user-friendly for everyone. The drag-and-drop course builder makes it easy to upload content, organize lessons, and publish courses without any coding knowledge.'
        },
        {
          question: 'Can I import existing course content?',
          answer: 'Yes! You can upload videos, PDFs, documents, presentations, and other course materials. We support all major file formats, making it easy to migrate your existing content to our platform.'
        }
      ]
    },
    {
      category: 'Pricing & Plans',
      questions: [
        {
          question: 'How much does Clear Course Studio cost?',
          answer: 'We offer flexible pricing plans to fit organizations of all sizes. Start with our free 14-day trial to explore all features. After that, choose from our Starter, Professional, or Enterprise plans based on your needs. Visit our pricing page for detailed information.'
        },
        {
          question: 'Can I change my plan later?',
          answer: 'Absolutely! You can upgrade or downgrade your plan at any time. When you upgrade, you\'ll get immediate access to new features. If you downgrade, changes take effect at the end of your current billing cycle.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor, Stripe. Enterprise customers can also arrange for invoice billing.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with our platform within the first 30 days, contact us for a full refund. See our refund policy for more details.'
        }
      ]
    },
    {
      category: 'Features & Functionality',
      questions: [
        {
          question: 'What types of content can I upload?',
          answer: 'You can upload videos (MP4, MOV, WebM), documents (PDF, DOC, DOCX), presentations (PPT, PPTX), images, and other common file formats. Each plan includes generous storage for your course materials.'
        },
        {
          question: 'Can I track learner progress?',
          answer: 'Yes! Our comprehensive analytics dashboard lets you track individual learner progress, course completion rates, engagement metrics, and more. You can generate detailed reports and identify learners who may need additional support.'
        },
        {
          question: 'Is the platform mobile-friendly?',
          answer: 'Absolutely! Clear Course Studio is fully responsive and works seamlessly on desktop, tablet, and mobile devices. Learners can access courses from any device, and their progress is automatically synced across all platforms.'
        },
        {
          question: 'Can multiple instructors collaborate on courses?',
          answer: 'Yes! You can add multiple instructors and admins to your organization. Team members can collaborate on course creation, manage learners, and access analytics based on their assigned roles.'
        }
      ]
    },
    {
      category: 'Security & Privacy',
      questions: [
        {
          question: 'Is my data secure?',
          answer: 'Security is our top priority. We use bank-level encryption (SSL/TLS), secure authentication, and host our platform on reliable cloud infrastructure. All data is backed up regularly, and we follow industry best practices for data protection.'
        },
        {
          question: 'Who owns the course content?',
          answer: 'You do! All content you upload to Clear Course Studio remains your intellectual property. We never claim ownership of your materials, and you can export or delete your content at any time.'
        },
        {
          question: 'Are you GDPR compliant?',
          answer: 'Yes, we are fully GDPR compliant. We take data privacy seriously and provide tools for data management, user consent, and the right to be forgotten. Our privacy policy outlines how we collect and protect user data.'
        },
        {
          question: 'Can I delete my account and data?',
          answer: 'Yes, you have full control over your data. You can export your data at any time and delete your account whenever you wish. When you delete your account, all associated data is permanently removed from our systems.'
        }
      ]
    },
    {
      category: 'Support',
      questions: [
        {
          question: 'What kind of support do you offer?',
          answer: 'We offer email support for all customers, with priority support for Professional and Enterprise plans. Our comprehensive help center includes guides, tutorials, and FAQs. Enterprise customers also get dedicated account management.'
        },
        {
          question: 'How quickly will I get a response?',
          answer: 'We typically respond to support requests within 24 hours on business days. Priority support customers receive responses within 4 hours during business hours. For urgent issues, Enterprise customers have access to phone support.'
        },
        {
          question: 'Do you offer training or onboarding?',
          answer: 'Yes! We provide comprehensive documentation and video tutorials to help you get started. Enterprise customers receive personalized onboarding sessions and ongoing training for their team.'
        },
        {
          question: 'Can I schedule a demo?',
          answer: 'Absolutely! Contact us through our contact page to schedule a personalized demo. We\'ll walk you through the platform, answer your questions, and help you determine if Clear Course Studio is the right fit for your needs.'
        }
      ]
    }
  ];

  let globalIndex = 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/CLEAR COURSE STUDIO.png" alt="Clear Course Studio" className="h-10" />
            <span className="text-xl font-bold text-white">Clear Course Studio</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" onClick={(e) => { e.preventDefault(); navigateTo('/'); }} className="text-slate-300 hover:text-white transition-colors">
              Home
            </a>
            <a href="/pricing" onClick={(e) => { e.preventDefault(); navigateTo('/pricing'); }} className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </a>
            <Button href="/login">Sign In</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Find answers to common questions about Clear Course Studio
          </p>
        </div>

        {faqs.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">{section.category}</h2>
            {section.questions.map((faq) => {
              const currentIndex = globalIndex++;
              return (
                <FAQItem
                  key={currentIndex}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === currentIndex}
                  onToggle={() => setOpenIndex(openIndex === currentIndex ? null : currentIndex)}
                />
              );
            })}
          </div>
        ))}

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center mt-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            We're here to help! Contact our support team for personalized assistance.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8" href="/contact">
            Contact Support
          </Button>
        </div>
      </div>

      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} Clear Course Studio. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
