#!/bin/bash
set -euo pipefail
seq 1 30 | xargs -P 10 -I I bash -c "psql -X -A -t -v ON_ERROR_STOP=1 -U proof -d proof -c \"SELECT reserve_soullab_mail_capacity('P0', ARRAY[repeat('f',64)])\"" > /tmp/mail05-concurrent.out
printf 'CONCURRENT_P0_REQUESTS='; wc -l < /tmp/mail05-concurrent.out
printf 'ADMITTED='; grep -cx t /tmp/mail05-concurrent.out || true
printf 'REFUSED='; grep -cx f /tmp/mail05-concurrent.out || true
printf 'P0_RECIPIENT_BUCKET_COUNT='
psql -X -A -t -U proof -d proof -c "SELECT attempts FROM soullab_mail_capacity WHERE bucket_key LIKE 'recipient:h:P0:%' ORDER BY attempts DESC LIMIT 1"
