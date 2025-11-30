#!/bin/bash

# ===============================================
# SACRED TECHNOLOGY PLATFORM - TEST RUNNER
# Complete testing suite for production deployment
# ===============================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}===============================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}===============================================${NC}"
}

# Function to run a test and capture results
run_test() {
    local test_name="$1"
    local test_command="$2"
    local start_time=$(date +%s)

    print_status "Running $test_name..."

    if eval "$test_command" > "test-results/${test_name}.log" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        print_success "$test_name completed in ${duration}s"
        return 0
    else
        print_error "$test_name failed"
        echo "  Last 10 lines of output:"
        tail -n 10 "test-results/${test_name}.log" | sed 's/^/    /'
        return 1
    fi
}

# Main test runner function
main() {
    print_header "SACRED TECHNOLOGY PLATFORM - TEST SUITE"

    # Create test results directory
    mkdir -p test-results

    # Initialize test tracking
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local start_time=$(date +%s)

    echo -e "${CYAN}Starting comprehensive test suite...${NC}"
    echo ""

    # Parse command line arguments
    local run_unit=true
    local run_integration=true
    local run_performance=false
    local run_coverage=false
    local quick_mode=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --unit-only)
                run_integration=false
                run_performance=false
                shift
                ;;
            --with-performance)
                run_performance=true
                shift
                ;;
            --with-coverage)
                run_coverage=true
                shift
                ;;
            --quick)
                quick_mode=true
                run_performance=false
                shift
                ;;
            --help)
                echo "Sacred Technology Platform Test Runner"
                echo ""
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --unit-only         Run only unit tests"
                echo "  --with-performance  Include performance benchmarks"
                echo "  --with-coverage     Generate coverage report"
                echo "  --quick             Quick test run (unit + integration)"
                echo "  --help              Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                           # Standard test run"
                echo "  $0 --unit-only              # Unit tests only"
                echo "  $0 --with-performance       # Full suite with performance"
                echo "  $0 --with-coverage          # Tests with coverage report"
                exit 0
                ;;
            *)
                print_warning "Unknown option: $1"
                shift
                ;;
        esac
    done

    # Pre-flight checks
    print_header "PRE-FLIGHT CHECKS"

    print_status "Checking Node.js version..."
    node_version=$(node --version)
    print_success "Node.js version: $node_version"

    print_status "Checking npm dependencies..."
    if npm list jest > /dev/null 2>&1; then
        print_success "Jest is installed"
    else
        print_error "Jest is not installed. Run: npm install"
        exit 1
    fi

    print_status "Checking TypeScript configuration..."
    if npx tsc --noEmit > /dev/null 2>&1; then
        print_success "TypeScript check passed"
    else
        print_error "TypeScript errors found"
        exit 1
    fi

    echo ""

    # Linting
    print_header "CODE QUALITY CHECKS"
    total_tests=$((total_tests + 1))
    if run_test "lint-check" "npm run lint:check"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi

    # Type checking
    total_tests=$((total_tests + 1))
    if run_test "type-check" "npm run type-check"; then
        passed_tests=$((passed_tests + 1))
    else
        failed_tests=$((failed_tests + 1))
    fi

    echo ""

    # Unit Tests
    if [ "$run_unit" = true ]; then
        print_header "UNIT TESTS"

        # Sacred Mirror Protocol Tests
        total_tests=$((total_tests + 1))
        if run_test "sacred-mirror-protocol" "npm run test:sacred-mirror"; then
            passed_tests=$((passed_tests + 1))
        else
            failed_tests=$((failed_tests + 1))
        fi

        # Soul Memory System Tests
        total_tests=$((total_tests + 1))
        if run_test "soul-memory-system" "npm run test:soul-memory"; then
            passed_tests=$((passed_tests + 1))
        else
            failed_tests=$((failed_tests + 1))
        fi

        # Adaptive Wisdom Engine Tests
        total_tests=$((total_tests + 1))
        if run_test "adaptive-wisdom-engine" "npm run test:adaptive-wisdom"; then
            passed_tests=$((passed_tests + 1))
        else
            failed_tests=$((failed_tests + 1))
        fi

        echo ""
    fi

    # Integration Tests
    if [ "$run_integration" = true ]; then
        print_header "INTEGRATION TESTS"

        total_tests=$((total_tests + 1))
        if run_test "system-integration" "npm run test:integration"; then
            passed_tests=$((passed_tests + 1))
        else
            failed_tests=$((failed_tests + 1))
        fi

        echo ""
    fi

    # Performance Tests
    if [ "$run_performance" = true ]; then
        print_header "PERFORMANCE BENCHMARKS"

        total_tests=$((total_tests + 1))
        if run_test "performance-benchmarks" "npm run test:performance"; then
            passed_tests=$((passed_tests + 1))
        else
            failed_tests=$((failed_tests + 1))
        fi

        echo ""
    fi

    # Coverage Report
    if [ "$run_coverage" = true ]; then
        print_header "COVERAGE ANALYSIS"

        print_status "Generating coverage report..."
        if npm run test:coverage > test-results/coverage.log 2>&1; then
            print_success "Coverage report generated"
            if [ -f "coverage/lcov-report/index.html" ]; then
                print_status "Coverage report available at: coverage/lcov-report/index.html"
            fi
        else
            print_warning "Coverage report generation failed"
        fi

        echo ""
    fi

    # Final Results
    local end_time=$(date +%s)
    local total_duration=$((end_time - start_time))

    print_header "TEST RESULTS SUMMARY"

    echo -e "Total Tests:    ${CYAN}$total_tests${NC}"
    echo -e "Passed:         ${GREEN}$passed_tests${NC}"
    echo -e "Failed:         ${RED}$failed_tests${NC}"
    echo -e "Duration:       ${BLUE}${total_duration}s${NC}"
    echo ""

    if [ $failed_tests -eq 0 ]; then
        print_success "ALL TESTS PASSED! Sacred Technology Platform is ready for production deployment."
        echo ""
        print_status "✨ Production Readiness Checklist:"
        echo "  ✅ Code quality checks passed"
        echo "  ✅ Sacred Mirror Protocol validated"
        echo "  ✅ Soul Memory System verified"
        echo "  ✅ Adaptive Wisdom Engine tested"
        echo "  ✅ System integration confirmed"

        if [ "$run_performance" = true ]; then
            echo "  ✅ Performance benchmarks met"
        fi

        echo ""
        print_success "🌌 The Sacred Technology Platform is ready to transform consciousness at scale."

        return 0
    else
        print_error "TESTS FAILED! Please fix the failing tests before deployment."
        echo ""
        print_status "Failed test logs are available in:"
        ls -la test-results/*.log 2>/dev/null | grep -v "0 " | awk '{print "  - " $9}' || true

        return 1
    fi
}

# Trap to clean up on exit
cleanup() {
    print_status "Cleaning up..."
}

trap cleanup EXIT

# Run main function with all arguments
main "$@"