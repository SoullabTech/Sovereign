#!/bin/bash

# MAIA Development Process Manager
# Manages both Web Development (Node.js) and iOS Development (Xcode) ecosystems

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_section() {
    echo -e "\n${PURPLE}🔧 $1${NC}\n"
}

# Check if a port is in use
check_port() {
    local port=$1
    local process=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$process" ]; then
        local cmd=$(ps -o command= -p $process 2>/dev/null)
        echo "Port $port: $cmd"
        return 0
    else
        echo "Port $port: Available"
        return 1
    fi
}

# Check development server health
check_dev_servers() {
    print_section "Development Server Status"

    echo "🌐 Web Development Ports:"
    check_port 3001 && print_status "Port 3001 (LabTools) - Running" || print_warning "Port 3001 - Not running"
    check_port 3002 && print_status "Port 3002 (Main Chat) - Running" || print_warning "Port 3002 - Not running"
    check_port 3000 && print_status "Port 3000 (Development) - Running" || print_info "Port 3000 - Available"

    echo -e "\n📱 Mobile Development:"
    if pgrep -f "react-native" > /dev/null; then
        print_status "React Native Metro - Running"
    else
        print_warning "React Native Metro - Not running"
    fi

    if pgrep -f "Simulator" > /dev/null; then
        print_status "iOS Simulator - Running"
    else
        print_info "iOS Simulator - Not running"
    fi
}

# Check Electron desktop apps
check_desktop_apps() {
    print_section "Desktop App Status"

    local electron_count=$(pgrep -f "electron.*desktop-app" | wc -l)
    if [ $electron_count -gt 0 ]; then
        print_status "Desktop Apps Running: $electron_count processes"
        pgrep -f "electron.*desktop-app" | head -3 | while read pid; do
            echo "  PID: $pid"
        done
    else
        print_warning "No desktop apps running"
    fi
}

# Check Xcode processes and resource usage
check_xcode_status() {
    print_section "Xcode & iOS Development Status"

    if pgrep -f "Xcode.app" > /dev/null; then
        local xcode_cpu=$(ps -o pid,pcpu,command -p $(pgrep -f "Xcode.app" | head -1) | tail -1 | awk '{print $2}')
        if (( $(echo "$xcode_cpu > 50" | bc -l) )); then
            print_warning "Xcode using high CPU: ${xcode_cpu}%"
        else
            print_status "Xcode running normally: ${xcode_cpu}% CPU"
        fi
    else
        print_info "Xcode not running"
    fi

    local log_streams=$(pgrep -f "log stream.*Xcode" | wc -l)
    if [ $log_streams -gt 10 ]; then
        print_warning "Many Xcode log streams: $log_streams (consider cleanup)"
    else
        print_status "Xcode log streams: $log_streams"
    fi

    if pgrep -f "xcodebuild" > /dev/null; then
        print_status "Xcode build in progress"
    else
        print_info "No active Xcode builds"
    fi
}

# Check for failing builds
check_failing_builds() {
    print_section "Build Health Check"

    # Check if there are any failed npm processes
    local failed_processes=()

    # This would require checking actual process status which is complex
    # For now, we'll check for common signs of failed builds
    if [ -f "/tmp/maia-build-failures.log" ]; then
        print_error "Build failures detected - check /tmp/maia-build-failures.log"
    else
        print_status "No build failure logs found"
    fi

    # Check disk space (builds can fail due to space)
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $disk_usage -gt 85 ]; then
        print_error "Disk usage critical: ${disk_usage}%"
    elif [ $disk_usage -gt 70 ]; then
        print_warning "Disk usage high: ${disk_usage}%"
    else
        print_status "Disk usage OK: ${disk_usage}%"
    fi
}

# Clean up unnecessary processes
cleanup_processes() {
    print_section "Process Cleanup"

    read -p "🧹 Clean up excessive Xcode log streams? (y/N): " cleanup_logs
    if [[ $cleanup_logs =~ ^[Yy]$ ]]; then
        local log_pids=$(pgrep -f "log stream.*Xcode")
        if [ -n "$log_pids" ]; then
            echo "$log_pids" | head -20 | xargs kill 2>/dev/null || true
            print_status "Cleaned up Xcode log streams"
        fi
    fi

    read -p "🔄 Kill failed background builds? (y/N): " cleanup_builds
    if [[ $cleanup_builds =~ ^[Yy]$ ]]; then
        # Kill any long-running npm build processes that might be stuck
        pkill -f "npm run build" 2>/dev/null || true
        pkill -f "npm run dist" 2>/dev/null || true
        print_status "Cleaned up stuck build processes"
    fi
}

# Start essential development services
start_development() {
    print_section "Starting Development Environment"

    # Check if main development servers are running
    if ! check_port 3001 >/dev/null 2>&1; then
        print_info "Starting LabTools server (port 3001)..."
        cd /Users/soullab/MAIA-SOVEREIGN/apps/web
        npm run dev:frontend &
        sleep 3
    fi

    if ! check_port 3002 >/dev/null 2>&1; then
        print_info "Starting main chat server (port 3002)..."
        cd /Users/soullab/MAIA-SOVEREIGN
        PORT=3002 npm run dev &
        sleep 3
    fi

    # Check for desktop app
    if ! pgrep -f "electron.*desktop-app" > /dev/null; then
        print_info "Starting desktop app..."
        cd /Users/soullab/MAIA-SOVEREIGN/desktop-app
        npm run dev &
        sleep 2
    fi

    print_status "Development environment check complete"
}

# Stop all development processes
stop_development() {
    print_section "Stopping Development Environment"

    read -p "⚠️  Stop ALL development processes? (y/N): " confirm_stop
    if [[ $confirm_stop =~ ^[Yy]$ ]]; then
        print_info "Stopping development servers..."
        pkill -f "npm run dev" 2>/dev/null || true
        pkill -f "next dev" 2>/dev/null || true
        pkill -f "electron.*desktop-app" 2>/dev/null || true

        print_info "Stopping React Native..."
        pkill -f "react-native" 2>/dev/null || true

        print_status "Development environment stopped"
    fi
}

# Show resource usage summary
show_resources() {
    print_section "Resource Usage Summary"

    echo "💾 Memory Usage:"
    echo "$(ps aux --sort=-%mem | head -10 | awk '{printf "  %-8s %-6s %-6s %s\n", $2, $3, $4, $11}')"

    echo -e "\n🔥 CPU Usage:"
    echo "$(ps aux --sort=-%cpu | head -10 | awk '{printf "  %-8s %-6s %-6s %s\n", $2, $3, $4, $11}')"

    echo -e "\n🌐 Port Usage:"
    echo "$(lsof -iTCP -sTCP:LISTEN | awk 'NR>1 {printf "  %-20s %-8s %-15s\n", $1, $2, $9}' | sort -u)"
}

# Main menu
show_menu() {
    echo -e "\n${PURPLE}🚀 MAIA Development Process Manager${NC}\n"
    echo "1) Check All Status"
    echo "2) Start Development Environment"
    echo "3) Stop Development Environment"
    echo "4) Cleanup Processes"
    echo "5) Show Resource Usage"
    echo "6) Health Check Only"
    echo "7) Exit"
    echo ""
}

# Main execution
case "${1:-menu}" in
    "status"|"check")
        check_dev_servers
        check_desktop_apps
        check_xcode_status
        check_failing_builds
        ;;
    "start")
        start_development
        ;;
    "stop")
        stop_development
        ;;
    "cleanup")
        cleanup_processes
        ;;
    "resources")
        show_resources
        ;;
    "health")
        check_dev_servers
        check_xcode_status
        ;;
    "menu"|*)
        while true; do
            show_menu
            read -p "Select option (1-7): " choice
            case $choice in
                1) check_dev_servers; check_desktop_apps; check_xcode_status; check_failing_builds ;;
                2) start_development ;;
                3) stop_development ;;
                4) cleanup_processes ;;
                5) show_resources ;;
                6) check_dev_servers; check_xcode_status ;;
                7) echo "Goodbye! 👋"; exit 0 ;;
                *) print_error "Invalid option" ;;
            esac
            echo ""
            read -p "Press Enter to continue..."
        done
        ;;
esac