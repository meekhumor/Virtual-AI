import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="flex flex-col border-t gap-6">
      <div className="flex max-w-xl mx-auto justify-evenly gap-6 mt-8 text-gray-400 text-sm">
        <Link to="/contact" className="hover:text-white transition-colors">
          Contact
        </Link>
        <Link to="/about" className="hover:text-white transition-colors">
          About
        </Link>
        <Link to="/support" className="hover:text-white transition-colors">
          Support
        </Link>
        <Link to="/acknowledgement" className="hover:text-white transition-colors">
          Acknowledgement
        </Link>
      </div>

      <div className="footer-icons flex gap-6 justify-center">
        <a
          href="https://www.linkedin.com/in/your-profile"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform transform hover:scale-110"
        >
          <img
            src="footer/linkedin.svg"
            className="w-6 cursor-pointer"
            alt="LinkedIn"
          />
        </a>
        <a
          href="https://github.com/meekhumor/virtual_interviewer"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform transform hover:scale-110"
        >
          <img
            src="footer/github.svg"
            className="w-6 cursor-pointer"
            alt="GitHub"
          />
        </a>
        <a
          href="https://discordapp.com/channels/1291698189782483028/1291804960006340659"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform transform hover:scale-110"
        >
          <img
            src="footer/discord.svg"
            className="w-6 cursor-pointer"
            alt="Discord"
          />
        </a>
      </div>

      <div className="text-center text-xs flex flex-col gap-1 mb-8">
        <p className="text-gray-400">&copy; 2024 Virtual AI. All rights reserved.</p>
        {/* <p className="text-gray-400"> This website is a clone of
          <a href="https://myinterviewpractice.com" className="hover:text-gray-300"> myinterviewpractice.com </a>
        </p> */}
      </div>
    </footer>
  );
}
