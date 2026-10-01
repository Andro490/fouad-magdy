#!/bin/bash
# Run this on the server to apply the DivisionRequest table
cd /root/fouad-magdy/backend
npx prisma db push
echo "Done! DivisionRequest table created."
