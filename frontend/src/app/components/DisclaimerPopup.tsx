import { Scale } from 'lucide-react';
import logoImage from '../../imports/logo.png';

interface Props {
  onAgree: () => void;
}

export default function DisclaimerPopup({ onAgree }: Props) {
  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-10 sm:pt-14 pb-16">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-12">
          <img
            src={logoImage}
            alt="TheLawyerpedia"
            className="w-11 h-11 object-contain rounded-lg"
            style={{ filter: 'brightness(0.8)' }}
          />
          <span
            className="text-xl text-foreground tracking-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            TheLawyerpedia
          </span>
        </div>

        {/* Heading */}
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-primary/25 mb-4">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <h1
            className="text-2xl sm:text-3xl text-foreground"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: '600' }}
          >
            Disclaimer
          </h1>
          <div className="w-14 h-px bg-primary/40 mt-4" />
        </div>

        {/* Body */}
        <div className="text-[15px] leading-[1.85] text-muted-foreground space-y-5 mb-12">
          <p>
            The Bar Council of India prohibits the developing of the website for the advertisement by an Advocate.
          </p>

          <p>
            By clicking <strong className="text-foreground">"I Agree"</strong> below, the user acknowledges the following:
          </p>

          <p>
            This website is meant only for information purposes and not for any advertisement, personal communication, invitation or inducement of any sort from us or any of our members to solicit or advert any work through this website.
          </p>

          <p>
            If you wish to get more information about us or would like to get in touch with <strong className="text-foreground">Mehak Ahuja</strong>, you may contact us on our registered email address.
          </p>

          <p>
            As per the rules of the Bar Council of India, Advocates are not permitted to solicit or advertise their work. By clicking on "I Agree" below, the user (you) acknowledges the following:
          </p>

          <ul className="space-y-3 list-disc pl-6">
            <li>There exists no sort of advertisement, personal communication, solicitation, invitation or inducement of any sort whatsoever from us or any of our members, and we are not soliciting any work through this website.</li>
            <li>The user deliberately wishes to get more information about us for his/her own information, use and voluntary will.</li>
            <li>The information, if any, that may be provided to the user by us would have been provided upon the user's specific request, and any such information obtained, retained or downloaded from this website is absolutely the act of volition of the user. Any transmission, receipt or use of information or links to this site would not create any lawyer-client relationship.</li>
          </ul>

          <p>
            The information provided under this website is only available at your request for informational purposes strictly, and should not be interpreted as soliciting or advertisement in any manner.
          </p>

          <p>
            We are neither privy nor responsible or liable for any consequence of any action taken by the user relying upon our material/information provided under this website. In case the user has any legal issues, the user must seek independent legal advice.
          </p>

          <p className="text-foreground" style={{ fontWeight: 500 }}>
            Note: Access will only be granted once you confirm you have read and agree to the above.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onAgree}
          className="px-12 py-3.5 bg-primary text-primary-foreground rounded-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(122,86,46,0.2)]"
          style={{ fontWeight: 500 }}
        >
          I Agree
        </button>
      </div>
    </div>
  );
}
