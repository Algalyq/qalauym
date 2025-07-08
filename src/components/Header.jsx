import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Qalauym</h1>
        {currentUser && (
          <button 
            onClick={logout} 
            className="text-white hover:underline"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
