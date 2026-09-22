import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { Button, IconButton, Toolbar } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import favicon from "../../assets/favicon.webp";
import { useAuth } from "../../context/AuthContext";
import NavigationBar from "./NavigationBar";

function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const showNavbar =
    // location.pathname === "/admin/" ||
    location.pathname === "/admin/post" ||
    location.pathname === "/admin/videos" ||
    location.pathname === "/admin/ai" ||
    location.pathname === "/admin/chapters";

  return (
    <div className="sticky top-0 z-10 w-full mx-auto bg-white shadow-sm border-b border-[#dcd8d0]">
      <Toolbar className=" px-4 sm:px-6 lg:px-8   flex flex-col sm:flex-row justify-between items-center">
        <Link to="/" className="flex items-center">
          <img
            src={favicon}
            alt="Favicon"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform hover:scale-105"
          />
        </Link>
        <div className="flex items-center space-x-6  ">
          {showNavbar && <NavigationBar />}{" "}
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={logout}
            className="text-[#4a3728] border-[#4a3728] hover:bg-[#4a3728] hover:text-[#f8f5f0] transition-colors font-serif w-full "
          >
            Sign Out
          </Button>
          <div className="border rounded-full mx-4 border-gray-300">
            <IconButton
              aria-label="profile"
              onClick={() => navigate("/admin/profile")}
              className="text-[#4a3728] hover:bg-[#4a3728]/10 w-full"
            >
              <PersonIcon />
            </IconButton>
          </div>
        </div>
      </Toolbar>
    </div>
  );
}

export default Navbar;
