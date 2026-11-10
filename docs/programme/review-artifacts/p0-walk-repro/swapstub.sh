#!/bin/sh
# usage: swapstub.sh <delay_ms>   — replace the harness stub with stub2 on the same port
ST=/home/user/walkstate
[ -f $ST/stub.pid ] && kill $(cat $ST/stub.pid) 2>/dev/null; sleep 1
STUB_READER_DELAY_MS=${1:-0} nohup node /home/user/stub2.mjs $ST/stub.log 54400 > $ST/stub2.out 2>&1 &
echo $! > $ST/stub.pid; sleep 1; echo "stub2 up (reader delay ${1:-0}ms) pid $(cat $ST/stub.pid)"
