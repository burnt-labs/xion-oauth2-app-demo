import { EncodeObject } from '@cosmjs/proto-signing'
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { MsgInstantiateContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

export function createSendTokensMessage(
  toAddress: string,
  amount: number,
  denom: string
): EncodeObject {
  return {
    typeUrl: '/cosmos.bank.v1beta1.MsgSend',
    value: MsgSend.fromPartial({
      toAddress: toAddress,
      amount: [
        {
          denom: denom,
          amount: amount.toString(),
        },
      ],
    }),
  }
}

export function createInstantiateCW20ContractMessage(
  creatorAddress: string,
  codeId: number,
  name: string,
  symbol: string,
  decimals: number,
  initialBalances: { address: string; amount: string }[]
): EncodeObject {
  // Instantiate message for a CW20 token
  const cw20InstantiateMsg = {
    name: name,
    symbol: symbol,
    decimals: decimals,
    initial_balances: initialBalances,
    mint: { minter: creatorAddress },
  }
  const msg = MsgInstantiateContract.fromPartial({
    sender: creatorAddress,
    admin: creatorAddress, // Optional: address that can migrate contract
    codeId: BigInt(codeId), // Code ID from MsgStoreCode
    label: name, // Human-readable label
    msg: new TextEncoder().encode(JSON.stringify(cw20InstantiateMsg)),
    funds: [], // Initial funds to send to contract
  })
  return {
    typeUrl: '/cosmwasm.wasm.v1.MsgInstantiateContract',
    value: MsgInstantiateContract.toJSON(msg),
  }
}
