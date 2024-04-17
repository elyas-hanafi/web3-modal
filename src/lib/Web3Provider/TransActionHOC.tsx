import { MutateOptions } from "@tanstack/react-query";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import React from "react";
import {
  Abi,
  Address,
  ReadContractParameters,
  WriteContractErrorType,
  WriteContractParameters,
} from "viem";
import {
  Config,
  UseAccountReturnType,
  UseBalanceParameters,
  UseBalanceReturnType,
  UseConnectReturnType,
  UseDisconnectReturnType,
  UseReadContractReturnType,
  UseSendTransactionReturnType,
  UseWriteContractReturnType,
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useReadContract,
  useSendTransaction,
  useWriteContract
} from "wagmi";
import {
  WriteContractData
} from "wagmi/query";
export interface InpputRenderProps
  extends React.ReactElement<React.InputHTMLAttributes<HTMLInputElement>> {}
export interface TransActionComponentChildrenI {
  account: UseAccountReturnType<Config>;
  connect: UseConnectReturnType<Config, unknown>;
  disConnector: UseDisconnectReturnType;
  contract: {
    readContract: (
      params: Partial<ReadContractParameters>
    ) => UseReadContractReturnType<Abi, string, readonly unknown[], unknown>;
    writeContract: UseWriteContractReturnType<Config, unknown>;
    connectModal: {
      open: (
        options?:
          | {
              view:
                | "Account"
                | "Connect"
                | "Networks"
                | "ApproveTransaction"
                | "OnRampProviders";
            }
          | undefined
      ) => Promise<void>;
      close: () => Promise<void>;
    };
  };
  nativeBalance:(Parms:UseBalanceParameters)=>UseBalanceReturnType<{
    formatted:string
  }>
  nativeTransAction: UseSendTransactionReturnType<Config, unknown>
}

export interface TransActionComponentPropsI {
  uiRender?: {
    DestinationAddressInput: InpputRenderProps;
  };
  contract: {
    abi: Abi;
    address: Address;
  };
  children?: (props: TransActionComponentChildrenI) => React.ReactNode;
}

export default function TransActionHOC(
  props: TransActionComponentPropsI
) {
  const { contract: contractDataProps } = props;
  const account = useAccount();
  const connect = useConnect();
  const connectModal = useWeb3Modal();
  const disConnector = useDisconnect();
  const contractWriter = useWriteContract();
  const contractReader = useReadContract;
  const nativeBalance=useBalance
  const writeContract = (
    props: Partial<WriteContractParameters>,
    options: MutateOptions<WriteContractData, WriteContractErrorType, unknown>
  ) =>
    contractWriter.writeContract(
      //@ts-ignore
      {
        ...props,
        abi: contractDataProps.abi,
        address: contractDataProps.address,
      },
      //@ts-ignore
      options
    );
  
  const readContract = (params: Partial<ReadContractParameters>) =>
    contractReader({
      ...params,
      abi: props.contract.abi,
      address: props.contract.address,
    });
  const transactor = useSendTransaction();

 

  return (
    <>
      {props.children &&
        props.children({
          account,
          connect,
          //@ts-ignore
          disConnector,
          contract: {
            readContract,
            writeContract: {
              ...contractWriter,
              //@ts-ignore
              writeContract: writeContract,
            },
            connectModal,
          },
          nativeBalance,
          nativeTransAction: transactor,
        })}
    </>
  );
}
