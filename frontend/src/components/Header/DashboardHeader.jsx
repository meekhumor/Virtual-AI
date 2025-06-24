import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUserDetails } from "../../api";

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await getUserDetails();
        setUserDetails(data);
      } catch (error) {
        console.log("Failed to fetch user details");
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <header className="shadow sticky z-50 top-0">
      <nav className="bg-black px-4 py-4">
        <div className="flex flex-wrap justify-evenly items-center mx-auto mt-2 relative">
          {/* Toggle Menu */}
          <button type="button" className="text-white" onClick={toggleMenu}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img className="w-8 rounded-full bg-transparent bg-darkblue bg-opacity-40" src="https://d154zarmrcpu4a.cloudfront.net/60fe828b-2ebf-4dd2-9b4d-d78f771b83cc.png" />
            <div className="text-2xl ml-4 text-white font-extrabold">
              Virtual <span className="text-blue1">AI</span>
            </div>
          </Link>
          
          {/* Profile */}
          <div className="flex items-center gap-3 px-2 py-1.5 bg-darkblue bg-opacity-50 rounded-2xl relative cursor-pointer" onClick={toggleDropdown}>
            <div className="bg-gray-300 w-6 h-6 rounded-full flex justify-center items-center font-semibold text-xs">
              {(userDetails?.username || "O")[0].toUpperCase()}
            </div>
            <img
              src="/down-arrow.png"
              className="w-4 h-4"
              alt=""
            />
            <div
              className={`bg-black2 ${
                isDropdownOpen ? "block" : "hidden"
              } p-4 w-48 absolute top-full mt-2 right-0 z-20 flex flex-col rounded-lg shadow-lg`}
            >
              <Link to="/profile" className="w-full text-left text-white py-2 px-4 hover:bg-darkblue bg-opacity-40 rounded">
                Profile
              </Link>
              <Link to="/logout" className="w-full text-left text-white py-2 px-4 hover:bg-darkblue rounded mt-2">
                Logout
              </Link>
            </div>
          </div>
        </div>

        {/* Menu bar */}
        <div
          className={`bg-black2 ${
            isMenuOpen ? "block" : "hidden"
          } h-screen w-1/3 lg:w-1/4 xl:w-1/5 z-10 absolute top-0 left-0 flex flex-col justify-between`}
        >
          {/* Top section with close button */}
          <div>
            <div className="flex justify-end mt-4 mr-4">
              <img
                src="/close.svg"
                className="flex w-8 h-8 opacity-75 cursor-pointer"
                alt=""
                onClick={toggleMenu}
              />
            </div>

            {/* Main menu items */}
            <div className="mt-12">
              <ul className="flex flex-col text-lg gap-1">
                <li>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `block py-2 text-center duration-200 ${
                        isActive ? "text-blue1 hover:text-white" : "text-gray-100"
                      } hover:bg-blue1`
                    }
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/practice"
                    className={({ isActive }) =>
                      `block py-2 text-center duration-200 ${
                        isActive ? "text-blue1 hover:text-white" : "text-gray-100"
                      } hover:bg-blue1`
                    }
                  >
                    Practice
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/review-interview"
                    className={({ isActive }) =>
                      `block py-2 text-center duration-200 ${
                        isActive ? "text-blue1 hover:text-white" : "text-gray-100"
                      } hover:bg-blue1`
                    }
                  >
                    Review 
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/interview-category"
                    className={({ isActive }) =>
                      `block py-2 text-center duration-200 ${
                        isActive ? "text-blue1 hover:text-white" : "text-gray-100"
                      } hover:bg-blue1`
                    }
                  >
                    Categories
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/courses"
                    className={({ isActive }) =>
                      `block py-2 text-center duration-200 ${
                        isActive ? "text-blue1 hover:text-white" : "text-gray-100"
                      } hover:bg-blue1`
                    }
                  >
                    Courses
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>

  
          <div className="mb-16 px-4 mx-auto">
            <div className="flex flex-col gap-3">
              <NavLink
                to="/support"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg ${
                    isActive ? "text-blue1 bg-blue1 bg-opacity-10" : "text-gray-100"
                  } hover:bg-blue1 hover:bg-opacity-10 transition-all duration-200`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                Support
              </NavLink>
              
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg ${
                    isActive ? "text-blue1 bg-blue1 bg-opacity-10" : "text-gray-100"
                  } hover:bg-blue1 hover:bg-opacity-10 transition-all duration-200`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Contact
              </NavLink>
              
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg ${
                    isActive ? "text-blue1 bg-blue1 bg-opacity-10" : "text-gray-100"
                  } hover:bg-blue1 hover:bg-opacity-10 transition-all duration-200`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                About
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}