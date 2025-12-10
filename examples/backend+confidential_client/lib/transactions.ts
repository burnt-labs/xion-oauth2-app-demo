import { EncodeObject } from '@cosmjs/proto-signing'
import { MsgSend } from '@burnt-labs/xion-types/types/cosmos/bank/v1beta1/tx'

export function createSendTokensMessage(
  toAddress: string,
  amount: number,
  denom: string
): EncodeObject {
  return {
    typeUrl: MsgSend.typeUrl,
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
