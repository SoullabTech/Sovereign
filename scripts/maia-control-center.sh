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
PRODUCTION_PORT=3002
STAGING_PORT=3010
DEV_PORT=3000
MONITORING_PORT=3020

# Function to display header
show_header() {
    clear
    echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}${BOLD}║                    MAIA CONTROL CENTER                       ║${NC}"
    echo -e "${CYAN}${BOLD}║                 One-Person Management System                 ║${NC}"
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

# Function to show main menu
show_menu() {
    echo -e "${BOLD}🎛️  CONTROL PANEL${NC}"
    echo "=================="
    echo "1. 🔍 Check System Status"
    echo "2. 🖥️  Start Development Environment"
    echo "3. 🎯 Start Staging Environment"
    echo "4. 🚀 Deploy to Production (Safe)"
    echo "5. ⚠️  Emergency Production Restart"
    echo "6. 🛑 Stop All Development Processes"
    echo "7. 📊 Launch Monitoring Dashboard"
    echo "8. 🔧 Problem Solving Tools"
    echo "9. 📋 View System Logs"
    echo "10. 💾 Emergency Backup"
    echo "11. 🔄 Rollback to Previous Version"
    echo "0. ❌ Exit"
    echo ""
    echo -n "Select option [0-11]: "
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

# Main control loop
main() {
    # Create logs directory if it doesn't exist
    mkdir -p logs backups

    while true; do
        show_header
        check_system_status
        show_menu

        read choice
        echo ""

        case $choice in
            1)
                ./scripts/check-deployment.sh
                echo "Press Enter to continue..."
                read
                ;;
            2) start_development ;;
            3) start_staging ;;
            4) deploy_production ;;
            5) emergency_restart ;;
            6) stop_all_development ;;
            7) launch_monitoring ;;
            8) problem_solving_tools ;;
            9) view_logs ;;
            10) emergency_backup ;;
            11) rollback_version ;;
            0)
                echo -e "${CYAN}Goodbye! 👋${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please try again.${NC}"
                sleep 2
                ;;
        esac

        if [ "$choice" != "8" ] && [ "$choice" != "9" ]; then
            echo ""
            echo "Press Enter to continue..."
            read
        fi
    done
}

# Check if script is being sourced or executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi