import { useState } from "react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransActionHOC from "@/lib/Web3Provider/TransActionHOC";
import { PMEContract } from "@/lib/data/contracts/PME";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Abi, Address, formatUnits, parseUnits } from "viem";
import { polygon } from "viem/chains";

const Trans = () => {
  // State for transaction value and destination wallet address
  const [value, setValue] = useState<string | number>("0");
  const [desWallet, setDesWallet] = useState("");

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {/* Higher-order component for handling transactions */}
      <TransActionHOC
        contract={{
          abi: PMEContract.ABI as Abi,
          address: PMEContract.MAIN_ADDRESS as Address,
        }}
      >
        {({
          account,
          contract,
          disConnector,
          nativeTransAction,
          nativeBalance,
        }) => {
          // Read user's PME balance and decimal places
          const {
            data: balance,
            isLoading: balanceLoading,
            error: balanceError,
          } = contract.readContract({
            args: [account.address],
            functionName: "balanceOf",
          });

          const {
            data: decimal,
            isLoading: decimalLoading,
            error: decimalError,
          } = contract.readContract({
            args: [],
            functionName: "decimals",
          });

          // Destructure methods for writing contracts and native transactions
          const { writeContract, isPending: sendTransActionLoading } =
            contract.writeContract;

          const { sendTransaction, isPending: sendNativeTransactionLoading } =
            nativeTransAction;

          // Read user's native Matic balance
          const { data: MaticBalance, isLoading: nativeBalanceLoading } =
            nativeBalance({
              chainId: polygon.id,
              address: account.address,
            });

          const renderBalance = () => {
            if (balanceLoading || decimalLoading) {
              return "Loading...";
            }
            if (
              balanceError ||
              decimalError ||
              balance === undefined ||
              decimal === undefined
            ) {
              return "Error loading balance";
            }
            return `${formatUnits(balance as bigint, decimal as number)} PME`;
          };

          return (
            <div className="w-md mx-auto">
              {/* Display warning if not connected */}
              {!account.isConnected ? (
                <div className="bg-yellow-600 bg-opacity-30 border-yellow-800 rounded p-4">
                  <h4 className="font-bold">Warning ⚠️</h4>
                  <div className="w-full ">
                    You are not connected to your wallet yet!
                  </div>
                </div>
              ) : (
                <>
                  {/* Display wallet connected message */}
                  <div className="bg-green-600 bg-opacity-30 border-green-800 rounded p-4">
                    <h4 className="font-bold">Connected ✅</h4>
                    <div className="w-full ">
                      Your wallet is connected.
                      <br />
                      Your Address: {account.address}
                    </div>
                  </div>

                  {/* Button to disconnect */}
                  <Button
                    onClick={() => disConnector.disconnect()}
                    isLoading={disConnector.isPending}
                    variant="glass"
                    className="flex gap-2 ps-2 mt-2"
                  >
                    <span>
                      <Icon
                        icon={"solar:logout-3-bold-duotone"}
                        className="size-6"
                      />
                    </span>
                    <span>Disconnect</span>
                  </Button>
                </>
              )}

              {/* Render connect button if not connected */}
              {!account.isConnected && (
                <span className="mt-2 block">
                  <w3m-connect-button />
                </span>
              )}

              {/* Display PME balance if connected */}
              {account.isConnected && (
                <div className="bg-white bg-opacity-30 border rounded p-4">
                  <span className="mx-2">Your PME balance:</span>{" "}
                  <span>{renderBalance()}</span>
                </div>
              )}

              {/* Display Matic balance if connected */}
              {account.isConnected && (
                <div className="bg-white bg-opacity-30 border rounded p-4">
                  <span className="mx-2">Your MATIC balance:</span>{" "}
                  <span>
                    {nativeBalanceLoading
                      ? "Loading..."
                      : `${MaticBalance?.formatted} MATIC`}
                  </span>
                </div>
              )}

              {/* Render tabs for selecting transaction type */}
              {account.isConnected && (
                <Tabs defaultValue="matic">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="matic">MATIC</TabsTrigger>
                    <TabsTrigger value="contract">PME Contract</TabsTrigger>
                  </TabsList>
                  {/* Content for sending PME tokens */}
                  <TabsContent value="contract">
                    <div className="bg-gray-700/50 p-4 border">
                      <h1 className="text-lg font-bold">Send PME tokens</h1>
                      <br />
                      <div>
                        Wallet Address:
                        <br />
                        <Input
                          value={desWallet}
                          onChange={(e) => setDesWallet(e.target.value)}
                        />
                      </div>
                      <br />
                      <div>
                        Value PME:
                        <br />
                        <Input
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        />
                      </div>
                      <br />
                      {/* Button for sending PME tokens */}
                      <Button
                        isLoading={sendTransActionLoading}
                        onClick={() => {
                          writeContract(
                            {
                              abi: PMEContract.ABI,
                              address:
                                PMEContract.MAIN_ADDRESS as `0x${string}`,
                              functionName: "transfer",
                              args: [
                                desWallet,
                                parseUnits(value.toString(), decimal as number),
                              ],
                            },
                            {
                              onSuccess: () => {
                                // Handle success
                              },
                            }
                          );
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </TabsContent>
                  {/* Content for sending native Matic tokens */}
                  <TabsContent value="matic">
                    <div className="bg-gray-700/50 p-4 border">
                      <h1 className="text-lg font-bold">Send MATIC tokens</h1>
                      <br />
                      <div>
                        Wallet Address:
                        <br />
                        <Input
                          value={desWallet}
                          onChange={(e) => setDesWallet(e.target.value)}
                        />
                      </div>
                      <br />
                      <div>
                        Value MATIC:
                        <br />
                        <Input
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                        />
                      </div>
                      <br />
                      {/* Button for sending native Matic tokens */}
                      <Button
                        isLoading={sendNativeTransactionLoading}
                        onClick={() => {
                          sendTransaction(
                            {
                              to: desWallet as `0x${string}`,
                              value: parseUnits(
                                value.toString(),
                                polygon.nativeCurrency.decimals
                              ),
                              chainId: polygon.id,
                            },
                            {
                              onSuccess: () => {
                                // Handle success
                              },
                            }
                          );
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          );
        }}
      </TransActionHOC>
    </div>
  );
};

export default Trans;
