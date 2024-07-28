import './App.css';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import Services from './components/Services';
import Transactions from './components/Transactions';
import Welcome from './components/Welcome';

const App = () => {
    return (
        <>
            <div className="h-full">
                <div className="gradient-bg-welcome">
                    <NavBar />
                    <Welcome />
                </div>
                <Services />
                <Transactions />
                <Footer />
            </div>
        </>
    );
};

export default App;
