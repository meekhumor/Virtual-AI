import { Outlet, useLocation } from 'react-router-dom';
import HomeHeader from './components/Header/HomeHeader';
import DashboardHeader from './components/Header/DashboardHeader';
import Footer from './components/Footer/Footer';
import RegisterHeader from './components/Header/RegisterHeader';

function Layout() {
  const location = useLocation();

  const renderHeader = () => {
    if (location.pathname === '/home' || location.pathname === '/about' || location.pathname === '/contact' || location.pathname === '/support' || location.pathname === '/acknowledgement') {
      return <HomeHeader />;
    } else if (location.pathname === '/register' || location.pathname === '/email-verification') {
      return <RegisterHeader />;
    } else if (location.pathname === '/interview-simulator' || location.pathname === '/'){
      return null
    } else {
      return <DashboardHeader />;
    }
  };

  const renderFooter = () => {
      if(location.pathname === '/home' || location.pathname === '/dashboard' ) {
        return <Footer />;
      } else {
        return null;
      }
  };

  return (
    <>
      {renderHeader()}
      <Outlet />
      {renderFooter()}
    </>
  );
}

export default Layout;
