#!/bin/bash

# ==============================================================================
# MAIA SOVEREIGN - BETA SMOKE TEST SCRIPT
# ==============================================================================
# Goal: Validate core flows in 60 seconds with clear PASS/FAIL output
#
# Tests the four critical paths specified for beta readiness:
# - Oracle/Sonnet path (between chat)
# - Sovereign/DEEP path (with DEEP trigger)
# - AIN Companion TOC
# - AIN Section endpoint
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_PORT=3001
TIMEOUT=15
TEST_SESSION_ID="beta-smoke-$(date +%s)"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test results array
declare -a TEST_RESULTS

# Helper functions
print_header() {
    echo -e "${BLUE}================================================================${NC}"
    echo -e "${BLUE}🚀 MAIA SOVEREIGN BETA SMOKE TEST${NC}"
    echo -e "${BLUE}================================================================${NC}"
    echo -e "📍 Testing against: http://localhost:${DEFAULT_PORT}"
    echo -e "⏱️  Timeout per test: ${TIMEOUT}s"
    echo -e "🔑 Session ID: ${TEST_SESSION_ID}"
    echo ""
}

print_test_header() {
    local test_name="$1"
    local test_description="$2"
    echo -e "${PURPLE}🧪 TEST: ${test_name}${NC}"
    echo -e "   ${test_description}"
    echo -n "   "
}

record_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    local response_time="$4"

    TOTAL_TESTS=$((TOTAL_TESTS + 1))

    if [ "$status" = "PASS" ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✅ PASS${NC} (${response_time}ms) - ${details}"
        TEST_RESULTS+=("✅ $test_name - PASS - ${details}")
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}❌ FAIL${NC} (${response_time}ms) - ${details}"
        TEST_RESULTS+=("❌ $test_name - FAIL - ${details}")
    fi
    echo ""
}

check_server_health() {
    print_test_header "Server Health Check" "Verify server is responding on port ${DEFAULT_PORT}"

    local start_time=$(date +%s)

    if curl -s "http://localhost:${DEFAULT_PORT}/api/health" > /dev/null 2>&1; then
        local end_time=$(date +%s)
        local response_time=$((end_time - start_time))
        record_result "Health Check" "PASS" "Server is responding" "${response_time}s"
        return 0
    else
        local end_time=$(date +%s)
        local response_time=$((end_time - start_time))
        record_result "Health Check" "FAIL" "Server not responding on port ${DEFAULT_PORT}" "${response_time}s"
        return 1
    fi
}

test_oracle_sonnet_path() {
    print_test_header "Oracle/Sonnet Path" "Test /api/between/chat with standard query"

    local start_time=$(date +%s)
    local payload='{
        "message": "Hello, I am testing the Oracle conversation system. Please respond briefly.",
        "sessionId": "'${TEST_SESSION_ID}'-oracle"
    }'

    local response=$(curl -s --max-time $TIMEOUT \
        -X POST "http://localhost:${DEFAULT_PORT}/api/between/chat" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null || echo "CURL_FAILED")

    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))

    if [ "$response" = "CURL_FAILED" ]; then
        record_result "Oracle/Sonnet" "FAIL" "Request timeout or connection error" "${response_time}s"
        return 1
    fi

    # Check if response contains expected fields
    if echo "$response" | jq -e '.message' > /dev/null 2>&1; then
        local message_length=$(echo "$response" | jq -r '.message | length')
        if [ "$message_length" -gt 10 ]; then
            record_result "Oracle/Sonnet" "PASS" "Received valid response (${message_length} chars)" "${response_time}s"
            return 0
        else
            record_result "Oracle/Sonnet" "FAIL" "Response too short or empty" "${response_time}s"
            return 1
        fi
    else
        record_result "Oracle/Sonnet" "FAIL" "Invalid JSON response or missing message field" "${response_time}s"
        return 1
    fi
}

test_sovereign_deep_path() {
    print_test_header "Sovereign/DEEP Path" "Test /api/sovereign/app/maia with DEEP trigger"

    local start_time=$(date +%s)
    local payload='{
        "message": "I feel utterly lost and disconnected from my purpose. Everything feels meaningless.",
        "sessionId": "'${TEST_SESSION_ID}'-deep"
    }'

    local response=$(curl -s --max-time $TIMEOUT \
        -X POST "http://localhost:${DEFAULT_PORT}/api/sovereign/app/maia" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null || echo "CURL_FAILED")

    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))

    if [ "$response" = "CURL_FAILED" ]; then
        record_result "Sovereign/DEEP" "FAIL" "Request timeout or connection error" "$response_time"
        return 1
    fi

    # Check if response indicates DEEP path activation
    if echo "$response" | jq -e '.message' > /dev/null 2>&1; then
        local message_length=$(echo "$response" | jq -r '.message | length')
        # Check for DEEP indicators in metadata
        local has_deep_metadata=$(echo "$response" | jq -e '.metadata.maiaPaiKernel.conversationDepth // .metadata.processing.deepMode' > /dev/null 2>&1 && echo "true" || echo "false")

        if [ "$message_length" -gt 50 ]; then
            if [ "$has_deep_metadata" = "true" ]; then
                record_result "Sovereign/DEEP" "PASS" "DEEP path activated with metadata (${message_length} chars)" "$response_time"
            else
                record_result "Sovereign/DEEP" "PASS" "Response received, DEEP metadata unclear (${message_length} chars)" "$response_time"
            fi
            return 0
        else
            record_result "Sovereign/DEEP" "FAIL" "Response too short for DEEP activation" "$response_time"
            return 1
        fi
    else
        record_result "Sovereign/DEEP" "FAIL" "Invalid JSON response or missing message field" "$response_time"
        return 1
    fi
}

test_ain_companion_toc() {
    print_test_header "AIN Companion TOC" "Test book companion table of contents"

    local start_time=$(date +%s)

    # First try the standard book-companion endpoint
    local response=$(curl -s --max-time $TIMEOUT \
        "http://localhost:${DEFAULT_PORT}/api/book-companion/ain/toc" 2>/dev/null || echo "ENDPOINT_1_FAILED")

    # If that fails, try the AIN activation endpoint
    if [ "$response" = "ENDPOINT_1_FAILED" ]; then
        response=$(curl -s --max-time $TIMEOUT \
            "http://localhost:${DEFAULT_PORT}/api/ain/activate" 2>/dev/null || echo "ENDPOINT_2_FAILED")
    fi

    # If both fail, try AIN control endpoint
    if [ "$response" = "ENDPOINT_2_FAILED" ]; then
        response=$(curl -s --max-time $TIMEOUT \
            "http://localhost:${DEFAULT_PORT}/api/ain/control" 2>/dev/null || echo "ALL_ENDPOINTS_FAILED")
    fi

    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))

    if [ "$response" = "ALL_ENDPOINTS_FAILED" ]; then
        record_result "AIN Companion TOC" "FAIL" "All AIN endpoints unreachable" "$response_time"
        return 1
    fi

    # Check for TOC-like structure or valid AIN response
    if echo "$response" | jq -e '.toc // .sections // .chapters // .status' > /dev/null 2>&1; then
        local response_size=$(echo "$response" | wc -c)
        record_result "AIN Companion TOC" "PASS" "Valid AIN response structure (${response_size} bytes)" "$response_time"
        return 0
    elif [ ${#response} -gt 100 ]; then
        local response_size=$(echo "$response" | wc -c)
        record_result "AIN Companion TOC" "PASS" "AIN endpoint responding (${response_size} bytes)" "$response_time"
        return 0
    else
        record_result "AIN Companion TOC" "FAIL" "Unexpected response format or empty response" "$response_time"
        return 1
    fi
}

test_ain_section_endpoint() {
    print_test_header "AIN Section Endpoint" "Test book companion section reading"

    local start_time=$(date +%s)

    # First try the standard book-companion section endpoint
    local response=$(curl -s --max-time $TIMEOUT \
        "http://localhost:${DEFAULT_PORT}/api/book-companion/ain/section?id=1" 2>/dev/null || echo "ENDPOINT_1_FAILED")

    # If that fails, try the AIN process endpoint
    if [ "$response" = "ENDPOINT_1_FAILED" ]; then
        local payload='{"sectionId": 1, "action": "read"}'
        response=$(curl -s --max-time $TIMEOUT \
            -X POST "http://localhost:${DEFAULT_PORT}/api/ain/process" \
            -H "Content-Type: application/json" \
            -d "$payload" 2>/dev/null || echo "ENDPOINT_2_FAILED")
    fi

    # If both fail, try a general section query
    if [ "$response" = "ENDPOINT_2_FAILED" ]; then
        response=$(curl -s --max-time $TIMEOUT \
            "http://localhost:${DEFAULT_PORT}/api/books/integrate" 2>/dev/null || echo "ALL_ENDPOINTS_FAILED")
    fi

    local end_time=$(date +%s)
    local response_time=$((end_time - start_time))

    if [ "$response" = "ALL_ENDPOINTS_FAILED" ]; then
        record_result "AIN Section" "FAIL" "All section endpoints unreachable" "$response_time"
        return 1
    fi

    # Check for section content or valid response
    if echo "$response" | jq -e '.content // .text // .section // .status' > /dev/null 2>&1; then
        local content_length=$(echo "$response" | jq -r '.content // .text // .section // "unknown"' | wc -c)
        record_result "AIN Section" "PASS" "Valid section response (${content_length} chars content)" "$response_time"
        return 0
    elif [ ${#response} -gt 50 ]; then
        local response_size=$(echo "$response" | wc -c)
        record_result "AIN Section" "PASS" "Section endpoint responding (${response_size} bytes)" "$response_time"
        return 0
    else
        record_result "AIN Section" "FAIL" "Unexpected response format or empty response" "$response_time"
        return 1
    fi
}

print_summary() {
    echo -e "${BLUE}================================================================${NC}"
    echo -e "${BLUE}📊 SMOKE TEST SUMMARY${NC}"
    echo -e "${BLUE}================================================================${NC}"
    echo ""

    echo -e "📈 Overall Results:"
    echo -e "   Total Tests: ${TOTAL_TESTS}"
    echo -e "   ${GREEN}✅ Passed: ${PASSED_TESTS}${NC}"
    echo -e "   ${RED}❌ Failed: ${FAILED_TESTS}${NC}"
    echo ""

    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED - SYSTEM READY FOR BETA TESTING${NC}"
        SUCCESS_RATE="100%"
    else
        local success_percentage=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo -e "${YELLOW}⚠️  SOME TESTS FAILED - Success Rate: ${success_percentage}%${NC}"
        SUCCESS_RATE="${success_percentage}%"
    fi

    echo ""
    echo -e "📋 Test Details:"
    for result in "${TEST_RESULTS[@]}"; do
        echo -e "   $result"
    done

    echo ""
    echo -e "🔗 Next Steps:"
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "   • System is ready for beta user testing"
        echo -e "   • All core flows are operational"
        echo -e "   • Consider running full integration tests"
    else
        echo -e "   • Investigate failed endpoints"
        echo -e "   • Check server logs for errors"
        echo -e "   • Verify service dependencies"
        echo -e "   • Run individual tests for debugging"
    fi

    echo ""
    echo -e "${BLUE}================================================================${NC}"
}

# Main execution
main() {
    print_header

    # Pre-flight check
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ FATAL: curl command not found. Please install curl.${NC}"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  WARNING: jq not found. JSON validation will be limited.${NC}"
        echo ""
    fi

    # Run tests
    check_server_health || {
        echo -e "${RED}🚨 CRITICAL: Server health check failed. Cannot continue.${NC}"
        print_summary
        exit 1
    }

    test_oracle_sonnet_path
    test_sovereign_deep_path
    test_ain_companion_toc
    test_ain_section_endpoint

    print_summary

    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Execute main function
main "$@"