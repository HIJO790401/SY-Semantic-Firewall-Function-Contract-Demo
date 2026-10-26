#!/usr/bin/env bash
# Linux CPU-only, loopback-only portable Ollama bundle. No downloads or remote APIs.
set -euo pipefail
umask 077
: "${SY_OLLAMA_ROOT:?Set SY_OLLAMA_ROOT to an absolute Ollama 0.40.11 bundle directory}"
[[ "$SY_OLLAMA_ROOT" = /* ]] || { echo 'SY_OLLAMA_ROOT must be absolute' >&2; exit 2; }
export SY_OLLAMA_ROOT="$(realpath "$SY_OLLAMA_ROOT")"
# Reuse an operator-initialized Ollama home. Never create authentication keys here.
export HOME="${SY_OLLAMA_HOME:-$SY_OLLAMA_ROOT/home}"
[[ "$HOME" = /* && -f "$HOME/.ollama/id_ed25519" ]] || { echo 'STOP: Set SY_OLLAMA_HOME to an existing operator-initialized Ollama home. This script does not create keys.' >&2; exit 2; }
[[ $# -gt 0 ]] || { echo 'Usage: with-server.sh COMMAND [ARG ...]' >&2; exit 2; }
[[ -x "$SY_OLLAMA_ROOT/bin/ollama" && -x "$SY_OLLAMA_ROOT/lib/ollama/llama-server" ]] || { echo 'Expected bin/ollama and lib/ollama/llama-server inside bundle' >&2; exit 2; }
export OLLAMA_HOST=127.0.0.1:11434 OLLAMA_MODELS="$SY_OLLAMA_ROOT/models"
export OLLAMA_NO_CLOUD=1 OLLAMA_NUM_PARALLEL=1 OLLAMA_MAX_LOADED_MODELS=1 OLLAMA_MAX_QUEUE=4
export OLLAMA_CONTEXT_LENGTH=2048 OLLAMA_KEEP_ALIVE=5m GOMAXPROCS=3 OMP_NUM_THREADS=3
export SY_CLOCK_TICKS="$(getconf CLK_TCK)" SY_PAGE_SIZE="$(getconf PAGESIZE)"
if curl -fsS --noproxy '*' --max-time 2 http://127.0.0.1:11434/api/version >/dev/null 2>&1; then
 echo 'STOP: port 11434 already serves another Ollama. Do not attach to an unowned server.' >&2; exit 2
fi
mkdir -p .runtime
pid=''
cleanup(){ if [[ -n "$pid" ]]; then kill -TERM "$pid" 2>/dev/null || true; wait "$pid" 2>/dev/null || true; fi; }
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
"$SY_OLLAMA_ROOT/bin/ollama" serve >> .runtime/ollama-server.log 2>&1 &
pid=$!; export OLLAMA_SERVER_PID="$pid"
healthy=false
for attempt in $(seq 1 30); do
 kill -0 "$pid" 2>/dev/null || { echo 'Owned server exited; inspect .runtime/ollama-server.log' >&2; exit 1; }
 if curl -fsS --noproxy '*' --max-time 2 http://127.0.0.1:11434/api/version >/dev/null 2>&1; then healthy=true; break; fi
 sleep 1
done
"$healthy" || { echo 'Server startup timed out' >&2; exit 1; }
"$@"
