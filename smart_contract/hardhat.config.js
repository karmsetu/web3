/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();
require('@nomiclabs/hardhat-waffle');
module.exports = {
    solidity: '0.8.0',
    networks: {
        sepolia: {
            url: process.env.MM,
            accounts: [process.env.ACCOUNT],
        },
    },
};
