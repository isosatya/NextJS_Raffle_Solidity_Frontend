import { useWeb3Contract } from "react-moralis";
import { contractAddresses, abi } from "../constants";
import { useMoralis } from "react-moralis";
import { useEffect, useState } from "react";
import { ethers, BigNumber } from "ethers";
import { useNotification } from "web3uikit";

interface contractAddressesInterface {
    [key: string]: string[];
}

export default function LotteryEntrance() {
    // imported from the json file that contains all the available deployed contracts
    // whose address will depend on which network we are deploying
    const addresses: contractAddressesInterface = contractAddresses;

    // pull out the chainId from Moralis and rename it to chainIdHex
    // enableWeb3 --> method that can be used for activating web3, which we normally do with Metamask
    const { chainId: chainIdHex, isWeb3Enabled, enableWeb3 } = useMoralis();
    const chainId = parseInt(chainIdHex || "");
    // we are using the first address from the json object (addresses[chainId][0])
    const raffleAddress = chainId in addresses ? addresses[chainId][0] : null;
    // variables
    const [entranceFeeFromRaffle, setEntranceFeeFromRaffle] = useState("0");
    const [numberPlayers, setNumberPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0");

    // imported from "web3uikit" and used for popup notifications
    // "dispatch" is used in "handleNewNotification" function
    const dispatch = useNotification();

    // updateUI --> updates the variables
    const updateUI = async function () {
        const entranceFeeFromCall = (await getEntranceFee()).toString();
        setEntranceFeeFromRaffle(entranceFeeFromCall);
        const recentWinnerFromCall = (await getRecentWinner()).toString();
        setRecentWinner(recentWinnerFromCall);
        const numberPlayersFromCall = (await getNumberOfPlayers()).toString();
        setNumberPlayers(numberPlayersFromCall);
    };

    // functionality from "react-moralis" for calling certain functions from contracts
    // we need to provide the parameters to useWeb3Contract
    // isLoading and isFetching are execution states from react
    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        // abi of the contract, available in the json from constants folder
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFeeFromRaffle,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getRecentWinner",
        params: {},
    });

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
            console.log("recentWinner", recentWinner);
        }
    }, [isWeb3Enabled]);

    const handleSuccess = async function (tx) {
        await tx.wait(1);
        handleNewNotification();
        updateUI();
    };

    // the parameters come from the "web3uikit" element provided by their interactive website
    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            icon: "bell",
            position: "topR",
        });
    };

    // const checkEvents = async () => {
    //     const provider = await enableWeb3();
    //     const raffle = new ethers.Contract(raffleAddress!!, abi, provider);
    //     raffle.on("WinnerPicked", () => {
    //         console.log("winner pickeeedd hhuhuhuhuuuu");
    //     });
    // };

    // onSuccess / onError come from NotificationProvider from web3uikit
    // disabled={isLoading || isFetching} disables the button during these states
    return (
        <div className="p-5">
            Hi from the lottery Raffle!
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            });
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>
                        {" "}
                        Entrance Fee: {ethers.utils.formatUnits(
                            entranceFeeFromRaffle,
                            "ether"
                        )}{" "}
                        ETH
                    </div>
                    <div> Players: {numberPlayers}</div>
                    <div> Recent Winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No Raffle Address Detected</div>
            )}
        </div>
    );
}
