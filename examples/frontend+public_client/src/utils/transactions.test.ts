import assert from 'node:assert/strict'
import { MsgInstantiateContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { createInstantiateCW20ContractMessage } from './transactions'

const message = createInstantiateCW20ContractMessage(
  'xion1creator',
  510,
  'Example Token',
  'EXAMPLE',
  6,
  [{ address: 'xion1holder', amount: '1000000' }]
)

const serialized = JSON.stringify({ messages: [message] })
const parsed = JSON.parse(serialized).messages[0]
const reconstructed = MsgInstantiateContract.fromJSON(parsed.value)

assert.equal(parsed.typeUrl, '/cosmwasm.wasm.v1.MsgInstantiateContract')
assert.equal(reconstructed.codeId, 510n)
assert.equal(reconstructed.sender, 'xion1creator')
assert.deepEqual(JSON.parse(new TextDecoder().decode(reconstructed.msg)), {
  decimals: 6,
  initial_balances: [{ address: 'xion1holder', amount: '1000000' }],
  mint: { minter: 'xion1creator' },
  name: 'Example Token',
  symbol: 'EXAMPLE',
})
