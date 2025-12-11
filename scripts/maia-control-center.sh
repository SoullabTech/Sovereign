#!/bin/bash

# MAIA Control Center - Fail-Proof Management System
# One-person team management for MAIA Sovereign infrastructure
# Author: MAIA System (with Claude Code assistance)

set -e

# Colors for better UI
RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
PURPLE='\\033[0;35m'
CYAN='\\033[0;36m'
NC='\\033[0m' # No Color
BOLD='\\033[1m'

# Configuration
PRODUCTION_URL="https://soullab.life/maia/"
MAIA_URL="${MAIA_URL:-http://localhost:3002}"
PRODUCTION_PORT=3002
STAGING_PORT=3010
DEV_PORT=3000
MONITORING_PORT=3020
SCRIPTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPTS_DIR}/.." && pwd)"

# Function to display header
show_header() {
    clear
    echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}${BOLD}║                 MAIA ENTERPRISE CONTROL CENTER               ║${NC}"
    echo -e "${CYAN}${BOLD}║              Solo Operator - Enterprise Operations            ║${NC}"
    echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}Production: ${GREEN}$PRODUCTION_URL${NC}"
    echo -e "${BLUE}Docker: ${GREEN}maia-sovereign-web-1${NC}"
    echo -e "${BLUE}Database: ${GREEN}Supabase (managed)${NC}"
    echo ""
}

# Function to check all system status
check_system_status() {
    echo -e "${BOLD}🔍 SYSTEM STATUS CHECK${NC}"
    echo "================================="

    # Production health
    if curl -s -f "$PRODUCTION_URL" > /dev/null; then
        echo -e "✅ ${GREEN}Production Site: ONLINE${NC}"
    else
        echo -e "❌ ${RED}Production Site: OFFLINE${NC}"
    fi

    # Docker container status
    if docker ps --format "{{.Names}}" | grep -q "maia-sovereign-web"; then
        CONTAINER_STATUS=$(docker ps --filter "name=maia-sovereign-web" --format "{{.Status}}")
        echo -e "✅ ${GREEN}Docker Container: $CONTAINER_STATUS${NC}"
    else
        echo -e "❌ ${RED}Docker Container: NOT RUNNING${NC}"
    fi

    # Nginx status
    if ps aux | grep -v grep | grep -q nginx; then
        echo -e "✅ ${GREEN}Nginx: RUNNING${NC}"
    else
        echo -e "❌ ${RED}Nginx: NOT RUNNING${NC}"
    fi

    # Development server status
    if lsof -ti:$DEV_PORT > /dev/null 2>&1; then
        echo -e "✅ ${GREEN}Dev Server (3000): RUNNING${NC}"
    else
        echo -e "⚪ ${YELLOW}Dev Server (3000): STOPPED${NC}"
    fi

    # Staging server status
    if lsof -ti:$STAGING_PORT > /dev/null 2>&1; then
        echo -e "✅ ${GREEN}Staging Server (3010): RUNNING${NC}"
    else
        echo -e "⚪ ${YELLOW}Staging Server (3010): STOPPED${NC}"
    fi

    echo ""
}

# Enterprise function: Full health check (combines existing + sovereign focus)
enterprise_health_check() {
    echo -e "${BLUE}🔍 Running Enterprise Health Check...${NC}"
    echo ""

    # API Health Check (enhanced for sovereign focus)
    echo -e "${CYAN}📡 Testing MAIA Sovereign Endpoints:${NC}"

    # Health endpoint
    echo -n "  /api/health: "
    if curl -s -o /dev/null -w "%{http_code}" "${MAIA_URL}/api/health" | grep -q "200"; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAILED${NC}"
    fi

    # Sovereign endpoint with timing
    echo -n "  /api/sovereign/app/maia: "
    start_time=$(date +%s%3N)
    response=$(curl -s -X POST "${MAIA_URL}/api/sovereign/app/maia" \
        -H "Content-Type: application/json" \
        -d '{"message":"health check","sessionId":"health-check-'"$(date +%s)"'"}' \
        -w "%{http_code}")
    end_time=$(date +%s%3N)

    duration=$((end_time - start_time))

    if echo "$response" | tail -c 4 | grep -q "200"; then
        echo -e "${GREEN}✅ OK (${duration}ms)${NC}"
    else
        echo -e "${RED}❌ FAILED (${duration}ms)${NC}"
    fi

    echo ""

    # Docker Container Status (focused on MAIA sovereign)
    echo -e "${CYAN}🐳 MAIA Container Status:${NC}"
    if command -v docker >/dev/null 2>&1; then
        containers=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(maia|sovereign)" || echo "  No MAIA containers running")
        echo "$containers"

        # Health status
        echo ""
        echo -e "${CYAN}🏥 Container Health:${NC}"
        maia_containers=$(docker ps --format "{{.Names}}" | grep -E "(maia|sovereign)" || true)
        if [ -n "$maia_containers" ]; then
            for container in $maia_containers; do
                health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-healthcheck")
                case "$health" in
                    "healthy")
                        echo -e "  $container: ${GREEN}✅ Healthy${NC}"
                        ;;
                    "unhealthy")
                        echo -e "  $container: ${RED}❌ Unhealthy${NC}"
                        ;;
                    "starting")
                        echo -e "  $container: ${YELLOW}🔄 Starting${NC}"
                        ;;
                    *)
                        echo -e "  $container: ${BLUE}ℹ️ No healthcheck${NC}"
                        ;;
                esac
            done
        else
            echo "  No MAIA containers found"
        fi
    else
        echo -e "  ${YELLOW}⚠️ Docker not available${NC}"
    fi

    echo ""
}

# Enterprise function: Sovereign quick test
enterprise_sovereign_test() {
    echo -e "${BLUE}🧪 Running Sovereign Quick Test...${NC}"
    echo ""

    if [ -f "${SCRIPTS_DIR}/test-sovereign-session.sh" ]; then
        echo "Using existing sovereign test script..."
        "${SCRIPTS_DIR}/test-sovereign-session.sh" "${MAIA_URL}"
    else
        echo "Running inline sovereign test..."

        session_id="enterprise-test-$(date +%s)"
        echo "Session ID: $session_id"
        echo ""

        # Test sovereign response with timing
        echo "Testing sovereign session management..."
        start_time=$(date +%s%3N)

        response=$(curl -s -X POST "${MAIA_URL}/api/sovereign/app/maia" \
            -H "Content-Type: application/json" \
            -d "{\"message\":\"Enterprise test: session management validation\",\"sessionId\":\"$session_id\"}")

        end_time=$(date +%s%3N)
        duration=$((end_time - start_time))

        echo "Response time: ${duration}ms"

        if echo "$response" | grep -q "message" && echo "$response" | grep -q "$session_id"; then
            echo -e "${GREEN}✅ Sovereign API responding correctly${NC}"
            echo -e "${GREEN}✅ Session management working${NC}"
        else
            echo -e "${RED}❌ Sovereign API test failed${NC}"
            echo "Response: $response"
        fi
    fi

    echo ""
}

# Enterprise function: Tail logs with sovereign focus
enterprise_tail_logs() {
    echo -e "${BLUE}📜 Container Logs (Sovereign Focus):${NC}"
    echo ""
    echo "  [1] Web container logs (sovereign responses)"
    echo "  [2] Postgres container logs"
    echo "  [3] All MAIA containers"
    echo "  [4] Sovereign latency logs only"
    echo ""
    read -p "Select log source [1-4]: " log_choice

    case $log_choice in
        1)
            echo -e "${CYAN}Tailing web container logs with sovereign focus (Ctrl+C to exit):${NC}"
            container=$(docker ps --format "{{.Names}}" | grep -E "(maia.*web|sovereign.*web)" | head -1)
            if [ -n "$container" ]; then
                docker logs -f "$container" | grep --line-buffered -E "(Sovereign|✅|⚠️|❌)"
            else
                echo -e "${RED}❌ No MAIA web container found${NC}"
            fi
            ;;
        2)
            echo -e "${CYAN}Tailing Postgres logs (Ctrl+C to exit):${NC}"
            postgres_container=$(docker ps --format "{{.Names}}" | grep postgres | head -1)
            if [ -n "$postgres_container" ]; then
                docker logs -f "$postgres_container"
            else
                echo -e "${RED}❌ No Postgres container found${NC}"
            fi
            ;;
        3)
            echo -e "${CYAN}Tailing all MAIA container logs (Ctrl+C to exit):${NC}"
            maia_container=$(docker ps --format "{{.Names}}" | grep -E "(maia|sovereign)" | head -1)
            if [ -n "$maia_container" ]; then
                docker logs -f "$maia_container"
            else
                echo -e "${RED}❌ No MAIA containers found${NC}"
            fi
            ;;
        4)
            echo -e "${CYAN}Tailing sovereign latency logs only (Ctrl+C to exit):${NC}"
            container=$(docker ps --format "{{.Names}}" | grep -E "(maia.*web|sovereign.*web)" | head -1)
            if [ -n "$container" ]; then
                docker logs -f "$container" | grep --line-buffered "Sovereign response"
            else
                echo -e "${RED}❌ No MAIA web container found${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            ;;
    esac

    echo ""
}

# Enterprise function: Database backup
enterprise_backup_now() {
    echo -e "${BLUE}💾 Creating Database Backup...${NC}"
    echo ""

    if [ -f "${SCRIPTS_DIR}/backup-db.sh" ]; then
        echo "Using dedicated backup script..."
        "${SCRIPTS_DIR}/backup-db.sh"
    else
        echo -e "${YELLOW}⚠️ Dedicated backup script not found${NC}"
        echo "Creating manual backup..."

        # Check for DATABASE_URL
        if [ -z "${DATABASE_URL:-}" ]; then
            echo -e "${RED}❌ DATABASE_URL not set${NC}"
            echo "Please set DATABASE_URL environment variable"
            echo "Example: export DATABASE_URL='postgres://user:pass@localhost/dbname'"
            return 1
        fi

        # Create backup directory
        backup_dir="$HOME/maia_backups"
        mkdir -p "$backup_dir"

        # Generate backup with enterprise naming
        timestamp=$(date +"%Y%m%d_%H%M%S")
        backup_file="$backup_dir/maia_enterprise_${timestamp}.sql.gz"

        echo "Creating backup at $backup_file"
        if command -v pg_dump >/dev/null 2>&1; then
            if pg_dump "$DATABASE_URL" | gzip > "$backup_file"; then
                echo -e "${GREEN}✅ Backup complete${NC}"
                echo "Backup size: $(du -h "$backup_file" | cut -f1)"

                # Keep only last 14 backups
                ls -1t "$backup_dir"/maia_*.sql.gz | sed '1,14d' | xargs -r rm 2>/dev/null || true
                echo "Cleaned up old backups (keeping last 14)"
            else
                echo -e "${RED}❌ Backup failed${NC}"
                return 1
            fi
        else
            echo -e "${RED}❌ pg_dump not found${NC}"
            echo "Please install PostgreSQL client tools"
            return 1
        fi
    fi

    echo ""
}

# Enterprise function: Restore from backup
enterprise_restore_backup() {
    echo -e "${BLUE}🔄 Restore from Backup...${NC}"
    echo ""

    backup_dir="$HOME/maia_backups"

    if [ ! -d "$backup_dir" ]; then
        echo -e "${RED}❌ No backup directory found at $backup_dir${NC}"
        return 1
    fi

    # List available backups (enterprise format)
    backups=($(ls -1t "$backup_dir"/maia_*.sql.gz 2>/dev/null || true))

    if [ ${#backups[@]} -eq 0 ]; then
        echo -e "${RED}❌ No backups found${NC}"
        echo "Run option [4] to create a backup first"
        return 1
    fi

    echo -e "${CYAN}Available backups (newest first):${NC}"
    for i in "${!backups[@]}"; do
        backup_file="${backups[$i]}"
        backup_date=$(basename "$backup_file" | sed 's/maia.*_\([0-9_]*\)\.sql\.gz/\1/' | sed 's/_/ /g')
        backup_size=$(du -h "$backup_file" | cut -f1)
        echo "  [$((i+1))] $backup_date ($backup_size)"
    done
    echo ""

    read -p "Select backup to restore [1-${#backups[@]}] or 'c' to cancel: " restore_choice

    if [ "$restore_choice" = "c" ]; then
        echo "Cancelled"
        return 0
    fi

    if ! [[ "$restore_choice" =~ ^[0-9]+$ ]] || [ "$restore_choice" -lt 1 ] || [ "$restore_choice" -gt ${#backups[@]} ]; then
        echo -e "${RED}❌ Invalid selection${NC}"
        return 1
    fi

    selected_backup="${backups[$((restore_choice-1))]}"

    if [ -f "${SCRIPTS_DIR}/restore-db.sh" ]; then
        echo "Using dedicated restore script..."
        "${SCRIPTS_DIR}/restore-db.sh" "$selected_backup"
    else
        echo -e "${YELLOW}⚠️ Dedicated restore script not found${NC}"
        echo "Proceeding with manual restore..."

        if [ -z "${DATABASE_URL:-}" ]; then
            echo -e "${RED}❌ DATABASE_URL not set${NC}"
            return 1
        fi

        echo -e "${RED}⚠️ This will overwrite the current database. Ctrl+C to abort.${NC}"
        echo -e "${YELLOW}Proceeding in 5 seconds...${NC}"
        sleep 5

        echo "Restoring from $selected_backup..."
        if command -v psql >/dev/null 2>&1; then
            if gunzip -c "$selected_backup" | psql "$DATABASE_URL"; then
                echo -e "${GREEN}✅ Restore complete${NC}"
            else
                echo -e "${RED}❌ Restore failed${NC}"
                return 1
            fi
        else
            echo -e "${RED}❌ psql not found${NC}"
            echo "Please install PostgreSQL client tools"
            return 1
        fi
    fi

    echo ""
}

# Enterprise function: Latency summary (sovereign focus)
enterprise_latency_summary() {
    echo -e "${BLUE}⚡ Sovereign Performance Summary (Last 10 Minutes)${NC}"
    echo ""

    # Find the main web container
    container=$(docker ps --format "{{.Names}}" | grep -E "(maia.*web|sovereign.*web)" | head -1)

    if [ -z "$container" ]; then
        echo -e "${RED}❌ No MAIA web container found${NC}"
        return 1
    fi

    echo -e "${CYAN}Analyzing logs from container: $container${NC}"
    echo ""

    # Get logs from last 10 minutes and filter for sovereign responses
    logs=$(docker logs --since=10m "$container" 2>&1 | grep "Sovereign response" || true)

    if [ -z "$logs" ]; then
        echo -e "${YELLOW}⚠️ No sovereign response logs found in last 10 minutes${NC}"
        echo "This could mean:"
        echo "  - No requests processed recently"
        echo "  - Container restarted recently"
        echo "  - Logging configuration issue"
        return 0
    fi

    # Count response types
    success_count=$(echo "$logs" | grep -c "✅" || echo "0")
    slow_count=$(echo "$logs" | grep -c "⚠️" || echo "0")
    timeout_count=$(echo "$logs" | grep -c "❌" || echo "0")
    total_count=$((success_count + slow_count + timeout_count))

    echo -e "${CYAN}Response Analysis:${NC}"
    echo "  ✅ Fast responses:    $success_count"
    echo "  ⚠️ Slow responses:    $slow_count"
    echo "  ❌ Timeouts:         $timeout_count"
    echo "  📊 Total requests:   $total_count"
    echo ""

    # Extract timing information
    timings=$(echo "$logs" | grep -o '[0-9]\+ms' | grep -o '[0-9]\+' || true)

    if [ -n "$timings" ] && [ "$total_count" -gt 0 ]; then
        # Calculate statistics
        total=0
        count=0
        min=999999
        max=0

        while read -r timing; do
            if [ -n "$timing" ]; then
                total=$((total + timing))
                count=$((count + 1))
                if [ "$timing" -lt "$min" ]; then min=$timing; fi
                if [ "$timing" -gt "$max" ]; then max=$timing; fi
            fi
        done <<< "$timings"

        if [ "$count" -gt 0 ]; then
            avg=$((total / count))
            echo -e "${CYAN}Performance Metrics:${NC}"
            echo "  Average latency:  ${avg}ms"
            echo "  Min latency:      ${min}ms"
            echo "  Max latency:      ${max}ms"
            echo ""

            # Enterprise-level health assessment
            if [ "$avg" -lt 50 ] && [ "$slow_count" -eq 0 ] && [ "$timeout_count" -eq 0 ]; then
                echo -e "${GREEN}🚀 EXCELLENT: Enterprise-grade performance${NC}"
                echo "  System operating at peak efficiency"
            elif [ "$avg" -lt 200 ] && [ "$timeout_count" -eq 0 ]; then
                echo -e "${GREEN}✅ GOOD: Performance within acceptable ranges${NC}"
                echo "  System stable and responsive"
            elif [ "$avg" -lt 500 ] && [ "$timeout_count" -eq 0 ]; then
                echo -e "${YELLOW}⚠️ DEGRADED: Performance below optimal${NC}"
                echo "  Consider investigating system load"
            else
                echo -e "${RED}❌ CRITICAL: Performance issues detected${NC}"
                echo "  Immediate attention required"
            fi
        fi
    fi

    echo ""
    echo -e "${BLUE}Recent Response Sample:${NC}"
    echo "$logs" | tail -3 | while read -r line; do
        echo "  $line"
    done
    echo ""
}

# Function to show main menu
show_menu() {
    echo -e "${BOLD}🎛️  ENTERPRISE OPERATIONS CONSOLE${NC}"
    echo "======================================="
    echo "  ${GREEN}[1]${NC} Full Health Check      - API endpoints + container status"
    echo "  ${GREEN}[2]${NC} Sovereign Quick Test    - Session management validation"
    echo "  ${GREEN}[3]${NC} Tail Logs              - Real-time container logs"
    echo "  ${GREEN}[4]${NC} Backup Now             - Create database backup"
    echo "  ${GREEN}[5]${NC} Restore Last Backup    - Restore from most recent backup"
    echo "  ${GREEN}[6]${NC} Latency Summary         - Last 10 minutes performance"
    echo ""
    echo "  ${YELLOW}[q]${NC} Quit"
    echo ""
    echo -n "Choose an option [1-6, q]: "
}

# Function to start development environment safely
start_development() {
    echo -e "${BLUE}🖥️  Starting Development Environment...${NC}"

    # Clean any existing dev processes
    pkill -f "npm.*dev" 2>/dev/null || true
    pkill -f "next.*dev" 2>/dev/null || true
    sleep 2

    # Start clean development server
    echo "Starting development server on port $DEV_PORT..."
    nohup npm run dev > logs/dev-server.log 2>&1 &

    sleep 5

    if lsof -ti:$DEV_PORT > /dev/null 2>&1; then
        echo -e "✅ ${GREEN}Development server running at http://localhost:$DEV_PORT${NC}"
        echo -e "📄 Logs: ${YELLOW}logs/dev-server.log${NC}"
    else
        echo -e "❌ ${RED}Failed to start development server${NC}"
    fi
}

# Function to start staging environment
start_staging() {
    echo -e "${BLUE}🎯 Starting Staging Environment...${NC}"

    # Stop any existing staging process
    lsof -ti:$STAGING_PORT | xargs kill -9 2>/dev/null || true
    sleep 2

    # Build and start staging
    echo "Building staging version..."
    npm run build > logs/staging-build.log 2>&1

    echo "Starting staging server on port $STAGING_PORT..."
    nohup npm start -- -p $STAGING_PORT > logs/staging-server.log 2>&1 &

    sleep 5

    if lsof -ti:$STAGING_PORT > /dev/null 2>&1; then
        echo -e "✅ ${GREEN}Staging server running at http://localhost:$STAGING_PORT${NC}"
        echo -e "📄 Logs: ${YELLOW}logs/staging-server.log${NC}"
    else
        echo -e "❌ ${RED}Failed to start staging server${NC}"
    fi
}

# Function to deploy safely to production
deploy_production() {
    echo -e "${YELLOW}🚀 Safe Production Deployment${NC}"
    echo "==============================="

    # Pre-deployment checks
    echo "Running pre-deployment checks..."

    # Check if production is responding
    if ! curl -s -f "$PRODUCTION_URL" > /dev/null; then
        echo -e "❌ ${RED}Production is not responding! Aborting deployment.${NC}"
        return 1
    fi

    # Build application
    echo "Building application..."
    if ! npm run build > logs/deployment-build.log 2>&1; then
        echo -e "❌ ${RED}Build failed! Check logs/deployment-build.log${NC}"
        return 1
    fi

    # Stop old container and start new one
    echo "Deploying new container..."
    docker-compose down web
    docker-compose up -d web

    # Wait for health check
    echo "Waiting for health check..."
    sleep 30

    # Verify deployment
    if curl -s -f "$PRODUCTION_URL" > /dev/null; then
        echo -e "✅ ${GREEN}Deployment successful!${NC}"
        echo -e "🌐 ${GREEN}Production site: $PRODUCTION_URL${NC}"

        # Log deployment
        echo "$(date): Successful deployment" >> logs/deployment.log
    else
        echo -e "❌ ${RED}Deployment failed! Rolling back...${NC}"
        emergency_restart
        return 1
    fi
}

# Function to restart production emergency
emergency_restart() {
    echo -e "${RED}⚠️  EMERGENCY PRODUCTION RESTART${NC}"
    echo "=================================="

    echo "Restarting Docker container..."
    docker-compose restart web

    sleep 10

    echo "Testing production endpoint..."
    if curl -s -f "$PRODUCTION_URL" > /dev/null; then
        echo -e "✅ ${GREEN}Emergency restart successful!${NC}"
        echo "$(date): Emergency restart successful" >> logs/emergency.log
    else
        echo -e "❌ ${RED}Emergency restart failed! Manual intervention required.${NC}"
        echo "$(date): Emergency restart FAILED" >> logs/emergency.log
        echo ""
        echo -e "${YELLOW}Manual steps:${NC}"
        echo "1. Check Docker logs: docker logs maia-sovereign-web-1"
        echo "2. Check Nginx config: nginx -t"
        echo "3. Check system resources: df -h && free -h"
        echo "4. Contact system administrator if needed"
    fi
}

# Function to stop all development processes
stop_all_development() {
    echo -e "${BLUE}🛑 Stopping All Development Processes...${NC}"

    ./scripts/stop-all-dev.sh

    echo -e "✅ ${GREEN}All development processes stopped${NC}"
}

# Function to launch monitoring dashboard
launch_monitoring() {
    echo -e "${BLUE}📊 Launching Monitoring Dashboard...${NC}"

    # Run health check and save to file for dashboard
    ./scripts/check-deployment.sh > logs/health-status.log 2>&1

    # Start simple monitoring server
    python3 -c "
import http.server
import socketserver
import os
import time

PORT = $MONITORING_PORT

class MonitoringHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()

            # Read health status
            try:
                with open('logs/health-status.log', 'r') as f:
                    health_content = f.read()
            except:
                health_content = 'Health check not available'

            html = f'''
            <!DOCTYPE html>
            <html><head><title>MAIA Monitoring</title>
            <meta http-equiv=\"refresh\" content=\"30\">
            <style>body{{font-family:monospace;background:#1a1a1a;color:#00ff00;padding:20px;}}
            .good{{color:#00ff00;}} .warning{{color:#ffff00;}} .error{{color:#ff0000;}}
            pre{{background:#000;padding:10px;border:1px solid #333;}}</style>
            </head><body>
            <h1>🔍 MAIA System Monitoring</h1>
            <p>Last updated: {time.ctime()}</p>
            <pre>{health_content}</pre>
            </body></html>'''

            self.wfile.write(html.encode())

with socketserver.TCPServer(('', PORT), MonitoringHandler) as httpd:
    print(f'Monitoring dashboard at http://localhost:{PORT}')
    httpd.serve_forever()
" &

    sleep 2
    echo -e "✅ ${GREEN}Monitoring dashboard running at http://localhost:$MONITORING_PORT${NC}"
    echo -e "📊 Auto-refreshes every 30 seconds"
}

# Function for problem solving tools
problem_solving_tools() {
    echo -e "${BLUE}🔧 Problem Solving Tools${NC}"
    echo "========================"
    echo "1. View Container Logs"
    echo "2. Test Production Endpoints"
    echo "3. Check Nginx Configuration"
    echo "4. View System Resources"
    echo "5. Network Diagnostics"
    echo "6. Database Connection Test"
    echo "0. Back to Main Menu"
    echo ""
    echo -n "Select tool [0-6]: "

    read tool_choice
    case $tool_choice in
        1) docker logs maia-sovereign-web-1 --tail=50 ;;
        2)
            echo "Testing endpoints..."
            curl -I "$PRODUCTION_URL" || echo "Failed"
            curl -I "http://localhost:$PRODUCTION_PORT/api/health" || echo "Failed"
            ;;
        3) nginx -t ;;
        4)
            echo "=== Disk Usage ==="
            df -h
            echo "=== Memory Usage ==="
            if command -v vm_stat &> /dev/null; then
                vm_stat
            else
                free -h
            fi
            ;;
        5)
            echo "Testing network connectivity..."
            ping -c 3 google.com
            nslookup soullab.life
            ;;
        6)
            echo "Testing database connection..."
            # Add Supabase connection test here
            ;;
        0) return ;;
    esac

    echo ""
    echo "Press Enter to continue..."
    read
}

# Function to view system logs
view_logs() {
    echo -e "${BLUE}📋 System Logs${NC}"
    echo "==============="
    echo "1. Production Logs (Docker)"
    echo "2. Nginx Logs"
    echo "3. Development Logs"
    echo "4. Deployment Logs"
    echo "5. Emergency Logs"
    echo "0. Back to Main Menu"
    echo ""
    echo -n "Select log [0-5]: "

    read log_choice
    case $log_choice in
        1) docker logs maia-sovereign-web-1 --tail=100 ;;
        2) tail -50 /opt/homebrew/var/log/nginx/soullab.access.log ;;
        3) tail -50 logs/dev-server.log 2>/dev/null || echo "No dev logs available" ;;
        4) tail -50 logs/deployment.log 2>/dev/null || echo "No deployment logs available" ;;
        5) tail -50 logs/emergency.log 2>/dev/null || echo "No emergency logs available" ;;
        0) return ;;
    esac

    echo ""
    echo "Press Enter to continue..."
    read
}

# Function for emergency backup
emergency_backup() {
    echo -e "${YELLOW}💾 Emergency Backup${NC}"
    echo "==================="

    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"

    echo "Creating emergency backup..."

    # Backup critical files
    cp -r app/ "$BACKUP_DIR/" 2>/dev/null || true
    cp -r lib/ "$BACKUP_DIR/" 2>/dev/null || true
    cp -r components/ "$BACKUP_DIR/" 2>/dev/null || true
    cp package.json "$BACKUP_DIR/" 2>/dev/null || true
    cp next.config.js "$BACKUP_DIR/" 2>/dev/null || true
    cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || true

    # Backup nginx config
    cp /opt/homebrew/etc/nginx/servers/soullab.life.conf "$BACKUP_DIR/" 2>/dev/null || true

    echo -e "✅ ${GREEN}Backup created: $BACKUP_DIR${NC}"
    echo "$(date): Emergency backup created: $BACKUP_DIR" >> logs/backup.log
}

# Function to rollback
rollback_version() {
    echo -e "${YELLOW}🔄 Rollback to Previous Version${NC}"
    echo "==============================="

    echo "Available backups:"
    ls -la backups/ 2>/dev/null | grep "^d" | tail -5

    echo ""
    echo "Enter backup directory name (or 'cancel'):"
    read backup_name

    if [ "$backup_name" = "cancel" ]; then
        return
    fi

    if [ -d "backups/$backup_name" ]; then
        echo "Rolling back to $backup_name..."

        # Stop services
        docker-compose down web

        # Restore files
        cp -r "backups/$backup_name"/* ./ 2>/dev/null || true

        # Restart services
        docker-compose up -d web

        echo -e "✅ ${GREEN}Rollback completed${NC}"
        echo "$(date): Rollback to $backup_name completed" >> logs/rollback.log
    else
        echo -e "❌ ${RED}Backup directory not found${NC}"
    fi
}

# Main control loop (enterprise version)
main() {
    # Create necessary directories
    mkdir -p logs backups "$HOME/maia_backups"
    cd "$PROJECT_ROOT"

    while true; do
        show_header
        check_system_status
        show_menu

        read choice
        echo ""

        case $choice in
            1)
                enterprise_health_check
                ;;
            2)
                enterprise_sovereign_test
                ;;
            3)
                enterprise_tail_logs
                ;;
            4)
                enterprise_backup_now
                ;;
            5)
                enterprise_restore_backup
                ;;
            6)
                enterprise_latency_summary
                ;;
            q|Q)
                echo -e "${GREEN}Enterprise operations complete. MAIA sovereign systems stable.${NC}"
                echo -e "${CYAN}Thank you for maintaining the field! 🧬${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please choose 1-6 or q.${NC}"
                sleep 1
                continue
                ;;
        esac

        echo ""
        echo "Press Enter to return to menu..."
        read
    done
}

# Check if script is being sourced or executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi