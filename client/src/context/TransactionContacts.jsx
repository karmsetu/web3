/* eslint-disable react/prop-types */
import { ethers } from 'ethers';
import { createContext, useEffect, useState } from 'react';
import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = createContext();

const { ethereum } = window;

const getEtheriumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
    );
    console.log({
        provider,
        signer,
        transactionContract,
    });
    return transactionContract;
};

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setformData] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(
        localStorage.getItem('transactionCount')
    );

    const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) {
                console.log(ethereum);
                return alert('Please install metamask');
            }
            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
            } else {
                console.log('no accounts found');
            }
            console.log({ accounts });
        } catch (error) {
            console.log(error);
            throw new Error('no wallet found');
        }
    };

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Please install metamask');
            const accounts = await ethereum.request({
                method: 'eth_requestAccounts',
            });
            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);
            throw new Error('no wallet found');
        }
    };

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert('Please install metamask');
            const { addressTo, amount, keyword, message } = formData;
            const parsedAmount = ethers.utils.parseEther(amount);
            const transactionContract = getEtheriumContract();

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: currentAccount,
                        to: addressTo,
                        gas: '0x5208', //
                        value: parsedAmount._hex,
                    },
                ],
            });
            const transactionHash = await transactionContract.addToBlockchain(
                addressTo,
                parsedAmount,
                message,
                keyword
            );

            setIsLoading(true);
            console.log(`Loading -${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success -${transactionHash.hash}`);
            const transactionCount =
                await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());
        } catch (error) {
            console.log(error);
            throw new Error('no wallet found');
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);
    return (
        <TransactionContext.Provider
            value={{
                connectWallet,
                currentAccount,
                formData,
                setformData,
                handleChange,
                sendTransaction,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};
