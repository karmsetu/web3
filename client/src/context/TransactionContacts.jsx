/* eslint-disable react/prop-types */
import { ethers } from 'ethers';
import { createContext, useEffect, useState } from 'react';
import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = createContext();

const { ethereum } = window;

const getEtheriumContract = () => {
    const provider = new ethers.BrowserProvider(ethereum);
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
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    const getAllTransactions = async () => {
        try {
            if (!ethereum) {
                return alert('please install MetaMask');
            }
            const transactionContract = getEtheriumContract();

            const availableTransactions =
                await transactionContract.getAllTransactions();
            const structuredTransactions = availableTransactions.map(
                (transaction) => ({
                    addressTo: transaction.receiver,
                    addressFrom: transaction.sender,
                    timestamp: new Date(
                        transaction.timestamp.toNumber() * 1000
                    ).toLocaleString(),
                    message: transaction.message,
                    keyword: transaction.keyword,
                    amount: parseInt(transaction.amount),
                })
            );
            setTransactions(structuredTransactions);
            console.log(availableTransactions);
        } catch (error) {
            console.log(error);
        }
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
                getAllTransactions();
            } else {
                console.log('no accounts found');
            }
            console.log({ accounts });
        } catch (error) {
            console.log(error);
            throw new Error('no wallet found');
        }
    };

    const checkIfTransactionsExist = async () => {
        try {
            const transactionContract = getEtheriumContract();
            const transactionCount = await transactionContract
                .getTransactionCount()
                .catch((e) => console.log({ e }));
            console.log({ transactionContract });
            localStorage.setItem('transactionCount', transactionCount);
        } catch (error) {
            throw new Error('No ethereum object');
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
            const parsedAmount = ethers.parseEther(amount);
            console.log(
                {
                    amount,
                },
                parsedAmount.toString(16)
            );
            const transactionContract = getEtheriumContract();

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: currentAccount,
                        to: addressTo,
                        gas: '0x5208', //
                        value: parsedAmount.toString(16),
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
        checkIfTransactionsExist();
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
                transactions,
                isLoading,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};
