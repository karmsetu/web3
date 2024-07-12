/* eslint-disable react/prop-types */
// import { HiMenuAlt4} from 'react-icons/hi'
import {} from 'react-icons/ai';
import logo from '../../images/logo.png';

const NavBarItem = ({ title, classprops }) => {
    return <li className={`mx-4 cursor-pointer ${classprops}`}>{title}</li>;
};

const NavBar = () => {
    return (
        <nav className="w-full flex md:justify-center justify-between items-center p-4">
            <div className="md:fle-[0.5] flex-initial">
                <img src={logo} alt="logo" className="w-32 cursor-pointer " />
            </div>
            <ul className="text-white  md:flex hidden list-none flex-row justify-between items-center flex-initial">
                {['market', 'exchange', 'tutorials', 'wallet'].map(
                    (item, index) => (
                        <NavBarItem key={item + index} title={item} />
                    )
                )}
                <li className="bg-[#2952e3] py-2 px-7 mx-7 rounded-full cursor-pointer hover:bg-[#2546bd]">
                    Login
                </li>
            </ul>
            <div></div>
        </nav>
    );
};

export default NavBar;
