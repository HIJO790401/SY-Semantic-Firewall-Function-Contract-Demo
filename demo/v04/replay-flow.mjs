// Presentation-only historical record sequence. Does not dispatch tools or mint receipts.
export function replayFrames(sample) {
 if (!sample?.B || sample.B.calls.length !== 2) throw new Error('Two archived calls required');
 return [
  {key:'entry', modelCalls:1, payload:sample.B.calls[0]},
  {key:'domain', modelCalls:2, payload:sample.B.calls[1]},
  {key:'verdict', modelCalls:2, payload:sample.B.result},
  {key:'delivery', modelCalls:2, payload:{validation:sample.B.validation_projection,commit:sample.B.commit_projection,final:sample.B.final_text}}
 ];
}
