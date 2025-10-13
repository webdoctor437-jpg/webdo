import Link from "next/link";

export default function FooterCompany() {
  return (
    <footer className="footer-company bg-gray-100 border-t border-gray-200 mt-16 py-8 text-center text-gray-600">
      <div className="container mx-auto px-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          WebDoctor Inc.
        </h3>
        <div className="flex flex-col items-center p-4">
          <img 
            src="/images/logo.png"
            alt="logo" 
            width={150} 
            height={120} 
            className="rounded-xl shadow-md"
          />
        </div>
        <p className="text-sm mb-4">
          Empowering designers and developers with AI-driven UX/UI insights.
        </p>

        <div className="link flex flex-col gap-2 items-center">
          <Link href="mailto:webdoctor437@gmail.com" className="hover:text-blue-600">
            📧 webdoctor437@gmail.com
          </Link>

          <Link href="https://www.instagram.com/webdoctorpage?igsh=NmFhbmlwMndod3M2&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            Instagram
          </Link>

          <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            💼 Github
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} WebDoctor Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
