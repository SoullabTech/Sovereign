#!/bin/bash
# akash-deploy.sh - Deploy Fire + Water Agents to Akash Network

set -e

echo "🚀 Starting Akash Network Deployment for Fire + Water Agents"

# Configuration
AKASH_NET="https://raw.githubusercontent.com/akash-network/net/master/mainnet"
AKASH_CHAIN_ID="akashnet-2"
AKASH_NODE="https://rpc.akash.forbole.com:443"
KEY_NAME="spiralogic-deployer"
DEPLOYMENT_FILE="dual-agent-akash.yaml"

# Check requirements
command -v akash >/dev/null 2>&1 || { echo "❌ Akash CLI not found. Please install first."; exit 1; }

# Set Akash environment
export AKASH_NET AKASH_CHAIN_ID AKASH_NODE

echo "🔧 Setting up Akash environment..."
echo "Chain ID: $AKASH_CHAIN_ID"
echo "Node: $AKASH_NODE"

# Validate deployment file
if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo "❌ Deployment file $DEPLOYMENT_FILE not found"
    exit 1
fi

echo "✅ Validating deployment file..."
akash tx deployment create "$DEPLOYMENT_FILE" --dry-run --from "$KEY_NAME"

# Get account details
ACCOUNT=$(akash keys show "$KEY_NAME" -a)
echo "📍 Using account: $ACCOUNT"

# Check balance
BALANCE=$(akash query bank balances "$ACCOUNT")
echo "💰 Current balance: $BALANCE"

# Create deployment
echo "🏗️ Creating deployment..."
DEPLOYMENT_TX=$(akash tx deployment create "$DEPLOYMENT_FILE" --from "$KEY_NAME" --chain-id "$AKASH_CHAIN_ID" --node "$AKASH_NODE" --broadcast-mode block --gas auto --gas-adjustment 1.4 -y)

# Extract deployment sequence
DSEQ=$(echo "$DEPLOYMENT_TX" | jq -r '.logs[0].events[] | select(.type=="akash.v1beta2.DeploymentCreated") | .attributes[] | select(.key=="dseq") | .value')
echo "📋 Deployment sequence: $DSEQ"

# Wait for bids
echo "⏳ Waiting for bids (30 seconds)..."
sleep 30

# Query bids
echo "📊 Querying available bids..."
akash query market bid list --owner "$ACCOUNT" --dseq "$DSEQ"

# Create lease (using first available bid)
echo "🤝 Creating lease..."
PROVIDER=$(akash query market bid list --owner "$ACCOUNT" --dseq "$DSEQ" -o json | jq -r '.bids[0].bid.bid_id.provider')
GSEQ=1
OSEQ=1

if [ "$PROVIDER" != "null" ] && [ "$PROVIDER" != "" ]; then
    akash tx market lease create --dseq "$DSEQ" --gseq "$GSEQ" --oseq "$OSEQ" --provider "$PROVIDER" --from "$KEY_NAME" --chain-id "$AKASH_CHAIN_ID" --node "$AKASH_NODE" --broadcast-mode block --gas auto --gas-adjustment 1.4 -y

    echo "✅ Lease created with provider: $PROVIDER"

    # Send manifest
    echo "📦 Sending manifest..."
    akash provider send-manifest "$DEPLOYMENT_FILE" --dseq "$DSEQ" --gseq "$GSEQ" --oseq "$OSEQ" --provider "$PROVIDER" --from "$KEY_NAME"

    # Get service URLs
    echo "🌐 Getting service URLs..."
    sleep 10
    akash provider lease-status --dseq "$DSEQ" --gseq "$GSEQ" --oseq "$OSEQ" --provider "$PROVIDER" --from "$KEY_NAME"

    echo "🎉 Deployment complete!"
    echo "📝 Deployment Details:"
    echo "   DSEQ: $DSEQ"
    echo "   Provider: $PROVIDER"
    echo "   Services: Fire Agent (3001), Water Agent (3002), Orchestrator (80)"

else
    echo "❌ No bids received. Please check deployment requirements and try again."
    exit 1
fi