import { Mail, Phone, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Hero */}
      <div
        className="px-6 sm:px-10 py-10 text-white"
        style={{ background: 'linear-gradient(120deg, #38bdf8 0%, #0284c7 55%, #075985 100%)' }}
      >
        <h1 className="text-3xl sm:text-4xl font-black leading-tight">About Sky Post News</h1>
        <p className="mt-2 text-sky-100 font-semibold italic">Your Voice, Your News</p>
      </div>

      {/* Body */}
      <div className="px-6 sm:px-10 py-8 space-y-5 text-gray-700 leading-relaxed text-[15px] sm:text-base">
        <p>
          Welcome to <strong>Sky Post News</strong>, Rwanda&rsquo;s premier digital-first multimedia
          news network operated under <strong>IREMEE LTD</strong> and based in Nyarugenge, Kigali.
          Guided by our core philosophy, <em>&ldquo;Your Voice, Your News,&rdquo;</em> we bridge the
          gap between hard-hitting journalism and dynamic multimedia storytelling to empower our
          community and inform the region. Authorized under official Rwanda Development Board (RDB)
          business codes, we operate a fully integrated ecosystem across three core pillars:
          comprehensive digital journalism through our primary online newspaper
          (www.skypostnews.com), high-definition audio-visual interviews via the Sky Post Podcast
          broadcasted from our dedicated studio, and real-time social media updates across X,
          Instagram, and TikTok. Under the leadership of Founder and Managing Director
          <strong> Livine Nsanzumuhire N.</strong>, our passionate team of media innovators and
          professional journalists is dedicated to maintaining an independent, legally compliant,
          and high-impact media house that serves as a trusted mirror to society.
        </p>
        <p>
          Beyond delivering top-tier news, Sky Post News serves as a powerful, interconnected
          advertising ecosystem designed to connect premium corporate brands with an engaged,
          digitally active audience. We offer customized, high-value promotional opportunities
          ranging from programmatic website banner ads and sponsored editorials to permanent product
          placement on our podcast sets &mdash; fully backed by an authorized, compliant media
          entity. Whether you are a professional seeking deep insight, a young citizen staying
          informed, or a business looking to scale your market reach, Sky Post News is your ultimate
          media destination. To share a story, submit a press release, or discuss customized
          corporate sponsorship packages, contact us using the details below.
        </p>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <span className="bg-sky-600 text-white p-2 rounded-lg flex-shrink-0"><MapPin size={16} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Office</p>
              <p className="text-sm font-semibold text-gray-800">KN 20 Ave, Gitega, Nyarugenge, Kigali</p>
            </div>
          </div>
          <a href="mailto:skypostn@gmail.com" className="flex items-start gap-3 group">
            <span className="bg-sky-600 text-white p-2 rounded-lg flex-shrink-0"><Mail size={16} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Email</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-sky-600">skypostn@gmail.com</p>
            </div>
          </a>
          <a href="tel:+250782768957" className="flex items-start gap-3 group">
            <span className="bg-sky-600 text-white p-2 rounded-lg flex-shrink-0"><Phone size={16} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Phone</p>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-sky-600">0782 768 957</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
