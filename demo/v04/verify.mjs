export async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}
export async function compareBytes(canonical, final) {
  if (typeof canonical !== 'string' || typeof final !== 'string') throw new TypeError('Both exact text inputs are required');
  const a = new TextEncoder().encode(canonical), b = new TextEncoder().encode(final);
  let mismatch = null;
  for (let i=0;i<Math.max(a.length,b.length);i++) if(a[i]!==b[i]) {mismatch=i;break;}
  return {canonical_utf8_bytes:a.length,final_utf8_bytes:b.length,canonical_sha256:await sha256(canonical),final_sha256:await sha256(final),verbatim_equal:mismatch===null,first_mismatch_offset:mismatch};
}
export function demonstrationMutation(text) {
  // A separate synthetic negative copy: append precisely one ASCII byte.
  return text + '!';
}
export function calculatePairedCost(comparison, rates) {
  if (rates.length!==4 || rates.some(n=>!Number.isFinite(n)||n<0)) throw new TypeError('Four finite non-negative rates are required');
  const totals={A:0,B:0};
  ['qwen3:0.6b','qwen3:1.7b'].forEach((model,i)=>{
    for (const arm of ['A','B']) {
      const row=comparison.paired[model][arm];
      totals[arm]+=(row.input_total*rates[i*2]+row.output_total*rates[i*2+1])/1e6;
    }
  });
  const ratio=totals.A===0?null:totals.B/totals.A;
  if (!Number.isFinite(totals.A)||!Number.isFinite(totals.B)||(ratio!==null&&!Number.isFinite(ratio))) throw new RangeError('Calculated cost exceeds finite numeric range');
  return {...totals,ratio};
}
