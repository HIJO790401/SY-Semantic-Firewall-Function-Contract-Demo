# Evidence provenance

The original private delivery archive SHA256 is 47ed4337737977764754febdf17d1aa603b1ba1b322d8c8c1e44b4b15493c173. It is not uploaded wholesale here.

Public historical records are in evidence/original. The directory name means historical origin, **not byte-identical private originals**. EVIDENCE_TRANSFORMATIONS.json records original and public hashes and every redacted metadata field. Private chat authorizations and local filesystem prefixes were replaced; numeric measurements, model outputs, task facts, outcomes, prices, failure cases and timestamps were not changed. Nested historical source hashes remain original provenance and do not certify current public source. Public source has a distinct version and PUBLIC_RUNTIME_FREEZE.json.

Run `npm run verify-evidence` to verify exported evidence hashes without model calls. A hash proves file identity, not the truth of a claim; inspect raw rows and independently rerun within the documented scope.

The original study generated 56 calls. A separate original CLI check generated 1 call. Public-port tests are separate in public_port_validation and never inserted into those 57 calls. No claim of a repeated full study is made by packaging or offline tests.

For the new public-port receipt and extracted parity helper, the byte hash was not captured before metadata redaction. The ledger explicitly marks source_sha256 null / NOT_CAPTURED; reconstructed_pre_redaction_sha256 is reconstruction only, not independently witnessed source bytes. This gap does not change the measured numeric fields, but must not be represented as an original-byte capture. The historical private-package exports do have original-source hashes.
