import { MsgSend } from '@burnt-labs/xion-types/types/cosmos/bank/v1beta1/tx'

export function createSendTokensMessage(
  toAddress: string,
  amount: number,
  denom: string
) {
  return MsgSend.toProtoMsg(
    MsgSend.fromPartial({
      toAddress: toAddress,
      amount: [
        {
          denom: denom,
          amount: amount.toString(),
        },
      ],
    })
  )
}
